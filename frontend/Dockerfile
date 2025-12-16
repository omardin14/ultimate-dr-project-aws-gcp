# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:8001
ARG VITE_DR_API_URL=http://localhost:9001
ARG VITE_BALANCE_API_URL=http://localhost:8003
ARG VITE_BARCODE_API_URL=http://localhost:8002
ARG VITE_DR_BARCODE_API_URL=http://localhost:9002
ARG VITE_FORCE_DR_MODE=false

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DR_API_URL=$VITE_DR_API_URL
ENV VITE_BALANCE_API_URL=$VITE_BALANCE_API_URL
ENV VITE_BARCODE_API_URL=$VITE_BARCODE_API_URL
ENV VITE_DR_BARCODE_API_URL=$VITE_DR_BARCODE_API_URL
ENV VITE_FORCE_DR_MODE=$VITE_FORCE_DR_MODE

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

