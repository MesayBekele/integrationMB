# E2E Automation Framework Usage Guide

This guide covers how to use the E2E automation framework effectively for writing, organizing, and executing tests.

## 📚 Table of Contents

1. [Writing Tests](#writing-tests)
2. [Test Organization](#test-organization)
3. [Using Tags](#using-tags)
4. [Data-Driven Testing](#data-driven-testing)
5. [Page Object Model](#page-object-model)
6. [API Testing](#api-testing)
7. [Database Testing](#database-testing)
8. [Running Tests](#running-tests)
9. [Reporting](#reporting)
10. [Best Practices](#best-practices)

## 🧪 Writing Tests

### Feature Files

Feature files use Gherkin syntax and are located in `cypress/e2e/features/`. Here's the basic structure:

```gherkin
@smoke @ui @login
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  Background:
    Given I am on the login page

  @critical @smoke
  Scenario: Successful login with valid credentials
    When I enter valid admin credentials
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message
```

### Step Definitions

Step definitions are JavaScript functions that implement the Gherkin steps:

```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the login page', () => {
  cy.visit('/login');
});

When('I enter valid admin credentials', () => {
  const user = configManager.getUser('admin');
  cy.get('[data-cy="username"]').type(user.username);
  cy.get('[data-cy="password"]').type(user.password);
});

Then('I should be redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');
});
```

### Custom Commands

Use custom commands for reusable functionality:

```javascript
// In cypress/support/commands.js
Cypress.Commands.add('loginAs', (userType) => {
  const user = configManager.getUser(userType);
  cy.visit('/login');
  cy.get('[data-cy="username"]').type(user.username);
  cy.get('[data-cy="password"]').type(user.password);
  cy.get('[data-cy="login-button"]').click();
});

// In your test
cy.loginAs('admin');
```

## 🗂️ Test Organization

### Directory Structure

```
cypress/e2e/features/
├── auth/
│   ├── login.feature
│   ├── logout.feature
│   └── password-reset.feature
├── user-management/
│   ├── user-creation.feature
│   └── user-profile.feature
├── api/
│   ├── user-api.feature
│   └── product-api.feature
└── examples/
    ├── login.feature
    └── api-tests.feature
```

### Naming Conventions

- **Feature files**: Use kebab-case (e.g., `user-login.feature`)
- **Step definition files**: Use snake_case (e.g., `login_steps.js`)
- **Page objects**: Use PascalCase (e.g., `LoginPage.js`)
- **Utilities**: Use camelCase (e.g., `apiHelper.js`)

### Feature Organization

Group related scenarios in the same feature file:

```gherkin
Feature: User Management
  As an admin
  I want to manage users
  So that I can control system access

  @smoke @admin
  Scenario: Create new user
    # Steps here

  @regression @admin
  Scenario: Update user information
    # Steps here

  @regression @admin
  Scenario: Delete user
    # Steps here
```

## 🏷️ Using Tags

### Tag Categories

The framework supports multiple tag categories:

```gherkin
@smoke @ui @critical @login
Feature: Login Functionality

@regression @api @medium @user-management
Feature: User API

@integration @database @high @orders
Feature: Order Processing
```

### Tag Types

- **Test Types**: `@smoke`, `@regression`, `@sanity`, `@integration`, `@e2e`
- **Components**: `@ui`, `@api`, `@database`, `@mobile`, `@desktop`
- **Priorities**: `@critical`, `@high`, `@medium`, `@low`
- **Features**: `@login`, `@registration`, `@checkout`, `@payment`
- **Status**: `@wip`, `@ready`, `@blocked`, `@skip`

### Running Tagged Tests

```bash
# Run smoke tests
npm run test:smoke

# Run specific tags
npm run cy:run -- --env tags="@smoke and @ui"

# Exclude certain tags
npm run cy:run -- --env tags="@regression and not @wip"

# Complex tag expressions
npm run cy:run -- --env tags="(@smoke or @sanity) and @ui"

# Using the tag runner script
node scripts/run-tagged-tests.js --tags "@critical" --env qa
```

## 📊 Data-Driven Testing

### Scenario Outlines

Use scenario outlines for data-driven tests:

```gherkin
@data-driven @regression
Scenario Outline: Login with different user types
  When I login as "<userType>" with credentials "<username>" and "<password>"
  Then I should see the "<expectedPage>" page
  And I should have "<accessLevel>" access permissions

  Examples:
    | userType | username | password    | expectedPage | accessLevel |
    | admin    | admin    | Admin123!   | dashboard    | full        |
    | user     | testuser | User123!    | profile      | limited     |
    | manager  | manager  | Manager123! | reports      | moderate    |
```

### External Data Sources

#### JSON Data Files

```javascript
// cypress/fixtures/testData/users.json
{
  "validUsers": [
    {
      "username": "admin",
      "password": "Admin123!",
      "role": "administrator"
    },
    {
      "username": "user",
      "password": "User123!",
      "role": "user"
    }
  ]
}

// In step definitions
cy.fixture('testData/users').then((data) => {
  data.validUsers.forEach(user => {
    // Use user data
  });
});
```

#### CSV Data Files

```javascript
// Load CSV data
cy.task('readFile', 'cypress/fixtures/testData/users.csv').then((csvData) => {
  const users = csvData.split('\n').map(line => line.split(','));
  // Process CSV data
});
```

#### Database Data

```javascript
// Load data from database
cy.dbSelect('users', { active: true }).then((users) => {
  users.forEach(user => {
    // Use database user data
  });
});
```

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

  navigateToLogin() {
    this.visit('/login');
    return this;
  }

  enterCredentials(username, password) {
    this.typeText(this.elements.usernameInput, username);
    this.typeText(this.elements.passwordInput, password);
    return this;
  }

  clickLogin() {
    this.clickElement(this.elements.loginButton);
    return this;
  }

  verifyErrorMessage(message) {
    this.verifyElementText(this.elements.errorMessage, message);
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
  loginPage.navigateToLogin();
});

When('I enter valid credentials', () => {
  loginPage.enterCredentials('admin', 'password123');
});

When('I click the login button', () => {
  loginPage.clickLogin();
});
```

### Page Object Inheritance

```javascript
// BasePage.js - Common functionality
class BasePage {
  visit(url) {
    cy.visit(url);
    return this;
  }

  clickElement(selector) {
    cy.get(selector).click();
    return this;
  }

  typeText(selector, text) {
    cy.get(selector).clear().type(text);
    return this;
  }
}

// Specific page extends BasePage
class DashboardPage extends BasePage {
  constructor() {
    super();
    this.elements = {
      welcomeMessage: '[data-cy="welcome"]',
      logoutButton: '[data-cy="logout"]'
    };
  }

  verifyWelcomeMessage() {
    cy.get(this.elements.welcomeMessage).should('be.visible');
    return this;
  }
}
```

## 🔌 API Testing

### Basic API Tests

```javascript
// In step definitions
When('I make a GET request to {string}', (endpoint) => {
  cy.apiGet(endpoint).as('apiResponse');
});

Then('the response status should be {int}', (expectedStatus) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.status).to.equal(expectedStatus);
  });
});

Then('the response should contain {string}', (expectedData) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.include(expectedData);
  });
});
```

### API Authentication

```javascript
// Authenticate before API calls
Given('I am authenticated as an admin', () => {
  cy.apiLogin('admin').then((response) => {
    expect(response.status).to.equal(200);
    // Token is automatically stored in apiHelper
  });
});

// Make authenticated requests
When('I create a user via API', () => {
  const userData = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'Password123!'
  };
  cy.apiPost('/users', userData).as('createUserResponse');
});
```

### API Response Validation

```javascript
// Validate response structure
Then('the response should have valid user structure', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('username');
    expect(response.body).to.have.property('email');
    expect(response.body).to.have.property('createdAt');
    expect(response.body.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

// Validate response time
Then('the response time should be acceptable', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.duration).to.be.lessThan(2000); // 2 seconds
  });
});
```

## 🗄️ Database Testing

### Database Operations

```javascript
// Create test data
Given('I have a test user in the database', () => {
  cy.createTestUser({
    username: 'testuser',
    email: 'test@example.com'
  }).as('testUser');
});

