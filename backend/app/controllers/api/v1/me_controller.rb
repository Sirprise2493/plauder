module Api
  module V1
    class MeController < BaseController
      before_action :require_authentication!

      def show
        render json: {
          user: user_payload(current_user)
        }
      end
    end
  end
end
