
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  where,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { DailySalesChart } from '@/components/dashboard/stats/daily-sales-chart';
import { LowStockItems } from '@/components/dashboard/stats/low-stock-items';
import { StockLevelsChart } from '@/components/dashboard/stats/stock-levels-chart';
import type { Item } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionLog {
  id: string;
  transactionDate: Timestamp;
  amount: number;
  type: 'dispense-log';
}

interface DailySale {
  day: string;
  sales: number;
}

interface StockDistribution {
  category: string;
  stock: number;
  fill: string;
}

export default function StatsPage() {
  const clubId = useAuthStore((state) => state.clubId);
  const [dailySalesData, setDailySalesData] = useState<DailySale[]>([]);
  const [stockDistributionData, setStockDistributionData] = useState<StockDistribution[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for Daily Sales Data
  useEffect(() => {
    if (!clubId) {
        setIsLoading(false);
        return;
    }
    
    const today = new Date();
    const sevenDaysAgo = startOfDay(subDays(today, 6));

    const transactionsQuery = query(
      collection(getFirestore(), 'clubs', clubId, 'transactions'),
      where('type', '==', 'dispense-log'),
      where('transactionDate', '>=', sevenDaysAgo)
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const salesByDay: Record<string, number> = {};

      // Initialize sales for the last 7 days to 0
      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        const dayKey = format(date, 'E'); // 'Mon', 'Tue', etc.
        salesByDay[dayKey] = 0;
      }
      
      snapshot.docs.forEach((doc) => {
        const log = doc.data() as TransactionLog;
        if (log.transactionDate) {
          const saleDate = log.transactionDate.toDate();
          const dayKey = format(saleDate, 'E');
          if (dayKey in salesByDay) {
            salesByDay[dayKey] += log.amount;
          }
        }
      });

      const chartData = Object.entries(salesByDay)
        .map(([day, sales]) => ({ day, sales }))
        .reverse(); // To have the oldest day first

      setDailySalesData(chartData);
      if (stockDistributionData.length > 0 && !isLoading) setIsLoading(false);
    }, (error) => {
        console.error("Error fetching sales data: ", error);
        if (stockDistributionData.length > 0 && !isLoading) setIsLoading(false);
    });

    return () => unsubscribe();
  }, [clubId, stockDistributionData, isLoading]);

  // Effect for Stock Distribution and Low Stock
  useEffect(() => {
    if (!clubId) {
        setIsLoading(false);
        return;
    }
    
    const inventoryQuery = query(
      collection(getFirestore(), 'clubs', clubId, 'inventoryItems'),
      orderBy('stockLevel', 'asc')
    );

    const unsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data() as Item);
        const stockByCategory: Record<string, number> = {};

        items.forEach(item => {
            const category = item.category || 'Uncategorized';
            if (!stockByCategory[category]) {
                stockByCategory[category] = 0;
            }
            stockByCategory[category] += item.stockLevel;
        });

        const chartColors = [
            'var(--color-flowers)', 'var(--color-oils)', 'var(--color-edibles)', 
            'var(--color-vapes)', 'var(--color-topicals)'
        ];

        const stockData = Object.entries(stockByCategory).map(([category, stock], index) => ({
            category,
            stock,
            fill: chartColors[index % chartColors.length]
        }));
        
        setStockDistributionData(stockData);
        setLowStockItems(items.filter(item => item.stockLevel < 20));
        if (dailySalesData.length > 0 && !isLoading) setIsLoading(false);
    }, (error) => {
        console.error("Error fetching inventory data: ", error);
        if (dailySalesData.length > 0 && !isLoading) setIsLoading(false);
    });

    return () => unsubscribe();
  }, [clubId, dailySalesData, isLoading]);

  useEffect(() => {
    if (dailySalesData.length > 0 && stockDistributionData.length > 0) {
      setIsLoading(false);
    }
  }, [dailySalesData, stockDistributionData]);


  return (
    <>
      <DashboardHeader title="Statistics" />
      <PageWrapper>
        {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2"><Skeleton className="h-[400px] w-full" /></div>
                <div className="lg:col-span-1"><Skeleton className="h-[400px] w-full" /></div>
                <div className="lg:col-span-3"><Skeleton className="h-[300px] w-full" /></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <DailySalesChart data={dailySalesData} />
                </div>
                <div className="lg:col-span-1">
                    <StockLevelsChart data={stockDistributionData} />
                </div>
                <div className="lg:col-span-3">
                    <LowStockItems items={lowStockItems} />
                </div>
            </div>
        )}
      </PageWrapper>
    </>
  );
}
