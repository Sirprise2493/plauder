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
