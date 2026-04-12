import UserAvatar from "../UserAvatar";
import s from "./RecentChatsSection.module.css";
import type { RecentChat, User } from "../../pages/Contacts";

type ChatListItem = {
  id: number;
  chat_type: "direct" | "group_chat";
  title: string | null;
  avatar_url: string | null;
  display_name?: string | null;
  last_message?: {
    id: number;
    content: string | null;
    message_type: string;
    created_at: string;
    sender: User;
  } | null;
  users: User[];
};

type Props = {
  title: string;
  chats: ChatListItem[];
  loadingChats: boolean;
  chatsError: string;
  onOpenChat: (chatId: number) => void;
  currentUserId?: number;
  emptyMessage?: string;
  showTypeLabel?: boolean;
};

export default function RecentChatsSection({
  title,
  chats,
  loadingChats,
  chatsError,
  onOpenChat,
  currentUserId,
  emptyMessage = "Noch keine Chats vorhanden.",
  showTypeLabel = false,
}: Props) {
  function resolveAvatar(chat: ChatListItem) {
    if (chat.chat_type === "group_chat") {
      return chat.avatar_url;
    }

    return chat.users.find((user) => user.id !== currentUserId)?.avatar_url ?? null;
  }

  function resolveName(chat: ChatListItem) {
    if (chat.display_name) return chat.display_name;

    if (chat.chat_type === "direct") {
      return chat.users.find((user) => user.id !== currentUserId)?.username ?? "Direktchat";
    }

    return chat.title || "Gruppenchat";
  }

  function resolvePreview(chat: ChatListItem) {
    if ("last_message" in chat) {
      return chat.last_message
        ? `${chat.last_message.sender.username}: ${chat.last_message.content || "Anhang"}`
        : "Noch keine Nachrichten";
    }

    if (chat.chat_type === "direct") {
      const otherUser = chat.users.find((user) => user.id !== currentUserId);
      return otherUser?.email || "Direktchat öffnen";
    }

    return `${chat.users.length} Mitglieder`;
  }

  return (
    <section className={s.card}>
      <h2 className={s.title}>{title}</h2>

      {loadingChats ? (
        <p className={s.info}>Chats werden geladen...</p>
      ) : chatsError ? (
        <p className={s.error}>{chatsError}</p>
      ) : chats.length === 0 ? (
        <p className={s.info}>{emptyMessage}</p>
      ) : (
        <div className={s.list}>
          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={s.chatCard}
              onClick={() => onOpenChat(chat.id)}
            >
              <UserAvatar
                src={resolveAvatar(chat)}
                alt={resolveName(chat)}
                className={s.avatar}
              />

              <div className={s.content}>
                <div className={s.headerRow}>
                  <span className={s.name}>{resolveName(chat)}</span>

                  {showTypeLabel && (
                    <span className={s.type}>
                      {chat.chat_type === "group_chat" ? "Gruppe" : "Direkt"}
                    </span>
                  )}
                </div>

                <p className={s.preview}>{resolvePreview(chat)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
