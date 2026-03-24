import type { User } from "../../pages/Contacts";
import UserAvatar from "../UserAvatar";
import s from "./FriendsSection.module.css";

type Props = {
  friends: User[];
  loadingFriends: boolean;
  friendsError: string;
  onOpenFriendChat: (friendId: number) => void;
};

export default function FriendsSection({
  friends,
  loadingFriends,
  friendsError,
  onOpenFriendChat,
}: Props) {
  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle}>Meine Freunde</h2>

      {loadingFriends && <p className={s.message}>Lade Freunde...</p>}
      {friendsError && <p className={s.error}>{friendsError}</p>}

      {!loadingFriends && !friendsError && friends.length === 0 && (
        <p className={s.message}>Du hast noch keine Freunde.</p>
      )}

      {!loadingFriends && !friendsError && friends.length > 0 && (
        <ul className={s.list}>
          {friends.map((friend) => (
            <li
              key={friend.id}
              className={s.cardClickable}
              onClick={() => onOpenFriendChat(friend.id)}
            >
              <div className={s.cardContent}>
                <UserAvatar
                  src={friend.avatar_url}
                  alt={friend.username}
                  className={s.avatar}
                />

                <div>
                  <h3 className={s.username}>{friend.username}</h3>
                  <p className={s.meta}>{friend.email}</p>
                  <p className={s.meta}>Status: {friend.status}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
