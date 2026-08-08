import { create } from 'zustand';

interface GlobalErrorState {
  isOpen: boolean;
  title: string;
  message: string;
  showError: (title: string, message: string) => void;
  hideError: () => void;
}

export const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  showError: (title, message) => set({ isOpen: true, title, message }),
  hideError: () => set({ isOpen: false }),
}));
