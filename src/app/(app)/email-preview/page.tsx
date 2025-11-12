import { EmailOnboardingPreview } from '@/components/email-onboarding';

export default function EmailPreviewPage() {
  return (
    <main className="flex flex-1 flex-col">
      <EmailOnboardingPreview userName="Jamie" />
    </main>
  );
}

