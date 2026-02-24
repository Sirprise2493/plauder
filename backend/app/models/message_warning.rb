class MessageWarning < ApplicationRecord
  enum :ai_type, {
    toxicity: 0,
    harassment: 1,
    hate_speech: 2,
    self_harm: 3,
    spam: 4,
    misinformation: 5
  }

  belongs_to :message

  validates :dangerous_message, inclusion: { in: [true, false] }
  validates :response_of_ai, length: { maximum: 2000 }, allow_blank: true
  validates :ai_type, presence: true
end
