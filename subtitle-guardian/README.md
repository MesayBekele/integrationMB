# 🎬 Subtitle Guardian

**Safe movie watching for families** - AI-powered content analysis of movies and TV shows through subtitle screening.

## 📋 Overview

Subtitle Guardian is a mobile-first web application that helps parents screen movies and TV shows for inappropriate content by analyzing subtitles using AI. The app provides detailed content warnings, age recommendations, and discussion guides to facilitate meaningful conversations between parents and children.

## ✨ Key Features

### 🎯 Content Analysis
- **AI-Powered Screening**: Advanced content detection using AWS Comprehend and OpenAI
- **Customizable Topics**: Screen for violence, sexual content, profanity, religion, LGBTQ+ themes, and more
- **Custom Keywords**: Add your own words and phrases to monitor
- **Detailed Scoring**: Get severity ratings and confidence scores for each topic
- **Flagged Excerpts**: See specific examples of concerning content with context

### 📊 Smart Recommendations
- **Age Ratings**: AI-generated age recommendations based on content analysis
- **Overall Safety Score**: Comprehensive rating from 1-10 for quick decision making
- **Content Statistics**: Detailed breakdown of analysis results

### 💬 Discussion Guides
- **1000-Word Summaries**: Comprehensive discussion guides for post-viewing conversations
- **Age-Appropriate Questions**: Tailored discussion points for different age groups
- **Theme Analysis**: Deep dive into movie themes and messages
- **Parental Guidance**: Before, during, and after watching recommendations

### 💳 Flexible Pricing
- **Free Tier**: 5 movie analyses per month
- **Premium**: $4.99/month for unlimited analyses and advanced features

## 🏗️ Technical Architecture

### Frontend (Angular 18)
- **Mobile-First Design**: Responsive UI optimized for all devices
- **Progressive Web App**: Fast, reliable, and engaging user experience
- **Real-Time Updates**: Live analysis progress tracking
- **Offline Support**: Cache results for offline viewing

### Backend (Node.js + Express)
- **RESTful API**: Clean, documented API endpoints
- **TypeScript**: Type-safe development with comprehensive interfaces
- **JWT Authentication**: Secure user authentication and session management
- **Rate Limiting**: API protection and usage monitoring

### AWS Infrastructure
- **DynamoDB**: Scalable NoSQL database for user data and analysis results
- **S3**: Secure storage for subtitle files and cached data
- **Comprehend**: AI-powered sentiment analysis and entity detection
- **Lambda**: Serverless functions for background processing
- **CloudWatch**: Monitoring and logging

### External Integrations
- **OpenSubtitles API**: Comprehensive subtitle database
- **TMDB/OMDB**: Movie metadata and poster images
- **OpenAI GPT-4**: Advanced content analysis and summary generation
- **Stripe**: Secure payment processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- AWS Account with configured credentials
- OpenAI API key
- Stripe account (for payments)
- OpenSubtitles API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/subtitle-guardian.git
   cd subtitle-guardian
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../subtitle-guardian-frontend
   npm install
   npm start
   ```

4. **Environment Configuration**
   
   **Backend (.env)**:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-jwt-secret
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   DYNAMODB_TABLE_PREFIX=subtitle-guardian
   
   # External APIs
   OPENAI_API_KEY=your-openai-api-key
   OPENSUBTITLES_API_KEY=your-opensubtitles-key
   TMDB_API_KEY=your-tmdb-api-key
   
   # Stripe
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-webhook-secret
   ```

   **Frontend (environment.ts)**:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
     stripePublishableKey: 'pk_test_your_stripe_key'
   };
   ```

### Database Setup

The application uses DynamoDB with the following tables:
- `users` - User accounts and subscription data
- `movies` - Movie metadata and subtitle information
- `analyses` - Analysis results and history
- `subscriptions` - Stripe subscription management

Tables are created automatically on first run.

## 📱 Usage

### For Parents

1. **Search for Content**: Find movies or TV shows you want to screen
2. **Select Topics**: Choose what content to look for (violence, language, etc.)
3. **Get Analysis**: Receive detailed content warnings and age recommendations
4. **Discussion Guide**: Use the 1000-word summary to discuss themes with your kids

### For Developers

The API provides comprehensive endpoints for:
- Movie search and metadata
- Content analysis and results
- User management and subscriptions
- Payment processing

See the [API Documentation](./docs/api.md) for detailed endpoint information.

## 🔒 Security & Privacy

- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Privacy First**: No personal viewing data stored beyond analysis results
- **GDPR Compliant**: User data deletion and export capabilities
- **Rate Limiting**: API protection against abuse

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd ../subtitle-guardian-frontend
npm test
npm run e2e
```

## 📈 Deployment

### Production Deployment

1. **AWS Infrastructure**
   ```bash
   # Deploy using AWS CDK or CloudFormation
   cd infrastructure
   npm run deploy
   ```

2. **Backend Deployment**
   ```bash
   cd backend
   npm run build
   npm run deploy
   ```

3. **Frontend Deployment**
   ```bash
   cd subtitle-guardian-frontend
   npm run build
   # Deploy to S3 + CloudFront or Vercel
   ```

### Environment Variables for Production

Ensure all production environment variables are configured:
- Database connection strings
- API keys for external services
- Stripe live keys
- AWS production credentials

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards

- TypeScript for type safety
- ESLint + Prettier for code formatting
- Comprehensive test coverage
- Clear commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/subtitle-guardian/issues)
- **Email**: support@subtitleguardian.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core content analysis
- ✅ Basic subscription model
- ✅ Mobile-responsive UI

### Phase 2 (Q2 2024)
- 🔄 Advanced AI analysis
- 🔄 Parental controls dashboard
- 🔄 Family profiles

### Phase 3 (Q3 2024)
- 📋 Browser extensions
- 📋 Smart TV integration
- 📋 Educational institution licensing

### Phase 4 (Q4 2024)
- 📋 Multi-language support
- 📋 Community ratings
- 📋 Advanced analytics

## 📊 Business Model

### Revenue Streams
1. **Freemium Subscriptions**: $4.99/month premium tier
2. **B2B Licensing**: Schools and educational institutions
3. **API Licensing**: Third-party integrations
4. **White-Label Solutions**: Custom implementations

### Target Market
- **Primary**: Parents with children aged 5-17
- **Secondary**: Schools and educational institutions
- **Tertiary**: Content creators and streaming platforms

## 🏆 Competitive Advantages

1. **AI-Powered Analysis**: More accurate than keyword-based filtering
2. **Discussion Guides**: Unique 1000-word summaries for family conversations
3. **Mobile-First**: Optimized for modern parent workflows
4. **Comprehensive Coverage**: Movies, TV shows, and streaming content
5. **Privacy-Focused**: No tracking of actual viewing habits

---

**Built with ❤️ for families who want to make informed viewing decisions together.**

