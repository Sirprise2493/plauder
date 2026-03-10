# frozen_string_literal: true

class ModerateMessageJob < ApplicationJob
  queue_as :default

  CATEGORY_MAP = {
    "harassment" => :harassment,
    "harassment/threatening" => :harassment,
    "hate" => :hate_speech,
    "hate/threatening" => :hate_speech,
    "self-harm" => :self_harm,
    "self-harm/intent" => :self_harm,
    "self-harm/instructions" => :self_harm,
    "violence" => :toxicity,
    "violence/graphic" => :toxicity,
    "sexual" => :toxicity,
    "sexual/minors" => :toxicity,
    "illicit" => :misinformation,
    "illicit/violent" => :misinformation
  }.freeze

  discard_on ActiveRecord::RecordNotFound

  def perform(message_id)
    message = Message.includes(:message_warnings).find(message_id)

    return unless message.text?
    return if message.content.blank?
    return if message.content == "Anhang"

    result = OpenAI::ModerationClient.check_text!(message.content)
    return unless result[:flagged]

    flagged_categories = result[:categories].select { |_key, value| value == true }.keys
    mapped_types = flagged_categories.map { |key| CATEGORY_MAP[key] || :toxicity }.uniq
    mapped_types = [:toxicity] if mapped_types.empty?

    mapped_types.each do |ai_type|
      warning = message.message_warnings.find_or_initialize_by(ai_type: ai_type)
      warning.dangerous_message = true
      warning.response_of_ai = {
        provider: "openai",
        flagged_categories: flagged_categories,
        category_scores: result[:category_scores],
        raw: result[:raw]
      }.to_json
      warning.save!
    end
  end
end
