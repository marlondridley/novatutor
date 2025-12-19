/**
 * BestTutorEver - Stripe Webhook Handler
 * 
 * Handles subscription events from Stripe and updates user profiles.
 * 
 * Products:
 * - Best Tutor Ever Services: $12.99/mo (main subscription)
 * - Premium Voice Assistant Engagement: +$1.99/mo (OpenAI Whisper)
 * 
 * Deploy: supabase functions deploy stripe-webhook-novatutor
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@17.0.0"
import { createClient } from "npm:@supabase/supabase-js@2"

// =============================================================================
// CONFIG
// =============================================================================

// Premium Voice product ID from Stripe
const PREMIUM_VOICE_PRODUCT_ID = "prod_TPYJjhvbFCikK1"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-11-20.acacia",
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

console.log("✅ BestTutorEver Webhook ready!")

// =============================================================================
// MAIN HANDLER
// =============================================================================

Deno.serve(async (request) => {
  // Verify webhook signature
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
    console.error("❌ Invalid signature:", err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log(`🔔 ${event.type}`)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckout(session)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscription(sub)
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await handleCancellation(sub)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice.customer as string)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err: any) {
    console.error("❌ Error:", err.message)
    return new Response("Handler failed", { status: 500 })
  }
})

// =============================================================================
// HANDLERS
// =============================================================================

async function handleCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id || session.client_reference_id
  const email = session.customer_email || await getCustomerEmail(session.customer as string)

  const data = {
    subscription_status: "active",
    subscription_id: session.subscription as string,
    stripe_customer_id: session.customer as string,
    updated_at: new Date().toISOString(),
  }

  if (userId) {
    await supabase.from("profiles").update(data).eq("id", userId)
    console.log(`✅ Activated: ${userId}`)
  } else if (email) {
    await supabase.from("profiles").update(data).eq("email", email)
    console.log(`✅ Activated: ${email}`)
  }
}

async function handleSubscription(sub: Stripe.Subscription) {
  const customerId = sub.customer as string
  const userId = sub.metadata?.supabase_user_id
  const hasPremiumVoice = checkPremiumVoice(sub)
  const isActive = sub.status === "active" || sub.status === "trialing"

  const data = {
    subscription_status: mapStatus(sub.status),
    subscription_id: sub.id,
    subscription_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
    stripe_customer_id: customerId,
    premium_voice_enabled: hasPremiumVoice && isActive,
    updated_at: new Date().toISOString(),
  }

  if (userId) {
    await supabase.from("profiles").update(data).eq("id", userId)
    console.log(`✅ Updated: ${userId} (voice: ${hasPremiumVoice})`)
  } else {
    const email = await getCustomerEmail(customerId)
    if (email) {
      await supabase.from("profiles").update(data).eq("email", email)
      console.log(`✅ Updated: ${email} (voice: ${hasPremiumVoice})`)
    }
  }
}

async function handleCancellation(sub: Stripe.Subscription) {
  const customerId = sub.customer as string
  const userId = sub.metadata?.supabase_user_id

  const data = {
    subscription_status: "canceled",
    premium_voice_enabled: false,
    updated_at: new Date().toISOString(),
  }

  if (userId) {
    await supabase.from("profiles").update(data).eq("id", userId)
    console.log(`✅ Canceled: ${userId}`)
  } else {
    const email = await getCustomerEmail(customerId)
    if (email) {
      await supabase.from("profiles").update(data).eq("email", email)
      console.log(`✅ Canceled: ${email}`)
    }
  }
}

async function handlePaymentFailed(customerId: string) {
  const email = await getCustomerEmail(customerId)
  if (email) {
    await supabase
      .from("profiles")
      .update({ subscription_status: "past_due", updated_at: new Date().toISOString() })
      .eq("email", email)
    console.log(`⚠️ Past due: ${email}`)
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function checkPremiumVoice(sub: Stripe.Subscription): boolean {
  return sub.items.data.some(item => {
    const product = item.price.product
    return (
      product === PREMIUM_VOICE_PRODUCT_ID ||
      (typeof product === "object" && product.id === PREMIUM_VOICE_PRODUCT_ID)
    )
  })
}

async function getCustomerEmail(customerId?: string): Promise<string | null> {
  if (!customerId) return null
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return (customer as Stripe.Customer).email || null
  } catch {
    return null
  }
}

function mapStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active": return "active"
    case "trialing": return "trialing"
    case "past_due": return "past_due"
    default: return "canceled"
  }
}
