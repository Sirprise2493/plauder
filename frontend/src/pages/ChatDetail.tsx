import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../hooks/useAuth";
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

type MessageAttachment = {
  id: number;
  message_id: number;
  filename: string;
  file_type: "image" | "video" | "audio" | "document" | "other";
  durations_ms: number | null;
  byte_size: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
  file_url: string | null;
  download_url: string | null;
  content_type: string | null;
};

type Message = {
  id: number;
  content: string | null;
  message_type: "text" | "image" | "video" | "audio" | "file" | "system";
  created_at: string;
  updated_at: string;
  sender: User;
  message_attachments: MessageAttachment[];
};

type PendingAttachmentKind = "image" | "video" | "audio" | "document" | "other";

type PendingAttachment = {
  id: string;
  file: File;
  previewUrl: string | null;
  kind: PendingAttachmentKind;
};

function areMessagesEqual(currentMessages: Message[], nextMessages: Message[]) {
  if (currentMessages.length !== nextMessages.length) return false;

  for (let i = 0; i < currentMessages.length; i += 1) {
    const currentMessage = currentMessages[i];
    const nextMessage = nextMessages[i];

    if (
      currentMessage.id !== nextMessage.id ||
      currentMessage.updated_at !== nextMessage.updated_at ||
      currentMessage.message_attachments.length !== nextMessage.message_attachments.length
    ) {
      return false;
    }

    for (let j = 0; j < currentMessage.message_attachments.length; j += 1) {
      const currentAttachment = currentMessage.message_attachments[j];
      const nextAttachment = nextMessage.message_attachments[j];

      if (
        currentAttachment.id !== nextAttachment.id ||
        currentAttachment.updated_at !== nextAttachment.updated_at ||
        currentAttachment.file_url !== nextAttachment.file_url
      ) {
        return false;
      }
    }
  }

  return true;
}

  function resolveMessageType(
    hasText: boolean,
    attachments: PendingAttachment[]
  ): Message["message_type"] {
    if (hasText) return "text";
    if (attachments.length === 0) return "text";

    const uniqueKinds = Array.from(new Set(attachments.map((attachment) => attachment.kind)));

    if (uniqueKinds.length !== 1) return "file";

    switch (uniqueKinds[0]) {
      case "image":
        return "image";
      case "video":
        return "video";
      case "audio":
        return "audio";
      default:
        return "file";
    }
  }

function getAttachmentKind(file: File): PendingAttachmentKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";

  const loweredName = file.name.toLowerCase();
  const documentExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".rtf",
    ".zip",
    ".csv",
  ];

  if (documentExtensions.some((extension) => loweredName.endsWith(extension))) {
    return "document";
  }

  return "other";
}

function createPendingAttachment(file: File): PendingAttachment {
  const kind = getAttachmentKind(file);
  const previewUrl = kind === "image" || kind === "video" ? URL.createObjectURL(file) : null;

  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    previewUrl,
    kind,
  };
}

function formatBytes(bytes: number | null) {
  if (!bytes || bytes < 0) return "";

  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}


function isImageAttachment(attachment: MessageAttachment) {
  return (
    attachment.file_type === "image" ||
    attachment.content_type?.startsWith("image/") === true
  );
}

function isVideoAttachment(attachment: MessageAttachment) {
  return (
    attachment.file_type === "video" ||
    attachment.content_type?.startsWith("video/") === true
  );
}

function isAudioAttachment(attachment: MessageAttachment) {
  return (
    attachment.file_type === "audio" ||
    attachment.content_type?.startsWith("audio/") === true
  );
}