// Query database
When('I check the user in the database', () => {
  cy.get('@testUser').then((user) => {
    cy.dbSelect('users', { id: user.id }).as('dbUser');
  });
});

// Verify database state
Then('the user should exist in the database', () => {
  cy.get('@dbUser').then((users) => {
    expect(users).to.have.length(1);
    expect(users[0]).to.have.property('username', 'testuser');
  });
});
```

### Database Cleanup

```javascript
// Clean up after tests
afterEach(() => {
  cy.dbQuery('DELETE FROM users WHERE username LIKE "test%"');
});

// Or use helper methods
afterEach(() => {
  cy.task('cleanupTestData');
});
```

## 🏃‍♂️ Running Tests

### Local Development

```bash
# Interactive mode
npm run cy:open

# Headless mode
npm run cy:run

# Specific environment
npm run test:dev
npm run test:qa
npm run test:uat

# Specific browser
npm run cy:run:chrome
npm run cy:run:firefox
```

### Command Line Options

```bash
# Run with specific tags
npx cypress run --env tags="@smoke"

# Run specific spec file
npx cypress run --spec "cypress/e2e/features/login.feature"

# Run with custom environment
npx cypress run --env environment=qa,tags="@regression"

# Run in headed mode
npx cypress run --headed

# Run with specific browser
npx cypress run --browser firefox
```

### Parallel Execution

```bash
# Using Cypress Dashboard
npm run test:parallel

