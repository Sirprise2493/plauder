import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, type User, type SignInInput, type SignUpInput } from "../services/authApi";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshMe();
      setIsLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn: async (input) => {
      const result = await authApi.signIn(input);
      setUser(result.user);
    },
    signUp: async (input) => {
      const result = await authApi.signUp(input);
      setUser(result.user);
    },
    signOut: async () => {
      await authApi.signOut();
      setUser(null);
    },
    refreshMe,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
