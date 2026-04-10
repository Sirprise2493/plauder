import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { AuthUser, UserStatus } from "../services/authApi";
import UserAvatar from "../components/UserAvatar";
import s from "./ProfilePage.module.css";

/* Antwort für /me */
type MeResponse = {
  user: AuthUser;
};

/* Antwort für Profil-Update */
type UpdateUserResponse = {
  user: AuthUser;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();

  /* Formularzustand */
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<UserStatus>("offline");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* Lade- und Feedback-Zustände */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* Profildaten beim Laden der Seite abrufen */
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await apiRequest<MeResponse>("/me", {
          method: "GET",
        });

        setUsername(response.user.username);
        setStatus(response.user.status);
        setAvatarUrl(response.user.avatar_url);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Profil konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  /* Lokale Vorschau für ein neu ausgewähltes Avatar-Bild */
  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatar);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  /* Formular absenden */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("user[username]", username.trim());
      formData.append("user[status]", status);

      if (avatar) {
        formData.append("user[avatar]", avatar);
      }

      const response = await apiRequest<UpdateUserResponse>(`/users/${user.id}`, {
        method: "PATCH",
        body: formData,
      });

      setUsername(response.user.username);
      setStatus(response.user.status);
      setAvatarUrl(response.user.avatar_url);
      setAvatar(null);
      setPreviewUrl(null);
      setSuccessMessage("Profil erfolgreich aktualisiert.");

      await refreshMe();
      navigate("/contacts");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Profil konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={s.loadingState}>Profil wird geladen...</div>;
  }

  return (
    <div className={s.wrapper}>
      <section className={s.card} aria-labelledby="profile-title">
        <div className={s.headerRow}>
          <div className={s.headerText}>
            <p className={s.eyebrow}>Account</p>
            <h1 id="profile-title" className={s.title}>
              Mein Profil
            </h1>
          </div>

          <Link to="/contacts" className={s.backLink}>
            Zurück
          </Link>
        </div>

        {successMessage && <p className="uiMessage uiMessageSuccess">{successMessage}</p>}
        {errorMessage && <p className="uiMessage uiMessageError">{errorMessage}</p>}

        <div className={s.avatarBox}>
          {previewUrl ? (
            <img src={previewUrl} alt="Profilbild Vorschau" className={s.avatar} />
          ) : (
            <UserAvatar src={avatarUrl} alt="Profilbild" className={s.avatar} />
          )}
        </div>

        <form onSubmit={handleSubmit} className={`uiForm ${s.form}`}>
          <div className="uiField">
            <label className="uiLabel" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`uiInput ${s.inputReset}`}
              minLength={3}
              maxLength={30}
              required
            />
          </div>

          <div className="uiField">
            <label className="uiLabel" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className={`uiSelect ${s.inputReset}`}
            >
              <option value="offline">offline</option>
              <option value="online">online</option>
            </select>
          </div>

          <div className="uiField">
            <span className="uiLabel">Neues Profilbild</span>

            <label className={`uiFileUpload ${s.fileUploadCustom}`}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                className="uiFileInput"
              />

              <span className="uiFileButton">Bild auswählen</span>
              <span className="uiFileName">
                {avatar ? avatar.name : "Kein neues Bild ausgewählt"}
              </span>
            </label>

            <span className="uiHint">Erlaubt: PNG, JPG, JPEG, WEBP</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`uiButton uiButtonPrimary uiButtonBlock ${s.submitButton}`}
          >
            {saving ? "Speichert..." : "Profil speichern"}
          </button>
        </form>
      </section>
    </div>
  );
}
