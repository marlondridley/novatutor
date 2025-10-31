// @filename: stripe-webhook.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@12.0.0"
import { createClient } from "npm:@supabase/supabase-js@2"

// --- ENV VARS ---
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-11-20",
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role = needed for write access
)

console.log("✅ Stripe Webhook Function booted!")

// --- MAIN HANDLER ---
Deno.serve(async (request) => {
  const sig = request.headers.get("Stripe-Signature")
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    )
  } catch (err: any) {
    // Supabase Edge Functions use console for logging
    console.error("❌ Webhook signature verification failed.", err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Supabase Edge Functions use console for logging (acceptable in serverless functions)
  console.log(`🔔 Event received: ${event.type} (ID: ${event.id})`)

  // ✅ IDEMPOTENCY CHECK - Prevent duplicate processing
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id, status')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    console.log(`✅ Event ${event.id} already processed (status: ${existingEvent.status})`)
    return new Response(JSON.stringify({ received: true, already_processed: true }), { status: 200 })
  }

  // Log event as pending
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    data: event.data.object,
    status: 'pending',
  })

  try {
    switch (event.type) {
      // 1️⃣ Checkout completed → new subscription started
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      // 2️⃣ Subscription created
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpsert(sub.customer as string, sub)
        break
      }

      // 3️⃣ Invoice paid → renewal success
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        await handleSubscriptionUpsert(invoice.customer as string)
        break
      }

      // 4️⃣ Invoice failed → mark as past_due
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        // Fetch subscription to get metadata
        let subscription
        if (invoice.subscription) {
          subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        }
        await updateSubscriptionStatus(invoice.customer as string, "past_due", subscription)
        break
      }

      // 5️⃣ Subscription updated (plan/status change)
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpsert(sub.customer as string, sub)
        break
      }

      // 6️⃣ Subscription deleted → canceled
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await updateSubscriptionStatus(sub.customer as string, "canceled", sub)
        break
      }

      default:
        console.log(`⚪ Unhandled event type: ${event.type}`)
    }

    // ✅ Mark event as processed
    await supabase
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id)

    console.log(`✅ Event ${event.id} processed successfully`)
    return new Response(JSON.stringify({ received: true, processed: true }), { status: 200 })
  } catch (err: any) {
    console.error("❌ Error processing event:", err)
    
    // ❌ Mark event as failed
    await supabase
      .from('webhook_events')
      .update({ 
        status: 'failed', 
        error_message: err.message,
        retry_count: 1 
      })
      .eq('stripe_event_id', event.id)

    return new Response("Webhook handler failed", { status: 500 })
  }
})

// --- HELPERS ---

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("💳 Checkout completed:", session.id)

  const customerId = (typeof session.customer === 'string' ? session.customer : undefined) as string | undefined

  // 🎯 MULTI-SUBSCRIPTION: Check if this is a multi-profile checkout
  if (session.metadata?.type === "multi_subscription" && session.metadata?.profile_ids) {
    console.log("👨‍👩‍👧‍👦 Multi-subscription checkout detected")
    await handleMultiSubscriptionCheckout(session, customerId)
    return
  }

  // 🔑 SINGLE SUBSCRIPTION: Try to get Supabase user ID from metadata or client_reference_id
  const supabaseUserId = session.metadata?.supabase_user_id || session.client_reference_id

  if (supabaseUserId) {
    // Match by Supabase user ID (supports multiple subscriptions per email)
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_id: session.subscription as string,
        subscription_expires_at: null,
        stripe_customer_id: customerId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", supabaseUserId)

    if (error) console.error("❌ Failed to activate subscription:", error)
    else console.log(`✅ Subscription activated for user ${supabaseUserId}, customer=${customerId}`)
    return
  }

  // 🔄 FALLBACK: If no user ID, fall back to email matching (legacy support)
  let customerEmail = session.customer_email
  if (!customerEmail && customerId) {
    const customer = await stripe.customers.retrieve(customerId)
    customerEmail = (customer as Stripe.Customer).email || undefined
  }

  if (!customerEmail) {
    console.error("❌ No user ID or email found")
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_id: session.subscription as string,
      subscription_expires_at: null,
      stripe_customer_id: customerId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", customerEmail)

  if (error) console.error("❌ Failed to activate subscription:", error)
  else console.log(`✅ Subscription activated for ${customerEmail} (email fallback), customer=${customerId}`)
}

// Handle multi-subscription checkout (multiple children paid at once)
async function handleMultiSubscriptionCheckout(session: Stripe.Checkout.Session, customerId?: string) {
  const profileIds = session.metadata!.profile_ids!.split(",")
  const subscriptionId = session.subscription as string
  
  console.log(`👨‍👩‍👧‍👦 Activating ${profileIds.length} profiles`)

  // Update all profiles in parallel
  const updates = profileIds.map(async (profileId) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_id: subscriptionId,
        subscription_expires_at: null,
        stripe_customer_id: customerId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId.trim())

    if (error) {
      console.error(`❌ Failed to activate profile ${profileId}:`, error)
      return { profileId, success: false, error }
    } else {
      console.log(`✅ Activated profile ${profileId}`)
      return { profileId, success: true }
    }
  })

  const results = await Promise.all(updates)
  const successCount = results.filter(r => r.success).length
  
  console.log(`✅ Multi-subscription complete: ${successCount}/${profileIds.length} profiles activated, customer=${customerId}`)
}

