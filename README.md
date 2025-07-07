# Cypress 11 E2E Testing Framework

A comprehensive end-to-end testing framework built with Cypress 11, featuring Cucumber BDD, data-driven testing, tag-based execution, and Mochawesome reporting.

## 🚀 Features

- **Cypress 11**: Latest version with improved performance and stability
- **Cucumber BDD**: Behavior-driven development with Gherkin syntax
- **Data-Driven Testing**: Support for CSV, JSON, and dynamic test data generation
- **Tag-Based Execution**: Run specific test suites using tags (@smoke, @regression, @critical)
- **Mochawesome Reporting**: Beautiful HTML reports with screenshots and videos
- **Multi-Environment Support**: Dev, staging, and production configurations
- **Page Object Model**: Maintainable and reusable page objects with inheritance
- **Custom Commands**: Extended Cypress functionality for common operations
- **Utility Functions**: Comprehensive helper functions for test automation
- **CI/CD Ready**: Jenkins pipeline support and GitHub Actions compatible

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- Git

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd cypress-e2e-framework

# Install dependencies
npm install
```

## 🏃‍♂️ Quick Start

### Basic Test Execution

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Open Cypress Test Runner
npm run open
```

### Tag-Based Execution

```bash
# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run critical tests
npm run test:critical
```

### Environment-Specific Testing

```bash
# Development environment
npm run test:dev

# Staging environment
npm run test:staging

# Production environment
npm run test:prod

# Combined: smoke tests in dev environment
npm run test:smoke:dev
```

### Browser-Specific Testing

```bash
# Chrome browser
npm run test:chrome

# Firefox browser
npm run test:firefox

# Edge browser
npm run test:edge
```

### Report Generation

```bash
# Run tests with full reporting
npm run test:full

# Generate reports from existing data
npm run report:generate

# Clean report directory
npm run report:clean
```

## 📁 Project Structure

```
cypress-e2e-framework/
├── config/                     # Environment configurations
│   ├── dev.json               # Development environment settings
│   ├── staging.json           # Staging environment settings
│   └── prod.json              # Production environment settings
├── cypress/
│   ├── e2e/
│   │   └── features/          # Cucumber feature files
│   │       ├── login.feature
│   │       └── user-management.feature
│   ├── fixtures/
│   │   └── testdata/          # Test data files
│   │       ├── users.json
│   │       ├── credentials.json
│   │       └── sample-users.csv
│   ├── screenshots/           # Test failure screenshots
│   ├── support/
│   │   ├── pages/            # Page Object Model classes
│   │   │   ├── BasePage.js
│   │   │   ├── LoginPage.js
│   │   │   └── HomePage.js
│   │   ├── step_definitions/ # Cucumber step definitions
│   │   │   ├── loginSteps.js
│   │   │   └── commonSteps.js
│   │   ├── utils/           # Utility functions
│   │   │   ├── dataUtils.js
│   │   │   ├── helpers.js
│   │   │   └── apiUtils.js
│   │   ├── utilities/       # Configuration utilities
│   │   │   └── configManager.js
│   │   ├── commands.js      # Custom Cypress commands
│   │   └── e2e.js          # Support file configuration
│   └── videos/             # Test execution videos
├── reports/                # Test reports
│   ├── temp/              # Temporary report files
│   └── merged-report.json # Consolidated report data
├── .cypress-cucumber-preprocessorrc.json # Cucumber configuration
├── cypress.config.js      # Main Cypress configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🧪 Writing Tests

### Feature Files

Create `.feature` files in `cypress/e2e/features/` using Gherkin syntax:

```gherkin
@login @smoke
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  Background:
    Given I am on the login page

  @smoke @critical
  Scenario: Successful login with valid credentials
    When I enter valid credentials for "admin" user
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @regression @data-driven
  Scenario Outline: Login with different user roles
    When I enter credentials for "<userRole>" user
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see user profile for "<userRole>"

    Examples:
      | userRole |
      | admin    |
      | user     |
      | manager  |
```

### Step Definitions

Create step definitions in `cypress/support/step_definitions/`:

```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const LoginPage = require('../pages/LoginPage');
const DataUtils = require('../utils/dataUtils');

const loginPage = new LoginPage();

Given('I am on the login page', () => {
  loginPage.navigateToLogin();
  loginPage.verifyLoginFormVisible();
});

When('I enter valid credentials for {string} user', (userRole) => {
  DataUtils.getUserByRole(userRole, Cypress.env('environment') || 'dev').then(user => {
    loginPage.loginWithUserData(user);
  });
});
```

### Page Objects

Create page objects in `cypress/support/pages/` extending BasePage:

```javascript
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor() {
    super();
    this.url = '/login';
    this.elements = {
      usernameField: 'username',
      passwordField: 'password',
      loginButton: 'login-button'
    };
  }

  login(username, password) {
    this.enterUsername(username);
    this.enterPassword(password);
    this.clickLogin();
    return this;
  }

  enterUsername(username) {
    this.typeText(this.elements.usernameField, username);
    return this;
  }
}

