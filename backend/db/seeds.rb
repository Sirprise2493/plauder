require "pathname"

puts "Seeding..."

def avatar_path(filename)
  Rails.root.join("db", "seeds", "avatars", filename)
end

def attach_avatar(user, filename)
  path = avatar_path(filename)
  fallback_path = avatar_path("default-avatar.png")

  chosen_path =
    if File.exist?(path)
      path
    elsif File.exist?(fallback_path)
      fallback_path
    end

  return unless chosen_path

  user.avatar.attach(
    io: File.open(chosen_path),
    filename: File.basename(chosen_path),
    content_type: Marcel::MimeType.for(Pathname.new(chosen_path))
  )
end

def create_user_with_avatar!(attributes, avatar_filename = "default-avatar.png")
  user = User.create!(attributes)
  attach_avatar(user, avatar_filename)
  user
end

def create_friendship!(requester:, receiver:, status:, active: true)
  Friendship.create!(
    requester: requester,
    receiver: receiver,
    friendship_status: status,
    active: active
  )
end

def create_direct_chat!(user_a, user_b)
  chat = Chat.create!(chat_type: :direct)
  ChatMembership.create!(chat: chat, user: user_a)
  ChatMembership.create!(chat: chat, user: user_b)
  chat
end

def add_message!(chat:, sender:, content:, message_type: :text)
  Message.create!(
    sender: sender,
    chat: chat,
    message_type: message_type,
    content: content
  )
end

# =========================================================
# Cleanup
# =========================================================

CallParticipant.destroy_all
Call.destroy_all
MessageWarning.destroy_all
MessageAiCorrection.destroy_all
MessageAttachment.destroy_all
Message.destroy_all
ChatMembership.destroy_all
Chat.destroy_all
Friendship.destroy_all
User.destroy_all

# =========================================================
# Users
# =========================================================

andi = create_user_with_avatar!(
  {
    email: "andi@test.de",
    password: "123456",
    password_confirmation: "123456",
    username: "Andi",
    status: :online
  },
  "andi.jpg"
)

beni = create_user_with_avatar!(
  {
    email: "beni@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Beni",
    status: :online
  },
  "beni.jpg"
)

clara = create_user_with_avatar!(
  {
    email: "clara@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Clara",
    status: :offline
  },
  "clara.jpg"
)

david = create_user_with_avatar!(
  {
    email: "david@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "David",
    status: :online
  },
  "david.jpg"
)

eva = create_user_with_avatar!(
  {
    email: "eva@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Eva",
    status: :offline
  },
  "eva.jpg"
)

fiona = create_user_with_avatar!(
  {
    email: "fiona@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Fiona",
    status: :online
  },
  "fiona.jpg"
)

gregor = create_user_with_avatar!(
  {
    email: "gregor@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Gregor",
    status: :offline
  },
  "gregor.jpg"
)

hannah = create_user_with_avatar!(
  {
    email: "hannah@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Hannah",
    status: :online
  },
  "hannah.jpg"
)

jan = create_user_with_avatar!(
  {
    email: "jan@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Jan",
    status: :offline
  },
  "jan.jpg"
)

leo = create_user_with_avatar!(
  {
    email: "leo@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Leo",
    status: :online
  },
  "leo.jpg"
)

mara = create_user_with_avatar!(
  {
    email: "mara@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Mara",
    status: :online
  },
  "mara.jpg"
)

nils = create_user_with_avatar!(
  {
    email: "nils@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Nils",
    status: :offline
  },
  "nils.jpg"
)

sophie = create_user_with_avatar!(
  {
    email: "sophie@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Sophie",
    status: :online
  },
  "sophie.jpg"
)

tom = create_user_with_avatar!(
  {
    email: "tom@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Tom",
    status: :offline
  },
  "tom.jpg"
)

lena = create_user_with_avatar!(
  {
    email: "lena@example.com",
    password: "123456",
    password_confirmation: "123456",
    username: "Lena",
    status: :online
  },
  "lena.jpg"
)

