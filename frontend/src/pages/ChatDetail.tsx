import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import s from "./ChatDetail.module.css";

type UserStatus = "online" | "offline";

type User = {
  id: number;
  username: string;
  email: string;
  status: UserStatus;
};

type Chat = {
  id: number;
  chat_type: "direct" | "group_chat";
  title: string | null;
  created_at: string;
  updated_at: string;
  users: User[];
};

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadChat() {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        const data = await apiRequest<Chat>(`/chats/${id}`, {
          method: "GET",
        });

        setChat(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }

    void loadChat();
  }, [id]);

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <Link to="/contacts" className={s.backLink}>
          ← Zurück zu Kontakte
        </Link>
        <h1 className={s.title}>Chat Details</h1>
      </div>

      {loading && <p className={s.message}>Lade Chat...</p>}
      {error && <p className={s.error}>{error}</p>}

      {!loading && !error && chat && (
        <div className={s.card}>
          <p className={s.meta}>
            <strong>Chat ID:</strong> {chat.id}
          </p>
          <p className={s.meta}>
            <strong>Typ:</strong> {chat.chat_type}
          </p>
          {chat.title && (
            <p className={s.meta}>
              <strong>Titel:</strong> {chat.title}
            </p>
          )}

          <h2 className={s.sectionTitle}>User im Chat</h2>

          <ul className={s.list}>
            {chat.users.map((user) => (
              <li key={user.id} className={s.userCard}>
                <h3 className={s.username}>{user.username}</h3>
                <p className={s.meta}>{user.email}</p>
                <p className={s.meta}>Status: {user.status}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
