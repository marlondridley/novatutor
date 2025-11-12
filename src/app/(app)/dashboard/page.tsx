import { DashboardCharts } from "@/components/dashboard-charts";
import { HomeworkPlanner } from "@/components/homework-planner";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold md:text-2xl">Welcome back!</h1>
        <p className="text-sm text-muted-foreground">Let's plan your next small win.</p>
      </div>
      <div className="flex flex-1 flex-col gap-4 rounded-lg bg-accent/30 p-4 shadow-inner">
        <HomeworkPlanner />
        <DashboardCharts />
      </div>
    </main>
  );
}