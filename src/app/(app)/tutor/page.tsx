"use client";

import { useSearchParams } from "next/navigation";
import { EducationalAssistantChat } from "@/components/educational-assistant-chat";
import { HomeworkPlanner } from "@/components/homework-planner";
import { DashboardCharts } from "@/components/dashboard-charts";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { StreakCard } from "@/components/streak-card";
import { ReflectionCard } from "@/components/reflection-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ClipboardList, BarChart3, Sparkles } from "lucide-react";

/**
 * My Coach Page
 * 
 * The main learning hub with:
 * - AI Chat Tutor
 * - Homework Planner
 * - Progress Dashboard
 * - Onboarding & Streaks
 */
export default function TutorPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const pageContext = searchParams.get("context");

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          My Learning Coach
        </h1>
        <p className="text-sm text-muted-foreground">
          Chat with your tutor, plan homework, and track your progress!
        </p>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue={initialQuery ? "chat" : "planner"} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="planner" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Planner</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1">
          <div className="h-[calc(100vh-280px)]">
            <EducationalAssistantChat 
              initialQuery={initialQuery || undefined}
              pageContext={pageContext || undefined}
            />
          </div>
        </TabsContent>

        {/* Planner Tab */}
        <TabsContent value="planner" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-4">
            <div className="flex flex-1 flex-col gap-4 rounded-lg bg-accent/30 p-4 shadow-inner">
              <HomeworkPlanner />
            </div>
            <div className="space-y-4">
              <OnboardingChecklist />
              <StreakCard />
              <ReflectionCard />
            </div>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <DashboardCharts />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StreakCard />
            <ReflectionCard />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
