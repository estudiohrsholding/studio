
'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

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

interface StockData {
    category: string;
    stock: number;
    fill: string;
}

interface StockLevelsChartProps {
    data: StockData[];
}

const chartConfig = {
  stock: {
    label: 'Stock',
  },
  // Dynamic keys will be added from props
} satisfies ChartConfig;

export function StockLevelsChart({ data = [] }: StockLevelsChartProps) {
  const totalStock = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.stock, 0);
  }, [data]);

  const dynamicChartConfig = React.useMemo(() => {
    const config: ChartConfig = { ...chartConfig };
    data.forEach(item => {
        config[item.category] = {
            label: item.category,
            color: item.fill,
        };
    });
    return config;
  }, [data]);


  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Total Stock by Category</CardTitle>
        <CardDescription>Distribution of items across categories</CardDescription>
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
                    data={data}
                    dataKey="stock"
                    nameKey="category"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                                <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                >
                                <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                >
                                    {totalStock.toLocaleString()}
                                </tspan>
                                <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                >
                                    Units
                                </tspan>
                                </text>
                            );
                            }
                        }}
                    />
                </Pie>
                 <ChartLegend
                    content={<ChartLegendContent nameKey="category" />}
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
          Showing total stock across all categories
        </div>
      </CardFooter>
    </Card>
  );
}
