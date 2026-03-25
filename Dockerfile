# Build stage for Tailwind CSS
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files and content for Tailwind to scan
COPY tailwind.config.js ./
COPY src ./src
COPY index.html ./
COPY impressum.html ./
COPY script.js ./

# Build CSS
RUN npm run build

# Production stage with Nginx
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY index.html /usr/share/nginx/html/
COPY impressum.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Copy built CSS from builder stage
COPY --from=builder /app/dist/output.css /usr/share/nginx/html/dist/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]