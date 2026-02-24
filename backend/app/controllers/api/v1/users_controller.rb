module Api
  module V1
    class UsersController < BaseController
      before_action :set_user, only: %i[show update]

      def index
        users = User.order(:id)
        render json: users.as_json(only: %i[id username email status created_at updated_at])
      end

      def show
        render json: @user.as_json(only: %i[id username email status created_at updated_at])
      end

      def update
        @user.update!(user_params)
        render json: @user.as_json(only: %i[id username email status created_at updated_at])
      end

      private

      def set_user
        @user = User.find(params[:id])
      end

      def user_params
        params.require(:user).permit(:username, :status)
      end
    end
  end
end