module.exports = LoginPage;
```

## 📊 Data-Driven Testing

### JSON Test Data

Store structured test data in `cypress/fixtures/testdata/`:

```json
{
  "validUsers": [
    {
      "username": "admin@example.com",
      "password": "Admin123!",
      "role": "admin",
      "permissions": ["read", "write", "delete", "admin"]
    }
  ],
  "invalidUsers": [
    {
      "username": "invalid@example.com",
      "password": "wrongpassword",
      "expectedError": "Invalid credentials"
    }
  ]
}
```

### CSV Test Data

Use CSV files for tabular data:

```csv
firstName,lastName,email,role,department
John,Doe,john.doe@example.com,user,Engineering
Jane,Smith,jane.smith@example.com,admin,IT
```

### Dynamic Data Generation

```javascript
const DataUtils = require('../utils/dataUtils');

// Generate unique test data
const email = DataUtils.generateUniqueData('email');
const password = DataUtils.generateUniqueData('password');
const user = DataUtils.generateTestUser('admin');

// Load test data from fixtures
DataUtils.loadTestData('users').then(data => {
  const randomUser = DataUtils.getRandomValidUser();
  loginPage.loginWithUserData(randomUser);
});
```

## 🏷️ Tag-Based Execution

### Available Tags

- `@smoke` - Critical functionality tests (quick validation)
- `@regression` - Full regression suite (comprehensive testing)
- `@critical` - High-priority tests (must-pass scenarios)
- `@negative` - Negative test scenarios (error handling)
- `@data-driven` - Data-driven test scenarios
- `@security` - Security-related tests
- `@performance` - Performance testing scenarios
- `@accessibility` - Accessibility compliance tests
- `@mobile` - Mobile-specific tests

### Tag Execution Examples

```bash
# Single tag
npx cypress run --env tags='@smoke'

# Multiple tags (OR condition)
npx cypress run --env tags='@smoke,@critical'

# Tag combination (AND condition)
npx cypress run --env tags='@smoke and @critical'

# Exclude tags
npx cypress run --env tags='not @slow'

# Complex tag expressions
npx cypress run --env tags='(@smoke or @critical) and not @skip'
```

## 📈 Reporting

### Mochawesome Reports

The framework generates comprehensive HTML reports with:

- Test execution summary and statistics
- Screenshots on test failures
- Video recordings of test runs
- Environment and browser information
- Execution timeline and duration
- Failed test details with stack traces

### Report Structure

```
reports/
├── temp/                  # Individual test result files
├── merged-report.json     # Consolidated JSON report
├── index.html            # Main HTML report
├── assets/               # Report assets (CSS, JS, images)
└── cucumber-html-report.html # Cucumber-specific report
```

### Report Generation Process

```bash
# Full report generation workflow
npm run report:clean      # Clean previous reports
npm run test             # Run tests (generates temp files)
npm run report:merge     # Merge individual reports
npm run report:generate  # Generate final HTML report

# Or run everything in one command
npm run test:full
```

## 🌍 Multi-Environment Testing

### Environment Configuration

Each environment has its own JSON configuration file:

```json
{
  "baseUrl": "https://dev.example.com",
  "environment": "dev",
  "apiUrl": "https://api-dev.example.com",
  "timeout": {
    "default": 10000,
    "page": 30000,
    "request": 15000
  },
  "users": {
    "admin": {
      "username": "admin@dev.com",
      "password": "DevPassword123!"
    }
  },
  "features": {
    "newFeatureFlag": true,
    "debugMode": true
  }
}
```

### Environment Usage

```javascript
// Access environment configuration
const configManager = require('../utilities/configManager');

const baseUrl = configManager.getBaseUrl();
const adminUser = configManager.getUser('admin');
const timeout = configManager.get('timeout.default');
```

## 🛠️ Custom Commands

### Available Custom Commands

```javascript
// Authentication
cy.loginAs('admin');
cy.loginWithUserData(userData);

// Navigation
cy.navigateTo('dashboard');
cy.shouldBeOnPage('login');

// Form operations
cy.fillForm(formData);
cy.submitForm();

// Wait operations
cy.waitForPageLoad();
cy.waitForElement('[data-cy="element"]');

// Assertions
cy.shouldContainText('[data-cy="message"]', 'Success');
cy.shouldBeVisible('[data-cy="button"]');

// Mobile testing
cy.setMobileViewport('iphone-x');

// File operations
cy.uploadFile('[data-cy="upload"]', 'test-file.pdf');

// Performance
cy.measurePerformance(() => {
  // Action to measure
});

// Data generation
cy.generateTestData('email'); // Returns unique email
```

### Creating Custom Commands

Add to `cypress/support/commands.js`:

```javascript
Cypress.Commands.add('customLogin', (userType) => {
  const configManager = require('./utilities/configManager');
  const user = configManager.getUser(userType);
  
  cy.visit('/login');
  cy.get('[data-cy="username"]').type(user.username);
  cy.get('[data-cy="password"]').type(user.password);
  cy.get('[data-cy="login-button"]').click();
});
```

## 🔧 Utility Functions

### DataUtils

```javascript
const DataUtils = require('../utils/dataUtils');

