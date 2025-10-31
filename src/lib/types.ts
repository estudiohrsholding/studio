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

export type Item = {
  id: string;
  name:string;
  group: string;
  category: string;
  minimumUnitOfSale: number;
  amountPerUnit: number;
  stockLevel: number;
  imageUrl?: string;
  imageHint?: string;
  isMembership?: boolean;
  duration?: string;
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

    
