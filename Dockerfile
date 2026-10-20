FROM node:22-slim

WORKDIR /app

# Native compilation tools if needed by any package
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Build frontend React SPA production bundle
RUN cd frontend && npm install && npm run build

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["node", "server.js"]
