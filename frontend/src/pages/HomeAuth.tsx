// frontend/src/pages/HomeAuth.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserStatus } from "../services/authApi";
import s from "./HomeAuth.module.css";

type AuthMode = "sign_in" | "sign_up";

export default function HomeAuth() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>("sign_in");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState<UserStatus>("offline");

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password) return false;
    if (mode === "sign_up") return !!username.trim() && !!passwordConfirmation;
    return true;
  }, [mode, email, password, username, passwordConfirmation]);

  useEffect(() => {
    if (!loading && user) navigate("/contacts", { replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (mode === "sign_in") {
        await signIn(email.trim(), password);
        setSuccessMessage("Login erfolgreich");
      } else {
        await signUp({
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          username: username.trim(),
          status,
        });
        setSuccessMessage("Registrierung erfolgreich");
      }

      setPassword("");
      setPasswordConfirmation("");

      navigate("/contacts", { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    }
  }

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <h1 className={s.title}>Chat App Auth</h1>

        <div className={s.tabRow}>
          <button
            type="button"
            onClick={() => {
              setMode("sign_in");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`${s.tabButton} ${mode === "sign_in" ? s.activeTab : ""}`}
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
            className={`${s.tabButton} ${mode === "sign_up" ? s.activeTab : ""}`}
          >
            Sign Up
          </button>
        </div>

        {successMessage && <p className={s.success}>{successMessage}</p>}
        {errorMessage && <p className={s.error}>{errorMessage}</p>}

        <form onSubmit={handleSubmit} className={s.form}>
          {mode === "sign_up" && (
            <>
              <label className={s.label}>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="z. B. maxmustermann"
                  className={s.input}
                  minLength={3}
                  maxLength={30}
                  required
                />
              </label>

              <label className={s.label}>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className={s.input}
                >
                  <option value="offline">offline</option>
                  <option value="online">online</option>
                  <option value="away">away</option>
                  <option value="busy">busy</option>
                </select>
              </label>
            </>
          )}

          <label className={s.label}>
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={s.input}
              required
            />
          </label>

          <label className={s.label}>
            Passwort
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={s.input}
              required
            />
          </label>

          {mode === "sign_up" && (
            <label className={s.label}>
              Passwort bestätigen
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="********"
                className={s.input}
                required
              />
            </label>
          )}

          <button type="submit" disabled={loading || !canSubmit} className={s.primaryButton}>
            {loading ? "Bitte warten..." : mode === "sign_in" ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
