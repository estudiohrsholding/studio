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

    