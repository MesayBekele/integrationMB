# 🚀 Simple E2E Framework Setup Guide

This guide will help you set up the simple E2E automation testing framework on your local machine.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **Git**: Latest version

### Browser Requirements
- **Chrome**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Edge**: Version 90+

## 🚀 Quick Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd simple-e2e-framework
npm install
```

### 2. Verify Installation
```bash
# Verify Cypress installation
npx cypress verify

# Check Cypress info
npx cypress info
```

### 3. Configure Environments
Update the configuration files in the `config/` directory:

**config/dev.json**
```json
{
  "baseUrl": "https://your-dev-site.com",
  "timeout": 10000,
  "users": {
    "admin": {
      "username": "your_admin_username",
      "password": "your_admin_password"
    },
    "user": {
      "username": "your_user_username",
      "password": "your_user_password"
    }
  }
}
```

**config/qa.json**
```json
{
  "baseUrl": "https://your-qa-site.com",
  "timeout": 15000,
  "users": {
    "admin": {
      "username": "qa_admin_username",
      "password": "qa_admin_password"
    },
    "user": {
      "username": "qa_user_username",
      "password": "qa_user_password"
    }
  }
}
```

**config/uat.json**
```json
{
  "baseUrl": "https://your-uat-site.com",
  "timeout": 15000,
  "users": {
    "admin": {
      "username": "uat_admin_username",
      "password": "uat_admin_password"
    },
    "user": {
      "username": "uat_user_username",
      "password": "uat_user_password"
    }
  }
}
```

### 4. Run Your First Test
```bash
# Open Cypress Test Runner
npm run cy:open

# Or run tests headlessly
npm run test:smoke
```

## 🔧 Configuration Options

### Environment Variables
You can set environment variables to override defaults:

```bash
# Set environment
export CYPRESS_ENV=qa

# Set browser
export CYPRESS_BROWSER=firefox

# Set tags
export CYPRESS_TAGS="@regression"
```

### Cypress Configuration
The main configuration is in `cypress.config.js`. Key settings:

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://example.com',        // Default base URL
    viewportWidth: 1280,                   // Browser width
    viewportHeight: 720,                   // Browser height
    defaultCommandTimeout: 10000,         // Command timeout
    pageLoadTimeout: 30000,               // Page load timeout
    video: true,                          // Record videos
    screenshotOnRunFailure: true,         // Screenshots on failure
  }
});
```

## 🧪 Running Tests

### Interactive Mode
```bash
# Open Cypress Test Runner
npm run cy:open
```

### Headless Mode
```bash
# Run all tests
npm run cy:run

# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run UI tests
npm run test:ui
```

### Environment-Specific Testing
```bash
# Test in development
npm run test:dev

# Test in QA
npm run test:qa

# Test in UAT
npm run test:uat
```

### Browser-Specific Testing
```bash
# Chrome (default)
npm run cy:run:chrome

# Firefox
npm run cy:run:firefox

# Edge
npm run cy:run:edge
```

### Custom Test Execution
```bash
# Run with specific tags
node scripts/run-tagged-tests.js --tags "@smoke" --env dev

# Run with specific browser
node scripts/run-tagged-tests.js --tags "@ui" --browser firefox

# Run in headed mode
node scripts/run-tagged-tests.js --tags "@smoke" --headed

# Run specific feature file
node scripts/run-tagged-tests.js --spec "cypress/e2e/features/examples/login.feature"
```

## 📊 Generating Reports

### Generate HTML Reports
```bash
# Generate reports
npm run report:generate

# Open reports in browser
npm run report:open
```

### Report Location
Reports are generated in:
- `reports/html/index.html` - Main HTML report
- `reports/temp/` - Raw test results
- `cypress/screenshots/` - Test screenshots
- `cypress/videos/` - Test videos

## 🔄 Jenkins Setup

### Prerequisites
- Jenkins server with Node.js plugin
- Git access to your repository

