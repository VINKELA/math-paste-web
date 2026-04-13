# Stage 1: Build the Angular App
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- THE NODE 20 SECURITY BYPASS ---
# Allows older Webpack versions in ngx-admin to compile using legacy OpenSSL algorithms
ENV NODE_OPTIONS=--openssl-legacy-provider

# Builds the app for production
RUN npm run build --configuration=production


# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the custom Angular routing config (to prevent 404s on page refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the finished production files into the Nginx server
COPY --from=builder /app/dist/math-paste-web /usr/share/nginx/html

EXPOSE 80