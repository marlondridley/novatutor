import { AdaptiveTestGenerator } from "@/components/adaptive-test-generator";

export default function TestGeneratorPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold md:text-2xl">Test Generator</h1>
        <p className="text-sm text-muted-foreground">
          Create personalized quizzes that adapt to your learning level
        </p>
      </div>
      <AdaptiveTestGenerator />
    </main>
  );
}

