# Social Media / Chat App (WhatsApp-like) – Schema (ERD)

**Datenbank-Schema** (grafisch als ERD) für Plauder mit:
- 1:1 Chats & Gruppen
- Nachrichten + Read/Delivery
- Dateien/Medien (Audio/Video/File)
- KI-Features (Spellcheck, Transkription, Moderation)
- Audio/Video Calls

---

## ERD (Mermaid)

```mermaid
erDiagram
  users {
    int id PK
    varchar username
    varchar email
    varchar password
    int status
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
  }

  friendships {
    int id PK
    int requester_id FK
    int receiver_id FK
    int friendship_status
    boolean active
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
  }

  chats {
    int id PK
    int chat_type
    varchar title
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
  }

  chat_memberships {
    int id PK
    int user_id FK
    int chat_id FK
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
  }

  messages {
    int id PK
    int sender_id FK
    int chat_id FK
    int message_type
    text content
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
  }

  message_warnings {
    int id PK
    int message_id FK
    text response_of_ai
    boolean dangerous_message
    int ai_type
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
  }

  message_ai_corrections {
    int id PK
    int message_id FK
    text message_corrected_by_ai
    int ai_type
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
  }

  message_attachments {
    int id PK
    int message_id FK
    varchar filename
    int file_type
    int duration_ms
    int byte_size
    int width
    int height
    datetime created_at
    datetime updated_at
    int created_by FK
    int updated_by FK
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


