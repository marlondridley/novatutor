'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';

function PrivacyAgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accepted, setAccepted] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [isUnder13, setIsUnder13] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Check if user already accepted
      const { data: profile } = await supabase
        .from('profiles')
        .select('privacy_accepted, age')
        .eq('id', user.id)
        .single();

      if (profile?.privacy_accepted) {
        // Already accepted, redirect to dashboard
        router.push('/dashboard');
      }

      // Check if under 13
      if (profile?.age && profile.age < 13) {
        setIsUnder13(true);
      }
    }
    checkUser();
  }, [router]);

  const handleAccept = async () => {
    if (!accepted) {
      setError('Please check the box to accept the Privacy Policy');
      return;
    }

    if (isUnder13 && !parentalConsent) {
      setError('Parental consent is required for users under 13 years old');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!userId) throw new Error('User not found');

      // Update profile with consent
      const updateData: any = {
        privacy_accepted: true,
        privacy_accepted_at: new Date().toISOString(),
      };

      if (isUnder13) {
        updateData.parental_consent = parentalConsent;
        updateData.parental_consent_date = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Redirect to dashboard or return URL
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    } catch (err: any) {
      console.error('Error accepting privacy policy:', err);
      setError(err.message || 'Failed to save consent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">Privacy Policy Agreement</CardTitle>
          <CardDescription className="text-base mt-2">
            Please review and accept our privacy policy to continue using NovaTutor
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Privacy Policy Content */}
          <ScrollArea className="h-[400px] rounded-md border p-6">
            <div className="space-y-6 text-sm">
              <section>
                <h3 className="font-bold text-lg mb-2">Last updated: November 6, 2025</h3>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2">Introduction</h3>
                <p className="text-muted-foreground">
                  At NovaTutor, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our service. Please read this 
                  privacy policy carefully.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2">Information We Collect</h3>
                <p className="text-muted-foreground mb-2"><strong>Personal Information:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Name and email address</li>
                  <li>Age and grade level (for educational purposes)</li>
                  <li>Profile information and preferences</li>
                  <li>Payment and billing information (processed securely through Stripe)</li>
                </ul>
                
                <p className="text-muted-foreground mt-3 mb-2"><strong>Usage Information:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Learning activity and progress data</li>
                  <li>Questions asked and subjects studied</li>
                  <li>Session duration and frequency of use</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location (city/state level)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2">How We Use Your Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
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
                <h3 className="font-bold text-base mb-2">Children's Privacy (COPPA Compliance)</h3>
                <p className="text-muted-foreground mb-2">
                  NovaTutor is designed for students of all ages, including children under 13. We are committed 
                  to complying with the Children's Online Privacy Protection Act (COPPA). For users under 13:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>We require verifiable parental consent before collecting personal information</li>
                  <li>We collect only the minimum information necessary to provide our service</li>
                  <li>Parents can review, modify, or delete their child's information at any time</li>
                  <li>We do not show third-party advertising to children</li>
                  <li>We do not enable public profiles or sharing features for children</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2">Data Security</h3>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures including encryption, secure authentication, 
                  and regular security audits. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2">Your Rights</h3>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Receive your data in a portable format</li>
                </ul>
              </section>

              <section>
                <p className="text-sm text-muted-foreground">
                  <strong>Full Privacy Policy:</strong> For complete details, please read our{' '}
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                    full Privacy Policy
                  </Link>.
                </p>
              </section>
            </div>
          </ScrollArea>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="accept-privacy" 
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                disabled={loading}
              />
              <label
                htmlFor="accept-privacy"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I have read and agree to the Privacy Policy and Terms of Service
              </label>
            </div>

            {isUnder13 && (
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <Checkbox 
                  id="parental-consent" 
                  checked={parentalConsent}
                  onCheckedChange={(checked) => setParentalConsent(checked as boolean)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <label
                    htmlFor="parental-consent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block mb-1"
                  >
                    Parental Consent Required (User Under 13)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I am the parent or legal guardian of this child and I consent to the collection 
                    and use of my child's information as described in the Privacy Policy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Decline & Exit
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={loading || !accepted || (isUnder13 && !parentalConsent)}
            className="w-full sm:w-auto"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accept & Continue
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PrivacyAgreementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PrivacyAgreementContent />
    </Suspense>
  );
}

