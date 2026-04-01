import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { AuthUser, UserStatus } from "../services/authApi";
import UserAvatar from "../components/UserAvatar";
import s from "./ProfilePage.module.css";

type MeResponse = {
  user: AuthUser;
};

type UpdateUserResponse = {
  user: AuthUser;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();

  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<UserStatus>("offline");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatar);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

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
    return <div className={s.wrapper}>Profil wird geladen...</div>;
  }

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <div className={s.headerRow}>
          <h1 className={s.title}>Mein Profil</h1>
          <Link to="/contacts" className={s.backLink}>
            Zurück zu Contacts
          </Link>
        </div>

        {successMessage && <p className={s.success}>{successMessage}</p>}
        {errorMessage && <p className={s.error}>{errorMessage}</p>}

        <div className={s.avatarBox}>
          <UserAvatar
            src={previewUrl || avatarUrl}
            alt="Profilbild"
            className={s.avatar}
          />
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <label className={s.label}>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            </select>
          </label>

          <label className={s.label}>
            Neues Profilbild
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
              className={s.input}
            />
          </label>

          <button type="submit" disabled={saving} className={s.primaryButton}>
            {saving ? "Speichert..." : "Profil speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
