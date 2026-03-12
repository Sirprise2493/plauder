require "net/http"
require "uri"
require "json"

module OpenAi
  class TextImproverClient
    API_URL = "https://api.openai.com/v1/responses"

    class Error < StandardError; end

    def self.improve_text!(text)
      api_key = ENV["OPENAI_API_KEY"]
      raise Error, "OPENAI_API_KEY fehlt" if api_key.blank?
      raise Error, "Kein Text zur Korrektur vorhanden" if text.blank?

      uri = URI(API_URL)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.open_timeout = 10
      http.read_timeout = 60

      request = Net::HTTP::Post.new(uri.request_uri)
      request["Authorization"] = "Bearer #{api_key}"
      request["Content-Type"] = "application/json"
      request.body = {
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: text
              }
            ]
          }
        ],
        instructions: "Verbessere den folgenden deutschen Text. Korrigiere Rechtschreibung, Grammatik und Formulierung. Gib ausschließlich den korrigierten Text zurück, ohne Erklärungen."
      }.to_json

      response = http.request(request)
      body = response.body.to_s

      unless response.is_a?(Net::HTTPSuccess)
        raise Error, "OpenAI Textkorrektur fehlgeschlagen: HTTP #{response.code} - #{body}"
      end

      json = JSON.parse(body)
      output_text = extract_output_text(json)

      raise Error, "OpenAI hat keinen korrigierten Text zurückgegeben" if output_text.blank?

      {
        corrected_text: output_text.strip,
        raw: json
      }
    rescue JSON::ParserError => e
      raise Error, "Textkorrektur-Antwort konnte nicht geparst werden: #{e.message}"
    rescue StandardError => e
      raise Error, e.message if e.is_a?(Error)

      raise Error, "Textkorrektur unerwartet fehlgeschlagen: #{e.class} - #{e.message}"
    end

    def self.extract_output_text(json)
      messages = Array(json["output"])

      texts = messages.flat_map do |item|
        next [] unless item["type"] == "message"

        Array(item["content"]).filter_map do |content_item|
          content_item["text"] if content_item["type"] == "output_text"
        end
      end

      texts.join("\n").strip
    end

    private_class_method :extract_output_text
  end
end
