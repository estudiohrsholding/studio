
'use client';

import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardHeader } from '@/components/dashboard/header';
import { PageWrapper } from '@/components/dashboard/page-wrapper';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, type FormEvent } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useAuthStore } from '@/store/authStore';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Member {
  id: string;
  name: string;
  email: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
  avatar: string;
  idPhotoUrl: string;
}

function AddMemberDialog({ onMemberAdded }: { onMemberAdded: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('%c[DEBUG] 1. handleSubmit: Triggered.', 'color: #00FF00');

    // Get all states
    const clubId = useAuthStore.getState().clubId;
    const data = {
      fullName, // from form state
      email, // from form state
      idPhoto, // from file state
    };

    console.log('[DEBUG] 2. Validating input...', { clubId, ...data });
    setIsLoading(true); // Button now says "Saving..."
    setError(null);

    // --- Guard Clauses ---
    if (!clubId) {
      console.error('%c[DEBUG] 3. FAILURE: clubId is null.', 'color: #FF0000');
      setError('Could not identify the club. Please log in again.');
      setIsLoading(false);
      return;
    }
    if (!data.fullName || !data.email || !data.idPhoto) {
      console.error('%c[DEBUG] 3. FAILURE: Form is incomplete.', 'color: #FF0000');
      setError('Please fill out all fields and select an ID photo.');
      setIsLoading(false);
      return;
    }

    try {
      // --- STEP 1: UPLOAD FILE ---
      console.log('[DEBUG] 4. Creating Storage reference...');
      const storage = getStorage();
      const uniqueFileName = `${uuidv4()}-${data.idPhoto.name}`;
      const storageRef = ref(storage, `clubs/${clubId}/member_ids/${uniqueFileName}`);
      console.log('%c[DEBUG] 5. Storage Path:', 'color: #00FFFF', storageRef.path);

      console.log('[DEBUG] 6. Awaiting uploadBytes()...');
      await uploadBytes(storageRef, data.idPhoto);
      console.log('%c[DEBUG] 7. SUCCESS: File Uploaded.', 'color: #00FF00');

      // --- STEP 2: GET URL ---
      console.log('[DEBUG] 8. Awaiting getDownloadURL()...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('%c[DEBUG] 9. SUCCESS: Got URL:', 'color: #00FF00', downloadURL);

      // --- STEP 3: WRITE DOCUMENT ---
      const newMemberData = {
        name: data.fullName,
        email: data.email,
        idPhotoUrl: downloadURL,
        clubId: clubId,
        createdAt: serverTimestamp(),
        avatar: `https://picsum.photos/seed/${uuidv4()}/200/200`, // Match existing schema
      };
      console.log('[DEBUG] 10. Built Firestore object:', newMemberData);

      const db = getFirestore();
      const membersColRef = collection(db, 'clubs', clubId, 'members');
      console.log('[DEBUG] 11. Awaiting addDoc()...');
      await addDoc(membersColRef, newMemberData);
      console.log('%c[DEBUG] 12. SUCCESS: Doc written to Firestore.', 'color: #00FF00');

      console.log('[DEBUG] 13. Calling onMemberAdded()...');
      onMemberAdded(); // Close the modal

    } catch (error: any) {
      console.error('%c[DEBUG] 14. CRITICAL FAILURE in try block:', 'color: #FF0000', error.code, error.message);
      console.error(error);
      setError(`An unexpected error occurred: ${error.message}`);
    } finally {
      console.log('[DEBUG] 15. Finally block executed.');
      setIsLoading(false); // This MUST run to reset the button
    }
  };


  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setFullName('');
          setEmail('');
          setIdPhoto(null);
          setError(null);
          setIsLoading(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Member</DialogTitle>
            <DialogDescription>
              Fill in the form to register a new member. A unique ID will be
              generated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="idPhoto" className="text-right">
                ID Photo
              </Label>
              <Input
                id="idPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) setIdPhoto(e.target.files[0]);
                }}
                className="col-span-3"
                required
              />
            </div>
             {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { firestore } = useFirebase();
  const clubId = useAuthStore((state) => state.clubId);

  useEffect(() => {
    if (!clubId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }
    
    const db = getFirestore();

    const membersQuery = query(
      collection(db, 'clubs', clubId, 'members'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        const membersData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Member)
        );
        setMembers(membersData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching members:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clubId]);

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead>ID Photo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-10" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (members.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No members found. Add your first member to get started!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Client ID</TableHead>
          <TableHead>Joined Date</TableHead>
          <TableHead>ID Photo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={member.avatar}
                    alt={member.name}
                    data-ai-hint="person portrait"
                  />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{member.id}</Badge>
            </TableCell>
            <TableCell>
              {member.createdAt
                ? new Date(
                    member.createdAt.seconds * 1000
                  ).toLocaleDateString()
                : 'N/A'}
            </TableCell>
             <TableCell>
              {member.idPhotoUrl && (
                <a href={member.idPhotoUrl} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={member.idPhotoUrl}
                    alt={`${member.name} ID photo`}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function MembersPage() {
  // A simple state to force-close the dialog from the child component
  const [dialogKey, setDialogKey] = useState(0);

  return (
    <>
      <DashboardHeader title="Members" />
      <PageWrapper>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Club Members</CardTitle>
                <CardDescription>
                  List of all members associated with your club.
                </CardDescription>
              </div>
              <AddMemberDialog
                key={dialogKey}
                onMemberAdded={() => setDialogKey(prev => prev + 1)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <MembersList />
          </CardContent>
        </Card>
      </PageWrapper>
    </>
  );
}
