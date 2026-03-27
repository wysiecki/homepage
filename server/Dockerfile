FROM node:22-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY *.js ./
COPY public/ ./public/

RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "index.js"]
