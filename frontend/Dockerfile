FROM oven/bun:1 AS build

WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN bun run build

FROM node:22-alpine

WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json .

EXPOSE 3000
CMD ["node", "node_modules/@react-router/serve/bin.js", "build/server/index.js"]
