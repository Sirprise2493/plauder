class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  enum :status, {
    offline: 0,
    online: 1,
    away: 2,
    busy: 3
  }, default: :offline

  has_many :chat_memberships, dependent: :destroy
  has_many :chats, through: :chat_memberships

  has_many :requested_friendships, class_name: "Friendship", foreign_key: :requester_id, dependent: :destroy
  has_many :received_friendships, class_name: "Friendship", foreign_key: :receiver_id, dependent: :destroy

  has_many :sent_messages, class_name: "Message", foreign_key: :sender_id, dependent: :destroy
  has_many :initiated_calls, class_name: "Call", foreign_key: :initiator_id, dependent: :destroy
  has_many :call_participants, dependent: :destroy
  has_many :participated_calls, through: :call_participants, source: :call

  validates :username, presence: true, length: { minimum: 3, maximum: 30 }, uniqueness: { case_sensitive: false }
  validates :status, presence: true

  before_validation :normalize_username

  private

  def normalize_username
    self.username = username.to_s.strip
  end
end
