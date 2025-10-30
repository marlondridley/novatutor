import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Payment completed:', session.id);

  // Handle both snapshot and thin payloads
  let customerEmail = session.customer_email;
  
  // If thin payload (customer_email not present), fetch from customer object
  if (!customerEmail && session.customer) {
    const customer = await stripe.customers.retrieve(session.customer as string);
    customerEmail = (customer as Stripe.Customer).email || undefined;
  }

  const subscriptionId = session.subscription as string;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  // Update user's subscription status in Supabase
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_id: subscriptionId,
      subscription_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to update subscription:', error);
  } else {
    console.log(`✅ Subscription activated for ${customerEmail}`);
  }
}

// Handle subscription changes
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription changed:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  const status = subscription.status;
  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  // Map Stripe status to our status
  let subscriptionStatus: string;
  switch (status) {
    case 'active':
      subscriptionStatus = 'active';
      break;
    case 'trialing':
      subscriptionStatus = 'trialing';
      break;
    case 'past_due':
      subscriptionStatus = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      subscriptionStatus = 'canceled';
      break;
    default:
      subscriptionStatus = 'free';
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: subscriptionStatus,
      subscription_id: subscription.id,
      subscription_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to update subscription:', error);
  } else {
    console.log(`✅ Subscription updated for ${customerEmail}: ${subscriptionStatus}`);
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_expires_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to cancel subscription:', error);
  } else {
    console.log(`✅ Subscription canceled for ${customerEmail}`);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💳 Payment failed:', invoice.id);

  const customer = await stripe.customers.retrieve(invoice.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;

  if (!customerEmail) {
    console.error('❌ No customer email found');
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail);

  if (error) {
    console.error('❌ Failed to update payment status:', error);
  } else {
    console.log(`⚠️ Payment failed for ${customerEmail} - marked as past_due`);
  }
}


