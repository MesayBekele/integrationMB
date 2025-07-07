# 🚀 Cypress-Cucumber E2E Testing Framework

A comprehensive End-to-End automation testing framework built with **Cypress** and **Cucumber**, featuring advanced capabilities for enterprise-level testing.

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Testing Strategies](#-testing-strategies)
- [CI/CD Integration](#-cicd-integration)
- [Reporting](#-reporting)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

### 🎯 **Core Capabilities**
- **Cypress + Cucumber Integration** - BDD-style test writing with Gherkin syntax
- **Multi-Environment Support** - Dev, QA, UAT configurations
- **Tag-Based Execution** - Run specific test suites (@smoke, @regression, @ui)
- **Data-Driven Testing** - JSON fixtures and dynamic data generation
- **Page Object Model** - Maintainable and scalable test architecture

### 📊 **Advanced Features**
- **Comprehensive Reporting** - HTML, JSON, JUnit formats with merge capabilities
- **CI/CD Ready** - GitHub Actions and Jenkins pipeline configurations
- **Docker Support** - Containerized test execution
- **Parallel Execution** - Faster test runs with parallel processing
- **Visual Testing** - Screenshot comparison and visual regression testing
- **UI Testing** - Comprehensive user interface testing capabilities

### 🛠 **Developer Experience**
- **Custom Commands** - Extended Cypress functionality
- **Utility Libraries** - Helper functions for common operations
- **Environment Management** - Easy switching between environments
- **Debug Support** - Enhanced logging and debugging capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd cypress-cucumber-e2e-framework

# Install dependencies
npm install

# Verify Cypress installation
npm run setup
```

### Run Your First Test
```bash
# Run smoke tests in dev environment
npm run test:dev:smoke

# Open Cypress Test Runner
npm run cy:open
```

## 📦 Installation

### Local Setup
```bash
# Install all dependencies
npm install

# Setup Cypress
npm run setup

# Verify installation
npx cypress verify
```

### Docker Setup
```bash
# Build Docker containers
npm run setup:docker

# Run tests in Docker
npm run test:docker
```

## ⚙️ Configuration

### Environment Configuration

The framework supports multiple environments with specific configurations:

```bash
config/
├── dev.json     # Development environment
├── qa.json      # QA environment
└── uat.json     # UAT environment
```

#### Example Environment Config (`config/dev.json`):
```json
{
  "baseUrl": "https://dev.example.com",
  "environment": "development",
  "timeout": {
    "default": 10000,
    "ui": 5000,
    "pageLoad": 30000
  },
  "credentials": {
    "admin": {
      "username": "admin@dev.com",
      "password": "dev_admin_pass"
    }
  }
}
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key environment variables:
- `CYPRESS_ENV` - Target environment (dev/qa/uat)
- `CYPRESS_RECORD_KEY` - Cypress Dashboard recording key
- `GITHUB_TOKEN` - GitHub token for CI/CD

## 🎮 Usage

### Running Tests

#### By Environment
```bash
npm run test:dev          # Run all tests in dev
npm run test:qa           # Run all tests in qa
npm run test:uat          # Run all tests in uat
```

#### By Tags
```bash
npm run test:smoke        # Run smoke tests
npm run test:regression   # Run regression tests
npm run test:ui           # Run UI tests
npm run test:critical     # Run critical tests
```

#### Combined Environment + Tags
```bash
npm run test:dev:smoke       # Smoke tests in dev
npm run test:qa:regression   # Regression tests in qa
npm run test:uat:smoke       # Smoke tests in uat
```

#### Browser-Specific
```bash
npm run cy:run:chrome     # Run in Chrome
npm run cy:run:firefox    # Run in Firefox
npm run cy:run:edge       # Run in Edge
```

### Writing Tests

#### Feature Files
Create feature files in `cypress/e2e/features/`:

```gherkin
@smoke @critical @ui
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  @positive
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid username and password
    And I click the login button
    Then I should be redirected to the dashboard
```

#### Step Definitions
Create step definitions in `cypress/e2e/step_definitions/`:

```javascript
const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');
const LoginPage = require('../pages/LoginPage');

const loginPage = new LoginPage();

Given('I am on the login page', () => {
  loginPage.navigateToLogin();
});

When('I enter valid username and password', () => {
  loginPage.loginWithEnvironmentCredentials('user');
});
```

#### Page Objects
Create page objects in `cypress/e2e/pages/`:

```javascript
const BasePage = require('./base/BasePage');

class LoginPage extends BasePage {
  constructor() {
    super();
    this.selectors = {
      usernameInput: '[data-testid="username-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]'
    };
  }

  login(username, password) {
    this.typeText(this.selectors.usernameInput, username);
    this.typeText(this.selectors.passwordInput, password);
    this.clickElement(this.selectors.loginButton);
    return this;
  }
}
```

## 🧪 Testing Strategies

### Test Organization

```
cypress/e2e/features/
├── smoke/              # Critical path tests
├── regression/         # Full feature tests
├── ui/                # UI component tests
└── data-driven-examples/ # Data-driven scenarios
```

### Tagging Strategy

| Tag | Purpose | When to Use |
|-----|---------|-------------|
| `@smoke` | Critical functionality | Every deployment |
| `@regression` | Full feature coverage | Release testing |
| `@ui` | User interface testing | Frontend changes |
| `@critical` | Business-critical flows | High-priority testing |
| `@data-driven` | Data-driven scenarios | Data validation |

### Data-Driven Testing

#### Using JSON Fixtures
```javascript
// cypress/fixtures/users.json
{
  "validUsers": [
    {"username": "user1", "password": "pass1"},
    {"username": "user2", "password": "pass2"}
  ]
}

// In step definitions
cy.fixture('users').then(data => {
  data.validUsers.forEach(user => {
    // Test with each user
  });
});
```

#### Using Scenario Outlines
```gherkin
Scenario Outline: Login with different users
  When I login with "<username>" and "<password>"
  Then I should see "<message>"

  Examples:
    | username | password | message |
    | user1    | pass1    | Welcome |
    | user2    | pass2    | Welcome |
```

## 🔄 CI/CD Integration

### GitHub Actions

The framework includes a comprehensive GitHub Actions workflow (`.github/workflows/cypress.yml`):

- **Parallel Execution** - Tests run across multiple containers
- **Multi-Environment** - Support for dev/qa/uat environments
- **Artifact Management** - Screenshots, videos, and reports
- **Report Publishing** - Automatic report generation and publishing

#### Triggering Tests
```bash
# Manual trigger with custom environment
gh workflow run cypress.yml -f environment=qa -f tags=@smoke

# Automatic triggers
git push origin main        # Triggers full test suite
git push origin develop     # Triggers regression tests
```

### Jenkins

Jenkinsfile included with features:
- **Parameterized Builds** - Environment and tag selection
- **Parallel Stages** - Concurrent test execution
- **Quality Gates** - Automated pass/fail criteria
- **Notifications** - Slack and email integration

#### Jenkins Parameters
- `ENVIRONMENT` - Target environment (dev/qa/uat)
- `TAGS` - Cucumber tags to execute
- `BROWSER` - Browser selection (chrome/firefox/edge)
- `PARALLEL_EXECUTION` - Enable/disable parallel runs

### Docker Integration

#### Running Tests in Docker
```bash
# Build and run tests
docker-compose up --build cypress

# Run specific environment
CYPRESS_ENV=qa docker-compose up cypress

# Run with custom tags
CUCUMBER_TAGS=@smoke docker-compose up cypress
```

#### Docker Services
- `cypress` - Main test execution
- `cypress-dev` - Development with hot reload
- `cypress-ci` - CI-optimized container
- `report-server` - Report viewing server

## 📊 Reporting

### Report Types

#### HTML Reports
- **Location**: `reports/html/index.html`
- **Features**: Interactive, filterable, with screenshots
- **Generated by**: `multiple-cucumber-html-reporter`

#### JSON Reports
- **Location**: `reports/json/cucumber-report.json`
- **Purpose**: CI/CD integration, custom processing
- **Format**: Cucumber JSON format

#### JUnit Reports
- **Location**: `reports/junit/`
- **Purpose**: Jenkins/CI integration
- **Generated by**: `cucumber-junit`

### Generating Reports

```bash
# Generate all reports
npm run report:all

# Generate specific report types
npm run report:merge      # Merge JSON reports
npm run report:generate   # Generate HTML report
npm run report:junit      # Generate JUnit XML

# Open HTML report
npm run report:open
```

### Report Features

- **Test Results Summary** - Pass/fail statistics
- **Execution Timeline** - Test duration and timing
- **Screenshots** - Failure screenshots embedded
- **Environment Info** - Browser, OS, environment details
- **Trend Analysis** - Historical test results (when integrated)

## 🔧 Troubleshooting

### Common Issues

#### 1. Step Definitions Not Loading
**Issue**: Feature files run but step definitions are not found.

**Current Status**: This is a known issue with the current configuration. The Cucumber preprocessor is properly configured and feature files are being parsed, but step definitions are not being loaded.

**Debugging Steps Taken**:
- ✅ Verified Cypress and Cucumber preprocessor installation
- ✅ Confirmed esbuild preprocessor configuration
- ✅ Tested multiple step definition file locations
- ✅ Tried both CommonJS and ES6 imports
- ✅ Verified configuration files are correct

**Workarounds**:
1. **Use Pure Cypress**: Write tests using standard Cypress syntax as a fallback
2. **Alternative Preprocessor**: Try webpack preprocessor instead of esbuild
3. **Version Compatibility**: Test with different version combinations

**Resolution in Progress**: This issue is being investigated and will be resolved in a future update.

#### 2. Environment Configuration Not Loading
**Solution**:
```bash
# Verify environment file exists
ls -la config/

# Check environment variable
echo $CYPRESS_ENV

# Test with explicit environment
npm run test:dev
```

#### 3. Reports Not Generating
**Solution**:
```bash
# Ensure reports directory exists
mkdir -p reports/json reports/html

# Check for JSON files
ls -la reports/json/

# Generate reports manually
npm run report:all
```

#### 4. Docker Issues
**Solution**:
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache

# Check container logs
docker-compose logs cypress
```

### Debug Mode

Enable debug logging:
```bash
# Set debug environment
export DEBUG=cypress:*

# Run with verbose logging
npm run test:smoke -- --verbose
```

### Getting Help

1. **Check Documentation**: Review `docs/` directory
2. **View Logs**: Check Cypress and application logs
3. **Screenshots**: Review failure screenshots in `cypress/screenshots/`
4. **Videos**: Check test videos in `cypress/videos/`

## 🤝 Contributing

### Development Setup

```bash
# Clone and setup
git clone <repository-url>
cd cypress-cucumber-e2e-framework
npm install
npm run setup

# Run linting
npm run lint
npm run lint:fix
```

### Adding New Tests

1. **Create Feature File**: Add to appropriate directory in `cypress/e2e/features/`
2. **Add Step Definitions**: Create in `cypress/e2e/step_definitions/`
3. **Create Page Objects**: Add to `cypress/e2e/pages/`
4. **Add Test Data**: Include in `data/` or `cypress/fixtures/`
5. **Update Documentation**: Document new features

### Code Standards

- **ESLint**: Follow configured linting rules
- **Naming**: Use descriptive names for files and functions
- **Comments**: Document complex logic and page objects
- **Tags**: Use appropriate Cucumber tags for organization

### Pull Request Process

1. Create feature branch from `develop`
2. Add tests for new functionality
3. Ensure all tests pass
4. Update documentation
5. Submit pull request with detailed description

## 📚 Additional Resources

### Documentation
- [Cypress Documentation](https://docs.cypress.io/)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Framework Best Practices](docs/best-practices.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Framework Structure
```
├── .github/workflows/     # GitHub Actions CI/CD
├── config/               # Environment configurations
├── cypress/
│   ├── e2e/
│   │   ├── features/     # Cucumber feature files
│   │   ├── pages/        # Page Object Model
│   │   └── step_definitions/ # Cucumber step definitions
│   ├── fixtures/         # Test data files
│   └── support/          # Custom commands and utilities
├── data/                 # External test data
├── docs/                 # Documentation
├── reports/              # Test reports
└── scripts/              # Utility scripts
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions, issues, or contributions:
- Create an issue in the repository
- Contact the QA Automation team
- Review the troubleshooting documentation

---

**Happy Testing! 🎉**
