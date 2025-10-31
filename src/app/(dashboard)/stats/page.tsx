
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

interface HierarchicalStockData {
    name: string;
    children: {
        name: string;
        value: number;
    }[];
}

const chartColors = [
    'hsl(var(--color-flowers))', 'hsl(var(--color-oils))', 'hsl(var(--color-edibles))', 
    'hsl(var(--color-vapes))', 'hsl(var(--color-topicals))', 'hsl(var(--color-other))'
];

export default function StatsPage() {
  const clubId = useAuthStore((state) => state.clubId);
  
  const [dailySalesData, setDailySalesData] = useState<DailySale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [hierarchicalStockData, setHierarchicalStockData] = useState<HierarchicalStockData[]>([]);
  
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
        
        // --- Hierarchical Data Processing ---
        const stockByGroupAndCategory: Record<string, Record<string, number>> = {};
        
        items.forEach(item => {
            const group = item.group || 'Uncategorized';
            const category = item.category || 'Uncategorized';
            
            if (!stockByGroupAndCategory[group]) {
                stockByGroupAndCategory[group] = {};
            }
            if (!stockByGroupAndCategory[group][category]) {
                stockByGroupAndCategory[group][category] = 0;
            }
            stockByGroupAndCategory[group][category] += item.stockLevel;
        });

        const hierarchicalData: HierarchicalStockData[] = Object.entries(stockByGroupAndCategory).map(([groupName, categories], groupIndex) => {
            const children = Object.entries(categories).map(([categoryName, stock]) => ({
                name: categoryName,
                value: stock,
            }));
            
            return {
                name: groupName,
                children: children,
                fill: chartColors[groupIndex % chartColors.length]
            };
        });

        setHierarchicalStockData(hierarchicalData);
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
                    <StockLevelsChart data={hierarchicalStockData} />
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
