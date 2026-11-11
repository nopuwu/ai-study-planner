# Obraz frontendu (React + Vite, serwer deweloperski). Kontekst budowania: katalog główny repozytorium.
FROM node:22-slim

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
