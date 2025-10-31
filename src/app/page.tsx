
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
    }
     const authError = searchParams.get('error');
    if (authError === 'auth_error') {
      setError("Your account doesn't have the required permissions. Please contact support.");
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      // The DashboardLayout will now handle claims fetching.
      // We just need to sign in here.
      await signInWithEmailAndPassword(auth, email, password);
      
      // On successful sign-in, the onAuthStateChanged listener in FirebaseProvider
      // will trigger, and the DashboardLayout will handle the redirection and
      // claim-checking logic.
      router.push('/home');

    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (err.code) {
        switch (err.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid credentials. Please check your email and password.';
            break;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="h-12 w-12 text-primary" />
          <h1 className="mt-4 font-headline text-3xl font-bold tracking-tight">
            ClubConnect
          </h1>
          <p className="text-muted-foreground">
            The central hub for your club.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Club Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your club dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border-green-700 [&>svg]:text-green-600">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
             <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@myclub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                 <Alert variant="destructive">
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Log in'}
              </Button>
            </form>
          </CardContent>
        </Card>
         <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="underline hover:text-primary">
            Register a new club
          </Link>
        </div>
      </div>
    </div>
  );
}


function LoginPageSkeleton() {
  return (
     <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="h-12 w-12 text-primary" />
          <h1 className="mt-4 font-headline text-3xl font-bold tracking-tight">
            ClubConnect
          </h1>
          <p className="text-muted-foreground">
            The central hub for your club.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Club Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your club dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  )
}
