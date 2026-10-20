# Production Dockerfile for Express + React SPA using Debian glibc
FROM node:20-slim

WORKDIR /app

# Install native compilation dependencies for Debian
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy root dependencies and install production packages
COPY package*.json ./
RUN npm install --omit=dev

# Copy entire project including pre-built frontend/dist
COPY . .

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["node", "server.js"]
