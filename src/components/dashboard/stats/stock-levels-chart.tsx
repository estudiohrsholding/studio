'use client';

import { TrendingUp } from 'lucide-react';
import { RadialBar, RadialBarChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { category: 'Flowers', stock: 275, fill: 'var(--color-flowers)' },
  { category: 'Oils', stock: 200, fill: 'var(--color-oils)' },
  { category: 'Edibles', stock: 187, fill: 'var(--color-edibles)' },
  { category: 'Vapes', stock: 173, fill: 'var(--color-vapes)' },
  { category: 'Topicals', stock: 90, fill: 'var(--color-topicals)' },
];

const chartConfig = {
  stock: {
    label: 'Stock',
  },
  flowers: {
    label: 'Flowers',
    color: 'hsl(var(--chart-1))',
  },
  oils: {
    label: 'Oils',
    color: 'hsl(var(--chart-2))',
  },
  edibles: {
    label: 'Edibles',
    color: 'hsl(var(--chart-3))',
  },
  vapes: {
    label: 'Vapes',
    color: 'hsl(var(--chart-4))',
  },
  topicals: {
    label: 'Topicals',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export function StockLevelsChart() {
  const totalStock = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.stock, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Total Stock by Category</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={270}
            innerRadius={80}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="category" />}
            />
            <RadialBar dataKey="stock" background cornerRadius={10} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total Stock: {totalStock} units
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total stock across all categories
        </div>
      </CardFooter>
    </Card>
  );
}
