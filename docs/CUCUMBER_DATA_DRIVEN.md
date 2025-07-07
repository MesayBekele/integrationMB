# Cucumber Data-Driven Testing Guide

This framework combines Cypress 11 with Cucumber for powerful data-driven testing capabilities while maintaining Mochawesome reporting.

## 🥒 Cucumber Features

### Scenario Outlines with Examples Tables

Cucumber's scenario outlines allow you to run the same test logic with multiple data sets:

```gherkin
@smoke @data-driven
Feature: User Login - Data Driven Testing

  @positive @critical
  Scenario Outline: Successful login with valid credentials
    Given I am on the login page
    When I enter username "<username>" and password "<password>"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message for "<role>" user

    Examples:
      | username | password     | role    |
      | admin    | Admin123!    | admin   |
      | manager  | Manager123!  | manager |
      | user     | User123!     | user    |
```

### Data Tables for Complex Data

Use data tables for passing structured data to steps:

```gherub
When I send a POST request to "/auth/login" with:
  | username | admin     |
  | password | Admin123! |
```

### Tag-Based Test Organization

Organize tests using Cucumber tags:

```gherkin
@smoke @ui @data-driven
Feature: Login Tests

@positive @critical
Scenario: Admin login

@negative @validation  
Scenario: Invalid credentials
```

## 📊 Data-Driven Testing Patterns

### 1. User Credentials Testing

```gherkin
Scenario Outline: Login with different user types
  When I login with username "<username>" and password "<password>"
  Then I should see role "<expectedRole>"

  Examples:
    | username | password     | expectedRole |
    | admin    | Admin123!    | admin        |
    | manager  | Manager123!  | manager      |
    | user     | User123!     | user         |
```

### 2. Form Validation Testing

```gherkin
Scenario Outline: Form validation with different input types
  Given I am on the registration page
  When I enter "<fieldType>" with value "<value>"
  Then the validation should "<expectedResult>"

  Examples:
    | fieldType | value              | expectedResult |
    | email     | test@example.com   | pass          |
    | email     | invalid-email      | fail          |
    | phone     | +1-555-123-4567   | pass          |
    | phone     | invalid-phone     | fail          |
```

### 3. Cross-Browser Testing

```gherkin
Scenario Outline: Cross-browser compatibility
  Given I am using "<browser>" browser with "<viewport>" viewport
  When I perform login workflow
  Then the application should work correctly

  Examples:
    | browser | viewport |
    | chrome  | desktop  |
    | firefox | desktop  |
    | chrome  | mobile   |
```

### 4. Environment Testing

```gherkin
Scenario Outline: Multi-environment validation
  Given I am testing against "<environment>" environment
  When I access the application
  Then the base URL should be "<expectedUrl>"

  Examples:
    | environment | expectedUrl              |
    | dev         | https://dev.example.com  |
    | qa          | https://qa.example.com   |
    | uat         | https://uat.example.com  |
```

## 🏗️ Step Definition Patterns

### Parameterized Steps

```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I enter username {string} and password {string}', (username, password) => {
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="password-input"]').type(password);
});

Then('the user role should be {string}', (expectedRole) => {
  cy.get('[data-cy="user-role"]').should('contain', expectedRole);
});
```

### Data Table Handling

```javascript
When('I send a POST request to {string} with:', (endpoint, dataTable) => {
  const requestData = dataTable.rowsHash();
  cy.request({
    method: 'POST',
    url: `${Cypress.env('baseUrl')}${endpoint}`,
    body: requestData
  }).as('formResponse');
});
```

### Dynamic Data Loading

```javascript
Given('I have test data for {string}', (dataType) => {
  cy.fixture(`test-data/${dataType}`).then((data) => {
    Cypress.env('TEST_DATA', data);
  });
});
```

## 🎯 Running Data-Driven Tests

### Run All Cucumber Features

```bash
npm run test:features
```

### Run by Tags

