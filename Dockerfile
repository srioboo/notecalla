# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: runtime
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "build"]
