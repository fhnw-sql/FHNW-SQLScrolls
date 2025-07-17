# backend/api/Dockerfile
FROM node:20-slim

## Set Port
ENV PORT=4001

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY backend/api/package*.json ./

# Production
RUN npm ci --only=production

# Bundle the API source
COPY backend/api ./

# Expose and start
EXPOSE 4001
CMD ["node", "server.js"]
