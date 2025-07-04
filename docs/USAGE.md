# 📖 Simple E2E Framework Usage Guide

This guide covers how to use the simple E2E automation framework effectively.

## 🧪 Writing Tests

### Feature Files (Gherkin Syntax)

Feature files use Gherkin syntax and are located in `cypress/e2e/features/`:

```gherkin
@smoke @ui @login
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  Background:
    Given I am on the login page

  @critical @smoke
  Scenario: Successful login
    When I enter valid user credentials
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @regression @ui
  Scenario: Failed login with invalid credentials
    When I enter username "invalid"
    And I enter password "wrong"
    And I click the login button
    Then I should see an error message "Invalid credentials"
```

### Step Definitions

Step definitions implement the Gherkin steps in JavaScript:

```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the login page', () => {
  cy.visit('/login');
});

When('I enter valid user credentials', () => {
  cy.loginAs('user');
});

When('I enter username {string}', (username) => {
  cy.get('[data-cy="username"]').type(username);
});

Then('I should be redirected to the dashboard', () => {
  cy.shouldBeOnPage('/dashboard');
});
```

## 🏷️ Using Tags

### Tag Categories

- **@smoke** - Quick smoke tests
- **@regression** - Full regression tests
- **@ui** - UI-focused tests
- **@critical** - Critical functionality tests
- **@mobile** - Mobile-specific tests

### Running Tagged Tests

```bash
# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression

# Run UI tests
npm run test:ui

# Custom tag combinations
node scripts/run-tagged-tests.js --tags "@smoke and @ui"
node scripts/run-tagged-tests.js --tags "@regression and not @mobile"
```

## 🗂️ Test Organization

### Directory Structure

```
cypress/e2e/features/
├── auth/
│   ├── login.feature
│   └── logout.feature
├── navigation/
│   ├── menu.feature
│   └── breadcrumbs.feature
└── examples/
    └── login.feature
```

### Naming Conventions

- **Feature files**: Use kebab-case (e.g., `user-login.feature`)
- **Step definition files**: Use snake_case (e.g., `login_steps.js`)
- **Page objects**: Use PascalCase (e.g., `LoginPage.js`)

## 🏗️ Page Object Model

### Creating Page Objects

```javascript
// cypress/support/pages/LoginPage.js
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor() {
    super();
    this.elements = {
      usernameInput: '[data-cy="username"]',
      passwordInput: '[data-cy="password"]',
      loginButton: '[data-cy="login-button"]',
      errorMessage: '[data-cy="error-message"]'
    };
  }

  visit() {
    cy.visit('/login');
    return this;
  }

  enterUsername(username) {
    cy.get(this.elements.usernameInput).type(username);
    return this;
  }

  enterPassword(password) {
    cy.get(this.elements.passwordInput).type(password);
    return this;
  }

  clickLoginButton() {
    cy.get(this.elements.loginButton).click();
    return this;
  }

  verifyErrorMessage(message) {
    cy.shouldContainText(this.elements.errorMessage, message);
    return this;
  }
}

module.exports = LoginPage;
```

### Using Page Objects

```javascript
// In step definitions
const LoginPage = require('../pages/LoginPage');
const loginPage = new LoginPage();

Given('I am on the login page', () => {
  loginPage.visit();
});

When('I enter valid credentials', () => {
  loginPage
    .enterUsername('user')
    .enterPassword('password')
    .clickLoginButton();
});
```

## 🛠️ Custom Commands

The framework includes useful custom commands:

### Login Commands
```javascript
// Login as different user types
cy.loginAs('admin');
cy.loginAs('user');
```

### Navigation Commands
```javascript
// Navigate to pages
cy.navigateTo('dashboard');
cy.shouldBeOnPage('/profile');
```

### Form Commands
```javascript
// Fill forms easily
cy.fillForm({
  username: 'testuser',
  email: 'test@example.com',
  phone: '555-1234'
});

cy.submitForm();
```

### Assertion Commands
```javascript
// Simple assertions
cy.shouldBeVisible('[data-cy="welcome"]');
cy.shouldContainText('[data-cy="message"]', 'Success');
cy.shouldNotExist('[data-cy="error"]');
```

