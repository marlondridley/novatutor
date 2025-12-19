"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  masteryScoresData,
  masteryChartConfig,
  interventionChartConfig,
} from "@/lib/data";
import { Info, Loader2, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LearningRhythmChart } from "@/components/learning-rhythm-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StrategyData {
  name: string;
  effectiveness: number;
  fill: string;
}

export function DashboardCharts() {
  const [strategyData, setStrategyData] = useState<StrategyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real strategy effectiveness data
  useEffect(() => {
    async function fetchStrategyData() {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/strategy-effectiveness');
        
        if (!response.ok) {
          throw new Error('Failed to fetch strategy data');
        }

        const data = await response.json();
        
        if (data.hasData && data.strategies && data.strategies.length > 0) {
          setStrategyData(data.strategies);
          setHasData(true);
        } else {
          setStrategyData([]);
          setHasData(false);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching strategy effectiveness:', err);
        setError('Failed to load strategy data');
        setStrategyData([]);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchStrategyData();
  }, []);

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Confidence Growth</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Each bar shows how comfortable you feel in each subject — not a grade, just growth.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>
              How your understanding has grown over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={masteryChartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={masteryScoresData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="concept"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <RechartsTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="score" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>What's Helping You Most</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>See which learning techniques build your confidence fastest.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>
              Your progress with different study strategies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="h-[250px] flex items-center">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !hasData || strategyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-center space-y-2">
                <Info className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No study strategy data available yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Start using quizzes, homework planner, and tutor sessions to see your progress!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ChartContainer
                  config={interventionChartConfig}
                  className="mx-auto aspect-square h-[200px]"
                >
                  <PieChart>
                    <RechartsTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={strategyData}
                      dataKey="effectiveness"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    />
                  </PieChart>
                </ChartContainer>
                {/* Legend below chart */}
                <div className="flex flex-wrap gap-4 justify-center px-4">
                  {strategyData.map((strategy) => (
                    <div
                      key={strategy.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: strategy.fill }}
                      />
                      <span className="text-muted-foreground">
                        {strategy.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Learning Rhythm - Metronome Style */}
        <LearningRhythmChart />
      </div>
    </TooltipProvider>
  );
}
