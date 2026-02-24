Rails.application.routes.draw do
  devise_for :users, skip: [:sessions, :registrations]

  namespace :api do
    namespace :v1 do

      root to: "home#index"
      get :home, to: "home#index"

      namespace :auth do
        post   :sign_up,  to: "registrations#create"
        post   :sign_in,  to: "sessions#create"
        delete :sign_out, to: "sessions#destroy"
      end

      get :me, to: "me#show"

      resources :users, only: %i[index show update]
      resources :friendships

      resources :chats do
        resources :chat_memberships, only: %i[index create destroy]
        resources :messages, only: %i[index create]
        resources :calls, only: %i[index create]
      end

      resources :messages, only: %i[show update destroy] do
        resources :message_attachments, only: %i[index create show update destroy]
        resource  :message_ai_correction, only: %i[show create update destroy]
        resources :message_warnings, only: %i[index create show update destroy]
      end

      resources :calls, only: %i[show update] do
        resources :call_participants, only: %i[index create show update destroy]
      end
    end
  end
end
