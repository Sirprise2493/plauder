# frozen_string_literal: true

require "net/http"
require "uri"
require "json"

module OpenAI
  class ModerationClient
    API_URL = "https://api.openai.com/v1/moderations"

    class Error < StandardError; end

    def self.check_text!(text)
      api_key = ENV["OPENAI_API_KEY"]
      raise Error, "OPENAI_API_KEY fehlt" if api_key.blank?

      uri = URI(API_URL)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true

      request = Net::HTTP::Post.new(uri.request_uri)
      request["Authorization"] = "Bearer #{api_key}"
      request["Content-Type"] = "application/json"
      request.body = {
        model: "omni-moderation-latest",
        input: text
      }.to_json

      response = http.request(request)

      unless response.is_a?(Net::HTTPSuccess)
        raise Error, "Moderation fehlgeschlagen: HTTP #{response.code} - #{response.body}"
      end

      json = JSON.parse(response.body)
      result = json.fetch("results").first || {}

      {
        flagged: result["flagged"] == true,
        categories: result["categories"] || {},
        category_scores: result["category_scores"] || {},
        raw: json
      }
    end
  end
end
