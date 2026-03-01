puts "Seeding..."

# Reihenfolge wegen Foreign Keys
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

main_user = User.create!(
  email: "test@test.de",
  password: "123456",
  password_confirmation: "123456",
  username: "Sirprise",
  status: :online
)

u2 = User.create!(
  email: "andi@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "andi",
  status: :online
)

u3 = User.create!(
  email: "beni@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "beni",
  status: :online
)

u4 = User.create!(
  email: "clara@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "clara",
  status: :offline
)

u5 = User.create!(
  email: "david@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "david",
  status: :online
)

u6 = User.create!(
  email: "eva@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "eva",
  status: :offline
)

u7 = User.create!(
  email: "fiona@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "fiona",
  status: :online
)

u8 = User.create!(
  email: "gregor@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "gregor",
  status: :offline
)

# Neue User mit offener Anfrage an Sirprise
u9 = User.create!(
  email: "hannah@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "hannah",
  status: :online
)

u10 = User.create!(
  email: "jan@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "jan",
  status: :offline
)

u11 = User.create!(
  email: "leo@example.com",
  password: "123456",
  password_confirmation: "123456",
  username: "leo",
  status: :online
)

puts "Users created: #{User.count}"

# =========================================================
# Friendships
# =========================================================

# Akzeptierte Freundschaften für Sirprise
Friendship.create!(
  requester: main_user,
  receiver: u2,
  friendship_status: :accepted,
  active: true
)

Friendship.create!(
  requester: u3,
  receiver: main_user,
  friendship_status: :accepted,
  active: true
)

Friendship.create!(
  requester: main_user,
  receiver: u4,
  friendship_status: :accepted,
  active: true
)

Friendship.create!(
  requester: u5,
  receiver: main_user,
  friendship_status: :accepted,
  active: true
)

# Offene Anfrage
Friendship.create!(
  requester: main_user,
  receiver: u6,
  friendship_status: :pending,
  active: true
)

Friendship.create!(
  requester: u7,
  receiver: main_user,
  friendship_status: :pending,
  active: true
)

# 3 weitere offene Anfragen an Sirprise
Friendship.create!(
  requester: u9,
  receiver: main_user,
  friendship_status: :pending,
  active: true
)

Friendship.create!(
  requester: u10,
  receiver: main_user,
  friendship_status: :pending,
  active: true
)

Friendship.create!(
  requester: u11,
  receiver: main_user,
  friendship_status: :pending,
  active: true
)

# Sonstige Freundschaften zwischen anderen Usern
Friendship.create!(
  requester: u2,
  receiver: u3,
  friendship_status: :accepted,
  active: true
)

Friendship.create!(
  requester: u4,
  receiver: u5,
  friendship_status: :accepted,
  active: true
)

Friendship.create!(
  requester: u6,
  receiver: u8,
  friendship_status: :rejected,
  active: false
)

puts "Friendships created: #{Friendship.count}"

# =========================================================
# Chats
# =========================================================

# Direktchat Sirprise <-> andi
chat_direct_1 = Chat.create!(chat_type: :direct)
ChatMembership.create!(chat: chat_direct_1, user: main_user)
ChatMembership.create!(chat: chat_direct_1, user: u2)

# Direktchat Sirprise <-> beni
chat_direct_2 = Chat.create!(chat_type: :direct)
ChatMembership.create!(chat: chat_direct_2, user: main_user)
ChatMembership.create!(chat: chat_direct_2, user: u3)

# Direktchat Sirprise <-> clara
chat_direct_3 = Chat.create!(chat_type: :direct)
ChatMembership.create!(chat: chat_direct_3, user: main_user)
ChatMembership.create!(chat: chat_direct_3, user: u4)

# Gruppenchats
chat_group_1 = Chat.create!(chat_type: :group_chat, title: "Projekt Plauder")
ChatMembership.create!(chat: chat_group_1, user: main_user)
ChatMembership.create!(chat: chat_group_1, user: u2)
ChatMembership.create!(chat: chat_group_1, user: u3)
ChatMembership.create!(chat: chat_group_1, user: u4)

chat_group_2 = Chat.create!(chat_type: :group_chat, title: "Gaming Crew")
ChatMembership.create!(chat: chat_group_2, user: main_user)
ChatMembership.create!(chat: chat_group_2, user: u5)
ChatMembership.create!(chat: chat_group_2, user: u7)
ChatMembership.create!(chat: chat_group_2, user: u8)

puts "Chats created: #{Chat.count}"
puts "Chat memberships created: #{ChatMembership.count}"

# =========================================================
# Messages
# =========================================================

