# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and public assets
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install MySQL client
RUN apk add --no-cache mysql-client bash

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Create necessary directories
RUN mkdir -p /app/backups /app/logs

# Copy built files and public assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Make backup script executable
RUN chmod +x /app/server/scripts/backup.sh

# Set environment variables
ENV DB_HOST=db \
    DB_USER=root \
    DB_PASSWORD=password123 \
    DB_NAME=hospital_db \
    JWT_SECRET=your_jwt_secret

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server/index.js"]