puts "Users created: #{User.count}"

# =========================================================
# Friendships
# =========================================================

# Akzeptierte Freundschaften für Andi
create_friendship!(requester: andi, receiver: beni, status: :accepted)
create_friendship!(requester: clara, receiver: andi, status: :accepted)
create_friendship!(requester: andi, receiver: david, status: :accepted)
create_friendship!(requester: fiona, receiver: andi, status: :accepted)
create_friendship!(requester: andi, receiver: hannah, status: :accepted)
create_friendship!(requester: lena, receiver: andi, status: :accepted)

# Offene Anfrage von Andi
create_friendship!(requester: andi, receiver: eva, status: :pending)

# Offene Anfragen an Andi
create_friendship!(requester: jan, receiver: andi, status: :pending)
create_friendship!(requester: leo, receiver: andi, status: :pending)
create_friendship!(requester: mara, receiver: andi, status: :pending)
create_friendship!(requester: sophie, receiver: andi, status: :pending)

# Geblockt / abgelehnt
create_friendship!(requester: andi, receiver: gregor, status: :blocked)
create_friendship!(requester: nils, receiver: andi, status: :rejected, active: false)

# Sonstige Freundschaften
create_friendship!(requester: beni, receiver: clara, status: :accepted)
create_friendship!(requester: david, receiver: fiona, status: :accepted)
create_friendship!(requester: hannah, receiver: leo, status: :accepted)
create_friendship!(requester: mara, receiver: sophie, status: :accepted)
create_friendship!(requester: tom, receiver: eva, status: :accepted)

puts "Friendships created: #{Friendship.count}"

# =========================================================
# Direktchats
# =========================================================

chat_andi_beni = create_direct_chat!(andi, beni)
chat_andi_clara = create_direct_chat!(andi, clara)
chat_andi_david = create_direct_chat!(andi, david)
chat_andi_fiona = create_direct_chat!(andi, fiona)
chat_andi_hannah = create_direct_chat!(andi, hannah)
chat_andi_lena = create_direct_chat!(andi, lena)

# =========================================================
# Gruppenchats
# =========================================================

projekt_plauder = Chat.create!(chat_type: :group_chat, title: "Projekt Plauder")
[andi, beni, clara, david].each do |user|
  ChatMembership.create!(chat: projekt_plauder, user: user)
end

gaming_crew = Chat.create!(chat_type: :group_chat, title: "Gaming Crew")
[andi, david, fiona, gregor, leo].each do |user|
  ChatMembership.create!(chat: gaming_crew, user: user)
end

familien_orga = Chat.create!(chat_type: :group_chat, title: "Familien Orga")
[andi, clara, hannah, mara, lena].each do |user|
  ChatMembership.create!(chat: familien_orga, user: user)
end

frontend_team = Chat.create!(chat_type: :group_chat, title: "Frontend Team")
[andi, beni, fiona, leo, sophie].each do |user|
  ChatMembership.create!(chat: frontend_team, user: user)
end

wochenende = Chat.create!(chat_type: :group_chat, title: "Wochenende")
[andi, david, hannah, lena, tom].each do |user|
  ChatMembership.create!(chat: wochenende, user: user)
end

puts "Chats created: #{Chat.count}"
puts "Chat memberships created: #{ChatMembership.count}"

# =========================================================
# Messages - Direktchats
# =========================================================

m1 = add_message!(
  chat: chat_andi_beni,
  sender: andi,
  content: "Hey Beni, hast du kurz Zeit für das Kontakte-Layout?"
)

m2 = add_message!(
  chat: chat_andi_beni,
  sender: beni,
  content: "Ja klar, ich schau gleich drauf."
)

m3 = add_message!(
  chat: chat_andi_beni,
  sender: andi,
  content: "Super, die mobile Ansicht soll ruhiger wirken."
)

m4 = add_message!(
  chat: chat_andi_beni,
  sender: beni,
  content: "Dann würde ich mit festen Höhen und Scrollbereichen arbeiten."
)

