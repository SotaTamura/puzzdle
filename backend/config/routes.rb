Rails.application.routes.draw do
  namespace :api do
    get "health", to: "health#show"
    scope :wordle do
      get "today", to: "wordle#today"
      post "guess", to: "wordle#guess"
      post "scores", to: "wordle#submit_score"
      get "scores", to: "wordle#scores"
    end
  end
end
