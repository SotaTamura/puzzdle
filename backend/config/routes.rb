Rails.application.routes.draw do
  namespace :api do
    get "health", to: "health#show"
    get "puzzle/today", to: "puzzle#today"
  end
end
