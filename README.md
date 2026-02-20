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
    int id PK
    varchar username
    varchar email
    varchar password
    varchar status
  }

  friendships {
    int id PK
    int requester_id FK
    int receiver_id FK
    varchar friendship_status
  }

  chats {
    int id PK
    varchar chat_type
    varchar title
  }

  chat_memberships {
    int chat_id FK
    int user_id FK
  }

  messages {
    int id PK
    int sender_id FK
    int chat_id FK
    varchar message_type
    text content
  }

  message_warnings {
    int id PK
    text response_of_ai
    boolean dangerous_message
    int message_id FK
  }

  message_ai_corrections {
    int id PK
    int message_id FK
    text message_corrected_by_ai
  }

  message_attachments {
    int id PK
    int message_id FK
    varchar filename
    int duration_ms
    int byte_size
    int width
    int height
  }

  calls {
    int id PK
    int chat_id FK
    int initiator_id FK
    varchar call_type
    varchar status
    datetime stated_at
    datetime ended_at
  }

  call_participants {
    int id PK
    int call_id FK
    int user_id FK
    varchar state
    boolean camera_enabled
    boolean mic_enabled
  }

  users ||--o{ friendships : requester_id
  users ||--o{ friendships : receiver_id

  users ||--o{ chat_memberships : user_id
  chats ||--o{ chat_memberships : chat_id

  chats ||--o{ messages : chat_id
  users ||--o{ messages : sender_id

  messages ||--o{ message_warnings : message_id
  messages ||--o{ message_ai_corrections : message_id
  messages ||--o{ message_attachments : message_id

  chats ||--o{ calls : chat_id
  users ||--o{ calls : initiator_id

  calls ||--o{ call_participants : call_id
  users ||--o{ call_participants : user_id
