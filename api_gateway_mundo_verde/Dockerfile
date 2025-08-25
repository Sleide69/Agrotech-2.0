FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

# Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY cliente-websocket.html ./cliente-websocket.html

EXPOSE 8088
CMD ["node", "dist/index.js"]
