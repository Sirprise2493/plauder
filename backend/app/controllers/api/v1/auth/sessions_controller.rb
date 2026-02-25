module Api
  module V1
    module Auth
      class SessionsController < BaseController
        skip_before_action :require_authentication!, only: [:create]

        def create
          email = params.dig(:user, :email).to_s.strip
          password = params.dig(:user, :password).to_s

          user = User.find_for_authentication(email: email)

          if Rails.env.development?
            Rails.logger.info("[AUTH DEBUG] sign_in attempt email=#{email.inspect}")
            Rails.logger.info("[AUTH DEBUG] user_found=#{user.present?}")
            Rails.logger.info("[AUTH DEBUG] password_valid=#{user.present? ? user.valid_password?(password) : false}")
          end

          if user&.valid_password?(password)
            sign_in(user)
            set_user_online!(user)

            render json: {
              message: "Login erfolgreich",
              user: user_payload(user.reload)
            }, status: :ok
          else
            render json: { error: "Ungültige E-Mail oder Passwort" }, status: :unauthorized
          end
        end

        def destroy
          if current_user
            user = current_user
            set_user_offline!(user)

            sign_out(user)
            render json: { message: "Logout erfolgreich" }, status: :ok
          else
            render json: { error: "Kein Benutzer eingeloggt" }, status: :unauthorized
          end
        end

        private

        def set_user_online!(user)
          user.update_column(:status, User.statuses[:online]) unless user.online?
        end

        def set_user_offline!(user)
          user.update_column(:status, User.statuses[:offline]) unless user.offline?
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
