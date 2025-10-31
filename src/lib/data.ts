import type { User, Member, Item, Transaction } from './types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@myclub.com',
  role: 'userAdmin',
  clubId: 'club-alpha',
  level: 5,
  points: 4350,
  avatar: 'https://picsum.photos/seed/admin/200/200',
};

export const mockMembers: Member[] = [
  { id: 'client-001', clubId: 'club-alpha', name: 'Alice Johnson', email: 'alice@email.com', joinedDate: '2023-01-15', avatar: 'https://picsum.photos/seed/member1/200/200' },
  { id: 'client-002', clubId: 'club-alpha', name: 'Bob Williams', email: 'bob@email.com', joinedDate: '2023-02-20', avatar: 'https://picsum.photos/seed/member2/200/200' },
  { id: 'client-003', clubId: 'club-alpha', name: 'Charlie Brown', email: 'charlie@email.com', joinedDate: '2023-03-10', avatar: 'https://picsum.photos/seed/member3/200/200' },
  { id: 'client-004', clubId: 'club-alpha', name: 'Diana Prince', email: 'diana@email.com', joinedDate: '2023-04-05', avatar: 'https://picsum.photos/seed/member4/200/200' },
  { id: 'client-005', clubId: 'club-alpha', name: 'Ethan Hunt', email: 'ethan@email.com', joinedDate: '2023-05-21', avatar: 'https://picsum.photos/seed/member5/200/200' },
];

export const mockInventory: Item[] = [
  { id: 'item-101', name: 'Premium Blend', group: 'Flowers', category: 'Sativa', minSaleUnit: '1g', price: 15, stock: 150, imageUrl: 'https://picsum.photos/seed/item1/400/300', imageHint: 'product package' },
  { id: 'item-102', name: 'Relax Tincture', group: 'Oils', category: 'Indica', minSaleUnit: '10ml', price: 45, stock: 50, imageUrl: 'https://picsum.photos/seed/item2/400/300', imageHint: 'bottle label' },
  { id: 'item-103', name: 'Gummy Bites', group: 'Edibles', category: 'Hybrid', minSaleUnit: '1 pack', price: 25, stock: 80, imageUrl: 'https://picsum.photos/seed/item3/400/300', imageHint: 'food snack' },
  { id: 'item-104', name: 'Vape Cartridge', group: 'Vapes', category: 'Sativa', minSaleUnit: '1 unit', price: 35, stock: 12, imageUrl: 'https://picsum.photos/seed/item4/400/300', imageHint: 'vape cartridge' },
  { id: 'item-105', name: 'CBD Cream', group: 'Topicals', category: 'CBD', minSaleUnit: '50g', price: 30, stock: 40, imageUrl: 'https://picsum.photos/seed/item5/400/300', imageHint: 'cosmetic cream' },
];

export const mockTransactions: Transaction[] = [
    { id: 'txn-001', type: 'dispense', itemId: 'item-101', itemName: 'Premium Blend', quantity: 5, amount: 75, memberId: 'client-001', memberName: 'Alice Johnson', date: '2024-07-20T10:30:00Z', user: 'Admin User' },
    { id: 'txn-002', type: 'refill', itemId: 'item-102', itemName: 'Relax Tincture', quantity: 20, amount: null, memberId: null, memberName: null, date: '2024-07-20T09:00:00Z', user: 'Admin User' },
    { id: 'txn-003', type: 'dispense', itemId: 'item-103', itemName: 'Gummy Bites', quantity: 2, amount: 50, memberId: 'client-002', memberName: 'Bob Williams', date: '2024-07-19T15:45:00Z', user: 'Admin User' },
    { id: 'txn-004', type: 'dispense', itemId: 'item-104', itemName: 'Vape Cartridge', quantity: 1, amount: 35, memberId: 'client-001', memberName: 'Alice Johnson', date: '2024-07-19T12:10:00Z', user: 'Admin User' },
    { id: 'txn-005', type: 'refill', itemId: 'item-101', itemName: 'Premium Blend', quantity: 50, amount: null, memberId: null, memberName: null, date: '2024-07-18T18:00:00Z', user: 'Admin User' },
];
