'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface SubscriptionGateProps {
  children: ReactNode;
  feature?: string;
  showUpgrade?: boolean;
}

/**
 * Component to gate features behind subscription
 * Shows upgrade prompt for free users
 */
export function SubscriptionGate({ 
  children, 
  feature = 'this feature',
  showUpgrade = true 
}: SubscriptionGateProps) {
  const { hasPremiumAccess, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPremiumAccess()) {
    if (!showUpgrade) {
      return null;
    }

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Premium Feature</CardTitle>
          <CardDescription>
            Upgrade to access {feature}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Get unlimited access to all features for just</p>
            <p className="text-2xl font-bold text-primary mt-2">$5/month</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Unlimited AI tutoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Personalized learning paths</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Homework help & feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Test prep & practice quizzes</span>
            </div>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link href="/pricing">
              Upgrade to Premium
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

