"use client";

import { use } from "react";
import { CornellNoteEditor } from "@/components/cornell-note-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <Button variant="outline" onClick={() => router.push('/journal')} className="w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Journal
      </Button>
      <CornellNoteEditor noteId={id} />
    </main>
  );
}

