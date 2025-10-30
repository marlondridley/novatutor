import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's email
    const userEmail = user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Get user's profile for additional info (optional)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail, // Email for Stripe communications
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // Your Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      
      // 💳 Collect billing address for tax calculation
      billing_address_collection: 'required',
      
      // 📊 Enable automatic tax calculation
      // Note: Tax will be $0 until you register in Stripe Dashboard
      automatic_tax: { enabled: true },
      
      // 🔑 CRITICAL: This links the subscription to THIS specific user
      client_reference_id: user.id, // Supabase user ID
      metadata: {
        supabase_user_id: user.id, // The profile to update
        user_email: userEmail,
      },
      
      subscription_data: {
        metadata: {
          supabase_user_id: user.id, // Store in subscription for future updates
          user_email: userEmail,
        },
      },
      
      // Optional: Pre-fill customer details
      ...(profile?.full_name && {
        customer_creation: 'always' as const,
        customer_email: userEmail,
      }),
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

