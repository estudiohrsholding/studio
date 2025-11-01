
import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'userAdmin' | 'guest';
  clubId: string;
  level: number;
  points: number;
  avatar: string;
};

// Implements Phase 2, Task 1: Update 'members' Schema
export type Member = {
  id: string; // clientID
  clubId: string;
  name: string;
  email: string;
  avatar: string;
  idPhotoUrl: string;
  membershipExpiresAt?: Timestamp | null;
  isVetoed?: boolean;
  createdAt?: Timestamp;
};

// Implements Phase 1, Task 1: Update 'inventoryItems' Schema
export type Item = {
  id: string;
  name:string;
  group: string;
  category: string;
  minimumUnitOfSale: number;
  amountPerUnit: number;
  imageUrl?: string;
  imageHint?: string;
  createdAt?: Timestamp;
  // Polymorphic fields
  isMembership?: boolean;
  durationDays?: number | null;
  stockLevel?: number | null;
};

export type Transaction = {
  id: string;
  type: 'dispense' | 'refill';
  itemId: string;
  itemName: string;
  quantity: number;
  amount: number | null;
  memberId: string | null;
  memberName: string | null;
  date: string;
  user: string;
};
