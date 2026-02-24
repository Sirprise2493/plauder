module Api
  module V1
    class MeController < BaseController
      before_action :require_authentication!

      def show
        render json: {
          user: {
            id: current_user.id,
            email: current_user.email,
            username: current_user.username,
            status: current_user.status,
            created_at: current_user.created_at,
            updated_at: current_user.updated_at
          }
        }
      end
    end
  end
end
