import { Mail, MessageSquare, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground">
            We're here to help with any questions or concerns
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle>Email Us</CardTitle>
              <CardDescription>
                Get a response within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <a 
                href="mailto:support@studycoach.com" 
                className="text-primary hover:underline font-medium"
              >
                support@studycoach.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Find answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link 
                href="/help-center" 
                className="text-primary hover:underline font-medium"
              >
                Visit Help Center →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle>FAQ</CardTitle>
              <CardDescription>
                Quick answers to frequent questions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link 
                href="/faq" 
                className="text-primary hover:underline font-medium"
              >
                Browse FAQs →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject *
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="What is this about?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Please provide as much detail as possible..."
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
              >
                Send Message
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-sm">
            For billing questions or account issues, please include your account email in your message.
          </p>
          <p className="text-sm mt-2">
            We typically respond within 1 business day.
          </p>
        </div>
      </div>
    </div>
  );
}