### Setup Steps

1. **Install Jenkins Plugins**
   - NodeJS Plugin
   - Pipeline Plugin
   - HTML Publisher Plugin

2. **Configure Node.js**
   - Go to Manage Jenkins > Global Tool Configuration
   - Add Node.js installation (version 16+)

3. **Create Pipeline Job**
   - New Item > Pipeline
   - Use the provided `Jenkinsfile`
   - Configure parameters as needed

4. **Run Pipeline**
   - Select environment, browser, and tags
   - Execute build
   - View reports in build artifacts

### Jenkins Parameters
- **Environment**: dev, qa, uat
- **Browser**: chrome, firefox, edge
- **Tags**: @smoke, @regression, @ui, etc.
- **Headless Mode**: true/false

## 🐳 Docker Setup (Optional)

### Create Dockerfile
```dockerfile
FROM cypress/browsers:node16.14.2-slim-chrome103-ff102

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "test:smoke"]
```

### Build and Run
```bash
# Build Docker image
docker build -t simple-e2e-tests .

# Run tests in container
docker run --rm simple-e2e-tests

# Run with environment variables
docker run --rm -e CYPRESS_ENV=qa simple-e2e-tests
```

## 🔍 Troubleshooting

### Common Issues

#### Cypress Installation Problems
```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall Cypress
npm uninstall cypress
npm install cypress

# Verify installation
npx cypress verify
```

#### Browser Issues
```bash
# Install missing dependencies (Linux)
sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2

# For headless mode issues
export DISPLAY=:99
Xvfb :99 -screen 0 1280x720x16 &
```

#### Configuration Issues
```bash
# Check configuration files
cat config/dev.json

# Verify environment loading
npm run cy:open
# Check the Settings tab in Cypress
```

#### Test Execution Issues
```bash
# Run with debug output
DEBUG=cypress:* npm run cy:run

# Check for syntax errors
npx cypress run --spec "cypress/e2e/features/examples/login.feature"
```

### Debug Mode
```bash
# Enable Cypress debug mode
DEBUG=cypress:* npm run cy:run

# Enable specific debug categories
DEBUG=cypress:server:* npm run cy:run
```

## 📝 Writing Your First Test

### 1. Create Feature File
Create `cypress/e2e/features/my-feature.feature`:

```gherkin
@smoke @ui
Feature: My Feature
  As a user
  I want to test my feature
  So that I can ensure it works

  @critical
  Scenario: Basic functionality
    Given I am on the home page
    When I click the "Get Started" button
    Then I should see the welcome message
```

### 2. Create Step Definitions
Create `cypress/support/step_definitions/my_steps.js`:

```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the home page', () => {
  cy.visit('/');
});

When('I click the {string} button', (buttonText) => {
  cy.contains('button', buttonText).click();
});

Then('I should see the welcome message', () => {
  cy.shouldBeVisible('[data-cy="welcome-message"]');
});
```

### 3. Run Your Test
```bash
# Run your specific feature
node scripts/run-tagged-tests.js --spec "cypress/e2e/features/my-feature.feature"

# Or run by tag
node scripts/run-tagged-tests.js --tags "@smoke"
```

## ✅ Validation Checklist

After setup, verify everything is working:

- [ ] Node.js and npm are installed
- [ ] Cypress opens successfully with `npm run cy:open`
- [ ] Environment configuration files are set up
- [ ] Sample tests run successfully with `npm run test:smoke`
- [ ] Reports are generated with `npm run report:generate`
- [ ] Jenkins pipeline works (if using CI/CD)

## 🆘 Getting Help

- **Documentation**: Check the `docs/` folder
- **Examples**: Review example tests in `cypress/e2e/features/examples/`
- **Issues**: Create an issue in the repository
- **Community**: Join the team Slack channel

Congratulations! Your simple E2E automation framework is now set up and ready to use. 🎉

