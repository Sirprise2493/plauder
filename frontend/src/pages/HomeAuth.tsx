import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import UserAvatar from "../components/UserAvatar";
import s from "./HomeAuth.module.css";

/* Auth-Ansicht hat zwei Modi */
type AuthMode = "sign_in" | "sign_up";

export default function HomeAuth() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();

  /* Aktueller Modus */
  const [mode, setMode] = useState<AuthMode>("sign_in");

  /* Feedback-Meldungen */
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* Gemeinsame Formularfelder */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* Zusätzliche Felder für Registrierung */
  const [username, setUsername] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  /* Avatar-Upload */
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  /* Formular darf nur abgeschickt werden, wenn alle Pflichtfelder gesetzt sind */
  const canSubmit = useMemo(() => {
    if (!email.trim() || !password) return false;

    if (mode === "sign_up") {
      return !!username.trim() && !!passwordConfirmation;
    }

    return true;
  }, [mode, email, password, username, passwordConfirmation]);

  /* Wenn der User schon eingeloggt ist, direkt weiterleiten */
  useEffect(() => {
    if (!loading && user) {
      navigate("/contacts", { replace: true });
    }
  }, [loading, user, navigate]);

  /* Lokale Vorschau für das ausgewählte Profilbild erzeugen */
  useEffect(() => {
    if (!avatar) {
      setAvatarPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatar);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  /* Wechsel zwischen Sign In / Sign Up */
  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
  }

  /* Formular absenden */
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

          /* Status wird immer automatisch online gesetzt */
          status: "online",

          avatar,
        });

        setSuccessMessage("Registrierung erfolgreich");
      }

      /* Sensible Felder nach Erfolg leeren */
      setPassword("");
      setPasswordConfirmation("");
      setAvatar(null);
      setAvatarPreview(null);

      navigate("/contacts", { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    }
  }

  return (
    <div className={s.wrapper}>
      <section className={s.card} aria-labelledby="auth-title">
        <div className={s.header}>
          <p className={s.eyebrow}>Willkommen zurück</p>

          <h1 id="auth-title" className={s.title}>
            Chat App Auth
          </h1>

          <p className={s.subtitle}>
            Melde dich an oder erstelle ein neues Konto.
          </p>
        </div>

        <div className={s.tabRow} aria-label="Authentifizierungsmodus wählen">
          <button
            type="button"
            onClick={() => switchMode("sign_in")}
            className={`${s.tabButton} ${mode === "sign_in" ? s.activeTab : ""}`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => switchMode("sign_up")}
            className={`${s.tabButton} ${mode === "sign_up" ? s.activeTab : ""}`}
          >
            Sign Up
          </button>
        </div>

        {successMessage && <p className="uiMessage uiMessageSuccess">{successMessage}</p>}
        {errorMessage && <p className="uiMessage uiMessageError">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className={`uiForm ${s.form}`}>
          {mode === "sign_up" && (
            <>
              <div className={s.avatarSection}>
                <UserAvatar
                  src={avatarPreview}
                  alt="Avatar Vorschau"
                  className={s.avatarPreview}
                />
              </div>

              <div className="uiField">
                <span className="uiLabel">Profilbild</span>

                <label className={`uiFileUpload ${s.fileUploadCustom}`}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                    className="uiFileInput"
                  />

                  <span className="uiFileButton">Bild auswählen</span>
                  <span className="uiFileName">
                    {avatar ? avatar.name : "Kein Bild ausgewählt"}
                  </span>
                </label>

                <span className="uiHint">Erlaubt: PNG, JPG, JPEG, WEBP</span>
              </div>

              <div className="uiField">
                <label className="uiLabel" htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="z. B. maxmustermann"
                  className={`uiInput ${s.inputReset}`}
                  minLength={3}
                  maxLength={30}
                  required
                />
              </div>
            </>
          )}

          <div className="uiField">
            <label className="uiLabel" htmlFor="email">
              E-Mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`uiInput ${s.inputReset}`}
              required
            />
          </div>

          <div className="uiField">
            <label className="uiLabel" htmlFor="password">
              Passwort
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={`uiInput ${s.inputReset}`}
              required
            />
          </div>

          {mode === "sign_up" && (
            <div className="uiField">
              <label className="uiLabel" htmlFor="passwordConfirmation">
                Passwort bestätigen
              </label>

              <input
                id="passwordConfirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="********"
                className={`uiInput ${s.inputReset}`}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className={`uiButton uiButtonPrimary uiButtonBlock ${s.submitButton}`}
          >
            {loading ? "Bitte warten..." : mode === "sign_in" ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </section>
    </div>
  );
}
