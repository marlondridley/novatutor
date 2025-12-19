import Link from 'next/link';
import { Heart, Target, Users, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            About BestTutorEver
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering students to learn better, faster, and with confidence
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-16">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Heart className="h-12 w-12 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We believe every student deserves access to quality education and personalized support. 
                    BestTutorEver was created to make learning more accessible, affordable, and effective for 
                    students everywhere. By combining advanced AI technology with proven teaching methods, 
                    we're helping students build confidence, master difficult concepts, and achieve their 
                    academic goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              BestTutorEver was born from a simple observation: traditional tutoring is expensive, scheduling 
              is difficult, and students often need help right when they're stuck on a problem—not days later 
              when a tutor is available.
            </p>
            <p>
              We saw families spending hundreds or even thousands of dollars on tutoring, while many students 
              couldn't afford help at all. We knew there had to be a better way.
            </p>
            <p>
              By leveraging cutting-edge AI technology and the time-tested Socratic teaching method, we created 
              a platform that provides instant, personalized tutoring at a fraction of the cost of traditional 
              services. BestTutorEver is available 24/7, covers all subjects, and adapts to each student's 
              learning style and pace.
            </p>
            <p>
              Today, thousands of students use BestTutorEver to get homework help, prepare for tests, and build 
              stronger study habits. We're proud to be making quality education support accessible to families 
              everywhere.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Student-First Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every decision we make starts with asking: "Is this best for students?" We're committed 
                  to creating tools that truly help students learn, not just complete assignments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Quality education support shouldn't be a luxury. We're committed to keeping BestTutorEver 
                  affordable so every student can get the help they need to succeed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Family Partnership</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe parents should be partners in their child's education. That's why we provide 
                  transparent progress tracking and regular updates on learning activities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Safe & Ethical</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We take student safety and privacy seriously. No ads, no data selling, no compromises. 
                  We're COPPA compliant and committed to maintaining a safe learning environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">What Makes Us Different</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Socratic Teaching Method</h3>
                    <p className="text-muted-foreground">
                      We don't just give answers—we guide students to discover solutions themselves, 
                      promoting deeper understanding and critical thinking skills.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Availability</h3>
                    <p className="text-muted-foreground">
                      Help is available whenever students need it—late at night, early morning, or 
                      during study breaks. No scheduling required.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Comprehensive Platform</h3>
                    <p className="text-muted-foreground">
                      Beyond tutoring, we provide study planning, practice quizzes, progress tracking, 
                      and parent insights—everything in one place.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Affordable Pricing</h3>
                    <p className="text-muted-foreground">
                      At $12.99/month, we cost less than a single hour of traditional tutoring, 
                      yet provide unlimited support across all subjects.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center bg-muted rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">Join Thousands of Successful Students</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Start your free 7-day trial today • No credit card required
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

