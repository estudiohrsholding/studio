import { FieldValue, Timestamp } from "firebase/firestore";

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
  clubId: string; // --- CORRECCIÓN: Esta línea faltaba ---
  minimumUnitOfSale: number;
  amountPerUnit: number;
  imageUrl?: string;
  imageHint?: string;
  createdAt?: Timestamp | FieldValue;
  // Polymorphic fields
  isMembership?: boolean;
  durationDays?: number | null;
  stockLevel?: number | null;
};

export type Transaction = {
  id: string;
  clubId: string; // --- CORRECCIÓN: Esta línea faltaba ---
  type: 'dispense' | 'refill' | 'dispense-log'; // --- CORRECCIÓN: Añadido 'dispense-log'
  itemId: string;
  itemName: string;
  quantity: number;
  amount: number | null;
  memberId: string | null;
  memberName: string | null;
  transactionDate: Timestamp | FieldValue; // --- CORRECCIÓN: Nombre y tipo actualizados
  user: string;
  // El campo 'date: string' ha sido eliminado y reemplazado por 'transactionDate'
};
