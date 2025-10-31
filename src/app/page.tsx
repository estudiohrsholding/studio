
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
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
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('%c[DEBUG LOGIN] 1. handleSubmit: Triggered.', 'color: #00FF00');
    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const setLoginData = useAuthStore.getState().setLoginData;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('%c[DEBUG LOGIN] 2. Auth: User authenticated:', 'color: #00FF00', user.uid);

      console.log('[DEBUG LOGIN] 3. Claims: Forcing token refresh to get claims...');
      const idTokenResult = await user.getIdTokenResult(true);
      const { clubId, role } = idTokenResult.claims;
      console.log('%c[DEBUG LOGIN] 4. Claims: Claims retrieved! clubId is:', 'color: #FFA500', clubId);

      if (!clubId) {
        console.error('%c[DEBUG LOGIN] 5. FAILURE: No clubId found in claims!', 'color: #FF0000');
        setError('This account is not associated with a club.');
        setIsLoading(false);
        return;
      }

      console.log('[DEBUG LOGIN] 6. Zustand: Calling setLoginData...');
      setLoginData({ uid: user.uid, clubId: clubId as string, role: role as string });
      console.log('%c[DEBUG LOGIN] 7. Zustand: Global state updated!', 'color: #00FF00');

      console.log('[DEBUG LOGIN] 8. Router: Redirecting to /home...');
      router.push('/home');

    } catch (err: any) {
      console.error('%c[DEBUG LOGIN] CRITICAL FAILURE in try block:', 'color: #FF0000', err.message);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (err.code) {
        switch (err.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid credentials. Please check your email and password.';
            break;
        }
      } else if (err.message.startsWith('AUTH_ERR:')) {
        errorMessage = err.message;
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


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
