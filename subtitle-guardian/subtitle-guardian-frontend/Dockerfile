# Multi-stage build for Angular frontend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment configuration
ARG API_URL=http://localhost:3000/api
ARG STRIPE_PUBLISHABLE_KEY=pk_test_default

# Create environment file
RUN echo "export const environment = { \
  production: true, \
  apiUrl: '${API_URL}', \
  stripePublishableKey: '${STRIPE_PUBLISHABLE_KEY}' \
};" > src/environments/environment.prod.ts

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/subtitle-guardian-frontend /usr/share/nginx/html

# Copy SSL certificates (if available)
RUN mkdir -p /etc/nginx/ssl

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

