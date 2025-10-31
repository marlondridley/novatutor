'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { supabase } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';

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
    <main className="flex flex-1 items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Load Stripe Pricing Table Script */}
        <Script
          src="https://js.stripe.com/v3/pricing-table.js"
          strategy="lazyOnload"
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : userId && userEmail ? (
          /* Stripe Pricing Table with user context */
          <stripe-pricing-table
            pricing-table-id="prctbl_1SO5iLGxHdRwEkVK0LTy9JqE"
            publishable-key="pk_live_51S5Tk9GxHdRwEkVK9UvEBwpbWo4XIKpDXvOrU4Q8g0UAhmipwAfKm3zmJTRMBCdo2kHyL9I94gZ4kIQjor1xUqy900TJUzjNms"
            client-reference-id={userId}
            customer-email={userEmail}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please log in to view pricing</p>
          </div>
        )}
      </div>
    </main>
  );
}
