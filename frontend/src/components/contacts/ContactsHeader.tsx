import type { User } from "../../pages/Contacts";
import s from "./ContactsHeader.module.css";

type Props = {
  user: User | null;
  onLogout: () => void;
};

export default function ContactsHeader({ user, onLogout }: Props) {
  return (
    <header className={s.header}>
      <div>
        <h1 className={s.title}>Kontakte</h1>
        <p className={s.userInfo}>
          Eingeloggt als: <strong>{user?.username}</strong> ({user?.email})
        </p>
      </div>

      <button onClick={onLogout} className={s.logoutButton}>
        Logout
      </button>
    </header>
  );
}
