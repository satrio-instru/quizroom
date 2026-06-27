FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# Copy backend source
COPY backend/ ./

# Copy participant file (relative to Docker context = repo root)
COPY "PESERTA(1).md" ./PESERTA(1).md

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