### Mobile Commands
```javascript
// Test mobile viewports
cy.setMobileViewport('iphone-x');
cy.setMobileViewport('ipad');
```

### Utility Commands
```javascript
// Take screenshots
cy.takeScreenshot('login-page');

// Clear storage
cy.clearStorage();

// Measure performance
cy.measurePerformance(() => {
  cy.get('[data-cy="submit"]').click();
});

// Log steps for debugging
cy.logStep('Entering user credentials');
```

## 🏃‍♂️ Running Tests

### Local Development

```bash
# Interactive mode
npm run cy:open

# Headless mode
npm run cy:run

# Specific environments
npm run test:dev
npm run test:qa
npm run test:uat

# Specific browsers
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge
```

### Command Line Options

```bash
# Run with specific tags
node scripts/run-tagged-tests.js --tags "@smoke"

# Run in specific environment
node scripts/run-tagged-tests.js --tags "@ui" --env qa

# Run with specific browser
node scripts/run-tagged-tests.js --tags "@regression" --browser firefox

# Run in headed mode
node scripts/run-tagged-tests.js --tags "@smoke" --headed

# Run specific feature file
node scripts/run-tagged-tests.js --spec "cypress/e2e/features/auth/login.feature"
```

### Advanced Examples

```bash
# Smoke tests in QA with Firefox
node scripts/run-tagged-tests.js --tags "@smoke" --env qa --browser firefox

# Critical tests in headed mode
node scripts/run-tagged-tests.js --tags "@critical" --headed

# UI tests excluding mobile
node scripts/run-tagged-tests.js --tags "@ui and not @mobile"
```

## 📊 Reporting

### Generate Reports

```bash
# Generate HTML report
npm run report:generate

# Open report in browser
npm run report:open
```

### Report Features

The HTML report includes:
- ✅ Test execution summary
- 📊 Pass/fail statistics
- 🌍 Environment information
- 🕒 Execution timestamps
- 📱 Browser information
- 📈 Success rate visualization

### Report Location

Reports are saved to:
- `reports/html/index.html` - Main HTML report
- `cypress/screenshots/` - Test screenshots
- `cypress/videos/` - Test videos

## 🔧 Configuration

### Environment Configuration

Update configuration files in `config/` directory:

```json
{
  "baseUrl": "https://your-app.com",
  "timeout": 10000,
  "users": {
    "admin": {
      "username": "admin_user",
      "password": "admin_pass"
    },
    "user": {
      "username": "regular_user",
      "password": "user_pass"
    }
  }
}
```

### Using Configuration

```javascript
// In step definitions or page objects
const configManager = require('../utilities/configManager');

// Get user credentials
const adminUser = configManager.getUser('admin');
const regularUser = configManager.getUser('user');

// Get base URL
const baseUrl = configManager.getBaseUrl();

// Get timeout
const timeout = configManager.getTimeout();

// Get any config value
const customValue = configManager.get('custom.setting');
```

## 📱 Mobile Testing

### Set Mobile Viewport

```javascript
// In step definitions
Given('I am using a mobile device', () => {
  cy.setMobileViewport('iphone-x');
});

// Available devices
cy.setMobileViewport('iphone-x');    // 375x812
cy.setMobileViewport('ipad');        // 768x1024
cy.setMobileViewport('samsung-s10'); // 360x760
```

### Mobile-Specific Tests

```gherkin
@mobile @ui
Feature: Mobile Navigation
  As a mobile user
  I want to navigate the app
  So that I can access all features

  @smoke
  Scenario: Mobile menu functionality
    Given I am using a mobile device
    When I visit the home page
    Then the mobile menu should be visible
    When I tap the menu button
    Then the navigation menu should expand
```

## 📝 Data-Driven Testing

### Scenario Outlines

```gherkin
@data-driven @regression
Scenario Outline: Login with different users
  When I login with credentials "<username>" and "<password>"
  Then I should see the "<expectedPage>" page

  Examples:
    | username | password  | expectedPage |
    | admin    | admin123  | dashboard    |
    | user     | user123   | profile      |
    | manager  | mgr123    | reports      |
```

