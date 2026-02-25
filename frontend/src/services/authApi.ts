import { apiRequest } from "./api";

export type UserStatus = "offline" | "online" | "away" | "busy";

export type User = {
  id: number;
  email: string;
  username: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
  status?: UserStatus;
};

type AuthResponse = {
  message?: string;
  user: User;
};

export const authApi = {
  getMe: async (): Promise<User> => {
    const data = await apiRequest<{ user: User }>("/me", { method: "GET" });
    return data.user;
  },

  signIn: async (input: SignInInput): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/auth/sign_in", {
      method: "POST",
      body: JSON.stringify({ user: input }),
    });
  },

  signUp: async (input: SignUpInput): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/auth/sign_up", {
      method: "POST",
      body: JSON.stringify({ user: input }),
    });
  },

  signOut: async (): Promise<{ message?: string }> => {
    return apiRequest<{ message?: string }>("/auth/sign_out", {
      method: "DELETE",
    });
  },
};
