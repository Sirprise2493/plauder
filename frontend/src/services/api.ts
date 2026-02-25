export type ApiErrorResponse = {
  error?: string;
  errors?: string[];
};

function getCsrfToken(): string | null {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") ?? null;
}

export const API_BASE = "http://localhost:3000/api/v1";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorResponse;

  if (!response.ok) {
    const message =
      (Array.isArray(data.errors) && data.errors.join(", ")) ||
      data.error ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}
