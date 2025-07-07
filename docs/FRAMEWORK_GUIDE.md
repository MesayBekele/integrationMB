# Cypress 11 E2E Framework Guide

This guide provides detailed information about using the Cypress 11 E2E testing framework with Cucumber, data-driven testing, and Mochawesome reporting.

## Table of Contents

1. [Framework Architecture](#framework-architecture)
2. [Getting Started](#getting-started)
3. [Writing Tests](#writing-tests)
4. [Data Management](#data-management)
5. [Page Object Model](#page-object-model)
6. [Reporting](#reporting)
7. [Environment Management](#environment-management)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Framework Architecture

### Core Components

The framework is built on several key components:

- **Cypress 11**: Modern E2E testing framework
- **Cucumber**: BDD testing with Gherkin syntax
- **Mochawesome**: HTML reporting with screenshots
- **Page Object Model**: Maintainable test structure
- **Data Utilities**: Test data management
- **Environment Configuration**: Multi-environment support

### Directory Structure

```
cypress-e2e-framework/
├── config/                     # Environment configurations
├── cypress/
│   ├── e2e/features/          # Cucumber feature files
│   ├── fixtures/testdata/     # Test data files
│   ├── support/
│   │   ├── pages/            # Page Object Model
│   │   ├── step_definitions/ # Cucumber steps
│   │   ├── utils/           # Utility functions
│   │   └── utilities/       # Framework utilities
├── reports/                   # Generated reports
└── docs/                     # Documentation
```

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js 16 or higher
- npm 8 or higher
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cypress-e2e-framework
```

2. Install dependencies:
```bash
npm install
```

3. Verify installation:
```bash
npm run open
```

### First Test Run

Run your first test to ensure everything is working:

```bash
# Run smoke tests
npm run test:smoke

# Open Cypress Test Runner
npm run open
```

## Writing Tests

### Feature Files

Feature files use Gherkin syntax and are stored in `cypress/e2e/features/`.

#### Basic Structure

```gherkin
@feature-tag @priority-tag
Feature: Feature Name
  As a [role]
  I want [goal]
  So that [benefit]

  Background:
    Given [common setup step]

  @scenario-tag
  Scenario: Scenario Name
    Given [precondition]
    When [action]
    Then [expected result]
```

#### Example Feature File

```gherkin
@login @smoke
Feature: User Authentication
  As a user
  I want to login to the application
  So that I can access my account

  Background:
    Given I am on the login page

  @critical @smoke
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

Step definitions connect Gherkin steps to actual test code.

#### Creating Step Definitions

Create files in `cypress/support/step_definitions/`:

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

Then('I should be redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');
});
```

#### Step Definition Best Practices

1. **Keep steps atomic**: Each step should do one thing
2. **Use page objects**: Don't put UI interactions directly in steps
3. **Handle data properly**: Use data utilities for test data
4. **Add proper waits**: Ensure elements are ready before interaction
5. **Use descriptive names**: Make steps readable and maintainable

### Tags and Organization

#### Available Tags

- `@smoke` - Quick validation tests
- `@regression` - Comprehensive test suite
- `@critical` - Must-pass scenarios
- `@negative` - Error handling tests
- `@data-driven` - Data-driven scenarios
- `@security` - Security-related tests
- `@performance` - Performance tests
- `@accessibility` - Accessibility tests
- `@mobile` - Mobile-specific tests

#### Tag Usage

```gherkin
@login @smoke @critical
Scenario: Critical login functionality
  # Test implementation

@user-management @regression
Scenario: User management operations
  # Test implementation
```

#### Running Tagged Tests

```bash
# Single tag
npm run test:smoke

# Multiple tags
npx cypress run --env tags='@smoke,@critical'

# Complex expressions
npx cypress run --env tags='@smoke and not @slow'
```

## Data Management

### Test Data Structure

Test data is organized in `cypress/fixtures/testdata/`:

```
testdata/
├── users.json           # User account data
├── credentials.json     # Environment-specific credentials
├── sample-users.csv     # CSV data for bulk operations
└── test-scenarios.json  # Scenario-specific data
```

### JSON Data Files

#### users.json
```json
{
  "validUsers": [
    {
      "username": "admin@example.com",
      "password": "Admin123!",
      "role": "admin",
      "firstName": "Admin",
      "lastName": "User",
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

### Using DataUtils

The DataUtils class provides methods for managing test data:

```javascript
const DataUtils = require('../utils/dataUtils');

// Load test data
DataUtils.loadTestData('users').then(data => {
  const user = data.validUsers[0];
  // Use the user data
});

// Get user by role
DataUtils.getUserByRole('admin', 'dev').then(user => {
  loginPage.loginWithUserData(user);
});

// Generate unique data
const email = DataUtils.generateUniqueData('email');
const password = DataUtils.generateUniqueData('password');

// Generate test user
const testUser = DataUtils.generateTestUser('manager');
```

### CSV Data Handling

For tabular data, use CSV files:

```csv
firstName,lastName,email,role,department
John,Doe,john.doe@example.com,user,Engineering
Jane,Smith,jane.smith@example.com,admin,IT
```

Load CSV data:

```javascript
DataUtils.loadCSVData('sample-users').then(users => {
  users.forEach(user => {
    // Process each user
  });
});
```

## Page Object Model

### BasePage Class

All page objects extend the BasePage class:

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

  // Page-specific methods
  login(username, password) {
    this.enterUsername(username);
    this.enterPassword(password);
    this.clickLogin();
    return this;
  }
}
```

### Page Object Best Practices

1. **Single Responsibility**: One page object per page/component
2. **Method Chaining**: Return `this` for fluent interface
3. **Element Encapsulation**: Hide selectors within page objects
4. **Descriptive Methods**: Use action-oriented method names
5. **Error Handling**: Include proper error handling and waits

### Common Page Object Patterns

#### Element Interaction
```javascript
enterUsername(username) {
  this.typeText(this.elements.usernameField, username);
  return this;
}

clickLogin() {
  this.clickElement(this.elements.loginButton);
  return this;
}
```

#### Verification Methods
```javascript
verifyLoginFormVisible() {
  this.isVisible(this.elements.usernameField);
  this.isVisible(this.elements.passwordField);
  this.isVisible(this.elements.loginButton);
  return this;
}

verifyErrorMessage(expectedMessage) {
  this.isVisible(this.elements.errorMessage);
  if (expectedMessage) {
    this.shouldContainText(this.elements.errorMessage, expectedMessage);
  }
  return this;
}
```

## Reporting

### Mochawesome Configuration

The framework uses Mochawesome for HTML reporting with the following features:

- Test execution summary
- Screenshots on failure
- Video recordings
- Environment information
- Execution timeline

### Report Generation

```bash
# Generate reports after test run
npm run report:merge
npm run report:generate

# Full workflow
npm run test:full
```

### Report Structure

```
reports/
├── temp/                    # Individual test results
├── merged-report.json       # Consolidated data
├── index.html              # Main HTML report
└── assets/                 # Report assets
```

### Custom Reporting

Add custom information to reports:

```javascript
// In test files
cy.log('Custom test information');

// Add context to reports
cy.addContext('Environment: ' + Cypress.env('environment'));
```

## Environment Management

### Configuration Files

Each environment has its own configuration:

#### config/dev.json
```json
{
  "baseUrl": "https://dev.example.com",
  "environment": "dev",
  "timeout": {
    "default": 10000,
    "page": 30000
  },
  "users": {
    "admin": {
      "username": "admin@dev.com",
      "password": "DevPassword123!"
    }
  },
  "features": {
    "newFeature": true,
    "debugMode": true
  }
}
```

### Using Configuration

```javascript
const configManager = require('../utilities/configManager');

// Get configuration values
const baseUrl = configManager.getBaseUrl();
const adminUser = configManager.getUser('admin');
const timeout = configManager.get('timeout.default');
const isFeatureEnabled = configManager.get('features.newFeature');
```

### Environment-Specific Testing

```bash
# Run tests in specific environment
npm run test:dev
npm run test:staging
npm run test:prod

# Combine with tags
npm run test:smoke:dev
```

## Best Practices

### Test Design

1. **Independent Tests**: Each test should be able to run independently
2. **Clear Scenarios**: Write clear, understandable test scenarios
3. **Proper Setup**: Use Background steps for common setup
4. **Data Isolation**: Use unique test data to avoid conflicts
5. **Cleanup**: Clean up test data after execution

### Code Organization

1. **Consistent Structure**: Follow established patterns
2. **Reusable Components**: Create reusable page objects and utilities
3. **Clear Naming**: Use descriptive names for files and methods
4. **Documentation**: Add comments for complex logic
5. **Version Control**: Use meaningful commit messages

### Performance

1. **Efficient Selectors**: Use stable, efficient element selectors
2. **Proper Waits**: Use appropriate wait strategies
3. **Parallel Execution**: Run tests in parallel when possible
4. **Resource Management**: Clean up resources after tests
5. **Optimization**: Optimize test execution time

### Maintenance

1. **Regular Updates**: Keep dependencies up to date
2. **Code Reviews**: Review test code changes
3. **Refactoring**: Regularly refactor and improve code
4. **Monitoring**: Monitor test execution and failure rates
5. **Documentation**: Keep documentation current

## Troubleshooting

### Common Issues

#### Test Timeouts
```javascript
// Increase timeout for specific operations
cy.get('[data-cy="slow-element"]', { timeout: 30000 });

// Configure global timeouts in cypress.config.js
defaultCommandTimeout: 15000
```

#### Element Not Found
```javascript
// Add proper waits
cy.waitForElement('[data-cy="element"]');

// Use better selectors
cy.get('[data-cy="specific-element"]') // Good
cy.get('.generic-class') // Avoid
```

#### Flaky Tests
```javascript
// Add retry logic
cy.retryAction(() => {
  cy.get('[data-cy="button"]').click();
});

// Use stable waits
cy.waitForPageLoad();
```

### Debug Mode

```bash
# Run with debug output
DEBUG=cypress:* npm test

# Open with DevTools
npx cypress open --env debug=true
```

### Performance Issues

```bash
# Disable video for faster execution
npx cypress run --config video=false

# Run specific tests only
npx cypress run --spec "cypress/e2e/features/login.feature"
```

### Memory Issues

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm test
```

## Advanced Topics

### Custom Commands

Create reusable commands in `cypress/support/commands.js`:

```javascript
Cypress.Commands.add('loginAsRole', (role) => {
  const configManager = require('./utilities/configManager');
  const user = configManager.getUser(role);
  
  cy.visit('/login');
  cy.get('[data-cy="username"]').type(user.username);
  cy.get('[data-cy="password"]').type(user.password);
  cy.get('[data-cy="login-button"]').click();
});
```

### API Integration

Use API calls for test setup/teardown:

```javascript
const ApiUtils = require('../utils/apiUtils');

// Create test data
ApiUtils.createUser(userData).then(response => {
  // Use created user in test
});

// Clean up after test
ApiUtils.deleteUser(userId);
```

### Database Integration

For database operations:

```javascript
// In cypress.config.js
on('task', {
  queryDb: (query) => {
    return queryDatabase(query);
  }
});

// In tests
cy.task('queryDb', 'SELECT * FROM users WHERE email = ?', [email])
  .then(result => {
    // Use database result
  });
```

### Parallel Execution

Configure parallel execution:

```bash
# Run tests in parallel
npm run test:parallel

# Configure in cypress.config.js
e2e: {
  experimentalRunAllSpecs: true
}
```

## Conclusion

This framework provides a comprehensive solution for E2E testing with Cypress 11, Cucumber, and data-driven approaches. By following the patterns and best practices outlined in this guide, you can create maintainable, reliable, and scalable test automation.

For additional support:
- Check the main README.md
- Review example implementations
- Create issues for bugs or feature requests
- Contribute improvements back to the framework

Happy testing! 🎉

