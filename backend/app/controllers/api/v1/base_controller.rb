module Api
  module V1
    class BaseController < ApplicationController
      include Rails.application.routes.url_helpers

      before_action :require_authentication!

      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity
      rescue_from ActionController::ParameterMissing, with: :render_bad_request

      protected

      def require_authentication!
        return if user_signed_in?

        render json: { errors: ["Nicht authentifiziert"] }, status: :unauthorized
      end

      def ensure_chat_member!(chat)
        return if chat.chat_memberships.exists?(user_id: current_user.id)

        render json: { errors: ["Zugriff verweigert: kein Chat-Mitglied"] }, status: :forbidden
      end

      def avatar_url_for(user)
        return nil unless user.avatar.attached?

        rails_blob_url(user.avatar)
      end

      def user_payload(user)
        {
          id: user.id,
          email: user.email,
          username: user.username,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          avatar_url: avatar_url_for(user)
        }
      end

      def public_user_payload(user)
        {
          id: user.id,
          username: user.username,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          avatar_url: avatar_url_for(user)
        }
      end

      private

      def render_not_found(error)
        render json: { errors: [error.message] }, status: :not_found
      end

      def render_unprocessable_entity(error)
        render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
      end

      def render_bad_request(error)
        render json: { errors: [error.message] }, status: :bad_request
      end
    end
  end
end