```bash
npm run test:smoke              # All smoke tests
npm run test:data-driven        # All data-driven tests
npm run test:cucumber:smoke     # Only Cucumber smoke tests
npm run test:cucumber:ui        # Only Cucumber UI tests
```

### Run by Environment

```bash
npm run test:dev:smoke          # Smoke tests in dev
npm run test:qa:regression      # Regression tests in QA
npm run test:uat:smoke          # Smoke tests in UAT
```

### Hybrid Testing (Cucumber + Cypress)

```bash
npm run test:hybrid             # Run both .feature and .cy.js files
```

## 📈 Reporting

The framework generates comprehensive Mochawesome reports that include:

- Cucumber scenario results
- Data-driven test iterations
- Screenshots on failures
- Test execution metrics
- Environment information

### Generate Reports

```bash
npm run report:merge            # Merge individual reports
npm run report:generate         # Generate HTML report
npm run report:all              # Merge and generate
```

## 🔧 Configuration

### Cucumber Preprocessor Configuration

`.cypress-cucumber-preprocessorrc.json`:

```json
{
  "stepDefinitions": [
    "cypress/e2e/step_definitions/**/*.{js,ts}"
  ],
  "html": {
    "enabled": false
  },
  "json": {
    "enabled": false
  },
  "filterSpecs": true,
  "omitFiltered": true
}
```

### Cypress Configuration

`cypress.config.js` supports both `.feature` and `.cy.js` files:

```javascript
specPattern: [
  'cypress/e2e/**/*.feature',
  'cypress/e2e/**/*.cy.js'
]
```

## 📁 File Organization

```
cypress/
├── e2e/
│   ├── features/                 # Cucumber feature files
│   │   ├── data-driven/         # Data-driven scenarios
│   │   └── smoke/               # Smoke test features
│   ├── step_definitions/        # Step definitions
│   │   ├── common/              # Common steps
│   │   └── ui/                  # UI-specific steps
│   ├── smoke/                   # Regular Cypress tests
│   └── regression/              # Regular Cypress tests
├── fixtures/
│   └── test-data/               # Test data files
└── support/
    ├── e2e.js                   # Support file
    ├── commands.js              # Custom commands
    ├── data-driven.js           # Data-driven utilities
    └── pages/                   # Page object models
```

## 🎨 Best Practices

### 1. Feature File Organization

- Group related scenarios in the same feature file
- Use descriptive feature and scenario names
- Apply consistent tagging strategy

### 2. Data Management

- Store test data in `cypress/fixtures/test-data/`
- Use meaningful data descriptions in examples tables
- Keep data sets focused and relevant

### 3. Step Definition Reusability

- Create reusable step definitions
- Use parameterized steps for flexibility
- Organize steps by domain (UI, forms, common)

### 4. Tag Strategy

- Use hierarchical tags: `@smoke @ui @positive`
- Combine functional and technical tags
- Use tags for test organization and filtering

### 5. Reporting

- Take screenshots on failures
- Add meaningful assertions
- Use descriptive test names

## 🚀 Advanced Features

### Custom Data Generators

```javascript
// In step definitions
When('I test with generated data', () => {
  const testData = {
    username: `user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    timestamp: new Date().toISOString()
  };
  
  // Use generated data in test
});
```

### Dynamic Examples

```javascript
// Generate examples programmatically
const users = ['admin', 'manager', 'user'];
const browsers = ['chrome', 'firefox'];

// Create combinations for testing
```

### Performance Testing

```gherkin
Scenario Outline: Performance testing with load
  When I send <requestCount> concurrent requests
  Then all responses should complete within <maxTime> seconds
  And the success rate should be above <minRate>%

  Examples:
    | requestCount | maxTime | minRate |
    | 10          | 5       | 95      |
    | 50          | 10      | 90      |
    | 100         | 15      | 85      |
```

This hybrid approach gives you the best of both worlds: Cucumber's excellent data-driven capabilities with Cypress's robust testing framework and Mochawesome's comprehensive reporting.
