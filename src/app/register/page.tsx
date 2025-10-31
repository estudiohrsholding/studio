'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
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

export default function RegisterClubPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clubName, setClubName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const auth = getAuth();
    let newUser = null;

    try {
      // Step A: Create the Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      newUser = userCredential.user;

      // Step B: Provision the new club and set custom claims via a Cloud Function
      // This function needs to be deployed to your Firebase project.
      const functions = getFunctions();
      const provisionNewClub = httpsCallable(functions, 'provisionNewClub');

      await provisionNewClub({
        clubName: clubName,
        adminUid: newUser.uid,
      });

      // Step C: Success, redirect to login with a success message
      const successMessage = 'Club successfully registered! Please log in.';
      router.push(`/?message=${encodeURIComponent(successMessage)}`);

    } catch (err: any) {
      setIsLoading(false);

      // Crucial Rollback Logic: If the user was created but provisioning failed, delete the user.
      if (newUser) {
        try {
          await deleteUser(newUser);
        } catch (deleteError) {
          console.error("Failed to delete orphaned user:", deleteError);
          // Set an error that guides the admin to manually resolve the state
           setError("Critical: Registration failed and automatic cleanup failed. Please contact support.");
           return;
        }
      }
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered.';
            break;
          case 'auth/weak-password':
            errorMessage =
              'Password is too weak. It must be at least 6 characters long.';
            break;
           case 'functions/unauthenticated':
            errorMessage = 'You must be authenticated to create a club.';
            break;
          case 'functions/not-found':
             errorMessage = 'Registration endpoint not available. Please contact support.';
             break;
          default:
            errorMessage = `Registration failed: ${err.message}`;
        }
      } else {
         errorMessage = `Registration failed: ${err.message}`;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="h-12 w-12 text-primary" />
          <h1 className="mt-4 font-headline text-3xl font-bold tracking-tight">
            Register a New Club
          </h1>
          <p className="text-muted-foreground">
            Create an admin account and set up your club.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Registration Form</CardTitle>
            <CardDescription>
              Fill out the details below to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clubName">Club Name</Label>
                <Input
                  id="clubName"
                  type="text"
                  placeholder="My Awesome Club"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Registration Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register Club'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          <Link href="/" className="underline hover:text-primary">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
