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
  Brain,
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
  title: "Study Coach | AI Homework & Executive Function Tutor for Kids",
  description: "Affordable AI-powered homework and study coach — boosts confidence, grades, and organization for students 8–18. 7-day free trial, no credit card.",
  openGraph: {
    title: "Study Coach — Make Homework Time Stress-Free",
    description: "Trusted by 500+ families. Affordable AI-powered homework and study coach — boosts confidence, grades, and organization for students 8–18.",
    url: "https://studycoach.app",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Coach — Make Homework Time Stress-Free",
    description: "Affordable AI-powered homework and study coach for students 8–18. Try free for 7 days.",
    images: ["/og-image.jpg"],
  },
  keywords: ["homework help", "study coach", "executive function", "AI tutor", "learning support", "kids education", "homework battles", "student organization"],
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Study Coach</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/login">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Trusted by 500+ families
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your Child's Executive Function & Homework Coach
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tired of homework battles? Study Coach helps kids stay organized and confident — all for $12.99/month. 
              Try it free for 7 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-6">
                  Unlock Their Potential — Try Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              ✓ No credit card required • ✓ 7-day free trial • ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-t border-b bg-accent/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Families trust us</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Homework sessions</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Parent rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Sound Familiar?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">😫 Homework Takes Forever</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your child stares at the page for hours, getting frustrated and overwhelmed.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">😤 Nightly Battles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Every evening turns into a struggle. You're exhausted and they're in tears.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">📉 Grades Are Slipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Despite trying their best, they're still not achieving the grades they deserve.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">💸 Tutors Are Too Expensive</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    $50-$100/hour adds up fast, and scheduling is a nightmare.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">There's a Better Way</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Study Coach gives your child 24/7 access to a patient, personalized learning coach 
                for less than the cost of a single tutoring session. Perfect for students ages 8–18.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-accent/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Everything Your Child Needs to Succeed
              </h2>
              <p className="text-xl text-muted-foreground">
                More than just homework help—we build confidence and independence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Homework Help That Teaches</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Instead of just giving answers, we guide students through problems step-by-step 
                    using the Socratic method. They learn to think critically.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Brain className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Executive Function Coaching</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Build essential skills like planning, time management, and organization. 
                    These are the "secret sauce" to academic success.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Target className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Personalized Learning Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    AI adapts to your child's learning style, pace, and goals. No two students 
                    are the same, so why should their learning be?
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Study Planner & Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Never miss a deadline again. Our planner helps kids break big projects into 
                    manageable chunks and stay on track.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Parent Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    See what your child is working on, track progress, and get weekly summaries 
                    delivered to your inbox. Stay informed without hovering.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>100% Safe & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Bank-level encryption, COPPA compliant, no ads, no social features. 
                    Your child's data stays private and secure.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
              How Study Coach Works
            </h2>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Sign Up in 60 Seconds</h3>
                  <p className="text-muted-foreground">
                    Create your account, add your child's profile, and start exploring. 
                    No credit card required for the 7-day free trial.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Your Child Asks Questions</h3>
                  <p className="text-muted-foreground">
                    Whether it's math homework, essay writing, or test prep, they type or snap 
                    a photo of the problem. Study Coach responds instantly.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">They Learn & Build Confidence</h3>
                  <p className="text-muted-foreground">
                    Through patient guidance and positive reinforcement, they develop both 
                    academic skills and self-confidence. You see the results in days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-accent/30">
        <div className="container">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            What Parents Are Saying
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <CardTitle className="text-lg">"Game changer for our family"</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  "My 8th grader went from avoiding homework to actually looking forward to it. 
                  Her grades improved, and our evenings are so much calmer!"
                </p>
                <p className="text-xs font-semibold">— Sarah M., Mom of 2</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <CardTitle className="text-lg">"Worth every penny"</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  "We were spending $200/week on tutoring. Study Coach costs less than ONE session 
                  but my son uses it every single day. Amazing value."
                </p>
                <p className="text-xs font-semibold">— Michael R., Dad of 1</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <CardTitle className="text-lg">"Confidence has soared"</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  "My daughter used to cry during homework. Now she tackles problems independently 
                  and actually believes in herself. This is life-changing."
                </p>
                <p className="text-xs font-semibold">— Jennifer L., Mom of 3</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground">
                One plan. All features. Cancel anytime.
              </p>
            </div>

            <Card className="max-w-lg mx-auto border-2 border-primary shadow-lg">
              <CardHeader className="text-center pb-8">
                <Badge className="mb-4 w-fit mx-auto">7-Day Free Trial</Badge>
                <CardTitle className="text-3xl">Study Coach Premium</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$12.99</span>
                  <span className="text-muted-foreground">/month per child</span>
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

                <div className="text-center">
                  <Link href="/login">
                    <Button size="lg" className="w-full text-lg">
                      Start Your Free Trial
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Cancel anytime with one click. No questions asked.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Need to add multiple children? Manage all child accounts from your dashboard after subscribing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust */}
      <section className="py-20 bg-accent/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Safe, Private, & Trusted by Parents
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Bank-Level Security</h3>
                <p className="text-sm text-muted-foreground">
                  256-bit encryption protects every interaction
                </p>
              </div>

              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">COPPA Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Full compliance with children's privacy laws
                </p>
              </div>

              <div className="text-center">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Ads, Ever</h3>
                <p className="text-sm text-muted-foreground">
                  Pure focus on learning, zero distractions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Is this really better than hiring a tutor?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  In many ways, yes! A tutor costs $50-$100/hour and is only available for 1-2 hours per week. 
                  Study Coach is available 24/7 for unlimited questions at a fraction of the cost. Plus, your child 
                  can use it whenever they need help—not just during scheduled sessions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Will my child just get all the answers?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No! Study Coach uses the Socratic method—guiding students to find answers themselves through 
                  questions and hints. We teach them HOW to think, not WHAT to think. This builds real understanding 
                  and confidence.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  What subjects does Study Coach cover?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  All core subjects: Math, Science, English/Language Arts, History, and Social Studies. 
                  We cover elementary through high school (grades 3-12, ages 8-18) and even some college-level courses.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  How does the 7-day free trial work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sign up, use all premium features for 7 days—no credit card required. If you love it, 
                  upgrade for $12.99/month. If not, your account simply reverts to free (limited features) 
                  with no charge.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  How will I know if it's working?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You'll receive weekly email summaries showing what subjects your child practiced, 
                  time spent learning, and AI insights on progress. The parent dashboard gives you 
                  real-time visibility without being intrusive. Plus, you'll see it in their improved 
                  grades and confidence!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Can I really try it free for 7 days?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! No credit card required. Sign up, create your child's profile, and use all 
                  premium features for 7 days. If you love it, upgrade for $12.99/month. If not, 
                  no charge—just walk away. We're confident you'll see the value.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Is my child's data safe and private?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. We use bank-level encryption, never sell data, and comply with student 
                  privacy laws (FERPA/COPPA). There are no ads, no social features, and no external 
                  links. Your child gets a focused, safe learning environment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="bg-background rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Can I cancel anytime?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes—one click in your account settings. No hoops to jump through, no "are you sure?" 
                  emails, no retention tactics. Cancel anytime and your subscription ends at the current 
                  billing period. We'd rather earn your loyalty through great service.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to See Your Child Succeed?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join hundreds of families who've already transformed struggling students into confident learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-6">
                  Unlock Their Potential — Try Free
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card • Cancel anytime • 7-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-primary/5 rounded-xl p-8 text-center">
              <h3 className="font-semibold text-2xl mb-3">Want study tips & parent hacks?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Get 1 weekly email to help your child learn smarter — no spam, unsubscribe anytime.
              </p>
              <form className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                  required
                />
                <Button type="submit" size="lg">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4">
                ✓ Weekly tips • ✓ Parent success stories • ✓ No spam ever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="/help-center" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Email Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Study Coach. All rights reserved. Made with ❤️ for students and families.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
