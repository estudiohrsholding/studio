
'use client';

import { PlusCircle, Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useState, useEffect, type FormEvent } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Item } from '@/lib/types';

function RefillDialog({ item }: { item: Item }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefill = async (event: FormEvent) => {
    event.preventDefault();
    console.log('%c[DEBUG REFILL] 1. handleRefill: Triggered.', 'color: #00FF00');

    const refillAmount = Number(amountToAdd);
    console.log('[DEBUG REFILL] 2. Refill Amount:', refillAmount);
    console.log('[DEBUG REFILL] 3. Item ID:', item.id);

    setIsLoading(true);

    if (refillAmount <= 0) {
      console.error('%c[DEBUG REFILL] 4. FAILURE: Refill amount must be greater than 0.', 'color: #FF0000');
      // Here you would typically show a toast or an inline error to the user
      setIsLoading(false);
      return;
    }

    const clubId = useAuthStore.getState().clubId;
    console.log('%c[DEBUG REFILL] 5. clubId:', 'color: #FFA500', clubId);

    if (!clubId || !item.id) {
      console.error('%c[DEBUG REFILL] 6. FAILURE: clubId or itemId is null.', 'color: #FF0000');
      setIsLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      const itemDocRef = doc(db, 'clubs', clubId, 'inventoryItems', item.id);
      console.log('%c[DEBUG REFILL] 7. Firestore Path:', 'color: #00FFFF', itemDocRef.path);
      
      console.log('[DEBUG REFILL] 8. Attempting atomic updateDoc() with increment()...');
      await updateDoc(itemDocRef, {
        stockLevel: increment(refillAmount) 
      });
      console.log('%c[DEBUG REFILL] 9. SUCCESS: updateDoc() completed.', 'color: #00FF00');
      
      console.log('[DEBUG REFILL] 10. Attempting onClose()...');
      setIsOpen(false); // Close the modal on success
      console.log('%c[DEBUG REFILL] 11. SUCCESS: onClose() called.', 'color: #00FF00');

    } catch (error: any) {
      console.error('%c[DEBUG REFILL] 12. CRITICAL FAILURE in try block:', 'color: #FF0000', error.message);
      console.error(error);
    } finally {
      console.log('[DEBUG REFILL] 13. Finally block executed.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            setAmountToAdd('');
            setIsLoading(false);
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Refill</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleRefill}>
          <DialogHeader>
            <DialogTitle className="font-headline">Refill: {item.name}</DialogTitle>
            <DialogDescription>Add units to the existing stock.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="units" className="text-right">
                Units to Add
              </Label>
              <Input 
                id="units" 
                type="number" 
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                placeholder="e.g., 10" 
                className="col-span-3" 
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Confirming...' : 'Confirm Refill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddItemDialog({ onAddItem }: { onAddItem: () => void }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [category, setCategory] = useState('');
  const [minSaleUnit, setMinSaleUnit] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    console.log('%c[DEBUG INVENTORY] 1. handleSubmit: Triggered.', 'color: #00FF00');

    console.log('[DEBUG INVENTORY] 2. Form State:', {
      name,
      group,
      category,
      minSaleUnit,
      price,
      stock,
    });

    setIsLoading(true);

    const clubId = useAuthStore.getState().clubId;
    console.log('%c[DEBUG INVENTORY] 3. clubId:', 'color: #FFA500', clubId);

    if (!clubId) {
      console.error('%c[DEBUG INVENTORY] 4. FAILURE: clubId is null.', 'color: #FF0000');
      setIsLoading(false);
      return;
    }

    const newItemData = {
      name: name,
      group: group,
      category: category,
      minimumUnitOfSale: Number(minSaleUnit),
      amountPerUnit: Number(price),
      stockLevel: Number(stock),
      createdAt: serverTimestamp(),
      clubId: clubId,
    };
    console.log('[DEBUG INVENTORY] 5. newItemData:', newItemData);

    try {
      const db = getFirestore();
      const inventoryColRef = collection(db, 'clubs', clubId, 'inventoryItems');
      console.log('%c[DEBUG INVENTORY] 6. Firestore Path:', 'color: #00FFFF', inventoryColRef.path);

      console.log('[DEBUG INVENTORY] 7. Attempting addDoc()...');
      await addDoc(inventoryColRef, newItemData);
      console.log('%c[DEBUG INVENTORY] 8. SUCCESS: addDoc() completed.', 'color: #00FF00');

      console.log('[DEBUG INVENTORY] 9. Attempting onAddItem()...');
      onAddItem();
      console.log('%c[DEBUG INVENTORY] 10. SUCCESS: onAddItem() called.', 'color: #00FF00');
    } catch (error: any) {
      console.error(
        '%c[DEBUG INVENTORY] 11. CRITICAL FAILURE in try block:',
        'color: #FF0000',
        error.message
      );
      console.error(error);
    } finally {
      console.log('[DEBUG INVENTORY] 12. Finally block executed.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(isOpen) => {
        if (!isOpen) {
            setName('');
            setGroup('');
            setCategory('');
            setMinSaleUnit('');
            setPrice('');
            setStock('');
            setIsLoading(false);
        }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Item</DialogTitle>
            <DialogDescription>
              Create a new item for your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="group" className="text-right">Group</Label>
              <Input id="group" value={group} onChange={(e) => setGroup(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="min-unit" className="text-right">Min. Sale Unit</Label>
              <Input id="min-unit" value={minSaleUnit} onChange={(e) => setMinSaleUnit(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price (€)</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">Initial Stock</Label>
              <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Item'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InventoryList() {
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const clubId = useAuthStore((state) => state.clubId);
    
    useEffect(() => {
        if (!clubId) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        const db = getFirestore();
        const itemsQuery = query(collection(db, 'clubs', clubId, 'inventoryItems'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Item));
            setItems(itemsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching inventory items: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [clubId]);

    if (isLoading) {
        return (
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
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                               <div className="flex items-center gap-3">
                                  <Skeleton className="h-10 w-10 rounded-md" />
                                  <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                  </div>
                                </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        )
    }

    if (items.length === 0) {
        return (
            <div className="py-16 text-center text-muted-foreground">
                No inventory items found. Add your first item!
            </div>
        )
    }

    return (
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
                {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Image
                                    src={item.imageUrl || `https://picsum.photos/seed/${item.id}/40/40`}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover"
                                    data-ai-hint={item.imageHint || 'product package'}
                                />
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">{item.group}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                        <TableCell>€{(item.amountPerUnit || 0).toFixed(2)}</TableCell>
                        <TableCell>
                            <span className={item.stockLevel < 15 ? 'text-destructive font-medium' : ''}>
                                {item.stockLevel}
                            </span>
                            <span className="text-muted-foreground"> {item.minimumUnitOfSale}</span>
                        </TableCell>
                        <TableCell className="text-right">
                            <RefillDialog item={item} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function InventoryPage() {
    const [dialogKey, setDialogKey] = useState(0);
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
              <AddItemDialog key={dialogKey} onAddItem={() => setDialogKey(prev => prev + 1)} />
            </div>
          </CardHeader>
          <CardContent>
            <InventoryList />
          </CardContent>
        </Card>
      </PageWrapper>
    </>
  );
}

    