FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE
ARG VITE_STAGING_GUARD
ARG VITE_STAGING_HOST_PREFIX

ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_STAGING_GUARD=$VITE_STAGING_GUARD
ENV VITE_STAGING_HOST_PREFIX=$VITE_STAGING_HOST_PREFIX

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.29-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
