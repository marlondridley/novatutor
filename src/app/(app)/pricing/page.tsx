
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { createCheckoutSession } from '@/lib/stripe';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

const features = [
    "Personalized Learning Paths",
    "AI-Powered Tutoring",
    "Executive Function Coaching",
    "Homework Help & Feedback",
    "Unlimited Test Prep",
    "Focus & Productivity Tools"
];

export default function PricingPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubscribe = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not signed in',
                description: 'You must be signed in to subscribe.',
            });
            return;
        }

        setLoading(true);
        try {
            const sessionUrl = await createCheckoutSession(user.uid);
            if (sessionUrl) {
                window.location.href = sessionUrl;
            } else {
                throw new Error('Could not create checkout session.');
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Subscription Error',
                description: 'There was a problem creating your subscription. Please try again.',
            });
            setLoading(false);
        }
    };

  return (
    <main className="flex flex-1 items-center justify-center p-4 lg:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Become a SuperFocus Member</CardTitle>
          <CardDescription>Unlock your full learning potential with our complete suite of AI tools.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-center">
                <p className="text-4xl font-bold">$12.99<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <p className="font-semibold text-primary">Includes a 10-day free trial!</p>
            </div>
          <ul className="space-y-2">
            {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubscribe} disabled={loading} className="w-full" size="lg">
            {loading ? 'Processing...' : 'Start Your 10-Day Free Trial'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
