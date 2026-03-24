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
          .where(friendship_status: %i[pending accepted blocked], active: true)
          .pluck(:requester_id, :receiver_id)
          .flatten
          .uniq - [current_user.id]

        users = users.where.not(id: related_user_ids)
        users = users.order(Arel.sql("LOWER(username) ASC, LOWER(email) ASC")).limit(10)

        render json: users.map { |user|
          {
            id: user.id,
            email: user.email,
            username: user.username,
            status: user.status,
            avatar_url: avatar_url_for(user)
          }
        }
      end

      def show
        if @user == current_user
          render json: { user: user_payload(@user) }
        else
          render json: { user: public_user_payload(@user) }
        end
      end

      def update
        @user.update!(user_params)
        render json: { user: user_payload(@user.reload) }
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
        params.require(:user).permit(:username, :status, :avatar)
      end
    end
  end
end
