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

    // Get request body with child profile IDs
    const body = await req.json();
    const { profileIds } = body as { profileIds: string[] };

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return NextResponse.json(
        { error: 'No profiles selected' },
        { status: 400 }
      );
    }

    if (profileIds.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 profiles per checkout' },
        { status: 400 }
      );
    }

    // Verify user has permission to manage these profiles
    // (You might want to check a "family" or "managed_by" relationship)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', profileIds);

    if (profileError || !profiles || profiles.length !== profileIds.length) {
      return NextResponse.json(
        { error: 'Invalid profile selection' },
        { status: 400 }
      );
    }

    // Get user's email for billing
    const userEmail = user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Create ONE line item with quantity = number of children
    // This allows us to dynamically adjust quantity when adding/removing children
    const lineItems = [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: profileIds.length, // 🔑 Quantity-based subscription
      }
    ];

    // Store all profile IDs in metadata
    const metadata = {
      type: 'multi_subscription',
      profile_ids: profileIds.join(','), // Comma-separated list
      profile_count: profileIds.length.toString(),
      parent_user_id: user.id,
      parent_email: userEmail,
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail, // Parent's email for billing
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?multi_success=true&count=${profileIds.length}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      
      // 💳 Collect billing address for tax calculation
      billing_address_collection: 'required',
      
      // 📊 Enable automatic tax calculation
      automatic_tax: { enabled: true },
      
      metadata,
      // Store metadata on subscription for dynamic updates
      subscription_data: {
        metadata,
      },
      // Optional: Pre-fill customer details
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      profileCount: profileIds.length,
    });
  } catch (error: any) {
    console.error('❌ Error creating multi checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

