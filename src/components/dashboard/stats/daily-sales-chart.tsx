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

const chartData = [
  { day: 'Mon', sales: 150 },
  { day: 'Tue', sales: 230 },
  { day: 'Wed', sales: 310 },
  { day: 'Thu', sales: 220 },
  { day: 'Fri', sales: 450 },
  { day: 'Sat', sales: 600 },
  { day: 'Sun', sales: 350 },
];

const chartConfig = {
  sales: {
    label: 'Sales (€)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function DailySalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Daily Sales</CardTitle>
        <CardDescription>Sales figures for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} accessibilityLayer>
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
      </CardContent>
    </Card>
  );
}
