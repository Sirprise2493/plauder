puts "Seeding..."

User.destroy_all
Chat.destroy_all
Friendship.destroy_all

u1 = User.create!(
  email: "andi@example.com",
  password: "Passwort123!",
  password_confirmation: "Passwort123!",
  username: "andi",
  status: :online
)

u2 = User.create!(
  email: "beni@example.com",
  password: "Passwort123!",
  password_confirmation: "Passwort123!",
  username: "beni",
  status: :away
)

u3 = User.create!(
  email: "clara@example.com",
  password: "Passwort123!",
  password_confirmation: "Passwort123!",
  username: "clara",
  status: :offline
)

Friendship.create!(
  requester: u1,
  receiver: u2,
  friendship_status: :accepted,
  active: true
)

chat_direct = Chat.create!(chat_type: :direct)
ChatMembership.create!(chat: chat_direct, user: u1)
ChatMembership.create!(chat: chat_direct, user: u2)

chat_group = Chat.create!(chat_type: :group_chat, title: "Projekt Plauder")
ChatMembership.create!(chat: chat_group, user: u1)
ChatMembership.create!(chat: chat_group, user: u2)
ChatMembership.create!(chat: chat_group, user: u3)

m1 = Message.create!(
  sender: u1,
  chat: chat_direct,
  message_type: :text,
  content: "Hey, läuft dein Setup schon?"
)

m2 = Message.create!(
  sender: u2,
  chat: chat_direct,
  message_type: :text,
  content: "Ja, fast fertig 😄"
)

MessageAiCorrection.create!(
  message: m2,
  message_corrected_by_ai: "Ja, fast fertig! 😄",
  ai_type: :grammar
)

MessageWarning.create!(
  message: m2,
  response_of_ai: "Keine problematischen Inhalte erkannt.",
  dangerous_message: false,
  ai_type: :toxicity
)

call = Call.create!(
  chat: chat_direct,
  initiator: u1,
  call_type: :audio,
  status: :ringing
)

CallParticipant.create!(
  call: call,
  user: u1,
  state: :joined,
  camera_enabled: false,
  mic_enabled: true
)

CallParticipant.create!(
  call: call,
  user: u2,
  state: :ringing,
  camera_enabled: false,
  mic_enabled: true
)

puts "Done."