async function handleSubscriptionUpsert(customerId: string, sub?: Stripe.Subscription) {
  // 🎯 MULTI-SUBSCRIPTION: Check if this is a multi-profile subscription
  if (sub?.metadata?.type === "multi_subscription" && sub.metadata.profile_ids) {
    console.log("👨‍👩‍👧‍👦 Multi-subscription update detected")
    await handleMultiSubscriptionUpdate(sub, customerId)
    return
  }

  // 🔑 SINGLE SUBSCRIPTION: Try to get Supabase user ID from subscription metadata
  const supabaseUserId = sub?.metadata?.supabase_user_id

  // Determine subscription status
  let status = "active"
  if (sub) {
    switch (sub.status) {
      case "active":
        status = "active"
        break
      case "trialing":
        status = "trialing"
        break
      case "past_due":
        status = "past_due"
        break
      case "canceled":
      case "unpaid":
        status = "canceled"
        break
      default:
        status = "free"
    }
  }

  const updateData = {
    subscription_status: status,
    subscription_id: sub?.id ?? null,
    subscription_expires_at: sub?.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    stripe_customer_id: customerId,
    updated_at: new Date().toISOString(),
  }

  // If we have user ID, match by ID (supports multiple subscriptions per email)
  if (supabaseUserId) {
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", supabaseUserId)

    if (error) console.error("❌ Error updating subscription:", error)
    else console.log(`✅ Subscription updated for user ${supabaseUserId} → ${status}, customer=${customerId}`)
    return
  }

  // 🔄 FALLBACK: Match by email (legacy support)
  const customer = await stripe.customers.retrieve(customerId)
  const customerEmail = (customer as Stripe.Customer).email

  if (!customerEmail) {
    console.error("❌ No user ID or email found")
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("email", customerEmail)

  if (error) console.error("❌ Error updating subscription:", error)
  else console.log(`✅ Subscription updated for ${customerEmail} → ${status} (email fallback), customer=${customerId}`)
}

// Handle multi-subscription updates (quantity changes, status changes)
async function handleMultiSubscriptionUpdate(sub: Stripe.Subscription, customerId: string) {
  const profileIds = sub.metadata!.profile_ids!.split(",").map(id => id.trim())
  const subscriptionId = sub.id
  
  // Determine status
  let status = "active"
  switch (sub.status) {
    case "active":
      status = "active"
      break
    case "trialing":
      status = "trialing"
      break
    case "past_due":
      status = "past_due"
      break
    case "canceled":
    case "unpaid":
      status = "canceled"
      break
    default:
      status = "free"
  }

  console.log(`👨‍👩‍👧‍👦 Updating ${profileIds.length} profiles to status: ${status}`)

  // Update all profiles that are in the metadata
  const updates = profileIds.map(async (profileId) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: status,
        subscription_id: subscriptionId,
        subscription_expires_at: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)

    if (error) {
      console.error(`❌ Failed to update profile ${profileId}:`, error)
      return { profileId, success: false, error }
    } else {
      console.log(`✅ Updated profile ${profileId} → ${status}`)
      return { profileId, success: true }
    }
  })

  // Also: Find and deactivate any profiles that were removed from this subscription
  // (i.e., profiles that have this subscription_id but are NOT in the metadata)
  const { data: linkedProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("subscription_id", subscriptionId)

  if (linkedProfiles) {
    const removedProfiles = linkedProfiles.filter(
      p => !profileIds.includes(p.id)
    )

    if (removedProfiles.length > 0) {
      console.log(`🔄 Deactivating ${removedProfiles.length} removed profiles`)
      
      const deactivations = removedProfiles.map(async (profile) => {
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            subscription_id: null,
            subscription_expires_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id)

        if (error) {
          console.error(`❌ Failed to deactivate profile ${profile.id}:`, error)
        } else {
          console.log(`✅ Deactivated removed profile ${profile.id}`)
        }
      })

      await Promise.all([...updates, ...deactivations])
    } else {
      await Promise.all(updates)
    }
  } else {
    await Promise.all(updates)
  }

  const results = await Promise.all(updates)
  const successCount = results.filter(r => r.success).length
  
  console.log(`✅ Multi-subscription update complete: ${successCount}/${profileIds.length} profiles updated`)
}

async function updateSubscriptionStatus(customerId: string, status: string, subscription?: Stripe.Subscription) {
  const updateData: any = {
    subscription_status: status,
    stripe_customer_id: customerId,
    updated_at: new Date().toISOString(),
  }

  // If canceled, mark expiration
  if (status === "canceled") {
    updateData.subscription_expires_at = new Date().toISOString()
  }

  // 🔑 PRIMARY: Try to get Supabase user ID from subscription metadata
  const supabaseUserId = subscription?.metadata?.supabase_user_id

  if (supabaseUserId) {
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", supabaseUserId)

    if (error) console.error("❌ Error updating status:", error)
    else console.log(`⚙️ Updated user ${supabaseUserId} → ${status}, customer=${customerId}`)
    return
  }

  // 🔄 FALLBACK: Match by email (legacy support)
  const customer = await stripe.customers.retrieve(customerId)
  const customerEmail = (customer as Stripe.Customer).email

  if (!customerEmail) {
    console.error("❌ No user ID or email found")
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("email", customerEmail)

  if (error) console.error("❌ Error updating status:", error)
  else console.log(`⚙️ Updated ${customerEmail} → ${status} (email fallback), customer=${customerId}`)
}

