import { apiRequest } from "./api";

export type UserStatus = "offline" | "online";

export type User = {
  id: number;
  email: string;
  username: string;
  status: UserStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthSuccess = {
  message?: string;
  user: User;
};

export async function me(): Promise<User> {
  const data = await apiRequest<{ user: User }>("/me", { method: "GET" });
  return data.user;
}

export async function signIn(email: string, password: string): Promise<AuthSuccess> {
  return apiRequest<AuthSuccess>("/auth/sign_in", {
    method: "POST",
    body: JSON.stringify({ user: { email, password } }),
  });
}

export async function signUp(params: {
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
  status?: UserStatus;
  avatar?: File | null;
}): Promise<AuthSuccess> {
  const formData = new FormData();

  formData.append("user[email]", params.email);
  formData.append("user[password]", params.password);
  formData.append("user[password_confirmation]", params.password_confirmation);
  formData.append("user[username]", params.username);

  if (params.status) {
    formData.append("user[status]", params.status);
  }

  if (params.avatar) {
    formData.append("user[avatar]", params.avatar);
  }

  return apiRequest<AuthSuccess>("/auth/sign_up", {
    method: "POST",
    body: formData,
  });
}

export async function signOut(): Promise<{ message?: string }> {
  return apiRequest<{ message?: string }>("/auth/sign_out", { method: "DELETE" });
}
