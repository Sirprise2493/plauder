import type {
  Message,
  MessageAttachment,
  PendingAttachment,
  PendingAttachmentKind,
} from "./types";

export function areMessagesEqual(currentMessages: Message[], nextMessages: Message[]) {
  if (currentMessages.length !== nextMessages.length) return false;

  for (let i = 0; i < currentMessages.length; i += 1) {
    const currentMessage = currentMessages[i];
    const nextMessage = nextMessages[i];

    if (
      currentMessage.id !== nextMessage.id ||
      currentMessage.updated_at !== nextMessage.updated_at ||
      currentMessage.content !== nextMessage.content ||
      currentMessage.message_type !== nextMessage.message_type ||
      currentMessage.message_attachments.length !== nextMessage.message_attachments.length
    ) {
      return false;
    }

    const currentCorrection = currentMessage.message_ai_correction;
    const nextCorrection = nextMessage.message_ai_correction;

    if (
      currentCorrection?.id !== nextCorrection?.id ||
      currentCorrection?.updated_at !== nextCorrection?.updated_at ||
      currentCorrection?.message_corrected_by_ai !== nextCorrection?.message_corrected_by_ai
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

export function getAttachmentKind(file: File): PendingAttachmentKind {
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

export function createPendingAttachment(file: File): PendingAttachment {
  const kind = getAttachmentKind(file);
  const previewUrl = kind === "image" || kind === "video" ? URL.createObjectURL(file) : null;

  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    previewUrl,
    kind,
  };
}

export function formatBytes(bytes: number | null) {
  if (!bytes || bytes < 0) return "";

  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export function isImageAttachment(attachment: MessageAttachment) {
  return (
    attachment.file_type === "image" ||
    attachment.content_type?.startsWith("image/") === true
  );
}

export function isVideoAttachment(attachment: MessageAttachment) {
  return (
    attachment.file_type === "video" ||
    attachment.content_type?.startsWith("video/") === true
  );
}

export function isAudioAttachment(attachment: MessageAttachment) {
  return (
    attachment.file_type === "audio" ||
    attachment.content_type?.startsWith("audio/") === true
  );
}

export function resolveMessageType(
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