# Direktchat 1
m1 = Message.create!(
  sender: main_user,
  chat: chat_direct_1,
  message_type: :text,
  content: "Hey Andi, läuft dein Setup schon?"
)

m2 = Message.create!(
  sender: u2,
  chat: chat_direct_1,
  message_type: :text,
  content: "Ja, fast fertig 😄"
)

m3 = Message.create!(
  sender: main_user,
  chat: chat_direct_1,
  message_type: :text,
  content: "Perfekt, ich teste gerade Login und Kontakte."
)

# Direktchat 2
m4 = Message.create!(
  sender: u3,
  chat: chat_direct_2,
  message_type: :text,
  content: "Hast du die Seeds schon erweitert?"
)

m5 = Message.create!(
  sender: main_user,
  chat: chat_direct_2,
  message_type: :text,
  content: "Ja, ich habe jetzt deutlich mehr Testdaten."
)

# Direktchat 3
m6 = Message.create!(
  sender: u4,
  chat: chat_direct_3,
  message_type: :text,
  content: "Ich bin aktuell offline, aber die Nachricht kam an 😄"
)

# Gruppenchats
m7 = Message.create!(
  sender: main_user,
  chat: chat_group_1,
  message_type: :text,
  content: "Willkommen im Projektchat!"
)

m8 = Message.create!(
  sender: u2,
  chat: chat_group_1,
  message_type: :text,
  content: "Nice, dann können wir direkt loslegen."
)

m9 = Message.create!(
  sender: u3,
  chat: chat_group_1,
  message_type: :text,
  content: "API und Frontend sprechen schon miteinander."
)

m10 = Message.create!(
  sender: u4,
  chat: chat_group_1,
  message_type: :text,
  content: "Als Nächstes brauchen wir noch eine schönere Contacts-Seite."
)

m11 = Message.create!(
  sender: main_user,
  chat: chat_group_2,
  message_type: :text,
  content: "Wer ist heute Abend bei einer Runde dabei?"
)

m12 = Message.create!(
  sender: u5,
  chat: chat_group_2,
  message_type: :text,
  content: "Ich bin dabei!"
)

puts "Messages created: #{Message.count}"

# =========================================================
# AI Corrections
# =========================================================

MessageAiCorrection.create!(
  message: m2,
  message_corrected_by_ai: "Ja, fast fertig! 😄",
  ai_type: :grammar
)

MessageAiCorrection.create!(
  message: m6,
  message_corrected_by_ai: "Ich bin aktuell offline, aber die Nachricht ist angekommen. 😄",
  ai_type: :grammar
)

puts "Message AI corrections created: #{MessageAiCorrection.count}"

# =========================================================
# Message Warnings
# =========================================================

MessageWarning.create!(
  message: m2,
  response_of_ai: "Keine problematischen Inhalte erkannt.",
  dangerous_message: false,
  ai_type: :toxicity
)

MessageWarning.create!(
  message: m8,
  response_of_ai: "Keine problematischen Inhalte erkannt.",
  dangerous_message: false,
  ai_type: :toxicity
)

MessageWarning.create!(
  message: m11,
  response_of_ai: "Unkritische Unterhaltung erkannt.",
  dangerous_message: false,
  ai_type: :toxicity
)

puts "Message warnings created: #{MessageWarning.count}"

# =========================================================
# Calls
# =========================================================

call_1 = Call.create!(
  chat: chat_direct_1,
  initiator: main_user,
  call_type: :audio,
  status: :ringing
)

CallParticipant.create!(
  call: call_1,
  user: main_user,
  state: :joined,
  camera_enabled: false,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_1,
  user: u2,
  state: :ringing,
  camera_enabled: false,
  mic_enabled: true
)

call_2 = Call.create!(
  chat: chat_group_1,
  initiator: u3,
  call_type: :video,
  status: :ongoing,
  started_at: Time.current - 15.minutes
)

CallParticipant.create!(
  call: call_2,
  user: main_user,
  state: :joined,
  camera_enabled: true,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_2,
  user: u2,
  state: :joined,
  camera_enabled: false,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_2,
  user: u3,
  state: :joined,
  camera_enabled: true,
  mic_enabled: true
)

CallParticipant.create!(
  call: call_2,
  user: u4,
  state: :left,
  camera_enabled: false,
  mic_enabled: false
)

puts "Calls created: #{Call.count}"
puts "Call participants created: #{CallParticipant.count}"

puts "Done."
puts "Main login:"
puts "  Email: test@test.de"
puts "  Password: 123456"
puts "  Username: Sirprise"
