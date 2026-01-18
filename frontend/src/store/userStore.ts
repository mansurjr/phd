import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  userName: string | null;
  setUserName: (name: string) => void;
  setUserId: (id: string) => void;
  resetUser: () => void;
  openNameModal: boolean;
  setOpenNameModal: (open: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      userName: null,
      setUserName: (name) => set({ userName: name }),
      setUserId: (id) => set({ userId: id }),
          resetUser: () => set({ userId: null, userName: null }),
          // local UI flag to control NameModal open state
          openNameModal: false,
          setOpenNameModal: (open: boolean) => set({ openNameModal: open }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
