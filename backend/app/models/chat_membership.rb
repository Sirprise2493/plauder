class ChatMembership < ApplicationRecord
  belongs_to :user
  belongs_to :chat

  validates :user_id, uniqueness: { scope: :chat_id, message: "ist bereits Mitglied in diesem Chat" }

  validate :direct_chat_max_two_members

  private

  def direct_chat_max_two_members
    return unless chat&.direct?

    existing_count = chat.chat_memberships.where.not(id: id).count
    if existing_count >= 2
      errors.add(:chat_id, "Direktchat darf maximal 2 Mitglieder haben")
    end
  end
end
