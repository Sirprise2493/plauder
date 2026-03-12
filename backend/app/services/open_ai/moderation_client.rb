require "net/http"
require "uri"
require "json"

module OpenAi
  class ModerationClient
    API_URL = "https://api.openai.com/v1/moderations"

    class Error < StandardError; end

    def self.check_text!(text)
      api_key = ENV["OPENAI_API_KEY"]
      raise Error, "OPENAI_API_KEY fehlt" if api_key.blank?
      raise Error, "Kein Text zur Moderation vorhanden" if text.blank?

      uri = URI(API_URL)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.open_timeout = 10
      http.read_timeout = 30

      request = Net::HTTP::Post.new(uri.request_uri)
      request["Authorization"] = "Bearer #{api_key}"
      request["Content-Type"] = "application/json"
      request.body = {
        model: "omni-moderation-latest",
        input: text
      }.to_json

      response = http.request(request)
      body = response.body.to_s

      unless response.is_a?(Net::HTTPSuccess)
        raise Error, "Moderation fehlgeschlagen: HTTP #{response.code} - #{body}"
      end

      json = JSON.parse(body)
      result = json.fetch("results", []).first || {}

      {
        flagged: result["flagged"] == true,
        categories: result["categories"] || {},
        category_scores: result["category_scores"] || {},
        raw: json
      }
    rescue JSON::ParserError => e
      raise Error, "Moderation-Antwort konnte nicht geparst werden: #{e.message}"
    rescue StandardError => e
      raise Error, e.message if e.is_a?(Error)

      raise Error, "Moderation unerwartet fehlgeschlagen: #{e.class} - #{e.message}"
    end
  end
end
