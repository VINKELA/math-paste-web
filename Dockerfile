# Stage 1: Build the Angular App
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Builds the app for production
# Allow legacy OpenSSL algorithms for older Webpack builds
ENV NODE_OPTIONS=--openssl-legacy-provider
# Builds the app for production
RUN npm run build --configuration=production
# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy our custom routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built files (Change 'your-angular-app-name' to your actual project name!)
# Note: If you are using Angular 17+, the path is usually /app/dist/your-app-name/browser
COPY --from=builder /app/dist/your-angular-app-name /usr/share/nginx/html
EXPOSE 80