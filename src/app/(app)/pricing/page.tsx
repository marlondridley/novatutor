'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { supabase } from '@/lib/supabase-client';
import { Loader2, CheckCircle2, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Declare Stripe Pricing Table custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
          'client-reference-id'?: string;
          'customer-email'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export default function PricingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setUserEmail(user?.email || null);
      setLoading(false);
    }
    getUser();
  }, []);

  return (
    <main className="flex flex-1 flex-col p-4 lg:p-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
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
                <CardTitle className="text-3xl">Study Coach Premium</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$12.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base mt-4">
                  Try free for 7 days • No credit card required
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited questions across all subjects</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Homework help with Socratic teaching method</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Study planner & time management coaching</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Test prep with practice quizzes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Personalized learning paths</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Parent dashboard with weekly reports</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">24/7 access on any device</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Ad-free, safe environment</span>
                  </div>
                </div>

                {/* Stripe Integration */}
                <Script
                  src="https://js.stripe.com/v3/pricing-table.js"
                  strategy="lazyOnload"
                />
                
                {userId && userEmail ? (
                  <stripe-pricing-table
                    pricing-table-id="prctbl_1SO5iLGxHdRwEkVK0LTy9JqE"
                    publishable-key="pk_live_51S5Tk9GxHdRwEkVK9UvEBwpbWo4XIKpDXvOrU4Q8g0UAhmipwAfKm3zmJTRMBCdo2kHyL9I94gZ4kIQjor1xUqy900TJUzjNms"
                    client-reference-id={userId}
                    customer-email={userEmail}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    Please log in to subscribe
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Cancel anytime with one click. No questions asked.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-base">Life-changing for our family</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Worth every penny. My daughter's confidence has soared!"
                </p>
                <p className="text-xs font-semibold mt-2">— Sarah M.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-base">Best investment in education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Cheaper than one tutoring session, used every single day."
                </p>
                <p className="text-xs font-semibold mt-2">— Michael R.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-base">Homework is no longer a battle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "The study coach feature has transformed our evenings!"
                </p>
                <p className="text-xs font-semibold mt-2">— Jennifer L.</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Link */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Have questions?</p>
            <Link href="/landing#faq">
              <span className="text-primary hover:underline cursor-pointer">View Frequently Asked Questions →</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
