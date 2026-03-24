import type { AuthUser } from "../../services/authApi";
import UserAvatar from "../UserAvatar";
import s from "./ContactsHeader.module.css";

type Props = {
  user: AuthUser | null;
  onLogout: () => void;
};

export default function ContactsHeader({ user, onLogout }: Props) {
  return (
    <header className={s.header}>
      <div className={s.userInfo}>
        <UserAvatar
          src={user?.avatar_url}
          alt={user?.username ?? "User"}
          className={s.avatar}
        />

        <div>
          <h1 className={s.title}>Contacts</h1>
          {user && (
            <p className={s.subtitle}>
              Eingeloggt als <strong>{user.username}</strong> ({user.status})
            </p>
          )}
        </div>
      </div>

      <button type="button" onClick={onLogout} className={s.logoutButton}>
        Logout
      </button>
    </header>
  );
}
