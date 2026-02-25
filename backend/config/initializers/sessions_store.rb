Rails.application.config.session_store :cookie_store,
  key: "_plauder_session",
  same_site: :lax,   # oder :none bei Cross-Site
  secure: Rails.env.production?,
  httponly: true
