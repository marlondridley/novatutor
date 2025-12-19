export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: November 6, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              At BestTutorEver, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our service. Please read this 
              privacy policy carefully. If you do not agree with the terms of this privacy policy, 
              please do not access the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Name and email address</li>
              <li>Age and grade level (for educational purposes)</li>
              <li>Profile information and preferences</li>
              <li>Payment and billing information (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Usage Information</h3>
            <p className="text-muted-foreground mb-4">
              We automatically collect certain information about your device and how you interact with our service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Learning activity and progress data</li>
              <li>Questions asked and subjects studied</li>
              <li>Session duration and frequency of use</li>
              <li>Device information and browser type</li>
              <li>IP address and general location (city/state level)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our educational services</li>
              <li>Personalize your learning experience</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send you important updates about your account</li>
              <li>Generate progress reports for parents and students</li>
              <li>Respond to your requests and provide customer support</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> We use trusted third-party services (like Stripe for payments, 
              Supabase for data storage) who process information on our behalf</li>
              <li><strong>Parent Access:</strong> Parents can access their child's learning progress and activity data</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Children's Privacy (COPPA Compliance)</h2>
            <p className="text-muted-foreground mb-4">
              BestTutorEver is designed for students of all ages, including children under 13. We are committed 
              to complying with the Children's Online Privacy Protection Act (COPPA). For users under 13:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>We require verifiable parental consent before collecting personal information</li>
              <li>We collect only the minimum information necessary to provide our service</li>
              <li>Parents can review, modify, or delete their child's information at any time</li>
              <li>We do not show third-party advertising to children</li>
              <li>We do not enable public profiles or sharing features for children</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal information by employees</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to 
              protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-4">
              You have the following rights regarding your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at privacy@studycoach.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to improve your experience. These help us 
              remember your preferences, understand how you use our service, and provide relevant features. 
              You can control cookies through your browser settings, though some features may not work 
              properly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide 
              services. If you close your account, we will delete or anonymize your information within 
              90 days, except where we're required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">International Users</h2>
            <p className="text-muted-foreground">
              BestTutorEver is based in the United States. By using our service, you consent to the transfer 
              of your information to the United States, which may have different data protection laws than 
              your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any significant 
              changes by posting the new policy on this page and updating the "Last updated" date. 
              Your continued use of BestTutorEver after changes are posted constitutes acceptance of the 
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions or concerns about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> privacy@studycoach.com<br />
                <strong>Mail:</strong> BestTutorEver Privacy Team<br />
                [Your Company Address]<br />
                [City, State ZIP]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

