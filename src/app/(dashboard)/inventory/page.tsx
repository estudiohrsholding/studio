
'use client';

import { PlusCircle, Plus, Edit, Trash2 } from 'lucide-react';
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
import { useState, useEffect, type FormEvent, useMemo } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
  doc,
  writeBatch,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Item } from '@/lib/types';
import { mockUser } from '@/lib/data'; // Assuming mockUser might be needed for user name
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


function RefillDialog({ item }: { item: Item }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const clubId = useAuthStore((state) => state.clubId);

  const handleRefill = async (event: FormEvent) => {
    event.preventDefault();
    const refillAmount = Number(amountToAdd);
    setIsLoading(true);
  
    if (refillAmount <= 0) {
      setIsLoading(false);
      return;
    }
  
    if (!clubId || !item.id) {
      setIsLoading(false);
      return;
    }
  
    try {
      const db = getFirestore();
      const batch = writeBatch(db);
      const itemDocRef = doc(db, 'clubs', clubId, 'inventoryItems', item.id);
      batch.update(itemDocRef, { stockLevel: increment(refillAmount) });
  
      const logDocRef = doc(collection(db, 'clubs', clubId, 'transactions'));
      const logData = { 
        type: 'refill', 
        transactionDate: serverTimestamp(), 
        itemId: item.id, 
        itemName: item.name, 
        quantity: refillAmount,
        user: mockUser.name, 
        clubId: clubId
      };
      batch.set(logDocRef, logData);
  
      await batch.commit();
      setIsOpen(false);
  
    } catch (error: any) {
      console.error('Refill failed:', error.message);
    } finally {
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
        {/* Implements Phase 2, Task 3: Hide restock button for memberships */}
        {!item.isMembership && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Refill</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Refill: {item.name}</DialogTitle>
          <DialogDescription>Add units to the existing stock.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRefill}>
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

// Implements Phase 1, Task 4 & 5: Dynamic Form and Submission Logic
function AddItemDialog({ onAddItem }: { onAddItem: () => void }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [category, setCategory] = useState('');
  const [minSaleUnit, setMinSaleUnit] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();

  // Implements Phase 2, Task 2: Automate 'isMembership' flag
  const isMembershipItem = name.toLowerCase().includes('membresía');

  const resetForm = () => {
    setName('');
    setGroup('');
    setCategory('');
    setMinSaleUnit('');
    setPrice('');
    setStock('');
    setDurationDays('');
    setIsLoading(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const clubId = useAuthStore.getState().clubId;
    if (!clubId) {
      setIsLoading(false);
      return;
    }

    // Implements Phase 2, Task 2: Automate 'isMembership' flag on create
    let newItemData: Partial<Item> = {
      name: name,
      group: group,
      category: category,
      amountPerUnit: Number(price),
      createdAt: serverTimestamp(),
      clubId: clubId,
      isMembership: isMembershipItem,
    };
    
    if (isMembershipItem) {
      newItemData = {
        ...newItemData,
        durationDays: Number(durationDays),
        minimumUnitOfSale: 1,
        stockLevel: null,
      };
    } else {
      newItemData = {
        ...newItemData,
        stockLevel: Number(stock),
        minimumUnitOfSale: Number(minSaleUnit) || 1,
        durationDays: null,
      };
    }

    try {
      const db = getFirestore();
      const inventoryColRef = collection(db, 'clubs', clubId, 'inventoryItems');
      await addDoc(inventoryColRef, newItemData);
      onAddItem();
      resetForm();
    } catch (error: any) {
      console.error('Failed to add item:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetForm();
        }
    }}>
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Membresía Anual" required />
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
              <Label htmlFor="price" className="text-right">Price (€)</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" required />
            </div>
            {isMembershipItem ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duration (Days)</Label>
                <Input id="duration" type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="e.g., 365" className="col-span-3" required />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="min-unit" className="text-right">Min. Sale Unit</Label>
                    <Input id="min-unit" type="number" step="0.1" value={minSaleUnit} onChange={(e) => setMinSaleUnit(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">Initial Stock</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="col-span-3" required />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Item'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function EditItemDialog({ item, onUpdate, onOpenChange }: { item: Item | null, onUpdate: () => void, onOpenChange: (open: boolean) => void }) {
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [category, setCategory] = useState('');
    const [minSaleUnit, setMinSaleUnit] = useState('');
    const [price, setPrice] = useState('');
    const [durationDays, setDurationDays] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const clubId = useAuthStore((state) => state.clubId);

    // Implements Phase 2, Task 2: Automate 'isMembership' flag
    const isMembership = useMemo(() => name.toLowerCase().includes('membresía'), [name]);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setGroup(item.group);
            setCategory(item.category);
            setPrice(String(item.amountPerUnit));
            if (item.isMembership) {
                setDurationDays(String(item.durationDays || ''));
                setMinSaleUnit('');
            } else {
                setMinSaleUnit(String(item.minimumUnitOfSale || ''));
                setDurationDays('');
            }
        }
    }, [item]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!item || !clubId) return;

        setIsLoading(true);
        
        // Implements Phase 2, Task 2: Automate 'isMembership' flag on edit
        let updatedData: Partial<Item> = {
            name,
            group,
            category,
            amountPerUnit: Number(price),
            isMembership: isMembership,
        };

        if (isMembership) {
            updatedData.durationDays = Number(durationDays);
            updatedData.minimumUnitOfSale = 1;
            updatedData.stockLevel = null;
        } else {
            updatedData.minimumUnitOfSale = Number(minSaleUnit);
            updatedData.durationDays = null;
            // Note: stockLevel is not updated here, it's handled via Refill dialog.
        }

        try {
            const db = getFirestore();
            const itemDocRef = doc(db, 'clubs', clubId, 'inventoryItems', item.id);
            await updateDoc(itemDocRef, updatedData);
            onUpdate();
        } catch (error) {
            console.error("Failed to update item:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={!!item} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='font-headline'>Edit Item</DialogTitle>
                    <DialogDescription>Update the details for {item?.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Name</Label>
                            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-group" className="text-right">Group</Label>
                            <Input id="edit-group" value={group} onChange={(e) => setGroup(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-category" className="text-right">Category</Label>
                            <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-price" className="text-right">Price (€)</Label>
                            <Input id="edit-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" required />
                        </div>
                         {isMembership ? (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-duration" className="text-right">Duration (Days)</Label>
                                <Input id="edit-duration" type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="col-span-3" required />
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-min-unit" className="text-right">Min. Sale Unit</Label>
                                <Input id="edit-min-unit" type="number" step="0.1" value={minSaleUnit} onChange={(e) => setMinSaleUnit(e.target.value)} className="col-span-3" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function groupItemsByField(items: Item[], field: keyof Item): Record<string, Item[]> {
    return items.reduce((acc, item) => {
        const key = item[field] as string;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, Item[]>);
}

export default function InventoryPage() {
    const [dialogKey, setDialogKey] = useState(0);
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const clubId = useAuthStore((state) => state.clubId);
    
    const [selectedItems, setSelectedItems] = useState(new Set<string>());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

    const groupedItems = useMemo(() => {
        if (!items) return {};
        return groupItemsByField(items, 'group');
    }, [items]);

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
        console.error('Error fetching inventory:', error);
        setIsLoading(false);
      });
    
      return () => unsubscribe();
    }, [clubId]);

    const handleToggleSelect = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedItems(new Set(items.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleOpenEditModal = () => {
        if (selectedItems.size !== 1) return;
        const editId = selectedItems.values().next().value;
        const item = items.find(m => m.id === editId);
        if (item) {
            setItemToEdit(item);
        }
    };
    
    const handleDeleteSelected = async () => {
        if (!clubId || selectedItems.size === 0) {
            return;
        }
    
        const db = getFirestore();
        const batch = writeBatch(db);
    
        try {
            selectedItems.forEach(itemId => {
                const itemDocRef = doc(db, 'clubs', clubId, 'inventoryItems', itemId);
                batch.delete(itemDocRef);
            });
    
            await batch.commit();
    
            setSelectedItems(new Set());
            setIsSelectionMode(false);
    
        } catch (error: any) {
            console.error('Failed to delete items:', error.message);
        }
    };


    const isAllSelected = useMemo(() => {
        return items.length > 0 && selectedItems.size === items.length;
    }, [items, selectedItems]);
    

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
              <div className="flex items-center gap-2">
                {!isSelectionMode ? (
                     <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)}>Select</Button>
                ) : (
                    <Button variant="secondary" size="sm" onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedItems(new Set());
                    }}>Cancel</Button>
                )}
                <AddItemDialog key={dialogKey} onAddItem={() => setDialogKey(prev => prev + 1)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="space-y-6">
                    {[...Array(2)].map((_, groupIndex) => (
                        <div key={groupIndex}>
                            <Skeleton className="h-8 w-40 mb-4" />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock/Duration</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(2)].map((_, itemIndex) => (
                                        <TableRow key={itemIndex}>
                                            <TableCell>
                                            <div className="flex items-center gap-3">
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
                        </div>
                    ))}
                </div>
            ) : Object.keys(groupedItems).length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                    No inventory items found. Add your first item!
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedItems).map(([groupName, itemsInGroup]) => (
                        <div key={groupName}>
                            <h2 className="font-headline text-2xl font-semibold mb-4">{groupName}</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            {isSelectionMode && (
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                    aria-label="Select all"
                                                />
                                            )}
                                        </TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock/Duration</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsInGroup.map((item) => (
                                        <TableRow key={item.id} data-state={selectedItems.has(item.id) && "selected"}>
                                            <TableCell>
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedItems.has(item.id)}
                                                        onCheckedChange={() => handleToggleSelect(item.id)}
                                                        aria-label="Select item"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-sm text-muted-foreground">{item.group}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                                            <TableCell>€{(item.amountPerUnit || 0).toFixed(2)}</TableCell>
                                            <TableCell>
                                                {item.isMembership ? (
                                                    <span className="font-medium">{item.durationDays ? `${item.durationDays} days` : 'Temporal'}</span>
                                                ) : (
                                                    <span className={(item.stockLevel || 0) < 15 ? 'text-destructive font-medium' : ''}>
                                                        {item.stockLevel} units
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <RefillDialog item={item} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>

         {selectedItems.size > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <Card className="flex items-center gap-2 p-3 shadow-2xl">
                    <p className="text-sm font-medium mr-2">{selectedItems.size} selected</p>
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleOpenEditModal}
                        disabled={selectedItems.size !== 1}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={selectedItems.size === 0}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedItems.size})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the selected {selectedItems.size} item(s) from your inventory.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSelected}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Card>
            </div>
        )}
        
        <EditItemDialog 
            item={itemToEdit}
            onOpenChange={(open) => {
                if (!open) {
                    setItemToEdit(null);
                    setSelectedItems(new Set());
                    setIsSelectionMode(false);
                }
            }}
            onUpdate={() => {
                setItemToEdit(null);
                setSelectedItems(new Set());
                setIsSelectionMode(false);
            }}
        />
      </PageWrapper>
    </>
  );
}
