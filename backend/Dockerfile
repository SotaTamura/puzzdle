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

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
