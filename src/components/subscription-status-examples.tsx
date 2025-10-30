'use client';

import { useSubscriptionStatus } from '@/hooks/use-subscription-status';
import { CheckoutButton } from '@/components/checkout-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example 1: Simple Access Gate
 * Show different content based on subscription status
 */
export function SimpleAccessGate({ children }: { children: React.ReactNode }) {
  const { isActive, loading } = useSubscriptionStatus();

  if (loading) {
    return <div>Loading subscription status...</div>;
  }

  if (!isActive) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-muted-foreground mb-6">
          Subscribe to unlock this feature
        </p>
        <CheckoutButton>Subscribe Now - $19.99/mo</CheckoutButton>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Example 2: Status Badge
 * Show current subscription status
 */
export function SubscriptionStatusBadge() {
  const { status, loading } = useSubscriptionStatus();

  if (loading) return null;

  const statusConfig = {
    free: { label: 'Free', variant: 'secondary' as const },
    trialing: { label: 'Trial', variant: 'default' as const },
    active: { label: 'Active', variant: 'default' as const },
    past_due: { label: 'Past Due', variant: 'destructive' as const },
    canceled: { label: 'Canceled', variant: 'outline' as const },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Example 3: Subscription Card
 * Full subscription status display
 */
export function SubscriptionCard() {
  const subscription = useSubscriptionStatus();

  if (subscription.loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription Status
          <SubscriptionStatusBadge />
        </CardTitle>
        <CardDescription>
          {subscription.isActive && 'You have full access to all features'}
          {subscription.isPastDue && 'Payment failed - please update payment method'}
          {subscription.isCanceled && 'Your subscription has been canceled'}
          {subscription.status === 'free' && 'Upgrade to unlock premium features'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.isActive && (
          <div className="text-sm">
            <p className="text-muted-foreground">
              Status: <span className="font-medium text-foreground">Premium Member</span>
            </p>
            {subscription.expiresAt && (
              <p className="text-muted-foreground">
                Next billing: <span className="font-medium text-foreground">
                  {new Date(subscription.expiresAt).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
        )}

        {subscription.isPastDue && (
          <Alert variant="destructive">
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              Please update your payment method to continue your subscription.
            </AlertDescription>
          </Alert>
        )}

        {subscription.status === 'free' && (
          <CheckoutButton className="w-full">
            Upgrade to Premium - $19.99/mo
          </CheckoutButton>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Feature Access Component
 * Conditionally render based on subscription
 */
export function PremiumFeature({ 
  feature, 
  children 
}: { 
  feature: string; 
  children: React.ReactNode;
}) {
  const { isActive } = useSubscriptionStatus();

  if (!isActive) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4 p-6">
            <h3 className="text-lg font-semibold">🔒 Premium Feature</h3>
            <p className="text-sm text-muted-foreground">
              Unlock {feature} with Premium
            </p>
            <CheckoutButton size="sm">Upgrade Now</CheckoutButton>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Example 5: Usage in a Page
 */
export function ExampleUsageInPage() {
  const { isActive, status, loading } = useSubscriptionStatus();

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SubscriptionStatusBadge />
      </div>

      {/* Show subscription card */}
      <SubscriptionCard />

      {/* Simple access gate */}
      <SimpleAccessGate>
        <Card>
          <CardHeader>
            <CardTitle>Premium Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This content is only visible to premium members!</p>
          </CardContent>
        </Card>
      </SimpleAccessGate>

      {/* Feature-specific gate */}
      <PremiumFeature feature="Advanced Analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Advanced analytics and insights...</p>
          </CardContent>
        </Card>
      </PremiumFeature>

      {/* Conditional rendering */}
      {isActive ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Premium Member! 🎉</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Premium</CardTitle>
            <CardDescription>
              Get access to all features for just $19.99/month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutButton className="w-full">Subscribe Now</CheckoutButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

