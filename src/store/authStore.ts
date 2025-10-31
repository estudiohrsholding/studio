import { create } from 'zustand';

interface AuthState {
  uid: string | null;
  clubId: string | null;
  role: string | null;
  setLoginData: (data: { uid: string; clubId: string; role: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  clubId: null,
  role: null,
  setLoginData: (data) => set({ uid: data.uid, clubId: data.clubId, role: data.role }),
  logout: () => set({ uid: null, clubId: null, role: null }),
}));
