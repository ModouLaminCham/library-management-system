# Use Node.js 18 as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Allow the backend API URL to be set at build time. Vite inlines
# import.meta.env.* values into the static bundle at build time, so this
# must be a build arg (not a runtime container env var) for it to take effect.
# Pass it via `docker compose build --build-arg` or docker-compose.yml's
# build.args (see docker-compose.yml).
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build

# Install serve to serve the built application
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the application
CMD ["serve", "-s", "dist", "-l", "3000"]