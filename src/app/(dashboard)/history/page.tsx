
'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface LogEntry {
  id: string;
  type: 'dispense' | 'refill' | 'dispense-log';
  transactionDate: Timestamp | { seconds: number; nanoseconds: number };
  itemName: string;
  quantity: number;
  amount: number | null;
  memberName?: string;
  user?: string;
}

export default function HistoryPage() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const clubId = useAuthStore((state) => state.clubId);

  useEffect(() => {
    if (!clubId) {
      setIsLoading(false);
      return;
    }

    const db = getFirestore();
    const logQuery = query(
      collection(db, 'clubs', clubId, 'transactions'),
      orderBy('transactionDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      logQuery,
      (snapshot) => {
        const logsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as LogEntry)
        );
        // We filter out the parent 'dispense' transaction container
        // to avoid duplicates, as individual items are logged with 'dispense-log'
        setLogEntries(logsData.filter(log => log.type !== 'dispense'));
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching history:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clubId]);
  
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    // If it's a Firebase Timestamp object from the client
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleString();
    }
    // If it's a plain object from server-side rendering
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleString();
    }
    return 'Invalid Date';
  }

  return (
    <>
      <DashboardHeader title="History" />
      <PageWrapper>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Transaction History</CardTitle>
            <CardDescription>
              A log of all refills and dispenses in your club.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : logEntries.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                No transaction history found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge
                          variant={entry.type === 'dispense-log' ? 'destructive' : 'secondary'}
                          className={entry.type === 'dispense-log' ? 'bg-amber-800 text-amber-50' : 'bg-emerald-800 text-emerald-50'}
                        >
                          {entry.type === 'dispense-log' ? 'Dispense' : 'Refill'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.itemName}</TableCell>
                      <TableCell>
                        {entry.type === 'dispense-log' ? (
                          <span>
                            {entry.quantity} units to{' '}
                            <span className="font-medium">{entry.memberName}</span>
                          </span>
                        ) : (
                          <span>
                            {entry.quantity} units refilled by{' '}
                            <span className="font-medium">{entry.user}</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(entry.transactionDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.amount ? `€${entry.amount.toFixed(2)}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageWrapper>
    </>
  );
}