### Using Test Data

```javascript
// Generate test data
const email = cy.generateTestData('email');
const username = cy.generateTestData('username');
const password = cy.generateTestData('password');

// Use in tests
cy.get('[data-cy="email"]').type(email);
cy.get('[data-cy="username"]').type(username);
cy.get('[data-cy="password"]').type(password);
```

## 🎯 Best Practices

### Test Writing

1. **Use descriptive scenario names**
   ```gherkin
   # Good
   Scenario: User can login with valid credentials and access dashboard
   
   # Bad
   Scenario: Login test
   ```

2. **Keep scenarios focused**
   ```gherkin
   # Good - Single responsibility
   Scenario: User can reset password
   
   # Bad - Multiple responsibilities
   Scenario: User can login, update profile, and logout
   ```

3. **Use appropriate tags**
   ```gherkin
   @smoke @ui @critical @login
   Scenario: Successful login
   ```

### Step Definitions

1. **Make steps reusable**
   ```javascript
   // Good - Generic step
   When('I click the {string} button', (buttonText) => {
     cy.contains('button', buttonText).click();
   });
   
   // Bad - Specific step
   When('I click the login button', () => {
     cy.get('[data-cy="login-button"]').click();
   });
   ```

2. **Use page objects**
   ```javascript
   // Good
   When('I enter valid credentials', () => {
     loginPage.enterCredentials('user', 'password');
   });
   
   // Bad
   When('I enter valid credentials', () => {
     cy.get('[data-cy="username"]').type('user');
     cy.get('[data-cy="password"]').type('password');
   });
   ```

### Data Management

1. **Use configuration files**
   ```javascript
   // Good
   const user = configManager.getUser('admin');
   
   // Bad
   const user = { username: 'admin', password: 'hardcoded' };
   ```

2. **Use data-cy attributes**
   ```html
   <!-- Good -->
   <button data-cy="login-button">Login</button>
   
   <!-- Bad -->
   <button class="btn btn-primary">Login</button>
   ```

## 🔍 Debugging

### Debug Commands

```javascript
// Add debug points
cy.debug();

// Log information
cy.logStep('Entering login credentials');

// Take screenshots
cy.takeScreenshot('before-login');

// Pause execution
cy.pause();
```

### Debug Mode

```bash
# Run with debug output
DEBUG=cypress:* npm run cy:run

# Run specific debug categories
DEBUG=cypress:server:* npm run cy:run
```

### Common Debugging Techniques

1. **Use cy.log() for debugging**
   ```javascript
   cy.log('Current URL:', window.location.href);
   ```

2. **Check element existence**
   ```javascript
   cy.get('[data-cy="element"]').should('exist');
   ```

3. **Wait for elements**
   ```javascript
   cy.waitForElement('[data-cy="loading"]');
   ```

## 🔄 CI/CD Integration

### Jenkins Pipeline

The framework includes a Jenkins pipeline with parameters:

- **Environment**: dev, qa, uat
- **Browser**: chrome, firefox, edge
- **Tags**: Test tags to execute
- **Headless Mode**: Run in headless mode

### Pipeline Features

- ✅ Parameterized builds
- 📊 Automatic report generation
- 📁 Artifact archival
- 🔄 Clean workspace

### Running in CI/CD

```bash
# Example Jenkins build command
npx cypress run --browser chrome --env environment=qa,tags='@smoke'
```

## 🆘 Troubleshooting

### Common Issues

**Tests not finding elements:**
```javascript
// Use proper waits
cy.waitForElement('[data-cy="element"]');

// Check element visibility
cy.shouldBeVisible('[data-cy="element"]');
```

**Configuration not loading:**
```javascript
// Check environment setting
console.log(configManager.getCurrentEnvironment());

// Verify config file exists
console.log(configManager.getConfig());
```

**Browser issues:**
```bash
# Verify browser installation
npx cypress info

# Run in headed mode for debugging
node scripts/run-tagged-tests.js --tags "@smoke" --headed
```

This usage guide provides comprehensive information on how to effectively use the simple E2E automation framework. For more examples, check the `cypress/e2e/features/examples/` directory.