// Load test data
DataUtils.loadTestData('users');
DataUtils.getUserByRole('admin', 'dev');

// Generate data
DataUtils.generateUniqueData('email');
DataUtils.generateTestUser('manager');

// Date operations
DataUtils.formatDate('YYYY-MM-DD');
DataUtils.getRelativeDate(7); // 7 days from now
```

### Helpers

```javascript
const Helpers = require('../utils/helpers');

// String operations
Helpers.toSlug('My Test Name'); // 'my-test-name'
Helpers.capitalizeWords('hello world'); // 'Hello World'

// Array operations
Helpers.getRandomItem(['a', 'b', 'c']);
Helpers.removeDuplicates([1, 1, 2, 3]);

// Validation
Helpers.isValidEmail('test@example.com');
Helpers.isStrongPassword('MyP@ssw0rd123');

// Performance
Helpers.debounce(func, 300);
Helpers.throttle(func, 1000);
```

### ApiUtils (for test setup/teardown)

```javascript
const ApiUtils = require('../utils/apiUtils');

// User management
ApiUtils.createUser(userData);
ApiUtils.deleteUser(userId);
ApiUtils.getUserByEmail(email);

// Authentication
ApiUtils.authenticate(username, password);
ApiUtils.logout();

// Bulk operations
ApiUtils.createMultipleUsers(usersArray);
ApiUtils.cleanupTestData(userIds);
```

## 🎯 Best Practices

### Test Organization

1. **Feature-based structure**: Group tests by application features
2. **Reusable components**: Use page objects and utility functions
3. **Data separation**: Keep test data separate from test logic
4. **Clear naming**: Use descriptive names for tests and functions
5. **Tag strategy**: Use consistent tagging for test categorization

### Data Management

1. **Environment-specific data**: Use different data for each environment
2. **Dynamic generation**: Generate unique data to avoid conflicts
3. **Cleanup strategy**: Clean up test data after execution
4. **Realistic data**: Use production-like test data
5. **Data isolation**: Ensure tests don't interfere with each other

### Page Object Model

1. **Single responsibility**: Each page object handles one page/component
2. **Method chaining**: Return `this` for fluent interface
3. **Element encapsulation**: Hide selectors within page objects
4. **Inheritance**: Use BasePage for common functionality
5. **Descriptive methods**: Use clear, action-oriented method names

### Error Handling

1. **Graceful failures**: Handle expected failures appropriately
2. **Meaningful messages**: Provide clear error messages
3. **Screenshot capture**: Automatic screenshots on failure
4. **Retry logic**: Implement retry for flaky operations
5. **Timeout management**: Use appropriate timeouts for different operations

## 🔄 CI/CD Integration

### Jenkins Pipeline

The included `Jenkinsfile` provides:

- Multi-environment testing
- Parallel execution support
- Report publishing
- Notification integration
- Artifact management

### GitHub Actions

Create `.github/workflows/cypress.yml`:

```yaml
name: Cypress E2E Tests
on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging]
        tags: [smoke, regression]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Cypress tests
        run: npm run test:${{ matrix.tags }} -- --env environment=${{ matrix.environment }}
        
      - name: Upload reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-reports-${{ matrix.environment }}-${{ matrix.tags }}
          path: reports/
```

## 🐛 Troubleshooting

### Common Issues

1. **Test timeouts**
   - Increase timeout values in configuration
   - Add proper wait conditions
   - Check network connectivity

2. **Element not found**
   - Verify element selectors
   - Add wait conditions
   - Check page loading states

3. **Flaky tests**
   - Add proper waits and retry logic
   - Use stable selectors
   - Handle dynamic content

4. **Memory issues**
   - Reduce parallel execution
   - Increase Node.js memory limit
   - Clean up test data

### Debug Mode

```bash
# Run with debug output
DEBUG=cypress:* npm test

# Open with DevTools
npx cypress open --env debug=true

# Verbose logging
npm test -- --reporter spec
```

### Performance Optimization

```bash
# Run tests in parallel (if supported)
npm run test:parallel

# Disable video recording for faster execution
npx cypress run --config video=false

# Run headlessly for CI/CD
npm test -- --headless
```

## 📚 Advanced Features

### Custom Reporters

Add additional reporters in `cypress.config.js`:

```javascript
reporter: 'cypress-multi-reporters',
reporterOptions: {
  configFile: 'reporter-config.json'
}
```

### Database Integration

For database testing (if needed):

```javascript
// In cypress.config.js
setupNodeEvents(on, config) {
  on('task', {
    queryDb: (query) => {
      return queryDatabase(query);
    }
  });
}

// In tests
cy.task('queryDb', 'SELECT * FROM users').then(result => {
  // Use database result
});
```

### API Mocking

```javascript
// Mock API responses
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
cy.wait('@getUsers');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Update documentation if needed
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Create a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add JSDoc comments for new functions
- Include test coverage for new features
- Update README for significant changes
- Use semantic commit messages

## 📞 Support

For questions and support:

- 📖 Check this documentation first
- 🐛 Search existing issues on GitHub
- 💬 Create a new issue with detailed information
- 📧 Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Testing! 🎉**

