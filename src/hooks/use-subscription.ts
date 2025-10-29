
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { User } from 'firebase/auth';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'loading' | null;

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('loading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
        setLoading(true);
        setSubscriptionStatus('loading');
        return;
    };
    if (!user) {
        setLoading(false);
        setSubscriptionStatus(null);
        return;
    };

    const checkSubscription = async (currentUser: User) => {
      setLoading(true);
      try {
        const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh
        const claims = idTokenResult.claims;
        const stripeRole = claims.stripeRole as SubscriptionStatus;

        if (stripeRole) {
            setSubscriptionStatus(stripeRole);
        } else {
            setSubscriptionStatus(null);
        }
      } catch (error) {
        console.error("Error getting subscription status:", error);
        setSubscriptionStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription(user);

  }, [user, authLoading]);

  return { subscriptionStatus: subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? subscriptionStatus : null, loading };
}
