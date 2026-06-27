FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ ./
COPY ["PESERTA(1).md", "./PESERTA(1).md"]

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
