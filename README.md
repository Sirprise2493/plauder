# Social Media / Chat App (WhatsApp-like) – Schema (ERD)

Dieses Repo enthält das **Datenbank-Schema** (grafisch als ERD) für eine Chat-App mit:
- 1:1 Chats & Gruppen
- Nachrichten + Read/Delivery
- Dateien/Medien (Audio/Video/File)
- KI-Features (Spellcheck, Transkription, Moderation)
- Audio/Video Calls

---

## ERD (Mermaid)

> Hinweis: GitHub rendert Mermaid direkt in Markdown. Falls du nur Code siehst,
> prüfe ob Mermaid in deiner GitHub-Org/Repo erlaubt ist.

```mermaid
erDiagram
  users {
    uuid id PK
    text username
    text email
    text password_digest
    text role
    text public_key
    timestamptz created_at
    timestamptz updated_at
  }

  friendships {
    uuid id PK
    uuid user_id FK
    uuid friend_id FK
    text status
    timestamptz created_at
    timestamptz updated_at
  }

  devices {
    uuid id PK
    uuid user_id FK
    text platform
    text push_token
    timestamptz last_seen_at
    timestamptz created_at
    timestamptz updated_at
  }

  conversations {
    uuid id PK
    text kind
    text title
    uuid created_by_id FK
    timestamptz created_at
    timestamptz updated_at
  }

  conversation_memberships {
    uuid id PK
    uuid conversation_id FK
    uuid user_id FK
    text role
    timestamptz joined_at
    timestamptz left_at
    uuid last_read_message_id FK
  }

  direct_conversations {
    uuid conversation_id PK_FK
    uuid user_low_id FK
    uuid user_high_id FK
  }

  messages {
    uuid id PK
    uuid conversation_id FK
    uuid sender_id FK
    uuid client_message_id
    text message_type
    bytea encrypted_payload
    jsonb metadata
    uuid reply_to_message_id FK
    timestamptz sent_at
    timestamptz edited_at
    timestamptz deleted_at
  }

  message_receipts {
    uuid id PK
    uuid message_id FK
    uuid user_id FK
    text status
    timestamptz delivered_at
    timestamptz read_at
  }

  message_reactions {
    uuid id PK
    uuid message_id FK
    uuid user_id FK
    text emoji
    timestamptz created_at
  }

  message_media {
    uuid id PK
    uuid message_id FK
    text kind
    int duration_ms
    text mime_type
    bigint size_bytes
    jsonb extra
  }

  spellcheck_runs {
    uuid id PK
    uuid message_id FK
    text model_version
    text input_hash
    jsonb suggestions
    boolean accepted
  }

  transcriptions {
    uuid id PK
    uuid message_id FK
    text provider
    text status
    text language
    text text
    numeric confidence
  }

  moderation_checks {
    uuid id PK
    uuid message_id FK
    text provider
    text status
    numeric score
    jsonb categories
    boolean flagged
  }

  moderation_incidents {
    uuid id PK
    uuid user_id FK
    uuid message_id FK
    text severity
    text state
    uuid opened_by_id FK
    text notes
  }

  calls {
    uuid id PK
    uuid conversation_id FK
    text call_type
    uuid started_by_id FK
    text status
    timestamptz started_at
    timestamptz ended_at
    text provider_room_id
  }

  call_participants {
    uuid id PK
    uuid call_id FK
    uuid user_id FK
    uuid device_id FK
    timestamptz joined_at
    timestamptz left_at
    text role
  }

  users ||--o{ devices : has
  users ||--o{ friendships : user
  users ||--o{ friendships : friend

  users ||--o{ conversation_memberships : member
  conversations ||--o{ conversation_memberships : has

  conversations ||--o{ messages : contains
  users ||--o{ messages : sends
  messages ||--o{ messages : replies_to

  messages ||--o{ message_receipts : receipts
  users ||--o{ message_receipts : sees

  messages ||--o{ message_reactions : reactions
  users ||--o{ message_reactions : reacts

  messages ||--o{ message_media : has_media

  messages ||--o| transcriptions : transcription
  messages ||--o{ spellcheck_runs : spellcheck
  messages ||--o{ moderation_checks : moderation

  users ||--o{ moderation_incidents : involved
  users ||--o{ moderation_incidents : opened_by
  messages ||--o{ moderation_incidents : reference

  conversations ||--o{ calls : call_in
  calls ||--o{ call_participants : participants
  users ||--o{ call_participants : joins
  devices ||--o{ call_participants : via_device

  conversations ||--o| direct_conversations : direct_meta
  users ||--o{ direct_conversations : user_low
  users ||--o{ direct_conversations : user_high
