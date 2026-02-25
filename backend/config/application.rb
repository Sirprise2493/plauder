# backend/config/application.rb
require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module YourAppName # <- deinen Modulnamen drin lassen
  class Application < Rails::Application
    config.load_defaults 7.1

    config.api_only = true

    # WICHTIG für Devise Session/Cookies im API-Only Modus
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
    config.middleware.use ActionDispatch::Flash
  end
end
