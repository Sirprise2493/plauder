# Plauder

Plauder ist eine moderne Social-Media- und Chat-App im WhatsApp-ähnlichen Stil mit Fokus auf mobile Nutzung.  
Die Anwendung bietet Direktchats, Gruppenchats, Freundschaften, Datei-Uploads, KI-gestützte Textverbesserung und Moderation sowie Audio-/Video-Calls.

## Features

- Direktchats zwischen zwei Nutzern
- Gruppenchats mit Mitgliederverwaltung
- Freundschaftssystem mit Requests
- Nachrichten mit Anhängen
  - Bilder
  - Audio
  - Video
  - Dateien
- KI-Features
  - Rechtschreib- und Textkorrektur
  - Moderation von Nachrichten
- Audio-/Video-Calls
- Profilverwaltung mit Avatar
- Mobile-first UI im blau-grünen Gradient-Design

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS Modules

### Backend
- Ruby on Rails
- Devise Authentication
- Active Storage
- Cloudinary
- OpenAI API

---

## Screenshots

### Sign In
![Sign In](readme_files/screenshots/sign_in.png)

### Sign Up
![Sign Up](readme_files/screenshots/sign_up.png)

### Contacts
![Contacts](readme_files/screenshots/contacts.png)

### Direktchat
![Direktchat](readme_files/screenshots/chat_direct.png)

### Gruppenchat – Chat-Ansicht
![Gruppenchat Chat](readme_files/screenshots/chat_group.png)

### Gruppenchat – Gruppenverwaltung
![Gruppenchat Gruppe](readme_files/screenshots/chat_group2.png)

### Profil bearbeiten
![Profil bearbeiten](readme_files/screenshots/profile_editor.png)

---

## Voraussetzungen

Bevor du das Projekt startest, benötigst du:

- Node.js
- npm
- Ruby
- Bundler
- SQLite oder deine konfigurierte Rails-Datenbank
- Cloudinary-Zugang
- OpenAI API Key

---

## Wichtige Umgebungsvariablen

Im **`backend`**-Ordner musst du eine **`.env`**-Datei erstellen.

### `backend/.env`

```env
CLOUDINARY_URL=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

```
---

## Installation

### 1. Repository klonen

```bash
git clone <DEIN-REPO-URL>
cd <DEIN-PROJEKTORDNER>
```
### 2. Backend einrichten
```bash
cd backend
bundle install
bin/rails db:migrate
bin/rails db:seed
bin/rails server
```
Das Backend läuft danach standardmäßig auf:
http://localhost:3000

### 3. Frontend einrichten
```bash
cd frontend
npm install
npm run dev
```
Das Frontend läuft danach standardmäßig auf:
http://localhost:5173

## Nutzung

Nach dem Start stehen dir unter anderem folgende Funktionen zur Verfügung:

- Anmeldung mit dem Seed-User
- Durchsuchen von Kontakten
- Senden und Annehmen von Freundschaftsanfragen
- Öffnen von Direktchats
- Verwalten von Gruppenchats
- Senden von Nachrichten
- Hochladen von Anhängen
- Nutzung der KI-Korrektur für Nachrichten
- Aktualisieren von Profilbild und Status

## Architekturüberblick

Plauder ist in ein Frontend und ein API-Backend aufgeteilt:

- **Frontend:** React + TypeScript
- **Backend:** Rails API für Authentifizierung und Datenlogik
- **Storage:** Active Storage in Kombination mit Cloudinary
- **KI:** OpenAI zur Textverbesserung und Moderation

## Datenmodell / ERD

Das Datenmodell von Plauder deckt die folgenden Kernbereiche ab:

- Nutzer
- Freundschaften
- Chats und Gruppen
- Chat-Mitgliedschaften
- Nachrichten
- Nachrichten-Anhänge
- KI-Korrekturen
- KI-Moderation und Warnings
- Calls und Teilnehmer

## ERD

Das Entity-Relationship-Diagramm (ERD) zeigt die Beziehungen zwischen den zentralen Entitäten des Systems und bietet einen strukturellen Überblick über das Datenmodell.

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

## API-Bereiche

Unter `api/v1` stellt das Backend unter anderem Endpunkte für folgende Bereiche bereit:

- Authentifizierung (`Sign Up`, `Sign In`, `Sign Out`)
- Users
- Friendships
- Chats
- Chat Memberships
- Messages
- Message Attachments
- Message AI Corrections
- Message Warnings
- Calls
- Call Participants




## Projektstruktur

Das Projekt ist in zwei Hauptbereiche gegliedert:

- **`backend/`** – Rails API mit Authentifizierung, Datenmodell, Business-Logik, Active Storage und OpenAI-Services
- **`frontend/`** – React-Frontend mit TypeScript, Seiten, Komponenten, Auth-Kontext und API-Anbindung

```text
.
├── backend
│   ├── app
│   │   ├── channels
│   │   ├── controllers
│   │   ├── jobs
│   │   ├── mailers
│   │   ├── models
│   │   ├── services
│   │   └── views
│   ├── bin
│   ├── config
│   ├── db
│   ├── lib
│   ├── public
│   ├── test
│   ├── Dockerfile
│   ├── Gemfile
│   └── README.md
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   └── styles
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
└── README.md

```
