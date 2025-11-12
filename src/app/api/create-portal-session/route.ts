import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
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

    // Get user's profile to find their Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, subscription_id, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Prefer stored stripe_customer_id; fallback to email lookup and persist
    let customerId = profile.stripe_customer_id as string | null;

    if (!customerId) {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1,
      });

      if (!customers.data.length) {
        return NextResponse.json(
          { error: 'No Stripe customer found. Please subscribe first.' },
          { status: 404 }
        );
      }

      customerId = customers.data[0].id;

      // Persist for future use
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Create a Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error('❌ Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

