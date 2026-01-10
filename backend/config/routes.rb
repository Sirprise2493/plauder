Rails.application.routes.draw do
  devise_for :users,
             defaults: { format: :json },
             controllers: {
               sessions: "users/sessions",
               registrations: "users/registrations"
             }

  namespace :api, defaults: { format: :json } do
    get "current_user", to: "current_user#show"
  end
end
