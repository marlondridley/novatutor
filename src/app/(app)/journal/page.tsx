"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Journal page now redirects to Smart Tools
 * where both Smart Summarizer and Learning Journal are combined
 */
export default function LearningJournalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/summarizer');
  }, [router]);

  return null;
}