m5 = add_message!(
  chat: chat_andi_clara,
  sender: clara,
  content: "Ich bin gerade unterwegs, melde mich später."
)

m6 = add_message!(
  chat: chat_andi_clara,
  sender: andi,
  content: "Alles gut, kein Stress."
)

m7 = add_message!(
  chat: chat_andi_clara,
  sender: clara,
  content: "Kannst du mir dann noch den aktuellen Stand schicken?"
)

m8 = add_message!(
  chat: chat_andi_david,
  sender: david,
  content: "Heute Abend Runde?"
)

m9 = add_message!(
  chat: chat_andi_david,
  sender: andi,
  content: "Ja, bin dabei 😄"
)

m10 = add_message!(
  chat: chat_andi_david,
  sender: david,
  content: "Perfekt, ich frag noch Leo."
)

m11 = add_message!(
  chat: chat_andi_fiona,
  sender: andi,
  content: "Kannst du bitte den Button-Zustand testen?"
)

m12 = add_message!(
  chat: chat_andi_fiona,
  sender: fiona,
  content: "Mach ich. Ich prüfe auch gleich die Gruppenchats."
)

m13 = add_message!(
  chat: chat_andi_fiona,
  sender: andi,
  content: "Mega, danke dir."
)

m14 = add_message!(
  chat: chat_andi_hannah,
  sender: hannah,
  content: "Hi Andi, die App sieht schon richtig gut aus."
)

m15 = add_message!(
  chat: chat_andi_hannah,
  sender: andi,
  content: "Danke dir 🙂"
)

m16 = add_message!(
  chat: chat_andi_hannah,
  sender: hannah,
  content: "Vor allem die Chat-Seite gefällt mir."
)

m17 = add_message!(
  chat: chat_andi_lena,
  sender: lena,
  content: "Kannst du nachher noch den Profilbereich zeigen?"
)

m18 = add_message!(
  chat: chat_andi_lena,
  sender: andi,
  content: "Ja, ich schicke dir später Screenshots."
)

# =========================================================
# Messages - Gruppenchats
# =========================================================

m19 = add_message!(
  chat: projekt_plauder,
  sender: andi,
  content: "Willkommen im Projektchat!"
)

m20 = add_message!(
  chat: projekt_plauder,
  sender: beni,
  content: "Ich kümmere mich heute um den Switcher."
)

m21 = add_message!(
  chat: projekt_plauder,
  sender: clara,
  content: "Ich teste die Responsive-Abstände."
)

m22 = add_message!(
  chat: projekt_plauder,
  sender: david,
  content: "Ich prüfe die API-Antworten."
)

m23 = add_message!(
  chat: projekt_plauder,
  sender: andi,
  content: "Top, dann haben wir heute einen guten Stand."
)

m24 = add_message!(
  chat: gaming_crew,
  sender: andi,
  content: "Wer ist heute Abend dabei?"
)

m25 = add_message!(
  chat: gaming_crew,
  sender: david,
  content: "Ich bin dabei!"
)

m26 = add_message!(
  chat: gaming_crew,
  sender: fiona,
  content: "Ab 20 Uhr passt bei mir."
)

m27 = add_message!(
  chat: gaming_crew,
  sender: leo,
  content: "Ich komme später dazu."
)

m28 = add_message!(
  chat: familien_orga,
  sender: clara,
  content: "Denkt bitte an Sonntag."
)

m29 = add_message!(
  chat: familien_orga,
  sender: mara,
  content: "Ich bringe Kuchen mit."
)

m30 = add_message!(
  chat: familien_orga,
  sender: andi,
  content: "Sehr gut, ich kümmere mich um Getränke."
)

m31 = add_message!(
  chat: frontend_team,
  sender: andi,
  content: "Bitte einmal die Contacts-Seite auf 402px testen."
)

m32 = add_message!(
  chat: frontend_team,
  sender: beni,
  content: "Layout sieht schon sehr stabil aus."
)

