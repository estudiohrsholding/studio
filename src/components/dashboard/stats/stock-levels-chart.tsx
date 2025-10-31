
'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';

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

interface ChartDataItem {
    name: string;
    value: number;
    fill: string;
}

interface StockLevelsChartProps {
    data: ChartDataItem[];
}

const chartConfig = {
  stock: {
    label: 'Stock',
  },
} satisfies ChartConfig;

export function StockLevelsChart({ data = [] }: StockLevelsChartProps) {
  const totalStock = React.useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  const dynamicChartConfig = React.useMemo(() => {
    const config: ChartConfig = { ...chartConfig };
    data.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return config;
  }, [data]);


  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Stock by Group</CardTitle>
        <CardDescription>Total stock quantity per group</CardDescription>
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
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                    </Pie>
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
