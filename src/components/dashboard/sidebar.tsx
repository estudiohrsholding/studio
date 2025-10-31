
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Home,
  History,
  Boxes,
  Users,
  ShoppingCart,
  User,
  PanelLeft,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { mockUser } from '@/lib/data';

const menuItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/stats', label: 'Statistics', icon: BarChart3 },
  { href: '/history', label: 'History', icon: History },
];

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-14 justify-center p-2">
          <Link
            href="/home"
            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <Image src="/logo.svg" alt="CannabiApp Logo" width={32} height={32} className="size-8" />
            <span className="font-headline text-lg font-semibold group-data-[collapsible=icon]:hidden">
              <span className="text-primary">Cannab</span><span className="text-accent">iA</span><span className="text-primary">pp</span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/profile'}
                  tooltip={{ children: 'Profile & Rewards' }}
                >
                  <Link href="/profile">
                     <Avatar className="size-7">
                        <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                        <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    <span className="max-w-32 truncate">{mockUser.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </SidebarProvider>
  );
}
