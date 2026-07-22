FROM node:22-alpine AS build

ARG VITE_POCKETBASE_IP=127.0.0.1
ARG VITE_POCKETBASE_PUBLIC_URL=http://127.0.0.1:8090

ENV VITE_POCKETBASE_IP=${VITE_POCKETBASE_IP}
ENV VITE_POCKETBASE_PUBLIC_URL=${VITE_POCKETBASE_PUBLIC_URL}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/build ./build
COPY --from=build /app/setup-pb.mjs ./setup-pb.mjs
COPY --from=build /app/src/lib/config.js ./src/lib/config.js

RUN npm ci --omit=dev

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "build"]
