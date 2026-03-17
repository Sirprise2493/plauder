import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import s from "./CallRoom.module.css";

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

type CallParticipant = {
  id: number;
  call_id: number;
  user_id: number;
  state: "invited" | "ringing" | "joined" | "left" | "declined" | "missed";
  camera_enabled: boolean;
  mic_enabled: boolean;
  created_at: string;
  updated_at: string;
  user: User;
};

type Call = {
  id: number;
  chat_id: number;
  initiator_id: number;
  call_type: "audio" | "video";
  status: "initiated" | "ringing" | "ongoing" | "ended" | "missed" | "cancelled" | "declined";
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  initiator: User;
  call_participants: CallParticipant[];
};

export default function CallRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [endingCall, setEndingCall] = useState(false);
  const [error, setError] = useState("");

  const hasInitializedCall = useRef(false);

  const currentParticipant = useMemo(() => {
    return participants.find((participant) => participant.user_id === currentUser?.id) ?? null;
  }, [participants, currentUser?.id]);

  const otherParticipants = useMemo(() => {
    return participants.filter((participant) => participant.user_id !== currentUser?.id);
  }, [participants, currentUser?.id]);

  const displayTitle = useMemo(() => {
    if (!chat) return "Call";

    if (chat.chat_type === "group_chat") {
      return chat.title || "Gruppen-Call";
    }

    const otherUser = chat.users.find((user) => user.id !== currentUser?.id);
    return otherUser?.username || "Direkt-Call";
  }, [chat, currentUser?.id]);

  useEffect(() => {
    async function initializeCall() {
      if (!id || !currentUser || hasInitializedCall.current) return;

      hasInitializedCall.current = true;
      setLoading(true);
      setError("");

      try {
        const chatData = await apiRequest<Chat>(`/chats/${id}`, {
          method: "GET",
        });
        setChat(chatData);

        const nowIso = new Date().toISOString();

        const createdCall = await apiRequest<Call>(`/chats/${id}/calls`, {
          method: "POST",
          body: JSON.stringify({
            call: {
              call_type: "audio",
              status: "ongoing",
              started_at: nowIso,
            },
          }),
        });

        setCall(createdCall);
        setParticipants(createdCall.call_participants);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Call konnte nicht gestartet werden");
      } finally {
        setLoading(false);
      }
    }

    void initializeCall();
  }, [id, currentUser]);

  async function updateParticipant(
    participantId: number,
    payload: Partial<Pick<CallParticipant, "state" | "camera_enabled" | "mic_enabled">>
  ) {
    if (!call) throw new Error("Kein aktiver Call vorhanden");

    const updated = await apiRequest<CallParticipant>(
      `/calls/${call.id}/call_participants/${participantId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          call_participant: payload,
        }),
      }
    );

    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === updated.id ? updated : participant
      )
    );

    return updated;
  }

  async function updateCall(
    payload: Partial<Pick<Call, "call_type" | "status" | "started_at" | "ended_at">>
  ) {
    if (!call) throw new Error("Kein aktiver Call vorhanden");

    const updated = await apiRequest<Call>(`/calls/${call.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        call: payload,
      }),
    });

    setCall(updated);

    if (updated.call_participants) {
      setParticipants(updated.call_participants);
    }

    return updated;
  }

  async function handleToggleCallType() {
    if (!call || !currentParticipant) return;

    const nextCallType = call.call_type === "audio" ? "video" : "audio";
    const nextCameraEnabled = nextCallType === "video";

    try {
      setError("");
      await updateCall({ call_type: nextCallType });
      await updateParticipant(currentParticipant.id, {
        camera_enabled: nextCameraEnabled,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Call-Typ konnte nicht gewechselt werden");
    }
  }

  async function handleToggleMic() {
    if (!currentParticipant) return;

    try {
      setError("");
      await updateParticipant(currentParticipant.id, {
        mic_enabled: !currentParticipant.mic_enabled,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mikrofon konnte nicht umgeschaltet werden");
    }
  }

  async function handleHangUp() {
    if (!id) {
      navigate("/contacts");
      return;
    }

    if (!call) {
      navigate(`/chats/${id}`);
      return;
    }

    setEndingCall(true);
    setError("");

    try {
      const nowIso = new Date().toISOString();

      if (currentParticipant) {
        await updateParticipant(currentParticipant.id, {
          state: "left",
        });
      }

      await updateCall({
        status: "ended",
        ended_at: nowIso,
      });

      navigate(`/chats/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Call konnte nicht beendet werden");
      setEndingCall(false);
    }
  }

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <div className={s.header}>
          <div>
            <p className={s.eyebrow}>Aktiver Call</p>
            <h1 className={s.title}>{displayTitle}</h1>
            <p className={s.subtitle}>
              {call
                ? `Modus: ${call.call_type === "video" ? "Video" : "Audio"}`
                : "Call wird vorbereitet..."}
            </p>
          </div>
        </div>

        {loading && <p className={s.infoText}>Call wird gestartet...</p>}
        {error && <p className={s.error}>{error}</p>}

        {!loading && chat && (
          <>
            <section className={s.section}>
              <h2 className={s.sectionTitle}>Teilnehmer</h2>

              <ul className={s.participantList}>
                {participants.map((participant) => {
                  const isMe = participant.user_id === currentUser?.id;

                  return (
                    <li key={participant.id} className={s.participantItem}>
                      <div>
                        <p className={s.participantName}>
                          {participant.user.username} {isMe ? "(du)" : ""}
                        </p>
                        <p className={s.participantMeta}>
                          Status: {participant.state} · Mikro: {participant.mic_enabled ? "an" : "aus"} · Kamera:{" "}
                          {participant.camera_enabled ? "an" : "aus"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className={s.section}>
              <h2 className={s.sectionTitle}>Steuerung</h2>

              <div className={s.controls}>
                <button
                  type="button"
                  className={s.secondaryButton}
                  onClick={() => void handleToggleCallType()}
                  disabled={!call || !currentParticipant || endingCall}
                >
                  {call?.call_type === "video" ? "Zu Audio wechseln" : "Zu Video wechseln"}
                </button>

                <button
                  type="button"
                  className={s.secondaryButton}
                  onClick={() => void handleToggleMic()}
                  disabled={!currentParticipant || endingCall}
                >
                  {currentParticipant?.mic_enabled ? "Mikro aus" : "Mikro an"}
                </button>

                <button
                  type="button"
                  className={s.hangupButton}
                  onClick={() => void handleHangUp()}
                  disabled={endingCall}
                >
                  {endingCall ? "Beende..." : "Auflegen"}
                </button>
              </div>
            </section>

            {otherParticipants.length > 0 && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>Andere Teilnehmer</h2>
                <p className={s.infoText}>
                  {otherParticipants.map((participant) => participant.user.username).join(", ")}
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
