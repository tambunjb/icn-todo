FROM node:20-alpine AS builder
WORKDIR /web
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=/api
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /web/dist /usr/share/nginx/html
EXPOSE 3334
CMD ["nginx", "-g", "daemon off;"]