# Step 1: Build 프론트엔드
FROM node:18 as build
WORKDIR /app
COPY talktalkcare/package*.json ./
RUN npm ci
COPY talktalkcare/ ./
RUN npm run build

# Step 2: Nginx에서 정적 파일 서빙
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]