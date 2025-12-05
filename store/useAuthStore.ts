import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (user: Partial<User> & { id: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) =>
        set({
          user,
          token,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
        }),
      setUser: (user) =>
        set({
          user,
        }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);

// Selector to get isAuthenticated state
export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};

