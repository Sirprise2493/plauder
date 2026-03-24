import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "../services/authApi";
import type { User, UserStatus } from "../services/authApi";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refreshMe: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: {
    email: string;
    password: string;
    password_confirmation: string;
    username: string;
    status?: UserStatus;
    avatar?: File | null;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authApi.signIn(email, password);
    setUser(res.user);
  }, []);

  const signUp = useCallback(async (params: {
    email: string;
    password: string;
    password_confirmation: string;
    username: string;
    status?: UserStatus;
    avatar?: File | null;
  }) => {
    const res = await authApi.signUp(params);
    setUser(res.user);
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, refreshMe, signIn, signUp, signOut }),
    [user, loading, refreshMe, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
