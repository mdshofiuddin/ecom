# Production Dockerfile for Express + React SPA
FROM node:20-alpine

WORKDIR /app

# Install native dependencies required by better-sqlite3 build
RUN apk add --no-cache python3 make g++

# Copy root package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy frontend package files and build React SPA
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

# Copy remaining server application code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start server
CMD ["node", "server.js"]
