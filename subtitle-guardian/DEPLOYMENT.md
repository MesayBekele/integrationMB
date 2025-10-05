# 🚀 Subtitle Guardian Deployment Guide

This guide covers deploying the Subtitle Guardian application in various environments.

## 📋 Prerequisites

### Required Software
- **Docker** (v20.10+) and Docker Compose
- **Node.js** (v18+) and npm
- **AWS CLI** (v2+) configured with appropriate permissions
- **Git** for version control

### Required Accounts & API Keys
- **AWS Account** with the following services enabled:
  - DynamoDB
  - S3
  - Comprehend
  - Lambda (optional)
  - ECS (for production deployment)
- **OpenAI API Key** for content analysis
- **OpenSubtitles API Key** for subtitle retrieval
- **TMDB API Key** for movie metadata
- **Stripe Account** for payment processing

## 🏗️ Deployment Options

### Option 1: Local Development with Docker Compose (Recommended for Testing)

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd subtitle-guardian
   ```

2. **Configure Environment**
   ```bash
   # Copy and edit environment file
   cp .env.example .env.staging
   # Edit .env.staging with your API keys and configuration
   ```

3. **Deploy**
   ```bash
   ./deployment/deploy.sh staging
   ```

4. **Access Application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

### Option 2: AWS ECS Production Deployment

1. **Setup AWS Infrastructure**
   ```bash
   cd deployment/terraform
   terraform init
   terraform plan -var="environment=production"
   terraform apply -var="environment=production"
   ```

2. **Configure Production Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

3. **Deploy to AWS**
   ```bash
   # Build and push Docker images to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Deploy using the full deployment script
   ./deployment/deploy.sh production
   ```

### Option 3: GitHub Actions CI/CD

1. **Setup GitHub Secrets**
   Add the following secrets to your GitHub repository:
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   OPENAI_API_KEY
   STRIPE_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY
   API_URL
   ```

2. **Push to Main Branch**
   ```bash
   git push origin main
   ```

3. **Monitor Deployment**
   Check the Actions tab in your GitHub repository for deployment status.

## 🔧 Configuration

### Environment Variables

#### Required Variables
```bash
# Backend
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret

# AWS
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1

# APIs
OPENAI_API_KEY=sk-your-openai-key
OPENSUBTITLES_API_KEY=your-opensubtitles-key
TMDB_API_KEY=your-tmdb-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
```

#### Optional Variables
```bash
# Logging
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Features
ENABLE_ANALYTICS=true
ENABLE_CACHING=true
```

### AWS Permissions

Your AWS user/role needs the following permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:*",
        "s3:*",
        "comprehend:*",
        "ecs:*",
        "ecr:*",
        "elbv2:*",
        "ec2:*",
        "iam:PassRole",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🗄️ Database Setup

### DynamoDB Tables

The application creates the following DynamoDB tables:
- `subtitle-guardian-users` - User accounts and subscriptions
- `subtitle-guardian-movies` - Movie metadata and subtitle info
- `subtitle-guardian-analyses` - Analysis results and history

Tables are created automatically on first deployment.

### Data Migration

For production deployments:
1. Export data from staging: `aws dynamodb scan --table-name subtitle-guardian-staging-users`
2. Import to production: `aws dynamodb put-item --table-name subtitle-guardian-prod-users`

## 🔒 Security Considerations

### SSL/TLS Setup

For production deployments:
1. Obtain SSL certificates (Let's Encrypt recommended)
2. Update nginx configuration to enable HTTPS
3. Configure domain DNS to point to your load balancer

### Secrets Management

- Use AWS Secrets Manager for production secrets
- Never commit API keys to version control
- Rotate secrets regularly
- Use IAM roles instead of access keys when possible

### Network Security

- Configure VPC with private subnets for database access
- Use security groups to restrict access
- Enable AWS WAF for additional protection
- Set up CloudWatch monitoring and alerts

## 📊 Monitoring & Logging

### Health Checks

The application provides health check endpoints:
- Backend: `/health`
- Frontend: `/health`

### Logging

Logs are available in:
- Docker Compose: `docker-compose logs -f`
- AWS ECS: CloudWatch Logs
- Local files: `./backend/logs/`

### Monitoring

Set up monitoring for:
- Application health and performance
- API response times
- Error rates
- Database performance
- Payment processing success rates

## 🚨 Troubleshooting

### Common Issues

1. **Docker Build Fails**
   ```bash
   # Clear Docker cache
   docker system prune -a
   # Rebuild images
   docker-compose build --no-cache
   ```

2. **API Keys Not Working**
   - Verify keys are correctly set in environment files
   - Check API key permissions and quotas
   - Ensure keys are for the correct environment (test vs production)

3. **Database Connection Issues**
   - Verify AWS credentials and permissions
   - Check DynamoDB table names and regions
   - Ensure VPC configuration allows database access

4. **Payment Processing Fails**
   - Verify Stripe keys match the environment
   - Check webhook endpoints are accessible
   - Ensure webhook secrets are correctly configured

### Logs and Debugging

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps

# Access container shell
docker-compose exec backend sh
```

## 🔄 Updates and Maintenance

### Updating the Application

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Rebuild and Deploy**
   ```bash
   ./deployment/deploy.sh production
   ```

3. **Verify Deployment**
   ```bash
   curl -f http://your-domain.com/health
   ```

### Database Maintenance

- Monitor DynamoDB usage and costs
- Set up automated backups
- Review and optimize table indexes
- Clean up old analysis data periodically

### Security Updates

- Regularly update Docker base images
- Keep dependencies up to date
- Monitor security advisories
- Rotate API keys and secrets

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify configuration and environment variables
4. Contact support with specific error messages and logs

---

**Happy Deploying! 🎉**

