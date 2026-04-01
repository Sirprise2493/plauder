export type UserStatus = "online" | "offline";

export type User = {
  id: number;
  username: string;
  email: string;
  status: UserStatus;
  avatar_url: string | null;
};

export type Chat = {
  id: number;
  chat_type: "direct" | "group_chat";
  title: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  users: User[];
};

export type ChatMembership = {
  id: number;
  chat_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: User;
};

export type MessageAttachment = {
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

export type MessageAiCorrection = {
  id: number;
  message_id: number;
  message_corrected_by_ai: string;
  ai_type: "spelling" | "grammar" | "rewrite" | "translation" | "safety_rephrase";
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: number;
  content: string | null;
  message_type: "text" | "image" | "video" | "audio" | "file" | "system";
  created_at: string;
  updated_at: string;
  draft?: boolean;
  sender: User;
  message_ai_correction?: MessageAiCorrection | null;
  message_attachments: MessageAttachment[];
};
export type PendingAttachmentKind = "image" | "video" | "audio" | "document" | "other";

export type PendingAttachment = {
  id: string;
  file: File;
  previewUrl: string | null;
  kind: PendingAttachmentKind;
};
