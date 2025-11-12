'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PrivacyAgreementModalProps {
  open: boolean;
  onAccept: (parentalConsent?: boolean) => Promise<void>;
  onDecline: () => void;
  isUnder13?: boolean;
}

export function PrivacyAgreementModal({ 
  open, 
  onAccept, 
  onDecline, 
  isUnder13 = false 
}: PrivacyAgreementModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      await onAccept(isUnder13 ? parentalConsent : undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to save consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <DialogTitle className="text-2xl">Privacy Policy Agreement</DialogTitle>
              <DialogDescription className="mt-1">
                Please review and accept our privacy policy to continue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] rounded-md border p-4 my-4">
          <div className="space-y-4 text-sm pr-4">
            <section>
              <h3 className="font-bold text-base mb-2">Introduction</h3>
              <p className="text-muted-foreground">
                At NovaTutor, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">Information We Collect</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-xs">
                <li>Name, email address, age and grade level</li>
                <li>Learning activity and progress data</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Device information and usage data</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">Children's Privacy (COPPA Compliance)</h3>
              <p className="text-muted-foreground text-xs mb-2">
                For users under 13, we require verifiable parental consent and collect only 
                the minimum information necessary to provide our service.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">Your Rights</h3>
              <p className="text-muted-foreground text-xs">
                You can access, correct, or delete your information at any time. Parents can 
                review and manage their child's data through the parent dashboard.
              </p>
            </section>

            <section className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Full Privacy Policy:</strong> Read the complete{' '}
                <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </Link>.
              </p>
            </section>
          </div>
        </ScrollArea>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="modal-accept-privacy" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              disabled={loading}
            />
            <label
              htmlFor="modal-accept-privacy"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I have read and agree to the Privacy Policy and Terms of Service
            </label>
          </div>

          {isUnder13 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <Checkbox 
                id="modal-parental-consent" 
                checked={parentalConsent}
                onCheckedChange={(checked) => setParentalConsent(checked as boolean)}
                disabled={loading}
              />
              <div className="flex-1">
                <label
                  htmlFor="modal-parental-consent"
                  className="text-sm font-medium leading-none cursor-pointer block mb-1"
                >
                  Parental Consent (Required for Under 13)
                </label>
                <p className="text-xs text-muted-foreground">
                  I am the parent/guardian and consent to my child's use of this service.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onDecline}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Decline
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={loading || !accepted || (isUnder13 && !parentalConsent)}
            className="w-full sm:w-auto"
          >
            {loading ? 'Processing...' : 'Accept & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

