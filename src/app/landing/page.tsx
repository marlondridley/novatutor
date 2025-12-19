import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen,
  GraduationCap,
  Star,
  Clock,
  Target,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: "BestTutorEver | AI Homework & Executive Function Tutor for Kids",
  description: "Affordable AI-powered homework and study coach — boosts confidence, grades, and organization for students 8–18. 7-day free trial, no credit card.",
  openGraph: {
    title: "BestTutorEver — Make Homework Time Stress-Free",
    description: "Trusted by 500+ families. Affordable AI-powered homework and study coach — boosts confidence, grades, and organization for students 8–18.",
    url: "https://studycoach.app",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BestTutorEver — Make Homework Time Stress-Free",
    description: "Affordable AI-powered homework and study coach for students 8–18. Try free for 7 days.",
    images: ["/og-image.jpg"],
  },
  keywords: ["homework help", "study coach", "executive function", "AI tutor", "learning support", "kids education", "homework battles", "student organization"],
};

export default function LandingPage() {
  // 🎯 JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'BestTutorEver',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '12.99',
          priceCurrency: 'USD',
          priceValidUntil: '2025-12-31',
          availability: 'https://schema.org/InStock',
          url: 'https://besttutorever.com/pricing',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '500',
          bestRating: '5',
          worstRating: '1',
        },
        description: 'AI-powered homework and study coach for kids ages 8-18. Personalized learning with a fun game controller interface.',
        featureList: [
          'Personalized AI Tutoring',
          'Homework Planning',
          'Test Preparation',
          'Voice Interaction',
          'Progress Tracking',
          'COPPA Compliant',
        ],
        screenshot: 'https://besttutorever.com/og-image.png',
      },
      {
        '@type': 'Organization',
        '@id': 'https://besttutorever.com/#organization',
        name: 'BestTutorEver',
        url: 'https://besttutorever.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://besttutorever.com/logo.png',
        },
        sameAs: [
          'https://twitter.com/besttutorever',
          'https://facebook.com/besttutorever',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'support@besttutorever.com',
          availableLanguage: 'English',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://besttutorever.com/#website',
        url: 'https://besttutorever.com',
        name: 'BestTutorEver',
        description: 'The best AI tutor for kids',
        publisher: {
          '@id': 'https://besttutorever.com/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://besttutorever.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Product',
        name: 'BestTutorEver Premium',
        description: 'Premium AI tutoring with voice interaction and unlimited homework help',
        brand: {
          '@type': 'Brand',
          name: 'BestTutorEver',
        },
        offers: {
          '@type': 'Offer',
          price: '12.99',
          priceCurrency: 'USD',
          priceValidUntil: '2025-12-31',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '500',
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex min-h-screen flex-col">
        {/* Simple Header */}
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10
                              bg-gradient-to-br from-purple-500 to-pink-500
                              rounded-full shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <span className="text-xl font-extrabold">
              <span className="text-purple-600">Best</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Tutor</span>
              <span className="text-purple-600">Ever</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Simplified */}
      <section className="relative py-20 lg:py-32">
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                End Homework Battles Forever
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Your child gets a patient, personalized AI tutor available 24/7.
                <span className="font-semibold text-foreground"> Just $12.99/month.</span>
              </p>
            </div>

            {/* Social Proof - Inline */}
            <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>500+ families</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8★ rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>COPPA compliant</span>
              </div>
            </div>

            {/* Main CTA */}
            <div className="space-y-4">
              <Link href="/login">
                <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Try Free for 7 Days
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="text-base text-muted-foreground">
                No credit card required • Cancel anytime • Instant access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Pricing Preview */}
      <section className="py-16 bg-accent/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader className="text-center pb-6">
                <Badge className="mb-3 w-fit mx-auto">7-Day Free Trial</Badge>
                <CardTitle className="text-2xl">Just $12.99/month</CardTitle>
                <CardDescription className="text-sm mt-2">
                  No credit card required • Cancel anytime
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/login">
                  <Button size="lg" className="w-full text-lg py-6">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* One Testimonial */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg italic text-muted-foreground mb-4">
                  "We were spending $200/week on tutoring. BestTutorEver costs less than ONE session
                  but my son uses it every single day. Amazing value."
                </blockquote>
                <cite className="text-sm font-semibold">— Michael R., Dad of 1</cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 BestTutorEver. Made with ❤️ for students and families.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
