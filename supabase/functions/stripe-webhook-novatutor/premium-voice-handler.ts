// @ts-nocheck
// Premium Voice Add-On Handler for Stripe Webhooks

import { SupabaseClient } from "npm:@supabase/supabase-js@2"
import Stripe from "npm:stripe@12.0.0"

const PREMIUM_VOICE_PRODUCT_ID = "prod_TPYJjhvbFCikK1" // Your Stripe product ID

/**
 * Check if a subscription includes Premium Voice
 */
export function hasPremiumVoice(subscription: Stripe.Subscription): boolean {
  return subscription.items.data.some(item => {
    const product = item.price.product
    // Check if product ID matches or metadata indicates premium_voice
    return (
      product === PREMIUM_VOICE_PRODUCT_ID ||
      (typeof product === 'object' && product.id === PREMIUM_VOICE_PRODUCT_ID) ||
      (typeof product === 'object' && product.metadata?.feature === 'premium_voice')
    )
  })
}

/**
 * Handle Premium Voice subscription created/updated
 */
export async function handlePremiumVoiceUpdate(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
  customerId: string
) {
  console.log("🎤 Checking for Premium Voice in subscription...")
  
  const premiumVoiceActive = hasPremiumVoice(subscription)
  const isActive = subscription.status === 'active' || subscription.status === 'trialing'
  
  // Calculate expiration date
  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  console.log(`🎤 Premium Voice: ${premiumVoiceActive ? 'YES' : 'NO'}, Status: ${subscription.status}`)

  // Get user ID from subscription metadata or customer
  const supabaseUserId = subscription.metadata?.supabase_user_id

  const updateData: any = {
    premium_voice_enabled: premiumVoiceActive && isActive,
    premium_voice_expires_at: premiumVoiceActive ? expiresAt : null,
    updated_at: new Date().toISOString(),
  }

  // Update by user ID if available
  if (supabaseUserId) {
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", supabaseUserId)

    if (error) {
      console.error("❌ Failed to update Premium Voice:", error)
    } else {
      console.log(`✅ Premium Voice ${premiumVoiceActive ? 'enabled' : 'disabled'} for user ${supabaseUserId}`)
    }
    return
  }

  // Fallback: Update by customer ID
  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("❌ Failed to update Premium Voice:", error)
  } else {
    console.log(`✅ Premium Voice ${premiumVoiceActive ? 'enabled' : 'disabled'} for customer ${customerId}`)
  }
}

/**
 * Handle Premium Voice subscription canceled/deleted
 */
export async function handlePremiumVoiceCanceled(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
  customerId: string
) {
  console.log("🎤 Premium Voice subscription canceled")

  const supabaseUserId = subscription.metadata?.supabase_user_id

  const updateData = {
    premium_voice_enabled: false,
    premium_voice_expires_at: null,
    updated_at: new Date().toISOString(),
  }

  // Update by user ID if available
  if (supabaseUserId) {
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", supabaseUserId)

    if (error) {
      console.error("❌ Failed to disable Premium Voice:", error)
    } else {
      console.log(`✅ Premium Voice disabled for user ${supabaseUserId}`)
    }
    return
  }

  // Fallback: Update by customer ID
  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("❌ Failed to disable Premium Voice:", error)
  } else {
    console.log(`✅ Premium Voice disabled for customer ${customerId}`)
  }
}

