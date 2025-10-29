'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';

const features = [
    "Personalized Learning Paths",
    "AI-Powered Tutoring with DeepSeek",
    "Executive Function Coaching",
    "Homework Help & Feedback",
    "Unlimited Test Prep",
    "Focus & Productivity Tools",
    "Text-to-Speech Audio",
    "Math Problem Solving"
];

export default function PricingPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4 lg:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">SuperTutor Features</CardTitle>
          <CardDescription>
            All features are currently <span className="font-bold text-primary">FREE</span> during development!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-2xl font-bold text-primary">Currently Free Access</p>
            <p className="text-sm text-muted-foreground mt-1">
              Subscription features coming soon!
            </p>
          </div>
          <ul className="space-y-2">
            {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
          </ul>
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>🚀 Enjoy unlimited access while we build!</p>
            <p className="mt-2">Premium subscriptions will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