export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [activeImageName, setActiveImageName] = useState<string>("");

  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadChat() {
      if (!id) return;

      setLoadingChat(true);
      setError("");

      try {
        const data = await apiRequest<Chat>(`/chats/${id}`, {
          method: "GET",
        });

        setChat(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat konnte nicht geladen werden");
      } finally {
        setLoadingChat(false);
      }
    }

    void loadChat();
  }, [id]);

  const loadMessages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!id) return;

      const isSilent = options?.silent ?? false;

      if (!isSilent) {
        setLoadingMessages(true);
        setError("");
      }

      try {
        const data = await apiRequest<Message[]>(`/chats/${id}/messages`, {
          method: "GET",
        });

        setMessages((prev) => (areMessagesEqual(prev, data) ? prev : data));
      } catch (err) {
        if (!isSilent) {
          setError(
            err instanceof Error ? err.message : "Nachrichten konnten nicht geladen werden"
          );
        }
      } finally {
        if (!isSilent) {
          setLoadingMessages(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!id) return;

    const intervalId = window.setInterval(() => {
      void loadMessages({ silent: true });
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [id, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      pendingAttachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [pendingAttachments]);

  const chatDisplayTitle = useMemo(() => {
    if (!chat) return "Chat";

    if (chat.chat_type === "group_chat") {
      return chat.title || "Gruppenchat";
    }

    const otherUser = chat.users.find((member) => member.id !== currentUser?.id);
    return otherUser?.username || "Direktchat";
  }, [chat, currentUser?.id]);

  function addFiles(files: FileList | File[]) {
    const nextAttachments = Array.from(files).map(createPendingAttachment);

    setPendingAttachments((prev) => [...prev, ...nextAttachments]);
    setIsDragActive(false);
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) return;

    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleRemovePendingAttachment(attachmentId: string) {
    setPendingAttachments((prev) => {
      const attachmentToRemove = prev.find((item) => item.id === attachmentId);

      if (attachmentToRemove?.previewUrl) {
        URL.revokeObjectURL(attachmentToRemove.previewUrl);
      }

      return prev.filter((item) => item.id !== attachmentId);
    });
  }

  function handleDrop(event: React.DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragActive(false);

    if (event.dataTransfer.files.length === 0) return;
    addFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: React.DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLFormElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDragActive(false);
  }

  async function uploadAttachment(messageId: number, attachment: PendingAttachment) {
    const formData = new FormData();

    formData.append("message_attachment[file]", attachment.file);
    formData.append("message_attachment[filename]", attachment.file.name);
    formData.append("message_attachment[file_type]", attachment.kind);
    formData.append("message_attachment[byte_size]", String(attachment.file.size));

    await apiRequest<MessageAttachment>(`/messages/${messageId}/message_attachments`, {
      method: "POST",
      body: formData,
    });
  }

  async function handleSendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!id || sendingMessage) return;

    const trimmedMessage = newMessage.trim();
    const hasText = trimmedMessage.length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasText && !hasAttachments) return;

    setSendingMessage(true);
    setSendError("");

    try {
      const outgoingMessageType = resolveMessageType(hasText, pendingAttachments);

      const createdMessage = await apiRequest<Message>(`/chats/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: {
            message_type: outgoingMessageType,
            content: hasText ? trimmedMessage : null,
          },
        }),
      });

      if (pendingAttachments.length > 0) {
        for (const attachment of pendingAttachments) {
          await uploadAttachment(createdMessage.id, attachment);
        }
      }

      pendingAttachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });

      setPendingAttachments([]);
      setNewMessage("");

      await loadMessages({ silent: true });
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Nachricht konnte nicht gesendet werden"
      );
    } finally {
      setSendingMessage(false);
    }
  }

  function handleMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    event.preventDefault();

    const hasText = newMessage.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if ((!hasText && !hasAttachments) || sendingMessage) return;

    void handleSendMessage();
  }

  async function handleDownloadAttachment(attachment: MessageAttachment) {
    const downloadUrl = attachment.download_url;

    console.log("download attachment", attachment);
    console.log("download url", downloadUrl);

    if (!downloadUrl) {
      setSendError("Kein Download-Link für diese Datei vorhanden.");
      return;
    }

    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Download fehlgeschlagen: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download fehlgeschlagen:", error);
      setSendError(
        error instanceof Error
          ? error.message
          : "Datei konnte nicht heruntergeladen werden"
      );
    }
  }

  return (
    <div className={s.wrapper}>
      <div className={s.topBar}>
        <Link to="/contacts" className={s.backLink}>
          ← Zurück zu Kontakte
        </Link>
      </div>

      {(loadingChat || loadingMessages) && <p className={s.message}>Lade Chat...</p>}
      {error && <p className={s.error}>{error}</p>}

      {!loadingChat && !error && chat && (
        <div className={s.chatLayout}>
          <header className={s.chatHeader}>
            <div>
              <h1 className={s.chatTitle}>{chatDisplayTitle}</h1>
              <p className={s.chatSubtitle}>
                {chat.chat_type === "group_chat"
                  ? `${chat.users.length} Mitglieder`
                  : "Direktchat"}
              </p>
            </div>
          </header>

          <section className={s.participantsCard}>
            <h2 className={s.participantsTitle}>Teilnehmer</h2>

            <ul className={s.participantsList}>
              {chat.users.map((member) => {
                const isMe = member.id === currentUser?.id;

                return (
                  <li key={member.id} className={s.participantItem}>
                    <div className={s.participantLeft}>
                      <span className={s.participantName}>
                        {member.username} {isMe ? "(du)" : ""}
                      </span>
                      <span className={s.participantEmail}>{member.email}</span>
                    </div>

                    <span
                      className={`${s.participantStatus} ${
                        member.status === "online" ? s.statusOnline : s.statusOffline
                      }`}
                      title={member.status}
                    />
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={s.messagesSection}>
            {loadingMessages ? (
              <p className={s.message}>Lade Nachrichten...</p>
            ) : messages.length === 0 ? (
              <p className={s.emptyState}>Noch keine Nachrichten vorhanden.</p>
            ) : (
              <ul className={s.messageList}>
                {messages.map((message) => {
                  const isOwnMessage = message.sender.id === currentUser?.id;

                  return (
                    <li
                      key={message.id}
                      className={`${s.messageRow} ${isOwnMessage ? s.ownRow : s.otherRow}`}
                    >
                      <div
                        className={`${s.messageBubble} ${
                          isOwnMessage ? s.ownBubble : s.otherBubble
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className={s.messageSender}>{message.sender.username}</p>
                        )}

                        {message.content && <p className={s.messageContent}>{message.content}</p>}

                        {message.message_attachments.length > 0 && (
                          <div className={s.attachmentList}>
                            {message.message_attachments.map((attachment) => {
                              if (!attachment.file_url) return null;

                              if (isImageAttachment(attachment)) {
                                return (
                                  <div key={attachment.id} className={s.attachmentItem}>
                                    <button
                                      type="button"
                                      className={s.imageButton}
                                      onClick={() => {
                                        setActiveImageUrl(attachment.file_url);
                                        setActiveImageName(attachment.filename);
                                      }}
                                    >
                                      <img
                                        src={attachment.file_url}
                                        alt={attachment.filename}
                                        className={s.attachmentImage}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      className={s.downloadButton}
                                      onClick={() => handleDownloadAttachment(attachment)}
                                    >
                                      Bild herunterladen
                                    </button>
                                  </div>
                                );
                              }

                              if (isVideoAttachment(attachment)) {
                                return (
                                  <div key={attachment.id} className={s.attachmentItem}>
                                    <video controls preload="metadata" className={s.attachmentVideo}>
                                      <source
                                        src={attachment.file_url}
                                        type={attachment.content_type || "video/mp4"}
                                      />
                                      Dein Browser unterstützt Video nicht.
                                    </video>

                                    <button
                                      type="button"
                                      className={s.downloadButton}
                                      onClick={() => handleDownloadAttachment(attachment)}
                                    >
                                      Video herunterladen
                                    </button>
                                  </div>
                                );
                              }

                              if (isAudioAttachment(attachment)) {
                                return (
                                  <div key={attachment.id} className={s.attachmentItem}>
                                    <audio controls preload="metadata" className={s.attachmentAudio}>
                                      <source
                                        src={attachment.file_url}
                                        type={attachment.content_type || "audio/mpeg"}
                                      />
                                      Dein Browser unterstützt Audio nicht.
                                    </audio>

                                    <button
                                      type="button"
                                      className={s.downloadButton}
                                      onClick={() => handleDownloadAttachment(attachment)}
                                    >
                                      Audio herunterladen
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div key={attachment.id} className={s.fileAttachment}>
                                  <div>
                                    <p className={s.fileName}>{attachment.filename}</p>
                                    <p className={s.fileMeta}>{formatBytes(attachment.byte_size)}</p>
                                  </div>

                                  <button
                                    type="button"
                                    className={s.downloadButton}
                                    onClick={() => handleDownloadAttachment(attachment)}
                                  >
                                    Datei herunterladen
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <p className={s.messageMeta}>
                          {new Date(message.created_at).toLocaleString("de-DE")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div ref={messagesEndRef} />
          </section>

          <form
            className={`${s.messageForm} ${isDragActive ? s.dragActive : ""}`}
            onSubmit={handleSendMessage}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className={s.composerTopRow}>
              <button
                type="button"
                className={s.attachButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={sendingMessage}
              >
                Datei hinzufügen
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className={s.hiddenFileInput}
                onChange={handleFileInputChange}
              />
            </div>

            {pendingAttachments.length > 0 && (
              <div className={s.pendingAttachments}>
                {pendingAttachments.map((attachment) => (
                  <div key={attachment.id} className={s.pendingAttachmentCard}>
                    {attachment.kind === "image" && attachment.previewUrl && (
                      <img
                        src={attachment.previewUrl}
                        alt={attachment.file.name}
                        className={s.pendingPreviewImage}
                      />
                    )}

                    {attachment.kind === "video" && attachment.previewUrl && (
                      <video
                        className={s.pendingPreviewVideo}
                        src={attachment.previewUrl}
                        muted
                      />
                    )}

                    <div className={s.pendingAttachmentInfo}>
                      <p className={s.pendingAttachmentName}>{attachment.file.name}</p>
                      <p className={s.pendingAttachmentMeta}>
                        {attachment.kind} · {formatBytes(attachment.file.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={s.removeAttachmentButton}
                      onClick={() => handleRemovePendingAttachment(attachment.id)}
                      disabled={sendingMessage}
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={handleMessageKeyDown}
              placeholder="Nachricht eingeben oder Datei hier hineinziehen..."
              className={s.messageInput}
              maxLength={10000}
              disabled={sendingMessage}
              rows={3}
            />

            <button
              type="submit"
              className={s.sendButton}
              disabled={sendingMessage || (!newMessage.trim() && pendingAttachments.length === 0)}
            >
              {sendingMessage ? "Sende..." : "Senden"}
            </button>
          </form>

          <p className={s.inputHint}>
            Enter = senden, Shift + Enter = Zeilenumbruch, Dateien per Drag & Drop möglich
          </p>

          {sendError && <p className={s.error}>{sendError}</p>}
        </div>
      )}

      {activeImageUrl && (
        <div
          className={s.imageModalOverlay}
          onClick={() => {
            setActiveImageUrl(null);
            setActiveImageName("");
          }}
        >
          <div
            className={s.imageModalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={s.closeModalButton}
              onClick={() => {
                setActiveImageUrl(null);
                setActiveImageName("");
              }}
            >
              ✕
            </button>

            <img src={activeImageUrl} alt={activeImageName} className={s.modalImage} />
            <p className={s.modalImageName}>{activeImageName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
