# --- Stage 1: Dependencies & Development ---
FROM node:18-bookworm AS development
WORKDIR /app

# 1. Встановлюємо залежності
COPY package*.json ./
RUN npm install

# 2. Конфіги Nest + TS
COPY nest-cli.json ./
COPY tsconfig*.json ./

# 3. Увесь код (monorepo)
COPY . .

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

# 4. Prisma client для конкретного сервісу
RUN npx prisma generate --schema=apps/${SERVICE_NAME}/prisma/schema.prisma

# --- Stage 2: Build (ВАЖЛИВО!) ---
FROM development AS builder

# ⬇⬇⬇ КЛЮЧОВА ЗМІНА ⬇⬇⬇
# НЕ будуємо окремий сервіс → Nest v11 monorepo bug
RUN npx nest build

# --- Stage 3: Production ---
FROM node:18-bookworm-slim AS production
WORKDIR /app

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

# Мінімальні залежності для Prisma + TLS
RUN apt-get update \
 && apt-get install -y openssl libssl3 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# node_modules З builder (включно з @nestjs/jwt)
COPY --from=builder /app/node_modules ./node_modules

# ТІЛЬКИ потрібний сервіс
COPY --from=builder /app/dist/apps/${SERVICE_NAME} ./dist/apps/${SERVICE_NAME}

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/${SERVICE_NAME}/prisma ./apps/${SERVICE_NAME}/prisma

# Prisma client в production
RUN npx prisma generate --schema=apps/${SERVICE_NAME}/prisma/schema.prisma

# ⬇⬇⬇ ФІКС шляхів ⬇⬇⬇
CMD sh -c "npx prisma db push --schema=apps/${SERVICE_NAME}/prisma/schema.prisma && node dist/apps/${SERVICE_NAME}/main.js"
