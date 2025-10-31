
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

  console.log('%c[DEBUG GUARDIAN] 10. Guardian executed! Reading state...', 'color: #FF00FF');
  console.log('%c[DEBUG GUARDIAN] Current State: isAuthLoading:', 'color: #FF00FF', isAuthLoading);
  console.log('%c[DEBUG GUARDIAN] Current State: isStoreLoading:', 'color: #FF00FF', isStoreLoading);
  console.log('%c[DEBUG GUARDIAN] Current State: clubId:', 'color: #FF00FF', clubId);

  useEffect(() => {
    if (isAuthLoading) {
      console.log('[DEBUG GUARDIAN] useEffect: Auth state is loading...');
      return; // Wait for Firebase Auth to initialize
    }

    if (!user) {
      console.error('[DEBUG GUARDIAN] useEffect: No user found, logging out and redirecting.');
      logout();
      router.push('/');
      return;
    }

    // If we have a user but no clubId in the store, fetch claims.
    if (user && !clubId) {
        console.log('[DEBUG GUARDIAN] useEffect: User exists, but no clubId in store. Fetching claims...');
        setLoading(true);
        user.getIdTokenResult(true).then((idTokenResult) => {
            const { clubId, role } = idTokenResult.claims;
            console.log('[DEBUG GUARDIAN] useEffect: Claims fetched! clubId:', clubId);

            if (clubId && role) {
                setLoginData({
                    uid: user.uid,
                    clubId: clubId as string,
                    role: role as string,
                });
            } else {
                console.error('[DEBUG GUARDIAN] CRITICAL: User has no claims. Logging out.');
                logout();
                router.push('/?error=auth_error');
            }
            setLoading(false);
        }).catch(error => {
            console.error('[DEBUG GUARDIAN] Error fetching ID token:', error);
            logout();
            router.push('/');
            setLoading(false);
        });
    } else if (user && clubId) {
        // User and clubId are already in the store, we are good.
        if (isStoreLoading) setLoading(false);
    }
  }, [user, isAuthLoading, clubId, router, setLoginData, logout, setLoading, isStoreLoading]);

  // Combined loading state
  const isLoading = isAuthLoading || isStoreLoading;

   if (isLoading) {
    console.log('%c[DEBUG GUARDIAN] DECISION: isAuthLoading or isStoreLoading is true. Rendering loading skeleton.', 'color: #FFA500');
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
    console.error('%c[DEBUG GUARDIAN] DECISION: Unauthenticated! Redirecting to /.', 'color: #FF0000');
    // This state shouldn't be reached if useEffect logic is correct, but as a fallback.
    // router.push('/'); // This can cause loops. The useEffect handles redirection.
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <p>Redirecting to login...</p>
        </div>
    );
  }
  
  console.log('%c[DEBUG GUARDIAN] DECISION: Authenticated! Rendering children.', 'color: #00FF00');
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
