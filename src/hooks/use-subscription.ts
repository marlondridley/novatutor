'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase-client';

export type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'loading' | null;

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  grade: string;
  role: string;
  subscription_status: string;
  subscription_id: string | null;
  subscription_expires_at: string | null;
}

/**
 * Subscription hook with entitlement checks
 * Reads subscription status from Supabase profiles table
 * Subscriptions are managed through Stripe payment link
 * Update subscription status via Supabase dashboard or webhook
 */
export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(true);
      return;
    }

    async function loadSubscriptionStatus() {
      try {
        setLoading(true);
        
        // Get user profile with subscription status
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading subscription status:', error);
          setSubscriptionStatus('free');
          return;
        }

        if (data) {
          setProfile(data as UserProfile);
          setSubscriptionStatus(data.subscription_status as SubscriptionStatus);
        } else {
          setSubscriptionStatus('free');
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setSubscriptionStatus('free');
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptionStatus();
  }, [user, authLoading]);

  /**
   * Check if user has an active subscription
   */
  const hasActiveSubscription = (): boolean => {
    return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  };

  /**
   * Check if user has premium access (active or trialing)
   */
  const hasPremiumAccess = (): boolean => {
    return hasActiveSubscription();
  };

  /**
   * Check if subscription is expired or past due
   */
  const isSubscriptionExpired = (): boolean => {
    if (!profile?.subscription_expires_at) return false;
    const expiresAt = new Date(profile.subscription_expires_at);
    return expiresAt < new Date();
  };

  return {
    subscriptionStatus,
    profile,
    loading,
    hasActiveSubscription,
    hasPremiumAccess,
    isSubscriptionExpired,
  };
}
