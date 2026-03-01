module Api
  module V1
    class UsersController < BaseController
      before_action :set_user, only: %i[show update]
      before_action :authorize_self!, only: %i[update]

      def index
        users = User.where.not(id: current_user.id)

        if params[:query].present?
          query = "%#{params[:query].strip.downcase}%"
          users = users.where(
            "LOWER(username) LIKE :query OR LOWER(email) LIKE :query",
            query: query
          )
        end

        related_user_ids = Friendship
          .where("requester_id = :id OR receiver_id = :id", id: current_user.id)
          .pluck(:requester_id, :receiver_id)
          .flatten
          .uniq - [current_user.id]

        users = users.where.not(id: related_user_ids)
        users = users.order(:username).limit(10)

        render json: users.as_json(only: %i[id username email status])
      end

      def show
        if @user == current_user
          render json: @user.as_json(only: %i[id username email status created_at updated_at])
        else
          render json: @user.as_json(only: %i[id username status created_at updated_at])
        end
      end

      def update
        @user.update!(user_params)
        render json: @user.as_json(only: %i[id username email status created_at updated_at])
      end

      private

      def set_user
        @user = User.find(params[:id])
      end

      def authorize_self!
        return if @user == current_user

        render json: { error: "Zugriff verweigert" }, status: :forbidden
      end

      def user_params
        params.require(:user).permit(:username, :status)
      end
    end
  end
end
