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
import { mockTransactions } from '@/lib/data';

export default function HistoryPage() {
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
                {mockTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge
                        variant={tx.type === 'dispense' ? 'destructive' : 'secondary'}
                        className={tx.type === 'dispense' ? 'bg-amber-800 text-amber-50' : 'bg-emerald-800 text-emerald-50'}
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{tx.itemName}</TableCell>
                    <TableCell>
                      {tx.type === 'dispense' ? (
                        <span>
                          {tx.quantity} units to{' '}
                          <span className="font-medium">{tx.memberName}</span>
                        </span>
                      ) : (
                        <span>
                          {tx.quantity} units refilled by{' '}
                          <span className="font-medium">{tx.user}</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(tx.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.amount ? `€${tx.amount.toFixed(2)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageWrapper>
    </>
  );
}
