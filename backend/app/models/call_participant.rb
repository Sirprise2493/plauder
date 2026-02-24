class CallParticipant < ApplicationRecord
  enum :state, {
    invited: 0,
    ringing: 1,
    joined: 2,
    left: 3,
    declined: 4,
    missed: 5
  }, default: :invited

  belongs_to :call
  belongs_to :user

  validates :user_id, uniqueness: { scope: :call_id, message: "ist bereits Teilnehmer dieses Calls" }
  validates :camera_enabled, inclusion: { in: [true, false] }
  validates :mic_enabled, inclusion: { in: [true, false] }

  validate :user_must_be_member_of_call_chat

  private

  def user_must_be_member_of_call_chat
    return if call.blank? || user_id.blank?

    unless call.chat.chat_memberships.exists?(user_id: user_id)
      errors.add(:user_id, "muss Mitglied des zugehörigen Chats sein")
    end
  end
end
