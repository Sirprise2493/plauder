module Api
  module V1
    class HomeController < BaseController
      skip_before_action :require_authentication!, only: [:index]

      def index
        render json: {
          message: "Plauder API läuft ✅",
          version: "v1",
          timestamp: Time.current.iso8601
        }, status: :ok
      end
    end
  end
end
