"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, Line, LineChart, Tooltip as RechartsTooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
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
  interventionEffectivenessData,
  interventionChartConfig,
  learningPatternsData,
  learningPatternsChartConfig,
} from "@/lib/data";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardCharts() {
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
            <ChartContainer
              config={interventionChartConfig}
              className="mx-auto aspect-square h-[250px]"
            >
              <PieChart>
                <RechartsTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={interventionEffectivenessData}
                  dataKey="effectiveness"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-2">
                <CardTitle>Learning Rhythm</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The goal isn't every day — it's steady effort. You're building great habits!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            <CardDescription>Your study consistency over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={learningPatternsChartConfig} className="h-[250px] w-full">
              <LineChart
                accessibilityLayer
                data={learningPatternsData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(5)}
                />
                <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                 <Line
                  dataKey="timeSpent"
                  type="natural"
                  stroke="var(--color-timeSpent)"
                  strokeWidth={2}
                  dot={false}
                />
                 <Line
                  dataKey="topicsCovered"
                  type="natural"
                  stroke="var(--color-topicsCovered)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
