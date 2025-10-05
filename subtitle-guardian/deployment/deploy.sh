#!/bin/bash

# Subtitle Guardian Deployment Script
# This script handles the deployment of the Subtitle Guardian application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-us-east-1}
APP_NAME="subtitle-guardian"

echo -e "${BLUE}🚀 Starting deployment of Subtitle Guardian to ${ENVIRONMENT}${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        print_error "Environment file .env.${ENVIRONMENT} not found."
        exit 1
    fi
    
    print_status "Prerequisites check completed"
}

# Load environment variables
load_environment() {
    echo -e "${BLUE}📋 Loading environment variables...${NC}"
    
    # Load environment-specific variables
    if [ -f ".env.${ENVIRONMENT}" ]; then
        export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
        print_status "Environment variables loaded from .env.${ENVIRONMENT}"
    fi
}

# Build and deploy with Docker Compose
deploy_with_docker_compose() {
    echo -e "${BLUE}🐳 Deploying with Docker Compose...${NC}"
    
    # Build and start services
    docker-compose -f docker-compose.yml up -d --build
    
    print_status "Application deployed with Docker Compose"
}

# Health check
health_check() {
    echo -e "${BLUE}🏥 Performing health check...${NC}"
    
    # Wait for services to start
    echo "Waiting for services to start..."
    sleep 30
    
    # Check backend health
    if curl -f "http://localhost:3000/health" > /dev/null 2>&1; then
        print_status "Backend health check passed"
    else
        print_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend health
    if curl -f "http://localhost:80/health" > /dev/null 2>&1; then
        print_status "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        exit 1
    fi
    
    echo -e "${GREEN}🎉 Application is healthy and accessible at: http://localhost${NC}"
}

# Main deployment flow
main() {
    echo -e "${BLUE}🎬 Subtitle Guardian Deployment${NC}"
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo ""
    
    check_prerequisites
    load_environment
    deploy_with_docker_compose
    health_check
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}Your Subtitle Guardian application is now running at http://localhost${NC}"
}

# Handle script arguments
case "${1}" in
    "staging"|"production"|"")
        main
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [staging|production]"
        echo ""
        echo "This script deploys the Subtitle Guardian application locally with Docker."
        echo ""
        echo "Prerequisites:"
        echo "  - Docker installed and running"
        echo "  - Environment file (.env.staging or .env.production)"
        echo ""
        echo "Examples:"
        echo "  $0 staging    # Deploy to staging environment"
        echo "  $0 production # Deploy to production environment"
        ;;
    *)
        print_error "Invalid environment. Use 'staging' or 'production'"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac
