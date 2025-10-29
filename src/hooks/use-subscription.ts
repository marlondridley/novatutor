'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'loading' | null;

/**
 * Placeholder hook for subscription management
 * TODO: Implement Stripe subscription checking later
 */
export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    // For now, all users have free access
    // TODO: Implement Stripe subscription checking
    setSubscriptionStatus(null);
    setLoading(false);
  }, [user, authLoading]);

  return { subscriptionStatus, loading };
}
