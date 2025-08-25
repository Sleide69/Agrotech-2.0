# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_GATEWAY_URL
ARG VITE_WS_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DEV_AUTH_BYPASS
ENV VITE_GATEWAY_URL=${VITE_GATEWAY_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_DEV_AUTH_BYPASS=${VITE_DEV_AUTH_BYPASS}
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Etapa de runtime (vite preview)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
RUN npm i -g serve
EXPOSE 5173
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
