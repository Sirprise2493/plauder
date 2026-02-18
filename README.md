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
    string created_at
  }

  conversations {
    string id
    string kind
    string title
    string created_by_id
    string created_at
  }

  conversation_memberships {
    string id
    string conversation_id
    string user_id
    string role
    string joined_at
    string left_at
  }

  messages {
    string id
    string conversation_id
    string sender_id
    string message_type
    string content_ciphertext
    string created_at
    string reply_to_message_id
  }

  message_receipts {
    string id
    string message_id
    string user_id
    string status
    string delivered_at
    string read_at
  }

  ai_message_jobs {
    string id
    string message_id
    string kind
    string status
    string result
    string score
    string created_at
  }

  calls {
    string id
    string conversation_id
    string call_type
    string status
    string started_by_id
    string started_at
    string ended_at
  }

  call_participants {
    string id
    string call_id
    string user_id
    string joined_at
    string left_at
  }

  users ||--o{ conversation_memberships : joins
  conversations ||--o{ conversation_memberships : has

  conversations ||--o{ messages : contains
  users ||--o{ messages : sends
  messages ||--o{ messages : replies_to

  messages ||--o{ message_receipts : receipts
  users ||--o{ message_receipts : sees

  messages ||--o{ ai_message_jobs : ai_checks

  conversations ||--o{ calls : has
  calls ||--o{ call_participants : participants
  users ||--o{ call_participants : joins
