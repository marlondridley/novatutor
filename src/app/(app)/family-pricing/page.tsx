import { MultiChildCheckout } from '@/components/multi-child-checkout';
import { CheckoutButton } from '@/components/checkout-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FamilyPricingPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Family & Group Subscriptions</h1>
        <p className="text-xl text-muted-foreground">
          Subscribe for yourself or manage multiple accounts at once
        </p>
      </div>

      {/* Pricing Tabs */}
      <Tabs defaultValue="multi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="multi">Multiple Accounts</TabsTrigger>
          <TabsTrigger value="single">Single Account</TabsTrigger>
        </TabsList>

        {/* Multi-Account Tab */}
        <TabsContent value="multi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>👨‍👩‍👧‍👦 Pay for Multiple Accounts at Once</CardTitle>
              <CardDescription>
                Perfect for parents managing children's accounts, schools, teams, or organizations.
                Select multiple accounts and pay for them all in a single transaction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <p className="text-3xl font-bold">$19.99</p>
                    <p className="text-sm text-muted-foreground">per account/month</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-3xl font-bold">1-10</p>
                    <p className="text-sm text-muted-foreground">accounts at once</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-3xl font-bold">One</p>
                    <p className="text-sm text-muted-foreground">payment for all</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Single checkout for multiple accounts</li>
                    <li>Instant activation for all selected accounts</li>
                    <li>One invoice for easy tracking</li>
                    <li>Manage all subscriptions from one place</li>
                    <li>Cancel individual accounts anytime</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Child Checkout Component */}
          <MultiChildCheckout />
        </TabsContent>

        {/* Single Account Tab */}
        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Subscription</CardTitle>
              <CardDescription>
                Subscribe to NovaHelper Premium for your own account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-block p-6 border rounded-lg">
                  <p className="text-5xl font-bold">$19.99</p>
                  <p className="text-muted-foreground">per month</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">What's Included:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Unlimited AI tutoring sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Personalized learning paths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Homework planning & feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Executive function coaching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Test preparation tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Progress tracking & analytics</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <CheckoutButton size="lg" className="w-full md:w-auto">
                  Subscribe for $19.99/month
                </CheckoutButton>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime. No long-term commitment required.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">How does multi-account billing work?</h3>
            <p className="text-sm text-muted-foreground">
              When you select multiple accounts, you'll pay for all of them in a single transaction.
              Each account costs $19.99/month, so 3 accounts would be $59.97/month total.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I add more accounts later?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can return to this page and subscribe additional accounts at any time.
              Each new subscription starts immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I cancel individual accounts?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can manage each subscription independently through the Stripe customer portal.
              Canceling one account won't affect the others.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do all accounts get activated instantly?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! As soon as your payment is processed, all selected accounts are immediately activated
              and get full access to premium features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

