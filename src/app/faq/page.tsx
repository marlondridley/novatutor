import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Get answers to common questions about Study Coach
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              What is Study Coach?
            </AccordionTrigger>
            <AccordionContent>
              Study Coach is an AI-powered learning platform that helps students with homework, test preparation, and study planning. 
              We use advanced AI technology to provide personalized tutoring across all subjects, helping students learn more effectively 
              through the Socratic teaching method.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              How does the 7-day free trial work?
            </AccordionTrigger>
            <AccordionContent>
              Your 7-day free trial gives you full access to all Study Coach features with no credit card required. 
              You can explore the platform, get homework help, and try all our features risk-free. After the trial, 
              you can choose to subscribe for $12.99/month. Cancel anytime with no questions asked.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              What subjects does Study Coach cover?
            </AccordionTrigger>
            <AccordionContent>
              Study Coach covers all major academic subjects including Mathematics (Algebra, Geometry, Calculus), 
              Sciences (Physics, Chemistry, Biology), English, History, Social Studies, and more. Our AI tutor 
              is trained to help with questions from elementary school through college level.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              Is Study Coach appropriate for my child's age?
            </AccordionTrigger>
            <AccordionContent>
              Study Coach is designed for students from elementary school through college. Our AI adapts its 
              explanations to match the student's level and learning pace. The platform is COPPA compliant and 
              provides a safe, ad-free environment. Parents can monitor progress through the parent dashboard.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              How is Study Coach different from other tutoring services?
            </AccordionTrigger>
            <AccordionContent>
              Unlike traditional tutoring that costs $40-100+ per hour, Study Coach provides unlimited help 24/7 
              for just $12.99/month. Our AI tutor uses the Socratic method to guide students to discover answers 
              themselves, promoting deeper understanding. Plus, you get study planning tools, practice quizzes, 
              and parent analytics all in one platform.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              Can multiple children use one account?
            </AccordionTrigger>
            <AccordionContent>
              Yes! Parents can add multiple children to their subscription directly from their account dashboard. 
              Simply subscribe, then add child accounts from your Account Settings. Each child gets their own 
              personalized learning experience with their own profile and progress tracking. You can manage all 
              your children's accounts, monitor their progress, and add or remove children at any time from your{' '}
              <Link href="/account" className="text-primary hover:underline">Account Settings</Link>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              How do I cancel my subscription?
            </AccordionTrigger>
            <AccordionContent>
              You can cancel your subscription at any time with just one click from your account settings. 
              There are no cancellation fees or questions asked. You'll continue to have access until the end 
              of your current billing period.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              What devices can I use Study Coach on?
            </AccordionTrigger>
            <AccordionContent>
              Study Coach works on any device with a web browser - computers, tablets, and smartphones. 
              The platform is fully responsive and optimized for all screen sizes, so students can get 
              help wherever they are, whether at home, school, or on the go.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              Is my child's data safe and private?
            </AccordionTrigger>
            <AccordionContent>
              Yes, we take privacy and security very seriously. Study Coach is COPPA compliant and follows strict 
              data protection guidelines. We never sell student data, show ads, or share information with third parties. 
              All conversations are encrypted and secure. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for 
              more details.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left">
              What if I need help or have technical issues?
            </AccordionTrigger>
            <AccordionContent>
              We're here to help! You can reach our support team through the <Link href="/contact" className="text-primary hover:underline">Contact Us</Link> page 
              or visit our <Link href="/help-center" className="text-primary hover:underline">Help Center</Link> for guides and troubleshooting tips. 
              We typically respond within 24 hours on business days.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Still Have Questions */}
        <div className="mt-16 text-center bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

