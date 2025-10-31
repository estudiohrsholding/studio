'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { useState, useEffect, useMemo } from 'react';
import type { Item } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CartItem extends Item {
  quantity: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [amount, setAmount] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const clubId = useAuthStore((state) => state.clubId);

  // --- Member Search State & Logic ---
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberSelectOpen, setMemberSelectOpen] = useState(false);

  // --- Inventory Search State & Logic ---
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [itemResults, setItemResults] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemSelectOpen, setItemSelectOpen] = useState(false);

  const db = getFirestore();

  // Effect for fetching members
  useEffect(() => {
    if (!clubId) return;
    setMembersLoading(true);

    const membersRef = collection(db, 'clubs', clubId, 'members');
    let q;
    if (memberSearchTerm) {
      q = query(
        membersRef,
        where('name', '>=', memberSearchTerm),
        where('name', '<=', memberSearchTerm + '\uf8ff'),
        limit(10)
      );
    } else {
      q = query(membersRef, orderBy('name'), limit(10));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMembers = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Member)
      );
      setMemberResults(fetchedMembers);
      setMembersLoading(false);
    });

    return () => unsubscribe();
  }, [clubId, memberSearchTerm, db]);

  // Effect for fetching inventory items
  useEffect(() => {
    if (!clubId) return;
    setItemsLoading(true);
    const itemsRef = collection(db, 'clubs', clubId, 'inventoryItems');
    let q;

    if (itemSearchTerm) {
      q = query(
        itemsRef,
        where('name', '>=', itemSearchTerm),
        where('name', '<=', itemSearchTerm + '\uf8ff'),
        limit(10)
      );
    } else {
      q = query(itemsRef, orderBy('name'), limit(10));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Item)
      );
      setItemResults(fetchedItems);
      setItemsLoading(false);
    });

    return () => unsubscribe();
  }, [clubId, itemSearchTerm, db]);

  const isIntegerOnly = selectedItem ? Number.isInteger(selectedItem.minimumUnitOfSale) : false;

  const handleQuantityChange = (newQuantity: string) => {
    if (isIntegerOnly && newQuantity.includes('.') && newQuantity.split('.')[1] !== '') {
      setFormError('This item only accepts whole units.');
      // We still update the quantity to show the invalid input, but the error will be visible
      setQuantity(newQuantity);
      return; 
    }
    
    setFormError(null);
    setQuantity(newQuantity);

    if (!selectedItem || !selectedItem.amountPerUnit) {
      setAmount('');
      return;
    }

    const q = parseFloat(newQuantity);
    if (isNaN(q)) {
      setAmount('');
      return;
    }
    const newAmount = q * selectedItem.amountPerUnit;
    setAmount(newAmount.toFixed(2));
  };
  
  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    setFormError(null);

    if (!selectedItem || !selectedItem.amountPerUnit || selectedItem.amountPerUnit === 0) {
      setQuantity('');
      return;
    }

    const a = parseFloat(newAmount);
    if (isNaN(a)) {
      setQuantity('');
      return;
    }

    const newQuantity = a / selectedItem.amountPerUnit;

    if (isIntegerOnly) {
      const roundedQuantity = Math.round(newQuantity);
      setQuantity(roundedQuantity.toString());
      const finalAmount = roundedQuantity * selectedItem.amountPerUnit;
      setAmount(finalAmount.toFixed(2));
    } else {
      setQuantity(newQuantity.toFixed(2));
    }
  };


  const handleAddToCart = () => {
    if (formError) return;
    const numericQuantity = parseFloat(quantity);
    if (!selectedItem || isNaN(numericQuantity) || numericQuantity <= 0) return;
  
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === selectedItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === selectedItem.id
            ? { ...item, quantity: item.quantity + numericQuantity }
            : item
        );
      }
      return [...prevCart, { ...selectedItem, quantity: numericQuantity }];
    });
  
    setSelectedItem(null);
    setQuantity('1');
    setAmount('');
    setItemSearchTerm('');
    setFormError(null);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const total = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (item.amountPerUnit || 0) * item.quantity,
      0
    );
  }, [cart]);

  return (
    <>
      <DashboardHeader title="Point of Sale" />
      <PageWrapper className="p-0 sm:p-0">
        <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left Column: Form */}
          <div className="col-span-1 flex flex-col gap-4 p-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Create Dispense</CardTitle>
                <CardDescription>
                  Select a member and add items to the cart.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Member</Label>
                  <Popover
                    open={memberSelectOpen}
                    onOpenChange={setMemberSelectOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={memberSelectOpen}
                        className="w-full justify-between"
                      >
                        {selectedMember
                          ? selectedMember.name
                          : 'Select member...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search member..."
                          value={memberSearchTerm}
                          onValueChange={setMemberSearchTerm}
                        />
                        <CommandList>
                          {membersLoading && (
                            <div className="p-2">
                              <Skeleton className="h-8 w-full" />
                            </div>
                          )}
                          <CommandEmpty>No member found.</CommandEmpty>
                          <CommandGroup>
                            {memberResults.map((member) => (
                              <CommandItem
                                key={member.id}
                                onSelect={() => {
                                  setSelectedMember(member);
                                  setMemberSelectOpen(false);
                                }}
                              >
                                {member.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Add Item</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <Label htmlFor="item" className="sr-only">
                        Item
                      </Label>
                      <Popover
                        open={itemSelectOpen}
                        onOpenChange={setItemSelectOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={itemSelectOpen}
                            className="w-full justify-between"
                            disabled={!selectedMember}
                          >
                            {selectedItem
                              ? selectedItem.name
                              : 'Select item...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search item..."
                              value={itemSearchTerm}
                              onValueChange={setItemSearchTerm}
                            />
                            <CommandList>
                              {itemsLoading && (
                                <div className="p-2">
                                  <Skeleton className="h-8 w-full" />
                                </div>
                              )}
                              <CommandEmpty>No item found.</CommandEmpty>
                              <CommandGroup>
                                {itemResults.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    onSelect={() => {
                                      setSelectedItem(item);
                                      setQuantity('1');
                                      handleQuantityChange('1');
                                      setItemSelectOpen(false);
                                    }}
                                  >
                                    {item.name} (€
                                    {(item.amountPerUnit || 0).toFixed(2)})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="sm:col-span-1">
                      <Label htmlFor="quantity" className="sr-only">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Qty"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        min="0"
                        step={isIntegerOnly ? '1' : '0.01'}
                        disabled={!selectedItem}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Label htmlFor="amount" className="sr-only">
                        Amount (€)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="€"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        min="0"
                        disabled={!selectedItem}
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={handleAddToCart} className="sm:col-span-1" disabled={!selectedItem || !!formError}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                   {formError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Cart */}
          <div className="col-span-1 flex h-full flex-col bg-card">
            <Card className="flex flex-1 flex-col rounded-none border-0 border-l lg:rounded-l-lg">
              <CardHeader>
                <CardTitle className="font-headline">Shopping Cart</CardTitle>
                {selectedMember ? (
                  <CardDescription>
                    Dispensing to:{' '}
                    <span className="font-medium text-primary">
                      {selectedMember.name}
                    </span>
                  </CardDescription>
                ) : (
                  <CardDescription>Select a member to begin.</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-4 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Your cart is empty.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x €
                          {(item.amountPerUnit || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          €
                          {((item.amountPerUnit || 0) * item.quantity).toFixed(
                            2
                          )}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter className="flex-col !p-6">
                <Separator className="my-4" />
                <div className="flex w-full justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <Dialog
                  open={showConfirmation}
                  onOpenChange={setShowConfirmation}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="mt-4 w-full"
                      disabled={
                        cart.length === 0 || !selectedMember || isConfirming
                      }
                    >
                      {isConfirming ? 'Processing...' : 'Confirm Dispense'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline text-accent">
                        Dispense Confirmed
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>
                        The following items have been dispensed to{' '}
                        <span className="font-bold">{selectedMember?.name}</span>:
                      </p>
                      <div className="space-y-2 rounded-md border p-4">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between"
                          >
                            <span>{item.name}</span>
                            <span className="font-medium">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex w-full justify-between rounded-md bg-muted p-4 text-lg font-semibold">
                        <span>Total</span>
                        <span>€{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