m33 = add_message!(
  chat: frontend_team,
  sender: fiona,
  content: "Scrollbar ist dezent genug."
)

m34 = add_message!(
  chat: frontend_team,
  sender: leo,
  content: "Ich würde die Höhe noch leicht anpassen."
)

m35 = add_message!(
  chat: frontend_team,
  sender: sophie,
  content: "Der Gruppen-Button sollte den Rest der Ansicht ausblenden."
)

m36 = add_message!(
  chat: wochenende,
  sender: david,
  content: "Hat jemand Ideen für Samstag?"
)

m37 = add_message!(
  chat: hannah,
  sender: hannah,
  content: "Wie wäre es mit Brunchen?"
)

m38 = add_message!(
  chat: wochenende,
  sender: lena,
  content: "Klingt gut, ich wäre dabei."
)

m39 = add_message!(
  chat: wochenende,
  sender: andi,
  content: "Dann machen wir das so."
)

puts "Messages created: #{Message.count}"

# =========================================================
# AI Corrections
# =========================================================

MessageAiCorrection.create!(
  message: m2,
  message_corrected_by_ai: "Ja klar, ich schaue gleich drauf.",
  ai_type: :grammar
)

MessageAiCorrection.create!(
  message: m32,
  message_corrected_by_ai: "Das Layout sieht bereits sehr stabil aus.",
  ai_type: :rewrite
)

MessageAiCorrection.create!(
  message: m27,
  message_corrected_by_ai: "Ich komme etwas später dazu.",
  ai_type: :rewrite
)

puts "Message AI corrections created: #{MessageAiCorrection.count}"

# =========================================================
# Message Warnings
# =========================================================

MessageWarning.create!(
  message: m24,
  response_of_ai: "Keine problematischen Inhalte erkannt.",
  dangerous_message: false,
  ai_type: :toxicity
)

MessageWarning.create!(
  message: m31,
  response_of_ai: "Technische Abstimmung erkannt. Keine problematischen Inhalte.",
  dangerous_message: false,
  ai_type: :toxicity
)

MessageWarning.create!(
  message: m36,
  response_of_ai: "Normale Unterhaltung erkannt. Keine problematischen Inhalte.",
  dangerous_message: false,
  ai_type: :toxicity
)

puts "Message warnings created: #{MessageWarning.count}"

# =========================================================
# Calls
# =========================================================

call_1 = Call.create!(
  chat: chat_andi_beni,
  initiator: andi,
  call_type: :audio,
  status: :ringing
)

CallParticipant.create!(
  call: call_1,
  user: andi,
  state: :joined,
  camera_enabled: false,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_1,
  user: beni,
  state: :ringing,
  camera_enabled: false,
  mic_enabled: true
)

call_2 = Call.create!(
  chat: projekt_plauder,
  initiator: fiona,
  call_type: :video,
  status: :ongoing,
  started_at: Time.current - 12.minutes
)

CallParticipant.create!(
  call: call_2,
  user: andi,
  state: :joined,
  camera_enabled: true,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_2,
  user: beni,
  state: :joined,
  camera_enabled: true,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_2,
  user: fiona,
  state: :joined,
  camera_enabled: true,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_2,
  user: clara,
  state: :left,
  camera_enabled: false,
  mic_enabled: false
)

call_3 = Call.create!(
  chat: gaming_crew,
  initiator: david,
  call_type: :audio,
  status: :ended,
  started_at: Time.current - 1.hour
)

CallParticipant.create!(
  call: call_3,
  user: david,
  state: :joined,
  camera_enabled: false,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_3,
  user: andi,
  state: :left,
  camera_enabled: false,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_3,
  user: leo,
  state: :left,
  camera_enabled: false,
  mic_enabled: true
)

puts "Calls created: #{Call.count}"
puts "Call participants created: #{CallParticipant.count}"

puts "Done."
puts "Main login:"
puts "  Email: andi@test.de"
puts "  Password: 123456"
puts "  Username: Andi"
