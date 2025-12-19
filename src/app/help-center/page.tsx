import Link from 'next/link';
import { Book, CreditCard, Settings, Users, MessageSquare, Shield, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find guides, tutorials, and answers to your questions
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help..."
              className="flex h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Book className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn the basics of using BestTutorEver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Creating your account
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Your first tutoring session
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Setting up study goals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Navigating the dashboard
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Using the AI Tutor</CardTitle>
              <CardDescription>
                Get the most out of your tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    How to ask effective questions
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Understanding the Socratic method
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Working with images and diagrams
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Math equation formatting
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CreditCard className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Billing & Subscriptions</CardTitle>
              <CardDescription>
                Manage your account and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Free trial information
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Updating payment methods
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Canceling your subscription
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Refund policy
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Parent Dashboard</CardTitle>
              <CardDescription>
                Monitor your child's learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Accessing the parent dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Understanding progress reports
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Setting study time limits
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Managing multiple children
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Settings className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Customize your BestTutorEver experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Updating profile information
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Notification preferences
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Changing password
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Deleting your account
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Privacy & Safety</CardTitle>
              <CardDescription>
                Learn about our security measures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Data protection and COPPA
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Content safety measures
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    What data we collect
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary hover:underline">
                    Reporting concerns
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="pb-4 border-b">
                  <Link href="#" className="text-primary hover:underline font-medium">
                    How do I start my 7-day free trial?
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Step-by-step guide to getting started with BestTutorEver
                  </p>
                </div>
                <div className="pb-4 border-b">
                  <Link href="#" className="text-primary hover:underline font-medium">
                    What subjects can the AI tutor help with?
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete list of subjects and topics we cover
                  </p>
                </div>
                <div className="pb-4 border-b">
                  <Link href="#" className="text-primary hover:underline font-medium">
                    How do I cancel my subscription?
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Easy steps to cancel anytime with no fees
                  </p>
                </div>
                <div className="pb-4 border-b">
                  <Link href="#" className="text-primary hover:underline font-medium">
                    Can I use BestTutorEver on multiple devices?
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Information about device compatibility and syncing
                  </p>
                </div>
                <div>
                  <Link href="#" className="text-primary hover:underline font-medium">
                    How do Family Plans work?
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Everything you need to know about our family pricing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="text-center bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help answer any questions
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
            >
              Contact Support
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2"
            >
              Browse FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

