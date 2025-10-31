'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useAuthStore } from '@/store/authStore';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useAuth();
  const setLoginData = useAuthStore((state) => state.setLoginData);
  const logout = useAuthStore((state) => state.logout);
  const clubId = useAuthStore((state) => state.clubId);
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      // Still checking for user, do nothing yet.
      return;
    }

    if (!user) {
      // No user found, clear state and redirect to login
      logout();
      router.push('/');
      return;
    }

    // User is logged in, but we need to ensure their claims (clubId) are loaded.
    user.getIdTokenResult(true).then((idTokenResult) => {
      const { clubId, role } = idTokenResult.claims;

      if (clubId && role) {
        // We have the claims, set them in the global store.
        setLoginData({
          uid: user.uid,
          clubId: clubId as string,
          role: role as string,
        });
      } else {
        // User exists but has no claims. This is an invalid state.
        console.error('CRITICAL: User is authenticated but has no clubId/role claims.');
        logout();
        router.push('/?error=auth_error'); // Redirect with an error
      }
    }).catch(error => {
        console.error('Error fetching ID token:', error);
        logout();
        router.push('/');
    });

  }, [user, isUserLoading, router, setLoginData, logout]);

  // While user or claims are loading, show a loading shell.
  if (isUserLoading || !clubId) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
  }

  // Once everything is loaded, render the actual dashboard.
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
