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
import { mockInventory } from '@/lib/data';

const lowStockItems = mockInventory
  .filter((item) => item.stock < 20)
  .sort((a, b) => a.stock - b.stock);

export function LowStockItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Low Stock Items</CardTitle>
        <CardDescription>
          Items that are running low and need to be refilled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Stock Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.group}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {item.stock}
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
