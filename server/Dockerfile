FROM node:22-alpine

# better-sqlite3 requires native compilation tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy application files
COPY *.js ./
COPY public/ ./public/
COPY templates/ ./templates/

# Create data directories
RUN mkdir -p /data /app/data

EXPOSE 8002

CMD ["node", "index.js"]
