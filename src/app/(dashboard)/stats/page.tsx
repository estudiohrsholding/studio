
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { subDays, startOfDay, format } from 'date-fns';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { DailySalesChart } from '@/components/dashboard/stats/daily-sales-chart';
import { LowStockItems } from '@/components/dashboard/stats/low-stock-items';
import { StockLevelsChart } from '@/components/dashboard/stats/stock-levels-chart';
import { CategoryDistributionChart } from '@/components/dashboard/stats/category-distribution-chart';
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

interface ChartDataItem {
    name: string;
    value: number;
    fill: string;
}

export default function StatsPage() {
  const clubId = useAuthStore((state) => state.clubId);
  
  const [dailySalesData, setDailySalesData] = useState<DailySale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [groupDistributionData, setGroupDistributionData] = useState<ChartDataItem[]>([]);
  const [categoryDistributionData, setCategoryDistributionData] = useState<ChartDataItem[]>([]);
  
  const [isSalesLoading, setIsSalesLoading] = useState(true);
  const [isStockLoading, setIsStockLoading] = useState(true);

  // Effect for Daily Sales Data
  useEffect(() => {
    if (!clubId) {
        setIsSalesLoading(false);
        return;
    }
    setIsSalesLoading(true);
    
    const today = new Date();
    const sevenDaysAgo = startOfDay(subDays(today, 6));

    const transactionsQuery = query(
      collection(getFirestore(), 'clubs', clubId, 'transactions'),
      orderBy('transactionDate', 'desc')
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const salesByDay: Record<string, number> = {};

      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        const dayKey = format(date, 'E'); 
        salesByDay[dayKey] = 0;
      }
      
      snapshot.docs.forEach((doc) => {
        const log = doc.data() as TransactionLog;
        if (log.transactionDate && log.type === 'dispense-log') {
          const saleDate = log.transactionDate.toDate();
          if (saleDate >= sevenDaysAgo) {
            const dayKey = format(saleDate, 'E');
            if (dayKey in salesByDay) {
              salesByDay[dayKey] += log.amount;
            }
          }
        }
      });

      const chartData = Object.entries(salesByDay)
        .map(([day, sales]) => ({ day, sales }))
        .reverse();

      setDailySalesData(chartData);
      setIsSalesLoading(false);
    }, (error) => {
        console.error("Error fetching sales data: ", error);
        setIsSalesLoading(false);
    });

    return () => unsubscribe();
  }, [clubId]);

  // Effect for Stock Distribution and Low Stock
  useEffect(() => {
    if (!clubId) {
        setIsStockLoading(false);
        return;
    }
    setIsStockLoading(true);
    
    const inventoryQuery = query(
      collection(getFirestore(), 'clubs', clubId, 'inventoryItems'),
      orderBy('stockLevel', 'asc')
    );

    const unsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
        
        // --- Group & Category Data Processing ---
        const stockByGroup: Record<string, number> = {};
        const stockByCategory: Record<string, number> = {};
        
        items.forEach(item => {
            const group = item.group || 'Uncategorized';
            const category = item.category || 'Uncategorized';
            const stock = item.stockLevel || 0;
            
            stockByGroup[group] = (stockByGroup[group] || 0) + stock;
            stockByCategory[category] = (stockByCategory[category] || 0) + stock;
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

        setGroupDistributionData(groupData);
        setCategoryDistributionData(categoryData);
        setLowStockItems(items.filter(item => item.stockLevel < 20));
        setIsStockLoading(false);
    }, (error) => {
        console.error("Error fetching inventory data: ", error);
        setIsStockLoading(false);
    });

    return () => unsubscribe();
  }, [clubId]);

  const isLoading = isSalesLoading || isStockLoading;

  return (
    <>
      <DashboardHeader title="Statistics" />
      <PageWrapper>
        {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2"><Skeleton className="h-[400px] w-full" /></div>
                <div className="lg:col-span-1"><Skeleton className="h-[400px] w-full" /></div>
                <div className="lg:col-span-1"><Skeleton className="h-[400px] w-full" /></div>
                <div className="lg:col-span-2"><Skeleton className="h-[300px] w-full" /></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <DailySalesChart data={dailySalesData} />
                </div>
                <div className="lg:col-span-1">
                    <StockLevelsChart data={groupDistributionData} />
                </div>
                <div className="lg:col-span-1">
                    <CategoryDistributionChart data={categoryDistributionData} />
                </div>
                <div className="lg:col-span-2">
                    <LowStockItems items={lowStockItems} />
                </div>
            </div>
        )}
      </PageWrapper>
    </>
  );
}
