# --- STAGE 1: Build Frontend ---
FROM node:20-alpine AS build-stage
WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ .
RUN npm run build

# --- STAGE 2: Setup Backend ---
FROM node:20-alpine
WORKDIR /app
COPY Backend/package*.json ./
RUN npm install --omit=dev
COPY Backend/ .

# Copy the build from Stage 1 to the Backend's public folder
COPY --from=build-stage /app/frontend/dist ./public 

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
