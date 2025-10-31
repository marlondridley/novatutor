import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';

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

    // Get request body
    const body = await req.json();
    const { subscriptionId, profileId } = body as { subscriptionId: string; profileId: string };

    if (!subscriptionId || !profileId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Verify parent owns this child
    const { data: childProfile, error: childError } = await supabase
      .from('profiles')
      .select('id, parent_id, email, subscription_id')
      .eq('id', profileId)
      .single();

    if (childError || !childProfile) {
      return NextResponse.json(
        { error: 'Child profile not found' },
        { status: 404 }
      );
    }

    // ✅ SECURITY: Verify current user is the parent
    if (childProfile.parent_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you are not the parent of this account' },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Verify child is on this subscription
    if (childProfile.subscription_id !== subscriptionId) {
      return NextResponse.json(
        { error: 'Child is not on this subscription' },
        { status: 400 }
      );
    }

    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Verify this is a multi-subscription
    if (subscription.metadata?.type !== 'multi_subscription') {
      return NextResponse.json(
        { error: 'Not a multi-subscription' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Double-check subscription ownership
    if (subscription.metadata?.parent_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this subscription' },
        { status: 403 }
      );
    }

    // Get current profile IDs
    const currentProfileIds = subscription.metadata.profile_ids?.split(',').map(id => id.trim()) || [];
    
    // Check if profile is in the subscription
    if (!currentProfileIds.includes(profileId)) {
      return NextResponse.json(
        { error: 'Profile not found in this subscription' },
        { status: 404 }
      );
    }

    // Remove the profile ID
    const remainingProfileIds = currentProfileIds.filter(id => id !== profileId);

    if (remainingProfileIds.length === 0) {
      // If no children left, cancel the entire subscription
      await stripe.subscriptions.cancel(subscriptionId);
      
      return NextResponse.json({
        message: 'Subscription canceled - no children remaining',
        canceled: true,
        remainingCount: 0,
      });
    }

    // Update subscription metadata and quantity
    const updatedMetadata = {
      ...subscription.metadata,
      profile_ids: remainingProfileIds.join(','),
      profile_count: remainingProfileIds.length.toString(),
    };

    // Get the subscription item ID (first item since we only have one)
    const subscriptionItemId = subscription.items.data[0].id;

    // Update subscription item quantity
    await stripe.subscriptionItems.update(subscriptionItemId, {
      quantity: remainingProfileIds.length, // 🔑 Reduce quantity
    });

    // Update subscription metadata
    await stripe.subscriptions.update(subscriptionId, {
      metadata: updatedMetadata,
    });

    // Update the removed profile in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        subscription_id: null,
        subscription_expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      // Continue anyway - webhook will handle it
    }

    return NextResponse.json({
      message: 'Child removed from subscription',
      canceled: false,
      remainingCount: remainingProfileIds.length,
      newQuantity: remainingProfileIds.length,
      subscriptionId,
    });
  } catch (error: any) {
    console.error('❌ Error removing child from subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove child from subscription' },
      { status: 500 }
    );
  }
}

