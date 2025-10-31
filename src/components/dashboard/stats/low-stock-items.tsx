
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Item } from '@/lib/types';

interface LowStockItemsProps {
    items: Item[];
}

export function LowStockItems({ items }: LowStockItemsProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Low Stock Items</CardTitle>
        <CardDescription>
          Items with a stock level below 20 units.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Stock Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.group}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {item.stockLevel}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            All items are well-stocked.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
