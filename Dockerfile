# Multi-stage Dockerfile for Cypress E2E Testing

# Base image with Node.js and Cypress dependencies
FROM cypress/included:13.17.0 as cypress-base

# Set working directory
WORKDIR /app

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Create reports directory
RUN mkdir -p reports/json reports/html

# Set environment variables
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress
ENV NODE_ENV=test

# Verify Cypress installation
RUN npx cypress verify

# Production stage
FROM cypress-base as production

# Set default environment
ENV CYPRESS_ENV=dev

# Expose port for potential web server
EXPOSE 3000

# Default command
CMD ["npm", "run", "test:headless"]

# Development stage with additional tools
FROM cypress-base as development

# Install development dependencies
RUN npm ci && npm cache clean --force

# Install additional development tools
RUN npm install -g nodemon concurrently

# Set development environment
ENV NODE_ENV=development
ENV CYPRESS_ENV=dev

# Command for development
CMD ["npm", "run", "test:dev"]

# CI stage optimized for CI/CD pipelines
FROM cypress-base as ci

# Set CI environment variables
ENV CI=true
ENV CYPRESS_ENV=qa

# Copy CI-specific configuration
COPY .github/ .github/
COPY scripts/ scripts/

# Make scripts executable
RUN chmod +x scripts/*.sh

# Default command for CI
CMD ["npm", "run", "test:ci"]

