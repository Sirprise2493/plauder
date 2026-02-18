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
    string id
    string username
    string email
    string password_digest
    string role
    string public_key
    string created_at
    string updated_at
  }

  friendships {
    string id
    string user_id
    string friend_id
    string status
    string created_at
    string updated_at
  }

  devices {
    string id
    string user_id
    string platform
    string push_token
    string last_seen_at
    string created_at
    string updated_at
  }

  conversations {
    string id
    string kind
    string title
    string created_by_id
    string created_at
    string updated_at
  }

  conversation_memberships {
    string id
    string conversation_id
    string user_id
    string role
    string joined_at
    string left_at
    string last_read_message_id
  }

  direct_conversations {
    string conversation_id
    string user_low_id
    string user_high_id
  }

  messages {
    string id
    string conversation_id
    string sender_id
    string client_message_id
    string message_type
    string encrypted_payload
    string metadata
    string reply_to_message_id
    string sent_at
    string edited_at
    string deleted_at
  }

  message_receipts {
    string id
    string message_id
    string user_id
    string status
    string delivered_at
    string read_at
  }

  message_reactions {
    string id
    string message_id
    string user_id
    string emoji
    string created_at
  }

  message_media {
    string id
    string message_id
    string kind
    int duration_ms
    string mime_type
    int size_bytes
    string extra
  }

  spellcheck_runs {
    string id
    string message_id
    string model_version
    string input_hash
    string suggestions
    string accepted
  }

  transcriptions {
    string id
    string message_id
    string provider
    string status
    string language
    string text
    float confidence
  }

  moderation_checks {
    string id
    string message_id
    string provider
    string status
    float score
    string categories
    string flagged
  }

  moderation_incidents {
    string id
    string user_id
    string message_id
    string severity
    string state
    string opened_by_id
    string notes
  }

  calls {
    string id
    string conversation_id
    string call_type
    string started_by_id
    string status
    string started_at
    string ended_at
    string provider_room_id
  }

  call_participants {
    string id
    string call_id
    string user_id
    string device_id
    string joined_at
    string left_at
    string role
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
