import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../services/api";
import UserAvatar from "../components/UserAvatar";
import s from "./Contacts.module.css";

import ContactsHeader from "../components/contacts/ContactsHeader";
import UserSearchSection from "../components/contacts/UserSearchSection";
import ReceivedRequestsSection from "../components/contacts/ReceivedRequestsSection";
import RecentChatsSection from "../components/contacts/RecentChatsSection";
import FriendsSection from "../components/contacts/FriendsSection";

export type UserStatus = "online" | "offline";

export type User = {
  id: number;
  email: string;
  username: string;
  status: UserStatus;
  avatar_url: string | null;
};

export type FriendshipStatus = "pending" | "accepted" | "rejected" | "blocked";

export type Friendship = {
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

export type RecentChat = {
  id: number;
  chat_type: "direct" | "group_chat";
  title: string | null;
  avatar_url: string | null;
  display_name: string | null;
  last_message: {
    id: number;
    content: string | null;
    message_type: string;
    created_at: string;
    sender: User;
  } | null;
  users: User[];
};

type ChatSummary = {
  id: number;
  chat_type: "direct" | "group_chat";
  title: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  users: User[];
};

export default function Contacts() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [friends, setFriends] = useState<User[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [allChats, setAllChats] = useState<ChatSummary[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRecentChats, setLoadingRecentChats] = useState(true);
  const [loadingAllChats, setLoadingAllChats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [friendsError, setFriendsError] = useState("");
  const [recentChatsError, setRecentChatsError] = useState("");
  const [allChatsError, setAllChatsError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [showCreateGroupChat, setShowCreateGroupChat] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupFriendSearch, setGroupFriendSearch] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [groupAvatarPreviewUrl, setGroupAvatarPreviewUrl] = useState<string | null>(null);
  const [creatingGroupChat, setCreatingGroupChat] = useState(false);

  useEffect(() => {
    async function loadFriends() {
      if (!user) return;

      setLoadingFriends(true);
      setFriendsError("");

      try {
        const friendships = await apiRequest<Friendship[]>("/friendships", {
          method: "GET",
        });

        const mappedFriends = friendships.map((friendship) =>
          friendship.requester.id === user.id ? friendship.receiver : friendship.requester
        );

        setFriends(mappedFriends);
      } catch (err) {
        setFriendsError(
          err instanceof Error ? err.message : "Freunde konnten nicht geladen werden"
        );
      } finally {
        setLoadingFriends(false);
      }
    }

    void loadFriends();
  }, [user]);

  useEffect(() => {
    async function loadRecentChats() {
      if (!user) return;

      setLoadingRecentChats(true);
      setRecentChatsError("");

      try {
        const chats = await apiRequest<RecentChat[]>("/chats/recent", {
          method: "GET",
        });

        setRecentChats(chats);
      } catch (err) {
        setRecentChatsError(
          err instanceof Error ? err.message : "Letzte Chats konnten nicht geladen werden"
        );
      } finally {
        setLoadingRecentChats(false);
      }
    }

    void loadRecentChats();
  }, [user]);

  useEffect(() => {
    async function loadAllChats() {
      if (!user) return;

      setLoadingAllChats(true);
      setAllChatsError("");

      try {
        const chats = await apiRequest<ChatSummary[]>("/chats", {
          method: "GET",
        });

        setAllChats(chats);
      } catch (err) {
        setAllChatsError(
          err instanceof Error ? err.message : "Chats konnten nicht geladen werden"
        );
      } finally {
        setLoadingAllChats(false);
      }
    }

    void loadAllChats();
  }, [user]);

  useEffect(() => {
    async function loadReceivedRequests() {
      if (!user) return;

      setLoadingRequests(true);
      setRequestsError("");

      try {
        const requests = await apiRequest<Friendship[]>("/friendships/received_requests", {
          method: "GET",
        });

        setReceivedRequests(requests);
      } catch (err) {
        setRequestsError(
          err instanceof Error ? err.message : "Friendship Requests konnten nicht geladen werden"
        );
      } finally {
        setLoadingRequests(false);
      }
    }

    void loadReceivedRequests();
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError("");
      setLoadingSearch(false);
      return;
    }

    async function searchUsers() {
      setLoadingSearch(true);
      setSearchError("");

      try {
        const users = await apiRequest<User[]>(
          `/users?query=${encodeURIComponent(searchQuery.trim())}`,
          { method: "GET" }
        );

        setSearchResults(users);
      } catch (err) {
        setSearchError(
          err instanceof Error ? err.message : "User konnten nicht gesucht werden"
        );
      } finally {
        setLoadingSearch(false);
      }
    }

    const timeout = window.setTimeout(() => {
      void searchUsers();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!groupAvatar) {
      setGroupAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(groupAvatar);
    setGroupAvatarPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [groupAvatar]);

  const filteredFriends = useMemo(() => {
    const query = groupFriendSearch.trim().toLowerCase();

    if (!query) return friends;

    return friends.filter((friend) => friend.username.toLowerCase().includes(query));
  }, [friends, groupFriendSearch]);

  const directChats = useMemo(
    () => allChats.filter((chat) => chat.chat_type === "direct"),
    [allChats]
  );

  const groupChats = useMemo(
    () => allChats.filter((chat) => chat.chat_type === "group_chat"),
    [allChats]
  );

  function addFriendIfMissing(friendToAdd: User) {
    setFriends((prev) => {
      if (prev.some((friend) => friend.id === friendToAdd.id)) return prev;
      return [friendToAdd, ...prev];
    });
  }

  function toggleFriendSelection(friendId: number) {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  }

  function resetGroupChatForm() {
    setGroupTitle("");
    setGroupFriendSearch("");
    setSelectedFriendIds([]);
    setGroupAvatar(null);
    setGroupAvatarPreviewUrl(null);
    setShowCreateGroupChat(false);
  }

  async function handleSendFriendRequest(receiverId: number) {
    setActionMessage("");

    try {
      await apiRequest<Friendship>("/friendships", {
        method: "POST",
        body: JSON.stringify({
          friendship: {
            receiver_id: receiverId,
          },
        }),
      });

      setActionMessage("Freundschaftsanfrage gesendet.");
      setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
      setSearchQuery("");
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Freundschaftsanfrage konnte nicht gesendet werden"
      );
    }
  }

  async function handleRespondToRequest(
    friendshipId: number,
    friendshipStatus: "accepted" | "rejected"
  ) {
    setActionMessage("");

    try {
      const updatedFriendship = await apiRequest<Friendship>(`/friendships/${friendshipId}`, {
        method: "PATCH",
        body: JSON.stringify({
          friendship: {
            friendship_status: friendshipStatus,
          },
        }),
      });

      setReceivedRequests((prev) => prev.filter((request) => request.id !== friendshipId));

      if (friendshipStatus === "accepted") {
        addFriendIfMissing(updatedFriendship.requester);
        setActionMessage("Freundschaftsanfrage angenommen.");
      } else {
        setActionMessage("Freundschaftsanfrage abgelehnt.");
      }
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Aktion konnte nicht ausgeführt werden"
      );
    }
  }

  function handleOpenRecentChat(chatId: number) {
    navigate(`/chats/${chatId}`);
  }

  async function handleOpenFriendChat(friendId: number) {
    try {
      const chat = await apiRequest<ChatSummary>(`/chats/direct_with/${friendId}`, {
        method: "GET",
      });

      setAllChats((prev) => {
        const exists = prev.some((existingChat) => existingChat.id === chat.id);
        if (exists) {
          return prev.map((existingChat) => (existingChat.id === chat.id ? chat : existingChat));
        }

        return [chat, ...prev];
      });

      navigate(`/chats/${chat.id}`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Direktchat konnte nicht geöffnet werden"
      );
    }
  }

  async function handleCreateGroupChat() {
    setActionMessage("");

    const trimmedTitle = groupTitle.trim();

    if (!trimmedTitle) {
      setActionMessage("Bitte gib einen Gruppennamen ein.");
      return;
    }

    if (selectedFriendIds.length === 0) {
      setActionMessage("Bitte wähle mindestens einen Freund aus.");
      return;
    }

    setCreatingGroupChat(true);

    try {
      const formData = new FormData();
      formData.append("chat[chat_type]", "group_chat");
      formData.append("chat[title]", trimmedTitle);

      selectedFriendIds.forEach((friendId) => {
        formData.append("chat[user_ids][]", String(friendId));
      });

      if (groupAvatar) {
        formData.append("chat[avatar]", groupAvatar);
      }

      const chat = await apiRequest<ChatSummary>("/chats", {
        method: "POST",
        body: formData,
      });

      setActionMessage("Gruppenchat wurde erstellt.");
      resetGroupChatForm();

      setRecentChats((prev) => [
        {
          id: chat.id,
          chat_type: chat.chat_type,
          title: chat.title,
          avatar_url: chat.avatar_url,
          display_name: chat.title,
          last_message: null,
          users: chat.users,
        },
        ...prev.filter((existingChat) => existingChat.id !== chat.id),
      ]);

      setAllChats((prev) => [chat, ...prev.filter((existingChat) => existingChat.id !== chat.id)]);

      navigate(`/chats/${chat.id}`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Gruppenchat konnte nicht erstellt werden"
      );
    } finally {
      setCreatingGroupChat(false);
    }
  }

  return (
    <div className={s.wrapper}>
      <ContactsHeader user={user} onLogout={() => void signOut()} />

      <div className={s.topActions}>
        <button
          type="button"
          className={s.groupChatButton}
          onClick={() => {
            setActionMessage("");
            setShowCreateGroupChat((prev) => !prev);
          }}
        >
          {showCreateGroupChat ? "Abbrechen" : "Gruppenchat erstellen"}
        </button>

        <Link to="/profile" className={s.profileLink}>
          Mein Profil
        </Link>
      </div>

      {actionMessage && <p className={s.actionMessage}>{actionMessage}</p>}

      {showCreateGroupChat && (
        <section className={s.groupChatForm}>
          <h2>Neuen Gruppenchat erstellen</h2>

          <div className={s.groupAvatarBox}>
            <UserAvatar
              src={groupAvatarPreviewUrl}
              alt="Gruppenavatar Vorschau"
              className={s.groupAvatarPreview}
            />
          </div>

          <div className={s.formGroup}>
            <label htmlFor="groupAvatar">Gruppenavatar</label>
            <input
              id="groupAvatar"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setGroupAvatar(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className={s.formGroup}>
            <label htmlFor="groupTitle">Name des Gruppenchats</label>
            <input
              id="groupTitle"
              type="text"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              placeholder="z. B. Familie, Uni, Projektteam"
              maxLength={100}
            />
          </div>

          <div className={s.formGroup}>
            <label htmlFor="groupFriendSearch">Freunde suchen</label>
            <input
              id="groupFriendSearch"
              type="text"
              value={groupFriendSearch}
              onChange={(e) => setGroupFriendSearch(e.target.value)}
              placeholder="Nach Username suchen"
            />
          </div>

          <div className={s.selectedInfo}>Ausgewählte Freunde: {selectedFriendIds.length}</div>

          <div className={s.friendSelectionList}>
            {loadingFriends ? (
              <p>Freunde werden geladen...</p>
            ) : friendsError ? (
              <p>{friendsError}</p>
            ) : filteredFriends.length === 0 ? (
              <p>Keine passenden Freunde gefunden.</p>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedFriendIds.includes(friend.id);

                return (
                  <button
                    key={friend.id}
                    type="button"
                    className={`${s.friendSelectItem} ${isSelected ? s.friendSelected : ""}`}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <span className={s.friendSelectLeft}>
                      <UserAvatar
                        src={friend.avatar_url}
                        alt={friend.username}
                        className={s.friendSelectAvatar}
                      />
                      <span className={s.friendSelectName}>{friend.username}</span>
                    </span>

                    <span className={s.friendSelectAction}>
                      {isSelected ? "Ausgewählt" : "Hinzufügen"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className={s.groupChatActions}>
            <button
              type="button"
              className={s.cancelGroupChatButton}
              onClick={resetGroupChatForm}
              disabled={creatingGroupChat}
            >
              Abbrechen
            </button>

            <button
              type="button"
              className={s.createGroupChatSubmit}
              onClick={handleCreateGroupChat}
              disabled={creatingGroupChat}
            >
              {creatingGroupChat ? "Erstelle..." : "Gruppenchat erstellen"}
            </button>
          </div>
        </section>
      )}

      <div className={s.sections}>
        <UserSearchSection
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          loadingSearch={loadingSearch}
          searchError={searchError}
          onSendFriendRequest={handleSendFriendRequest}
        />

        <ReceivedRequestsSection
          receivedRequests={receivedRequests}
          loadingRequests={loadingRequests}
          requestsError={requestsError}
          onRespond={handleRespondToRequest}
        />

        <RecentChatsSection
          title="Letzte Chats"
          chats={recentChats}
          loadingChats={loadingRecentChats}
          chatsError={recentChatsError}
          onOpenChat={handleOpenRecentChat}
          currentUserId={user?.id}
          emptyMessage="Noch keine Chats vorhanden."
          showTypeLabel
        />

        <RecentChatsSection
          title="Direktchats"
          chats={directChats}
          loadingChats={loadingAllChats}
          chatsError={allChatsError}
          onOpenChat={handleOpenRecentChat}
          currentUserId={user?.id}
          emptyMessage="Noch keine Direktchats vorhanden."
        />

        <RecentChatsSection
          title="Gruppenchats"
          chats={groupChats}
          loadingChats={loadingAllChats}
          chatsError={allChatsError}
          onOpenChat={handleOpenRecentChat}
          currentUserId={user?.id}
          emptyMessage="Noch keine Gruppenchats vorhanden."
        />

        <FriendsSection
          friends={friends}
          loadingFriends={loadingFriends}
          friendsError={friendsError}
          onOpenFriendChat={handleOpenFriendChat}
        />
      </div>
    </div>
  );
}
