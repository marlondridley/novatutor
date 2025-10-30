'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, CreditCard } from 'lucide-react';
import { CheckoutButton } from '@/components/checkout-button';

const features = [
    "Personalized Learning Paths",
    "AI-Powered Tutoring with DeepSeek",
    "Executive Function Coaching",
    "Homework Help & Feedback",
    "Unlimited Test Prep",
    "Focus & Productivity Tools",
    "Text-to-Speech Audio",
    "Math Problem Solving",
    "24/7 AI Tutor Access",
    "Progress Tracking & Analytics"
];

export default function PricingPage() {

  return (
    <main className="flex flex-1 items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Pricing Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Premium Plan</CardTitle>
            <CardDescription>
              Unlock your full learning potential
            </CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-bold text-primary">$12.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Cancel anytime • No commitment
                    </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <CheckoutButton className="w-full">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Subscribe Now
                    </CheckoutButton>
                    <p className="text-xs text-center text-muted-foreground">
                      Secure checkout powered by Stripe
                    </p>
                  </CardFooter>
        </Card>
      </div>
    </main>
  );
}
