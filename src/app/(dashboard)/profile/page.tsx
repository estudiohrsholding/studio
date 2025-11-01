
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockUser } from '@/lib/data';
import { UserPlus } from 'lucide-react';
import { RewardsPanel } from '@/components/dashboard/profile/rewards-panel';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const progress = (mockUser.points % 1000) / 10;

  return (
    <>
      <DashboardHeader title="Profile & Rewards" />
      <PageWrapper>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-headline text-xl">{mockUser.name}</CardTitle>
                  <CardDescription>{mockUser.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-sm font-medium">
                      <span>Level {mockUser.level}</span>
                      <span className="text-muted-foreground">
                        {mockUser.points} / {(mockUser.level + 1) * 1000} XP
                      </span>
                    </div>
                    <Progress value={progress} aria-label={`${progress}% to next level`}/>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {(mockUser.level + 1) * 1000 - mockUser.points} points to next level
                    </p>
                  </div>

                   <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Create Guest Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-headline">Create Guest User</DialogTitle>
                        <DialogDescription>
                          Guests can view most club data but cannot access statistics.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="guest-name" className="text-right">Name</Label>
                          <Input id="guest-name" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="guest-email" className="text-right">Email</Label>
                          <Input id="guest-email" type="email" className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Guest</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <RewardsPanel />
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
