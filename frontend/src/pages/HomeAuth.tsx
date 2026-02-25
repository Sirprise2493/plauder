import React, { useEffect, useMemo, useState } from "react";

type AuthMode = "sign_in" | "sign_up";

type User = {
  id: number;
  email: string;
  username: string;
  status: "offline" | "online" | "away" | "busy";
  created_at: string;
  updated_at: string;
};

type ApiSuccess = {
  message?: string;
  user: User;
};

type ApiError = {
  error?: string;
  errors?: string[];
};

const API_BASE = "http://localhost:3000/api/v1"; // ggf. anpassen

function getCsrfToken(): string | null {
  // Falls Rails ein csrf-meta-tag rendert (z. B. in app/views/layouts/application.html.erb)
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") ?? null;
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // wichtig für Devise Session-Cookies
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    const message =
      (Array.isArray((data as ApiError).errors) && (data as ApiError).errors?.join(", ")) ||
      (data as ApiError).error ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export default function HomeAuth() {
  const [mode, setMode] = useState<AuthMode>("sign_in");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Gemeinsame Felder
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Nur für SignUp
  const [username, setUsername] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState<User["status"]>("offline");

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password) return false;
    if (mode === "sign_up") {
      return !!username.trim() && !!passwordConfirmation;
    }
    return true;
  }, [mode, email, password, username, passwordConfirmation]);

  useEffect(() => {
    void loadMe();
  }, []);

  async function loadMe() {
    setCheckingSession(true);
    setErrorMessage("");

    try {
      const data = await apiRequest<{ user: User }>(`${API_BASE}/me`, {
        method: "GET",
      });
      setCurrentUser(data.user);
    } catch {
      setCurrentUser(null);
      // absichtlich kein Fehler anzeigen, wenn nicht eingeloggt
    } finally {
      setCheckingSession(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (mode === "sign_in") {
        const payload = {
          user: {
            email: email.trim(),
            password,
          },
        };

        const data = await apiRequest<ApiSuccess>(`${API_BASE}/auth/sign_in`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setCurrentUser(data.user);
        setSuccessMessage(data.message || "Login erfolgreich");
      } else {
        const payload = {
          user: {
            email: email.trim(),
            password,
            password_confirmation: passwordConfirmation,
            username: username.trim(),
            status, // optional, bei dir im Backend erlaubt
          },
        };

        const data = await apiRequest<ApiSuccess>(`${API_BASE}/auth/sign_up`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setCurrentUser(data.user);
        setSuccessMessage(data.message || "Registrierung erfolgreich");
      }

      // Optional: Passwortfelder zurücksetzen
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await apiRequest<{ message?: string }>(`${API_BASE}/auth/sign_out`, {
        method: "DELETE",
      });

      setCurrentUser(null);
      setSuccessMessage(data.message || "Logout erfolgreich");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Logout fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>Lade Sitzung …</div>
      </div>
    );
  }

  // Wenn bereits eingeloggt -> User-Info anzeigen
  if (currentUser) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h1 style={styles.title}>Willkommen, {currentUser.username} 👋</h1>

          {successMessage && <p style={styles.success}>{successMessage}</p>}
          {errorMessage && <p style={styles.error}>{errorMessage}</p>}

          <div style={styles.userBox}>
            <p><strong>ID:</strong> {currentUser.id}</p>
            <p><strong>E-Mail:</strong> {currentUser.email}</p>
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Status:</strong> {currentUser.status}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? "Logout..." : "Logout"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Chat App Auth</h1>

        <div style={styles.tabRow}>
          <button
            type="button"
            onClick={() => {
              setMode("sign_in");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            style={{
              ...styles.tabButton,
              ...(mode === "sign_in" ? styles.activeTab : {}),
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("sign_up");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            style={{
              ...styles.tabButton,
              ...(mode === "sign_up" ? styles.activeTab : {}),
            }}
          >
            Sign Up
          </button>
        </div>

        {successMessage && <p style={styles.success}>{successMessage}</p>}
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "sign_up" && (
            <>
              <label style={styles.label}>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="z. B. maxmustermann"
                  style={styles.input}
                  minLength={3}
                  maxLength={30}
                  required
                />
              </label>

              <label style={styles.label}>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as User["status"])}
                  style={styles.input}
                >
                  <option value="offline">offline</option>
                  <option value="online">online</option>
                  <option value="away">away</option>
                  <option value="busy">busy</option>
                </select>
              </label>
            </>
          )}

          <label style={styles.label}>
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={styles.input}
              required
            />
          </label>

          <label style={styles.label}>
            Passwort
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              style={styles.input}
              required
            />
          </label>

          {mode === "sign_up" && (
            <label style={styles.label}>
              Passwort bestätigen
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="********"
                style={styles.input}
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            style={styles.primaryButton}
          >
            {loading
              ? mode === "sign_in"
                ? "Anmeldung..."
                : "Registrierung..."
              : mode === "sign_in"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f4f6f8",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  title: {
    margin: "0 0 16px",
    fontSize: "1.5rem",
    textAlign: "center",
  },
  tabRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "16px",
  },
  tabButton: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d0d7de",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  activeTab: {
    background: "#111827",
    color: "#fff",
    borderColor: "#111827",
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  label: {
    display: "grid",
    gap: "6px",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d0d7de",
    fontSize: "0.95rem",
  },
  primaryButton: {
    marginTop: "4px",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },
  success: {
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "0.9rem",
  },
  error: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "0.9rem",
  },
  userBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
};
