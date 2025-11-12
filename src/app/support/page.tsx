import Link from 'next/link';
import { MessageSquare, Book, Mail, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Support Center
          </h1>
          <p className="text-xl text-muted-foreground">
            We're here to help you get the most out of Study Coach
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/help-center">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Book className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Help Center</CardTitle>
                <CardDescription>
                  Browse guides, tutorials, and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Find step-by-step instructions, video tutorials, and answers to common questions organized by topic.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/faq">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <HelpCircle className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get instant answers to the most frequently asked questions about Study Coach features and billing.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Mail className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Send us a message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Contact our support team and we'll get back to you within 24 hours.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="h-full">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Community Forum</CardTitle>
              <CardDescription>
                Connect with other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Join our community to share tips, ask questions, and learn from other Study Coach users.
              </p>
              <span className="text-sm text-muted-foreground italic">Coming soon</span>
            </CardContent>
          </Card>
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Support Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      Getting started with Study Coach
                    </Link>
                  </li>
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      How to ask effective questions
                    </Link>
                  </li>
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      Understanding your subscription
                    </Link>
                  </li>
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      Setting up parent controls
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      Managing your account settings
                    </Link>
                  </li>
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      Billing and payment issues
                    </Link>
                  </li>
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      Technical troubleshooting
                    </Link>
                  </li>
                  <li>
                    <Link href="/help-center" className="text-primary hover:underline">
                      Privacy and data security
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Our support team is available to assist you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  We typically respond within 24 hours on business days
                </p>
                <a href="mailto:support@studycoach.com" className="text-primary hover:underline text-sm">
                  support@studycoach.com
                </a>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                <br />
                We aim to respond to all inquiries within 1 business day.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

