import { FocusHelp } from "@/components/focus-help";

export default function FocusPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-2">
         <p className="text-muted-foreground">
            Feeling distracted? Try one of these quick activities to regain your focus and get back to learning.
        </p>
      </div>
      <FocusHelp />
    </main>
  );
}
