class MessageAiCorrection < ApplicationRecord
  enum :ai_type, {
    spelling: 0,
    grammar: 1,
    rewrite: 2,
    translation: 3,
    safety_rephrase: 4
  }

  belongs_to :message

  validates :message_corrected_by_ai, presence: true
  validates :ai_type, presence: true
  validates :message_id, uniqueness: { message: "hat bereits eine AI-Korrektur" }
end
