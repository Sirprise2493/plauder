# backend/config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key: "_plauder_session",
  same_site: :lax

Rails.application.config.middleware.use ActionDispatch::Cookies
Rails.application.config.middleware.use Rails.application.config.session_store, Rails.application.config.session_options
