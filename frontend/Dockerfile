FROM node:18 as build
WORKDIR /app
# talktalkcare 디렉토리의 내용을 복사
COPY dabeen/talktalkcare/package*.json ./
RUN npm ci
COPY dabeen/talktalkcare/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]