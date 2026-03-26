Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("SERVICE_URL_FRONTEND", "http://localhost:5173,http://localhost:3000").split(",")
    resource "*",
      headers: :any,
      methods: [:get, :post, :options],
      credentials: true
  end
end
