FROM node:18-bookworm AS development
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY . .

RUN npm run build api-gateway

FROM node:18-bookworm-slim AS production
WORKDIR /app

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/dist/apps/api-gateway ./dist
COPY --from=development /app/package*.json ./

CMD ["node", "dist/main.js"]