# --- STAGE 1: Build the React Frontend (Vite) ---
FROM node:20-alpine AS build-stage
WORKDIR /app/frontend

# Copy package files first
COPY Frontend/package*.json ./
RUN npm install

# Copy the rest of the Frontend code
COPY Frontend/ .

# Build the project (Vite output goes to 'dist')
RUN npm run build

# --- STAGE 2: Setup the Node.js Backend ---
FROM node:20-alpine
WORKDIR /app

# Copy Backend package files and install production dependencies
COPY Backend/package*.json ./
RUN npm install --omit=dev

# Copy the Backend source code
COPY Backend/ .

# Copy the built Frontend files into the Backend's 'public' folder
COPY --from=build-stage /app/frontend/dist ./public 

# Set Port for Google Cloud Run
ENV PORT=8080
EXPOSE 8080

# Start the server using index.js
CMD ["node", "index.js"]