# Using custom parallel runner
node scripts/run-tagged-tests.js --tags "@regression" --parallel
```

## 📊 Reporting

### Generate Reports

```bash
# Generate all report types
npm run report:generate

# Generate specific format
node scripts/generate-reports.js --format html
node scripts/generate-reports.js --format cucumber
node scripts/generate-reports.js --format json

# Merge multiple reports
npm run report:merge
```

### View Reports

```bash
# Open HTML report
npm run report:open

# Or manually open
open reports/html/index.html
```

### Custom Report Configuration

```javascript
// In cypress.config.js
module.exports = defineConfig({
  e2e: {
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      configFile: 'reporter-config.json'
    }
  }
});
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
     loginPage.enterCredentials('admin', 'password');
   });
   
   // Bad
   When('I enter valid credentials', () => {
     cy.get('[data-cy="username"]').type('admin');
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

2. **Clean up test data**
   ```javascript
   afterEach(() => {
     cy.cleanupTestData();
   });
   ```

### Error Handling

1. **Use proper assertions**
   ```javascript
   // Good
   cy.get('[data-cy="error"]').should('contain.text', 'Invalid credentials');
   
   // Bad
   cy.get('[data-cy="error"]').should('be.visible');
   ```

2. **Handle async operations**
   ```javascript
   // Good
   cy.intercept('POST', '/api/login').as('loginRequest');
   cy.get('[data-cy="login-button"]').click();
   cy.wait('@loginRequest');
   
   // Bad
   cy.get('[data-cy="login-button"]').click();
   cy.wait(2000); // Arbitrary wait
   ```

## 🔧 Advanced Usage

### Custom Cypress Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('dragAndDrop', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).trigger('mousedown', { button: 0 });
  cy.get(targetSelector).trigger('mousemove').trigger('mouseup');
});

// Usage
cy.dragAndDrop('[data-cy="item"]', '[data-cy="dropzone"]');
```

### Environment-Specific Configuration

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const environment = config.env.environment || 'dev';
      const envConfig = require(`./config/${environment}.json`);
      
      config.baseUrl = envConfig.baseUrl;
      config.env = { ...config.env, ...envConfig };
      
      return config;
    }
  }
});
```

### Plugin Integration

```javascript
// cypress.config.js
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      
      // Add other plugins
      on('task', {
        customTask: (params) => {
          // Custom task implementation
          return null;
        }
      });
      
      return config;
    }
  }
});
```

This usage guide provides comprehensive information on how to effectively use the E2E automation framework. For more specific examples and advanced techniques, refer to the example tests in the `cypress/e2e/features/examples/` directory.

