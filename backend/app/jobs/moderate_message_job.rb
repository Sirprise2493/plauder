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
    return if message.draft?
    return if message.content.blank?
    return if message.content == "Anhang"

    result = OpenAi::ModerationClient.check_text!(message.content)
    flagged_categories = result[:categories].select { |_key, value| value == true }.keys
    mapped_types = flagged_categories.map { |key| CATEGORY_MAP[key] || :toxicity }.uniq

    if mapped_types.empty?
      warning = message.message_warnings.find_or_initialize_by(ai_type: :toxicity)
      warning.dangerous_message = false
      warning.response_of_ai = {
        provider: "openai",
        flagged_categories: [],
        category_scores: result[:category_scores],
        raw: result[:raw]
      }.to_json
      warning.save!
      return
    end

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
  rescue => e
    Rails.logger.error("[ModerateMessageJob] message_id=#{message_id} failed: #{e.class} - #{e.message}")
    raise
  end
end
