'use client'

import { PlusCircle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { mockMembers, mockInventory } from '@/lib/data';
import { useState } from 'react';
import type { Item } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';


interface CartItem extends Item {
  quantity: number;
}

export default function POSPage() {
    const [cart, setCart] = useState<CartItem[]>([
        {...mockInventory[0], quantity: 2},
        {...mockInventory[2], quantity: 1}
    ]);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <DashboardHeader title="Point of Sale" />
      <PageWrapper className="p-0 sm:p-0">
        <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left Column: Form */}
          <div className="col-span-1 flex flex-col gap-4 p-4 lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle className='font-headline'>Create Dispense</CardTitle>
                    <CardDescription>Select a member and add items to the cart.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                 <div className="space-y-2">
                  <Label>Select Member</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Search for a member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                 <div className="space-y-2">
                  <Label>Add Item</Label>
                  <div className="flex items-end gap-2">
                     <div className='flex-1'>
                        <Label htmlFor="item" className="sr-only">Item</Label>
                         <Select>
                            <SelectTrigger>
                            <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                            <SelectContent>
                            {mockInventory.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                {item.name} (€{item.price})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                     </div>
                      <div>
                        <Label htmlFor="quantity" className="sr-only">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="Qty" className="w-20" />
                      </div>
                      <Button variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                  </div>
                 </div>
                </CardContent>
             </Card>
          </div>

          {/* Right Column: Cart */}
          <div className="col-span-1 flex h-full flex-col bg-card">
            <Card className="flex flex-1 flex-col rounded-none border-0 border-l lg:rounded-l-lg">
              <CardHeader>
                <CardTitle className='font-headline'>Shopping Cart</CardTitle>
                <CardDescription>Items to be dispensed.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Your cart is empty.
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.quantity} x €{item.price.toFixed(2)}
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <p className="font-medium">€{(item.quantity * item.price).toFixed(2)}</p>
                                <Button variant="ghost" size="icon" className='h-8 w-8 text-muted-foreground hover:text-destructive'>
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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="mt-4 w-full" disabled={cart.length === 0}>
                            Confirm Dispense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className='font-headline text-accent'>Dispense Confirmed</DialogTitle>
                        </DialogHeader>
                        <div className='space-y-4'>
                            <p>The following items have been dispensed:</p>
                            <div className="space-y-2 rounded-md border p-4">
                                {cart.map(item => (
                                     <div key={item.id} className="flex justify-between">
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
