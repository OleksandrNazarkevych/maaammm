# --- Stage 1: Development & Builder ---
FROM node:18-bookworm AS development
WORKDIR /app

COPY package*.json ./
RUN npm install

# Копіюємо конфіги
COPY nest-cli.json ./
COPY tsconfig*.json ./
# Копіюємо весь код (для dev режиму це важливо)
COPY . .

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

RUN npx prisma generate --schema=apps/${SERVICE_NAME}/prisma/schema.prisma

# --- Stage 2: Production Build ---
FROM development AS builder
RUN npx nest build ${SERVICE_NAME}

# --- Stage 3: Production Run ---
FROM node:18-bookworm-slim AS production
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

RUN apt-get update && apt-get install -y openssl libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/${SERVICE_NAME} ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/${SERVICE_NAME}/prisma ./apps/${SERVICE_NAME}/prisma

RUN npx prisma generate --schema=apps/${SERVICE_NAME}/prisma/schema.prisma

CMD sh -c "npx prisma db push --schema=apps/${SERVICE_NAME}/prisma/schema.prisma && node dist/main.js"