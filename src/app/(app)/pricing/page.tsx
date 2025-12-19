/**
 * Pricing Page
 * 
 * Shows subscription options using Stripe Payment Links.
 * Simple and reliable - no complex API calls needed.
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, CheckCircle2, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// =============================================================================
// STRIPE LINKS - Update these with your actual links
// =============================================================================

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05';
const STRIPE_CUSTOMER_PORTAL = 'https://billing.stripe.com/p/login/fZu3cv0Gh4VHaUNblJ2VG00';

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function PricingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      setLoading(false);
    }
    getUser();
  }, []);

  // Build payment link with prefilled email
  const getPaymentLink = () => {
    if (userEmail) {
      return `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userEmail)}`;
    }
    return STRIPE_PAYMENT_LINK;
  };

  if (loading) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col p-4 lg:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            One plan. All features. Cancel anytime.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center pb-8">
              <Badge className="mb-4 w-fit mx-auto">7-Day Free Trial</Badge>
              <CardTitle className="text-3xl">BestTutorEver Premium</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">$12.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-base mt-4">
                Try free for 7 days • Cancel anytime
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-3">
                {[
                  'Unlimited questions across all subjects',
                  'Homework help with Socratic teaching method',
                  'Study planner & time management coaching',
                  'Test prep with practice quizzes',
                  'Personalized learning paths',
                  'Parent dashboard with weekly reports',
                  '24/7 access on any device',
                  'Ad-free, safe environment',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <Button asChild size="lg" className="w-full text-lg py-6">
                <a href={getPaymentLink()}>
                  Start Free Trial
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime with one click. No questions asked.
              </p>

              {/* Already subscribed? */}
              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Already subscribed?
                </p>
                <Button variant="outline" asChild size="sm">
                  <a href={STRIPE_CUSTOMER_PORTAL}>
                    Manage Subscription
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: "Life-changing for our family", quote: "Worth every penny. My daughter's confidence has soared!", author: "Sarah M." },
            { title: "Best investment in education", quote: "Cheaper than one tutoring session, used every single day.", author: "Michael R." },
            { title: "Homework is no longer a battle", quote: "The study coach feature has transformed our evenings!", author: "Jennifer L." },
          ].map((review, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-base">{review.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">"{review.quote}"</p>
                <p className="text-xs font-semibold mt-2">— {review.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Have questions?</p>
          <Link href="/landing#faq" className="text-primary hover:underline">
            View Frequently Asked Questions →
          </Link>
        </div>
      </div>
    </main>
  );
}
