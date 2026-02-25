class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Devise::Controllers::Helpers
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :exception
  skip_before_action :verify_authenticity_token, if: :api_request?

  private

  def api_request?
    request.path.start_with?("/api/")
  end
end
