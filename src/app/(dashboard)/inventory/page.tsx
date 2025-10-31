import { PlusCircle, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { mockInventory } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

function RefillDialog({ itemName }: { itemName: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4"/>
                    <span className="sr-only">Refill</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='font-headline'>Refill: {itemName}</DialogTitle>
                    <DialogDescription>Add units to the existing stock.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="units" className="text-right">
                            Units to Add
                        </Label>
                        <Input id="units" type="number" defaultValue="10" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Confirm Refill</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function InventoryPage() {
  return (
    <>
      <DashboardHeader title="Inventory" />
      <PageWrapper>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Club Inventory</CardTitle>
                <CardDescription>
                  Manage items, prices, and stock levels.
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="font-headline">Add New Item</DialogTitle>
                    <DialogDescription>
                      Create a new item for your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="group" className="text-right">Group</Label>
                        <Input id="group" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Input id="category" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="min-unit" className="text-right">Min. Sale Unit</Label>
                        <Input id="min-unit" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price (€)</Label>
                        <Input id="price" type="number" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                          data-ai-hint={item.imageHint}
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.group}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                    <TableCell>€{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={item.stock < 15 ? 'text-destructive font-medium' : ''}>
                        {item.stock}
                      </span>
                      <span className="text-muted-foreground"> {item.minSaleUnit}</span>
                    </TableCell>
                    <TableCell className="text-right">
                       <RefillDialog itemName={item.name} />
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
