module Api
  module V1
    module Auth
      class RegistrationsController < BaseController
        skip_before_action :require_authentication!, only: [:create]

        def create
          user = User.new(sign_up_params)

          if user.save
            sign_in(user)
            render json: {
              message: "Registrierung erfolgreich",
              user: user_payload(user)
            }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def sign_up_params
          params.require(:user).permit(
            :email,
            :password,
            :password_confirmation,
            :username,
            :status
          )
        end

        def user_payload(user)
          {
            id: user.id,
            email: user.email,
            username: user.username,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        end
      end
    end
  end
end
