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
  isLoading: true, // Important: start as true

  setLoginData: (data) => {
    console.log('%c[DEBUG ZUSTAND] 9. setLoginData action executed! New clubId:', 'color: #0000FF', data.clubId);
    set({ uid: data.uid, clubId: data.clubId, role: data.role });
  },

  logout: () => {
    console.log('%c[DEBUG ZUSTAND] logout action executed!', 'color: #0000FF');
    set({ uid: null, clubId: null, role: null });
  },

  setLoading: (loading) => {
    console.log('%c[DEBUG ZUSTAND] setLoading action executed! isLoading:', 'color: #0000FF', loading);
    set({ isLoading: loading });
  },
}));
