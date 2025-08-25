FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Instalar dependencias (incluyendo dev para ts-node en runtime)
COPY package*.json ./
RUN npm ci --include=dev

# Copiar el código
COPY . .

# Variables por defecto
ENV NODE_ENV=production \
    PORT=3000 \
    TS_NODE_TRANSPILE_ONLY=1

EXPOSE 3000

# Iniciar usando ts-node directamente
CMD ["npx", "ts-node", "src/app.ts"]
