'use client';

import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { DailySalesChart } from '@/components/dashboard/stats/daily-sales-chart';
import { LowStockItems } from '@/components/dashboard/stats/low-stock-items';
import { StockLevelsChart } from '@/components/dashboard/stats/stock-levels-chart';

export default function StatsPage() {
  return (
    <>
      <DashboardHeader title="Statistics" />
      <PageWrapper>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DailySalesChart />
          </div>
          <div className="lg:col-span-1">
            <StockLevelsChart />
          </div>
          <div className="lg:col-span-3">
            <LowStockItems />
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
