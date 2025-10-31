
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  sales: {
    label: 'Sales (€)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

interface DailySalesChartProps {
  data: { day: string; sales: number }[];
}

export function DailySalesChart({ data }: DailySalesChartProps) {
  const hasData = data && data.length > 0 && data.some(d => d.sales > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Daily Sales</CardTitle>
        <CardDescription>Sales figures for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig}>
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `€${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
            </BarChart>
          </ChartContainer>
        ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No sales data available for the last 7 days.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
