
'use client';

import Image from 'next/image';
import { PlusCircle, Camera, Paperclip, X, Edit, Trash2 } from 'lucide-react';
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
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  writeBatch,
  updateDoc,
  Timestamp,
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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// Implements Phase 2, Task 3: Import status utility
import { getMemberStatus } from '@/lib/utils/statusUtils';

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
  membershipExpiresAt?: Timestamp | null;
  isVetoed?: boolean;
}

function AddMemberDialog({ onMemberAdded }: { onMemberAdded: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCamera = async () => {
    setIsCameraActive(true);
    setError(null);
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
    } catch (err) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (finalErr) {
        console.error('Camera access denied:', finalErr);
        setError(
          'Could not access any camera. Please check your browser permissions.'
        );
        setIsCameraActive(false);
        return;
      }
    }
  
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        setIdPhoto(capturedFile);
      }
    }, 'image/jpeg');

    stopCameraStream();
    setIsCameraActive(false);
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const clubId = useAuthStore.getState().clubId;
    const data = { fullName, email, idPhoto };
  
    setIsLoading(true); 
    setError(null);
  
    if (!clubId) {
      setError('Could not identify the club. Please log in again.');
      setIsLoading(false);
      return;
    }
    if (!data.fullName || !data.email || !data.idPhoto) {
      setError('Please fill out all fields and select or capture an ID photo.');
      setIsLoading(false);
      return;
    }
  
    try {
      const storage = getStorage();
      const uniqueFileName = `${uuidv4()}-${data.idPhoto.name}`;
      const storageRef = ref(storage, `clubs/${clubId}/member_ids/${uniqueFileName}`);
  
      await uploadBytes(storageRef, data.idPhoto);
      const downloadURL = await getDownloadURL(storageRef);
  
      // Fix for F-01: 'Add Member' Form
      // Explicitly set `membershipExpiresAt` and `isVetoed` for new members.
      const newMemberData = {
        name: data.fullName,
        email: data.email,
        idPhotoUrl: downloadURL,
        clubId: clubId,
        createdAt: serverTimestamp(),
        avatar: `https://picsum.photos/seed/${uuidv4()}/200/200`,
        isVetoed: false,
        membershipExpiresAt: null,
      };
  
      const db = getFirestore();
      const membersColRef = collection(db, 'clubs', clubId, 'members');
      await addDoc(membersColRef, newMemberData);
  
      onMemberAdded(); 
  
    } catch (error: any) {
      console.error('Member creation failed:', error.code, error.message);
      if (error.code === 'storage/unauthorized') {
        setError("Upload failed due to a permissions issue. This is often caused by an issue with security rules or the user's authentication token. Please ensure your storage rules are correct and you are properly authenticated.");
      } else if (error.code === 'storage/object-not-found') {
        setError("Upload failed because the storage bucket could not be found. Please ensure that Firebase Storage is enabled for your project in the Firebase Console and the bucket name in your config is correct.");
      } else if (error.message.includes('CORS')) {
        setError("Upload failed due to a CORS policy error. Please ensure your storage bucket has been correctly configured to allow requests from this domain by setting a `cors.json` file.");
      } else {
        setError(`An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
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
          setIsCameraActive(false);
          stopCameraStream();
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
        {isCameraActive ? (
          <div>
            <DialogHeader>
              <DialogTitle className="font-headline">Capture ID Photo</DialogTitle>
              <DialogDescription>
                Position the ID in the frame and capture the photo.
              </DialogDescription>
            </DialogHeader>
            <div className="relative my-4">
              <video ref={videoRef} className="w-full rounded-md" autoPlay playsInline />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <DialogFooter className="sm:justify-between">
               <Button variant="outline" onClick={() => {
                   stopCameraStream();
                   setIsCameraActive(false);
                }}>Cancel</Button>
              <Button onClick={handleCapturePhoto}>
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
            </DialogFooter>
          </div>
        ) : (
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
                <Label className="text-right">
                  ID Photo
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={handleOpenCamera}>
                        <Camera className="mr-2 h-4 w-4" /> Take Photo
                    </Button>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="mr-2 h-4 w-4" /> Attach File
                    </Button>
                    <Input
                        ref={fileInputRef}
                        id="idPhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                        if (e.target.files) setIdPhoto(e.target.files[0]);
                        }}
                        className="hidden"
                    />
                </div>
              </div>

               {idPhoto && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div/>
                  <div className="col-span-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Image src={URL.createObjectURL(idPhoto)} alt="ID preview" width={40} height={40} className="rounded-md object-cover" />
                    <span className="truncate">{idPhoto.name}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIdPhoto(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

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
        )}
      </DialogContent>
    </Dialog>
  );
}


function EditMemberDialog({ member, onUpdate, onOpenChange }: { member: Member | null; onUpdate: () => void; onOpenChange: (open: boolean) => void; }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const clubId = useAuthStore((state) => state.clubId);

    useEffect(() => {
        if (member) {
            setFullName(member.name);
            setEmail(member.email);
        }
    }, [member]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!member || !clubId) return;

        setIsLoading(true);
        const updatedData = { name: fullName, email: email };

        try {
            const db = getFirestore();
            const memberDocRef = doc(db, 'clubs', clubId, 'members', member.id);
            await updateDoc(memberDocRef, updatedData);
            onUpdate(); // This will close the dialog and reset selections
        } catch (error) {
            console.error("Failed to update member:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={!!member} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Member</DialogTitle>
                    <DialogDescription>Update the details for {member?.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Full Name</Label>
                            <Input id="edit-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">Email</Label>
                            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function MembersPage() {
  const [dialogKey, setDialogKey] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { firestore } = useFirebase();
  const clubId = useAuthStore((state) => state.clubId);
  
  // --- Selection State ---
  const [selectedMembers, setSelectedMembers] = useState(new Set<string>());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

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

  // --- Selection Logic ---
  const handleToggleSelect = (memberId: string) => {
    setSelectedMembers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(memberId)) {
            newSet.delete(memberId);
        } else {
            newSet.add(memberId);
        }
        return newSet;
    });
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
        setSelectedMembers(new Set(members.map(member => member.id)));
    } else {
        setSelectedMembers(new Set());
    }
  };

  const handleOpenEditModal = () => {
    if (selectedMembers.size !== 1) return;
    const editId = selectedMembers.values().next().value;
    const member = members.find(m => m.id === editId);
    if (member) {
        setMemberToEdit(member);
    }
  };

  const handleDeleteSelected = async () => {
    if (!clubId || selectedMembers.size === 0) {
        return;
    }

    const db = getFirestore();
    const batch = writeBatch(db);

    try {
        selectedMembers.forEach(memberId => {
            const memberDocRef = doc(db, 'clubs', clubId, 'members', memberId);
            batch.delete(memberDocRef);
        });

        await batch.commit();

        setSelectedMembers(new Set());
        setIsSelectionMode(false);

    } catch (error: any) {
        console.error('Failed to delete members:', error.message);
    }
  };


  const isAllSelected = useMemo(() => {
    return members.length > 0 && selectedMembers.size === members.length;
  }, [members, selectedMembers]);

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
              <div className="flex items-center gap-2">
                {!isSelectionMode ? (
                    <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)}>Select</Button>
                ) : (
                    <Button variant="secondary" size="sm" onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedMembers(new Set());
                    }}>Cancel</Button>
                )}
                <AddMemberDialog
                  key={dialogKey}
                  onMemberAdded={() => {
                    setDialogKey(prev => prev + 1);
                    setIsSelectionMode(false);
                    setSelectedMembers(new Set());
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
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
                            <Skeleton className="h-6 w-20 rounded-full" />
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
                ) : members.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                    No members found. Add your first member to get started!
                </div>
                ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            {isSelectionMode && (
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    aria-label="Select all"
                                />
                            )}
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Client ID</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>ID Photo</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {members.map((member) => {
                      // Implements Phase 2, Task 3: Display Real-Time Member Status
                      const status = getMemberStatus(member.membershipExpiresAt);
                      return (
                        <TableRow key={member.id} data-state={selectedMembers.has(member.id) && "selected"}>
                        <TableCell>
                          {isSelectionMode && (
                            <Checkbox
                                checked={selectedMembers.has(member.id)}
                                onCheckedChange={() => handleToggleSelect(member.id)}
                                aria-label="Select member"
                            />
                          )}
                        </TableCell>
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
                            <Badge variant="outline" className={status.color}>{status.text}</Badge>
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
                      )
                    })}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
        
        {selectedMembers.size > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <Card className="flex items-center gap-2 p-3 shadow-2xl">
                    <p className="text-sm font-medium mr-2">{selectedMembers.size} selected</p>
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleOpenEditModal}
                        disabled={selectedMembers.size !== 1}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={selectedMembers.size === 0}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedMembers.size})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the selected {selectedMembers.size} member(s).
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSelected}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Card>
            </div>
        )}

        <EditMemberDialog 
            member={memberToEdit}
            onOpenChange={(open) => {
                if (!open) {
                    setMemberToEdit(null);
                    setSelectedMembers(new Set());
                    setIsSelectionMode(false);
                }
            }}
            onUpdate={() => {
                setMemberToEdit(null);
                setSelectedMembers(new Set());
                setIsSelectionMode(false);
            }}
        />

      </PageWrapper>
    </>
  );
}
