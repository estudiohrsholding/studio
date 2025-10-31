
'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Pie, PieChart } from 'recharts';

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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface HierarchicalStockData {
    name: string;
    children: {
        name: string;
        value: number;
    }[];
    fill: string;
}

interface StockLevelsChartProps {
    data: HierarchicalStockData[];
}

const chartConfig = {
  stock: {
    label: 'Stock',
  },
} satisfies ChartConfig;

// This component will now render a hierarchical chart (like a sunburst).
// For now, we'll render the top-level groups in a Pie Chart as a placeholder.
export function StockLevelsChart({ data = [] }: StockLevelsChartProps) {
  const totalStock = React.useMemo(() => {
    return data.reduce((acc, group) => {
      const groupTotal = group.children.reduce((childAcc, child) => childAcc + child.value, 0);
      return acc + groupTotal;
    }, 0);
  }, [data]);

  const topLevelData = React.useMemo(() => {
    return data.map(group => ({
        name: group.name,
        value: group.children.reduce((acc, child) => acc + child.value, 0),
        fill: group.fill,
    }));
  }, [data]);

  const dynamicChartConfig = React.useMemo(() => {
    const config: ChartConfig = { ...chartConfig };
    topLevelData.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return config;
  }, [topLevelData]);


  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Stock by Group</CardTitle>
        <CardDescription>Hierarchical distribution of items</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {data.length > 0 ? (
            <ChartContainer
                config={dynamicChartConfig}
                className="mx-auto aspect-square max-h-[300px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={topLevelData}
                        dataKey="value"
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
         ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No inventory data to display.
            </div>
         )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total Stock: {totalStock} units
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total stock across all groups.
        </div>
      </CardFooter>
    </Card>
  );
}
