class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Devise::Controllers::Helpers
end
