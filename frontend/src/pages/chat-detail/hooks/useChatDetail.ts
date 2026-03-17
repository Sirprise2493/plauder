import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  DragEvent,
} from "react";
import { apiRequest } from "../../../services/api";
import {
  areMessagesEqual,
  createPendingAttachment,
  resolveMessageType,
} from "../utils";
import type {
  Chat,
  Message,
  MessageAiCorrection,
  MessageAttachment,
  PendingAttachment,
} from "../types";

type UseChatDetailParams = {
  chatId?: string;
  currentUserId?: number;
};

export function useChatDetail({
  chatId,
  currentUserId,
}: UseChatDetailParams) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [activeImageName, setActiveImageName] = useState("");

  const [draftMessageId, setDraftMessageId] = useState<number | null>(null);
  const [originalDraftText, setOriginalDraftText] = useState<string | null>(null);
  const [aiCorrectedText, setAiCorrectedText] = useState<string | null>(null);
  const [isShowingAiCorrection, setIsShowingAiCorrection] = useState(false);
  const [improvingText, setImprovingText] = useState(false);

  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadChat() {
      if (!chatId) return;

      setLoadingChat(true);
      setError("");

      try {
        const data = await apiRequest<Chat>(`/chats/${chatId}`, {
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
  }, [chatId]);

  const loadMessages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!chatId) return;

      const isSilent = options?.silent ?? false;

      if (!isSilent) {
        setLoadingMessages(true);
        setError("");
      }

      try {
        const data = await apiRequest<Message[]>(`/chats/${chatId}/messages`, {
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
    [chatId]
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!chatId) return;

    const intervalId = window.setInterval(() => {
      void loadMessages({ silent: true });
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [chatId, loadMessages]);

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

    const otherUser = chat.users.find((member) => member.id !== currentUserId);
    return otherUser?.username || "Direktchat";
  }, [chat, currentUserId]);

  async function deleteDraftMessage(messageId: number) {
    await apiRequest(`/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async function updateDraftMessage(messageId: number, content: string) {
    const updated = await apiRequest<Message>(`/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({
        message: {
          content,
          draft: true,
        },
      }),
    });

    return updated;
  }

  async function addFiles(files: FileList | File[]) {
    const nextAttachments = Array.from(files).map(createPendingAttachment);

    if (draftMessageId) {
      try {
        await deleteDraftMessage(draftMessageId);
      } catch {
        // Draft-Cleanup soll das Hinzufügen von Dateien nicht blockieren
      }
    }

    setPendingAttachments((prev) => [...prev, ...nextAttachments]);
    setIsDragActive(false);

    setDraftMessageId(null);
    setOriginalDraftText(null);
    setAiCorrectedText(null);
    setIsShowingAiCorrection(false);
    setNewMessage("");
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) return;

    void addFiles(event.target.files);
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

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragActive(false);

    if (event.dataTransfer.files.length === 0) return;
    void addFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLFormElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDragActive(false);
  }

  function handleMessageChange(value: string) {
    setNewMessage(value);

    if (isShowingAiCorrection || aiCorrectedText || originalDraftText) {
      setAiCorrectedText(null);
      setOriginalDraftText(null);
      setIsShowingAiCorrection(false);
    }
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

  async function ensureDraftMessage(currentText: string): Promise<Message> {
    if (!chatId) {
      throw new Error("Keine Chat-ID vorhanden");
    }

    if (draftMessageId) {
      const updated = await apiRequest<Message>(`/messages/${draftMessageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          message: {
            content: currentText,
            draft: true,
          },
        }),
      });

      return updated;
    }

    const created = await apiRequest<Message>(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: {
          message_type: "text",
          content: currentText,
          draft: true,
        },
      }),
    });

    setDraftMessageId(created.id);
    return created;
  }

  async function handleAiCorrection() {
    const trimmed = newMessage.trim();

    if (!trimmed || sendingMessage || improvingText || pendingAttachments.length > 0) {
      return;
    }

    if (aiCorrectedText && originalDraftText && draftMessageId) {
      setImprovingText(true);
      setSendError("");

      try {
        if (isShowingAiCorrection) {
          await updateDraftMessage(draftMessageId, originalDraftText);
          setNewMessage(originalDraftText);
          setIsShowingAiCorrection(false);
        } else {
          await updateDraftMessage(draftMessageId, aiCorrectedText);
          setNewMessage(aiCorrectedText);
          setIsShowingAiCorrection(true);
        }
      } catch (err) {
        setSendError(
          err instanceof Error ? err.message : "Draft konnte nicht aktualisiert werden"
        );
      } finally {
        setImprovingText(false);
      }

      return;
    }

    setImprovingText(true);
    setSendError("");

    try {
      const draftMessage = await ensureDraftMessage(trimmed);

      const correction = await apiRequest<MessageAiCorrection>(
        `/messages/${draftMessage.id}/message_ai_correction`,
        {
          method: "POST",
          body: JSON.stringify({
            message_ai_correction: {},
          }),
        }
      );

      await updateDraftMessage(draftMessage.id, correction.message_corrected_by_ai);

      setDraftMessageId(draftMessage.id);
      setOriginalDraftText(trimmed);
      setAiCorrectedText(correction.message_corrected_by_ai);
      setNewMessage(correction.message_corrected_by_ai);
      setIsShowingAiCorrection(true);
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "AI-Korrektur konnte nicht erstellt werden"
      );
    } finally {
      setImprovingText(false);
    }
  }

  async function handleSendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!chatId || sendingMessage) return;

    const trimmedMessage = newMessage.trim();
    const hasText = trimmedMessage.length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasText && !hasAttachments) return;

    setSendingMessage(true);
    setSendError("");

    try {
      const outgoingMessageType = resolveMessageType(hasText, pendingAttachments);

      let targetMessage: Message;

      if (draftMessageId && outgoingMessageType === "text" && pendingAttachments.length === 0) {
        targetMessage = await apiRequest<Message>(`/messages/${draftMessageId}`, {
          method: "PATCH",
          body: JSON.stringify({
            message: {
              content: trimmedMessage,
              draft: false,
            },
          }),
        });
      } else {
        targetMessage = await apiRequest<Message>(`/chats/${chatId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            message: {
              message_type: outgoingMessageType,
              content: hasText ? trimmedMessage : null,
              draft: false,
            },
          }),
        });
      }

      if (pendingAttachments.length > 0) {
        for (const attachment of pendingAttachments) {
          await uploadAttachment(targetMessage.id, attachment);
        }
      }

      pendingAttachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });

      setPendingAttachments([]);
      setNewMessage("");
      setDraftMessageId(null);
      setOriginalDraftText(null);
      setAiCorrectedText(null);
      setIsShowingAiCorrection(false);

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
    } catch (downloadError) {
      setSendError(
        downloadError instanceof Error
          ? downloadError.message
          : "Datei konnte nicht heruntergeladen werden"
      );
    }
  }

  return {
    chat,
    messages,
    newMessage,
    pendingAttachments,
    isDragActive,
    activeImageUrl,
    activeImageName,
    draftMessageId,
    originalDraftText,
    aiCorrectedText,
    isShowingAiCorrection,
    improvingText,
    loadingChat,
    loadingMessages,
    sendingMessage,
    error,
    sendError,
    messagesEndRef,
    fileInputRef,
    chatDisplayTitle,
    setActiveImageUrl,
    setActiveImageName,
    handleFileInputChange,
    handleRemovePendingAttachment,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleMessageChange,
    handleAiCorrection,
    handleSendMessage,
    handleMessageKeyDown,
    handleDownloadAttachment,
  };
}
