
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAuthStore } from '@/store/authStore';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { clubId, isLoading: isStoreLoading, setLoginData, logout, setLoading } = useAuthStore(state => ({
    clubId: state.clubId,
    isLoading: state.isLoading,
    setLoginData: state.setLoginData,
    logout: state.logout,
    setLoading: state.setLoading,
  }));
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) {
      return; // Wait for Firebase Auth to initialize
    }

    if (!user) {
      logout();
      router.push('/');
      return;
    }

    if (user && !clubId) {
        setLoading(true);
        // Force refresh the token to get custom claims.
        user.getIdTokenResult(true).then((idTokenResult) => {
            const { clubId, role } = idTokenResult.claims;

            if (clubId && role) {
                // Set the claims in the global store
                setLoginData({
                    uid: user.uid,
                    clubId: clubId as string,
                    role: role as string,
                });
                // The new token with claims is now active for subsequent backend requests.
            } else {
                console.error('CRITICAL: User is authenticated but has no custom claims. Logging out.');
                logout();
                router.push('/?error=auth_error');
            }
            setLoading(false);
        }).catch(error => {
            console.error('Error fetching ID token with custom claims:', error);
            logout();
            router.push('/');
            setLoading(false);
        });
    } else if (user && clubId) {
        if (isStoreLoading) setLoading(false);
    }
  }, [user, isAuthLoading, clubId, router, setLoginData, logout, setLoading, isStoreLoading]);

  // Combined loading state
  const isLoading = isAuthLoading || isStoreLoading;

   if (isLoading) {
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

  if (!isLoading && !clubId) {
    // This state can be reached briefly while redirecting.
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <p>Verifying credentials, please wait...</p>
        </div>
    );
  }
  
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
