import Link from 'next/link';
import {
  BarChart3,
  Boxes,
  History,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { mockUser } from '@/lib/data';

const menuLinks = [
  {
    href: '/members',
    label: 'Members',
    icon: Users,
    description: 'Manage club members',
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Boxes,
    description: 'Track and manage stock',
  },
  {
    href: '/pos',
    label: 'Point of Sale',
    icon: ShoppingCart,
    description: 'Create new dispenses',
  },
  {
    href: '/stats',
    label: 'Statistics',
    icon: BarChart3,
    description: 'View sales and stock data',
  },
  {
    href: '/history',
    label: 'History',
    icon: History,
    description: 'Browse transaction logs',
  },
];

export default function HomePage() {
  return (
    <>
      <DashboardHeader title="Home" />
      <PageWrapper>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className='font-headline'>Welcome back, {mockUser.name.split(' ')[0]}!</CardTitle>
              <p className="text-muted-foreground">You belong to Club Alpha.</p>
            </CardHeader>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                <Card className="h-full transform transition-transform hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-headline text-lg font-medium">
                      {link.label}
                    </CardTitle>
                    <link.icon className="h-6 w-6 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
