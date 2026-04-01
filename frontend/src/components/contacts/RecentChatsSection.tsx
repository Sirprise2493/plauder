import UserAvatar from "../UserAvatar";
import s from "./RecentChatsSection.module.css";
import type { RecentChat } from "../../pages/Contacts";

type Props = {
  recentChats: RecentChat[];
  loadingChats: boolean;
  chatsError: string;
  onOpenChat: (chatId: number) => void;
  currentUserId?: number;
};

export default function RecentChatsSection({
  recentChats,
  loadingChats,
  chatsError,
  onOpenChat,
  currentUserId,
}: Props) {
  function resolveAvatar(chat: RecentChat) {
    if (chat.chat_type === "group_chat") {
      return chat.avatar_url;
    }

    return chat.users.find((user) => user.id !== currentUserId)?.avatar_url ?? null;
  }

  return (
    <section className={s.card}>
      <h2 className={s.title}>Letzte Chats</h2>

      {loadingChats ? (
        <p className={s.info}>Chats werden geladen...</p>
      ) : chatsError ? (
        <p className={s.error}>{chatsError}</p>
      ) : recentChats.length === 0 ? (
        <p className={s.info}>Noch keine Chats vorhanden.</p>
      ) : (
        <div className={s.list}>
          {recentChats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={s.chatCard}
              onClick={() => onOpenChat(chat.id)}
            >
              <UserAvatar
                src={resolveAvatar(chat)}
                alt={chat.display_name || chat.title || "Chat"}
                className={s.avatar}
              />

              <div className={s.content}>
                <div className={s.headerRow}>
                  <span className={s.name}>
                    {chat.display_name || chat.title || "Chat"}
                  </span>
                  <span className={s.type}>
                    {chat.chat_type === "group_chat" ? "Gruppe" : "Direkt"}
                  </span>
                </div>

                <p className={s.preview}>
                  {chat.last_message
                    ? `${chat.last_message.sender.username}: ${chat.last_message.content || "Anhang"}`
                    : "Noch keine Nachrichten"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
