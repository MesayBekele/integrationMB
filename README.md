# 🚀 Simple E2E Automation Framework

A straightforward end-to-end testing framework using **Cypress** and **Cucumber** for UI testing.

## ✨ Features

- 🧪 **Cypress + Cucumber** - BDD testing with Gherkin syntax
- 🏷️ **Test Tagging** - Organize tests with tags (@smoke, @regression, @ui)
- 🌍 **Multi-Environment** - Support for dev, qa, uat environments
- 📱 **Mobile Testing** - Responsive design testing
- 📊 **Simple Reporting** - Clean HTML reports
- 🔄 **Jenkins Ready** - CI/CD pipeline included
- 📖 **Page Object Model** - Maintainable test structure

## 🚀 Quick Start

### 1. Installation
```bash
git clone <repository-url>
cd simple-e2e-framework
npm install
```

### 2. Configuration
Update environment files in `config/` directory:
- `config/dev.json` - Development environment
- `config/qa.json` - QA environment
- `config/uat.json` - UAT environment

### 3. Run Tests
```bash
# Open Cypress Test Runner
npm run cy:open

# Run smoke tests
npm run test:smoke

# Run all tests
npm run cy:run
```

### 4. Generate Reports
```bash
npm run report:generate
npm run report:open
```

## 📁 Project Structure

```
├── cypress/
│   ├── e2e/features/           # Feature files (Gherkin)
│   │   └── examples/           # Example tests
│   ├── support/
│   │   ├── pages/              # Page Object Model
│   │   ├── step_definitions/   # Step implementations
│   │   ├── utilities/          # Helper utilities
│   │   └── commands.js         # Custom commands
│   └── fixtures/               # Test data
├── config/                     # Environment configs
├── scripts/                    # Utility scripts
├── docs/                       # Documentation
└── reports/                    # Generated reports
```

## 🏷️ Test Tags

Organize your tests with tags:

- **@smoke** - Quick smoke tests
- **@regression** - Full regression tests
- **@ui** - UI-focused tests
- **@critical** - Critical functionality
- **@mobile** - Mobile-specific tests

## 🎯 Usage Examples

### Running Tests with Tags
```bash
# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run UI tests
npm run test:ui

# Custom tag execution
node scripts/run-tagged-tests.js --tags "@smoke" --env dev

# Run with specific browser
node scripts/run-tagged-tests.js --tags "@ui" --browser firefox

# Run in headed mode
node scripts/run-tagged-tests.js --tags "@smoke" --headed
```

### Environment Testing
```bash
# Test in development
npm run test:dev

# Test in QA
npm run test:qa

# Test in UAT
npm run test:uat
```

### Browser Testing
```bash
# Chrome (default)
npm run cy:run:chrome

# Firefox
npm run cy:run:firefox

# Edge
npm run cy:run:edge
```

## 📝 Writing Tests

### Feature Files (Gherkin)
```gherkin
@smoke @ui @login
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  @critical
  Scenario: Successful login
    Given I am on the login page
    When I enter valid user credentials
    And I click the login button
    Then I should be redirected to the dashboard
```

### Step Definitions
```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the login page', () => {
  cy.visit('/login');
});

When('I enter valid user credentials', () => {
  cy.loginAs('user');
});

Then('I should be redirected to the dashboard', () => {
  cy.shouldBeOnPage('/dashboard');
});
```

### Page Objects
```javascript
class LoginPage {
  visit() {
    cy.visit('/login');
  }

  enterUsername(username) {
    cy.get('[data-cy="username"]').type(username);
  }

  enterPassword(password) {
    cy.get('[data-cy="password"]').type(password);
  }

  clickLoginButton() {
    cy.get('[data-cy="login-button"]').click();
  }
}
```

## 🔧 Configuration

### Environment Files
```json
{
  "baseUrl": "https://dev.example.com",
  "timeout": 10000,
  "users": {
    "admin": {
      "username": "admin",
      "password": "admin123"
    },
    "user": {
      "username": "user",
      "password": "user123"
    }
  }
}
```

## 🛠️ Custom Commands

The framework includes useful custom commands:

```javascript
// Login helpers
cy.loginAs('admin');
cy.loginAs('user');

// Navigation
cy.navigateTo('dashboard');
cy.shouldBeOnPage('/profile');

// Form helpers
cy.fillForm({ username: 'test', email: 'test@example.com' });
cy.submitForm();

// Mobile testing
cy.setMobileViewport('iphone-x');

// Assertions
cy.shouldBeVisible('[data-cy="welcome"]');
cy.shouldContainText('[data-cy="message"]', 'Success');

// Performance
cy.measurePerformance(() => {
  // Your action here
});
```

## 📊 Reporting

### Generate Reports
```bash
# Generate HTML report
npm run report:generate

# Open report in browser
npm run report:open
```

Reports include:
- ✅ Test execution summary
- 📊 Pass/fail statistics
- 🌍 Environment information
- 🕒 Execution timestamps
- 📱 Browser information

## 🔄 CI/CD Integration

### Jenkins Pipeline
The framework includes a complete Jenkins pipeline:

```bash
# Setup Jenkins (Linux)
sudo bash scripts/jenkins-setup.sh
```

Pipeline features:
- 🎛️ Parameterized builds
- 🌍 Environment selection
- 🏷️ Tag-based execution
- 📊 Automatic reporting
- 📧 Notifications

### Docker Support
```bash
# Build Docker image
docker build -t e2e-tests .

# Run tests in container
docker run --rm e2e-tests
```

## 📚 Documentation

- 📖 [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- 📝 [Usage Guide](docs/USAGE.md) - Comprehensive usage examples
- 📋 [Changelog](CHANGELOG.md) - Version history

## 🧪 Example Tests

The framework includes working examples:

### Login Tests
- ✅ Successful login scenarios
- ❌ Error handling and validation
- 📱 Mobile responsive testing
- 🔐 Security testing

### Features Covered
- User authentication
- Form validation
- Navigation testing
- Mobile responsiveness
- Performance testing

## 🎯 Best Practices

### Test Organization
- Use descriptive scenario names
- Group related tests in features
- Apply appropriate tags
- Keep scenarios focused

### Page Objects
- Create reusable page classes
- Use data-cy attributes for selectors
- Implement fluent interfaces
- Separate concerns properly

### Data Management
- Use configuration files for test data
- Generate dynamic test data when needed
- Clean up after tests
- Use fixtures for static data

## 🔍 Troubleshooting

### Common Issues

**Tests not running:**
```bash
# Verify Cypress installation
npx cypress verify

# Check configuration
npm run cy:open
```

**Reports not generating:**
```bash
# Ensure test results exist
ls reports/temp/

# Generate reports manually
npm run report:generate
```

**Environment issues:**
```bash
# Check configuration files
cat config/dev.json

# Verify environment variable
echo $CYPRESS_ENV
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your tests/features
4. Follow the existing patterns
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 Check the documentation in `docs/`
- 🐛 Report issues in GitHub Issues
- 💬 Ask questions in Discussions
- 📧 Contact the team for support

---

**Happy Testing! 🎉**

This framework provides everything you need for simple, effective E2E testing with modern tools and best practices.

