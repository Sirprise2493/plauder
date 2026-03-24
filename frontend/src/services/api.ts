const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000/api/v1";

export type ApiErrorShape = {
  error?: string;
  errors?: string[];
};

function getCsrfToken(): string | null {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") ?? null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // JSON-Body => Content-Type setzen
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] =
      (headers as Record<string, string>)["Content-Type"] ?? "application/json";
  }

  // CSRF nur setzen, wenn vorhanden
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as T & ApiErrorShape;

  if (!res.ok) {
    const message =
      (Array.isArray(data.errors) && data.errors.join(", ")) ||
      data.error ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}
