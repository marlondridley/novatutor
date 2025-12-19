export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: November 6, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using BestTutorEver, you agree to be bound by these Terms of Service and all 
              applicable laws and regulations. If you do not agree with any of these terms, you are 
              prohibited from using or accessing this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Description of Service</h2>
            <p className="text-muted-foreground">
              BestTutorEver is an AI-powered educational platform that provides tutoring, study planning, 
              practice quizzes, and related learning tools (the "Service"). The Service is designed to 
              supplement, not replace, traditional education and should be used as a learning aid.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Account Creation</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 13 years old to create an account without parental consent</li>
              <li>For users under 13, a parent or guardian must create and manage the account</li>
              <li>Each account is for individual use only and may not be shared</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Account Responsibilities</h3>
            <p className="text-muted-foreground mb-4">
              You are responsible for all activity that occurs under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Not share your account credentials with others</li>
              <li>Use the Service in compliance with all applicable laws</li>
              <li>Not attempt to circumvent any usage limitations or security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree NOT to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violate any laws or regulations</li>
              <li>Cheat on tests, exams, or assignments in violation of academic integrity policies</li>
              <li>Submit someone else's work as your own</li>
              <li>Harass, abuse, or harm others</li>
              <li>Upload malicious code or attempt to compromise system security</li>
              <li>Scrape, copy, or reproduce content for commercial purposes</li>
              <li>Reverse engineer or attempt to extract the AI models</li>
              <li>Use the Service to generate inappropriate or harmful content</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Academic Integrity</h2>
            <p className="text-muted-foreground">
              BestTutorEver is designed to help students learn through guided instruction, not to complete 
              assignments for them. We encourage students to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Use the Service as a learning tool and tutor, not a homework completion service</li>
              <li>Follow their school's academic integrity policies</li>
              <li>Understand the material rather than just copying answers</li>
              <li>Cite sources appropriately when required</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We are not responsible for violations of academic integrity policies. Students and parents 
              are responsible for ensuring appropriate use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Subscription and Payment</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Billing</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Subscriptions are billed monthly at the rate specified on our pricing page</li>
              <li>Payment is processed through our third-party payment processor (Stripe)</li>
              <li>You authorize us to charge your payment method on a recurring basis</li>
              <li>Prices are subject to change with 30 days notice</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Free Trial</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>New users may be eligible for a free trial period</li>
              <li>No payment is required during the trial period</li>
              <li>After the trial, your subscription will begin automatically unless canceled</li>
              <li>One free trial per user/household</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Cancellation and Refunds</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You may cancel your subscription at any time from your account settings</li>
              <li>Cancellations take effect at the end of the current billing period</li>
              <li>No refunds for partial months or unused portions of the subscription</li>
              <li>We reserve the right to offer refunds on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Our Content</h3>
            <p className="text-muted-foreground">
              All content provided through BestTutorEver, including but not limited to text, graphics, logos, 
              software, and AI-generated responses, is the property of BestTutorEver or its licensors and is 
              protected by copyright and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Your Content</h3>
            <p className="text-muted-foreground">
              You retain ownership of content you submit to the Service (questions, uploaded documents, etc.). 
              By submitting content, you grant us a license to use, store, and process it to provide the Service. 
              We may use anonymized data to improve our AI models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Disclaimers</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Educational Tool</h3>
            <p className="text-muted-foreground">
              BestTutorEver is an educational tool that uses AI technology. While we strive for accuracy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>AI responses may contain errors or inaccuracies</li>
              <li>The Service is not a substitute for professional educators or tutors</li>
              <li>We do not guarantee specific learning outcomes or academic performance</li>
              <li>Students should verify important information with teachers or other resources</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Service Availability</h3>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Uninterrupted or error-free service</li>
              <li>That defects will be corrected</li>
              <li>That the Service is free from viruses or harmful components</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, BestTutorEver shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
              whether incurred directly or indirectly, or any loss of data, use, goodwill, or other 
              intangible losses resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of your data</li>
              <li>Any errors or omissions in content or AI responses</li>
              <li>Any academic or disciplinary consequences from Service use</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Our total liability shall not exceed the amount you paid us in the 12 months prior to the 
              event giving rise to liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of the Service or harassment of other users</li>
              <li>Non-payment of fees</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Upon termination, your right to use the Service will immediately cease, and we may delete 
              your account and associated data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these Terms at any time. We will notify users of material changes by email 
              or through the Service. Your continued use of the Service after changes are posted 
              constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the United States 
              and the State of [Your State], without regard to conflict of law principles. Any disputes 
              arising from these Terms or the Service shall be resolved in the courts located in [Your County/State].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> legal@studycoach.com<br />
                <strong>Mail:</strong> BestTutorEver Legal Department<br />
                [Your Company Address]<br />
                [City, State ZIP]
              </p>
            </div>
          </section>

          <section className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              By using BestTutorEver, you acknowledge that you have read, understood, and agree to be bound 
              by these Terms of Service and our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

