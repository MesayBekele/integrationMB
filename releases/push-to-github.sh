#!/bin/bash

echo "🚀 Subtitle Guardian - GitHub Push Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d "backend" ] || [ ! -d "subtitle-guardian-frontend" ]; then
    echo "❌ Error: Please run this script from the subtitle-guardian project root directory"
    echo "Expected files: docker-compose.yml, backend/, subtitle-guardian-frontend/"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -m main
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    echo "Please enter your GitHub username:"
    read -r GITHUB_USERNAME
    git remote add origin "https://github.com/${GITHUB_USERNAME}/subtitle-guardian.git"
fi

# Configure git user if not set
if [ -z "$(git config user.name)" ]; then
    echo "👤 Setting up git user..."
    echo "Please enter your name:"
    read -r USER_NAME
    echo "Please enter your email:"
    read -r USER_EMAIL
    git config user.name "$USER_NAME"
    git config user.email "$USER_EMAIL"
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit. Repository is up to date."
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "Initial commit: Subtitle Guardian - AI-powered content analysis app

- Complete mobile-first Angular 18 frontend
- Node.js/Express backend with TypeScript  
- AI content analysis using OpenAI + AWS Comprehend
- Stripe payment integration for subscriptions
- Docker containerization with multi-stage builds
- AWS infrastructure with Terraform
- GitHub Actions CI/CD pipeline
- Comprehensive documentation and deployment guides
- Production-ready security and monitoring setup

Features:
- Movie/TV show search with subtitle analysis
- Customizable content filtering (violence, language, themes)
- Age recommendations and safety scores
- 1000-word family discussion guides
- Freemium model with premium subscriptions
- Mobile-optimized responsive design"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Your code has been pushed to GitHub!"
    echo ""
    echo "🔗 Repository URL: $(git remote get-url origin | sed 's/\.git$//')"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Set up your API keys in .env.staging"
    echo "3. Deploy locally: ./deployment/deploy.sh staging"
    echo "4. Deploy to AWS for production"
    echo ""
    echo "🎬 Your Subtitle Guardian app is ready to go live!"
else
    echo ""
    echo "❌ Push failed. This might be due to:"
    echo "1. Authentication issues - make sure you're logged into GitHub"
    echo "2. Repository doesn't exist - create it on GitHub first"
    echo "3. Permission issues - make sure you own the repository"
    echo ""
    echo "💡 Try running: gh auth login"
    echo "Or push manually with: git push -u origin main"
fi