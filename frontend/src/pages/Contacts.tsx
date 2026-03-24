import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../services/api";
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
  created_at: string;
  updated_at: string;
  users: User[];
};

export default function Contacts() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [friends, setFriends] = useState<User[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [friendsError, setFriendsError] = useState("");
  const [chatsError, setChatsError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

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

      setLoadingChats(true);
      setChatsError("");

      try {
        const chats = await apiRequest<RecentChat[]>("/chats/recent", {
          method: "GET",
        });

        setRecentChats(chats);
      } catch (err) {
        setChatsError(
          err instanceof Error ? err.message : "Chats konnten nicht geladen werden"
        );
      } finally {
        setLoadingChats(false);
      }
    }

    void loadRecentChats();
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

  function addFriendIfMissing(friendToAdd: User) {
    setFriends((prev) => {
      if (prev.some((friend) => friend.id === friendToAdd.id)) return prev;
      return [friendToAdd, ...prev];
    });
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

      navigate(`/chats/${chat.id}`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Direktchat konnte nicht geöffnet werden"
      );
    }
  }

  return (
    <div className={s.wrapper}>
      <ContactsHeader user={user} onLogout={() => void signOut()} />

      <div className={s.topActions}>
        <Link to="/profile" className={s.profileLink}>
          Mein Profil
        </Link>
      </div>

      {actionMessage && <p className={s.actionMessage}>{actionMessage}</p>}

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
          recentChats={recentChats}
          loadingChats={loadingChats}
          chatsError={chatsError}
          onOpenChat={handleOpenRecentChat}
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
