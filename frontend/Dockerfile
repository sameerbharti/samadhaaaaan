# Multi-stage build
# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and build the app
RUN npm ci && npm run build

# Stage 2: Serve the app with nginx
FROM nginx:alpine

# Copy the build output to nginx's default directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]