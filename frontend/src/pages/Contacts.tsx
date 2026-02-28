import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../services/api";
import s from "./Contacts.module.css";

type UserStatus = "offline" | "online";

type User = {
  id: number;
  email: string;
  username: string;
  status: UserStatus;
};

type FriendshipStatus = "pending" | "accepted" | "rejected" | "blocked";

type Friendship = {
  id: number;
  requester_id: number;
  receiver_id: number;
  friendship_status: FriendshipStatus;
  active: boolean;
  created_at: string;
  updated_at: string;
  requester: User;
  receiver: User;
};

export default function Contacts() {
  const { user, signOut } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFriends() {
      if (!user) return;

      setLoadingFriends(true);
      setError("");

      try {
        const friendships = await apiRequest<Friendship[]>("/friendships", {
          method: "GET",
        });

        const mappedFriends = friendships.map((friendship) =>
          friendship.requester.id === user.id
            ? friendship.receiver
            : friendship.requester
        );

        setFriends(mappedFriends);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Freunde konnten nicht geladen werden");
      } finally {
        setLoadingFriends(false);
      }
    }

    void loadFriends();
  }, [user]);

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <h1 className={s.title}>Kontakte</h1>
        <button onClick={() => void signOut()} className={s.logoutButton}>
          Logout
        </button>
      </div>

      <p className={s.userInfo}>
        Eingeloggt als: <strong>{user?.username}</strong> ({user?.email})
      </p>

      <h2 className={s.sectionTitle}>Meine Freunde</h2>

      {loadingFriends && <p className={s.message}>Lade Freunde...</p>}
      {error && <p className={s.error}>{error}</p>}

      {!loadingFriends && !error && friends.length === 0 && (
        <p className={s.message}>Du hast noch keine Freunde.</p>
      )}

      {!loadingFriends && !error && friends.length > 0 && (
        <ul className={s.list}>
          {friends.map((friend) => (
            <li key={friend.id} className={s.card}>
              <h3 className={s.username}>{friend.username}</h3>
              <p className={s.meta}>{friend.email}</p>
              <p className={s.meta}>Status: {friend.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
