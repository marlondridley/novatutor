/**
 * Checkout Button
 * 
 * Simple button that redirects to Stripe Payment Link.
 * No complex API calls needed - Stripe handles everything.
 */

'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

// =============================================================================
// STRIPE LINKS - Update these with your actual links
// =============================================================================

// Payment link for new subscriptions
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05';

// Customer portal for managing existing subscriptions
const STRIPE_CUSTOMER_PORTAL = 'https://billing.stripe.com/p/login/fZu3cv0Gh4VHaUNblJ2VG00';

// =============================================================================
// CHECKOUT BUTTON
// =============================================================================

interface CheckoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Button to start a new subscription.
 * Redirects directly to Stripe Payment Link.
 * 
 * @example
 * <CheckoutButton>Subscribe for $12.99/month</CheckoutButton>
 */
export function CheckoutButton({ className, children = 'Subscribe Now' }: CheckoutButtonProps) {
  const { user } = useAuth();

  const handleCheckout = () => {
    // Append user email to prefill Stripe checkout (optional)
    let url = STRIPE_PAYMENT_LINK;
    
    if (user?.email) {
      url += `?prefilled_email=${encodeURIComponent(user.email)}`;
    }
    
    window.location.href = url;
  };

  return (
    <Button onClick={handleCheckout} className={className} size="lg">
      {children}
    </Button>
  );
}

// =============================================================================
// MANAGE SUBSCRIPTION BUTTON
// =============================================================================

interface ManageSubscriptionButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Button to manage existing subscription (cancel, update payment, etc.)
 * Redirects to Stripe Customer Portal.
 * 
 * @example
 * <ManageSubscriptionButton>Manage Subscription</ManageSubscriptionButton>
 */
export function ManageSubscriptionButton({ 
  className, 
  children = 'Manage Subscription' 
}: ManageSubscriptionButtonProps) {
  const handleManage = () => {
    window.location.href = STRIPE_CUSTOMER_PORTAL;
  };

  return (
    <Button onClick={handleManage} variant="outline" className={className}>
      {children}
    </Button>
  );
}
