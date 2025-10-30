'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isActive: boolean; // true if 'active' or 'trialing'
  isPastDue: boolean;
  isCanceled: boolean;
  subscriptionId: string | null;
  expiresAt: string | null;
  loading: boolean;
}

export function useSubscriptionStatus(): SubscriptionInfo {
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: 'free',
    isActive: false,
    isPastDue: false,
    isCanceled: false,
    subscriptionId: null,
    expiresAt: null,
    loading: true,
  });

  useEffect(() => {
    async function fetchSubscription() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSubscription(prev => ({ ...prev, loading: false }));
          return;
        }

        // Get subscription status from profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_id, subscription_expires_at')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          console.error('Error fetching subscription:', error);
          setSubscription(prev => ({ ...prev, loading: false }));
          return;
        }

        const status = (profile.subscription_status || 'free') as SubscriptionStatus;

        setSubscription({
          status,
          isActive: status === 'active' || status === 'trialing',
          isPastDue: status === 'past_due',
          isCanceled: status === 'canceled',
          subscriptionId: profile.subscription_id,
          expiresAt: profile.subscription_expires_at,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    }

    fetchSubscription();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          // Refresh subscription when profile changes
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return subscription;
}

