FROM ruby:4.0-alpine AS build

RUN apk add --no-cache build-base postgresql-dev yaml-dev

WORKDIR /app
COPY Gemfile Gemfile.lock* ./
RUN bundle config set --local without 'development test' && bundle install

COPY . .

FROM ruby:4.0-alpine

RUN apk add --no-cache libpq tzdata

WORKDIR /app
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app .

ENV RAILS_ENV=production
EXPOSE 8080

# Entrypoint script to run migrations before starting the server
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo 'bundle exec rails db:migrate' >> /app/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
