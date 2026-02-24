module Api
  module V1
    module Auth
      class SessionsController < BaseController
        skip_before_action :require_authentication!, only: [:create]

        def create
          user = User.find_for_authentication(email: params.dig(:user, :email))

          if user&.valid_password?(params.dig(:user, :password))
            sign_in(user)
            render json: {
              message: "Login erfolgreich",
              user: user_payload(user)
            }, status: :ok
          else
            render json: { error: "Ungültige E-Mail oder Passwort" }, status: :unauthorized
          end
        end

        def destroy
          if current_user
            sign_out(current_user)
            render json: { message: "Logout erfolgreich" }, status: :ok
          else
            render json: { error: "Kein Benutzer eingeloggt" }, status: :unauthorized
          end
        end

        private

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
