import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Shield, Lock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Safety & Privacy | BestTutorEver",
  description: "Kid-safe, privacy-first design with simple rules for students and parents.",
};

export default function SafetyPage() {
  return (
    <main className="container max-w-4xl py-12 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-purple-600 font-bold">
          <Shield className="h-6 w-6" />
          <span>Safety & Privacy</span>
        </div>
        <h1 className="text-3xl font-extrabold">Safe by design for kids & families</h1>
        <p className="text-muted-foreground">
          We built BestTutorEver to be safe for students and transparent for parents. Here’s what we do and how you can stay informed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Kid-Safe Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• No ads, no social feeds, no external links inside learning flows.</p>
            <p>• Content filters for illustration prompts and kid-friendly copy.</p>
            <p>• Voice and text are local by default; Premium Voice uses OpenAI with minimal data sent.</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              Parent Transparency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Parent dashboard shows time spent and subjects studied (no PII content stored).</p>
            <p>• Weekly summaries and downloadable reports for your records.</p>
            <p>• Clear upgrade controls for Premium Voice; easy cancel anytime.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Privacy Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>We minimize data: transcripts for local voice stay on-device; Premium Voice requests go to OpenAI only for transcription.</p>
          <p>No selling of data, no advertising, no sharing with third parties beyond the services you opt into (e.g., Stripe for billing).</p>
          <p>Questions? Email us from the Support page. We’ll respond quickly.</p>
          <Link href="/privacy" className="text-purple-700 font-semibold underline">Read full Privacy Policy</Link>
        </CardContent>
      </Card>
    </main>
  );
}

