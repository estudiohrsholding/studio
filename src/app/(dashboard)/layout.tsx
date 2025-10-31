
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

    // This is the critical logic block.
    // If we have a user but the store (our app's state) doesn't have the clubId,
    // it means we need to fetch the custom claims.
    if (user && !clubId) {
        setLoading(true); // Set loading state for the UI
        
        // Force a refresh of the ID token. This is the most reliable way to get fresh claims
        // after they have been set by the cloud function.
        user.getIdTokenResult(true).then((idTokenResult) => {
            const { clubId, role } = idTokenResult.claims;

            // Check if the necessary claims exist on the token.
            if (clubId && role) {
                // If they exist, update our global application state.
                setLoginData({
                    uid: user.uid,
                    clubId: clubId as string,
                    role: role as string,
                });
                // Now the rest of the application knows the user's permissions.
            } else {
                // This is a critical failure. The user is authenticated but has no role.
                // This can happen if the club provisioning cloud function failed.
                console.error('CRITICAL: User is authenticated but has no custom claims. Logging out.');
                logout(); // Clear the invalid state
                router.push('/?error=auth_error'); // Redirect to login with an error message
            }
            // Once done, set loading to false.
            setLoading(false);
        }).catch(error => {
            console.error('Error fetching ID token with custom claims:', error);
            logout();
            router.push('/');
            setLoading(false);
        });
    } else if (user && clubId) {
        // If we have a user and a clubId in the store, everything is fine.
        // Ensure loading is false if it was somehow still true.
        if (isStoreLoading) setLoading(false);
    }
  }, [user, isAuthLoading, clubId, router, setLoginData, logout, setLoading, isStoreLoading]);

  // The combined loading state for the skeleton UI.
  // We are loading if Firebase Auth is checking OR if our store is loading claims.
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

  // This state is reached if loading is complete, but we still don't have a clubId.
  // This typically means the user is being redirected, so we show a temporary message.
  if (!isLoading && !clubId) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <p>Verifying credentials, please wait...</p>
        </div>
    );
  }
  
  // If loading is finished and we have a clubId, show the dashboard.
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
