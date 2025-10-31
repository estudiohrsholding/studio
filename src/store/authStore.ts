
import { create } from 'zustand';

interface AuthState {
  uid: string | null;
  clubId: string | null;
  role: string | null;
  isLoading: boolean;
  setLoginData: (data: { uid: string; clubId: string; role: string }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  clubId: null,
  role: null,
  isLoading: true, // Important: start as true to prevent premature rendering

  setLoginData: (data) => {
    set({ uid: data.uid, clubId: data.clubId, role: data.role });
  },

  logout: () => {
    set({ uid: null, clubId: null, role: null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
