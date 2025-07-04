# 🚀 Simple E2E Automation Framework

A streamlined end-to-end testing framework using **Cypress**, **Cucumber**, and **Mochawesome** reporting.

## ✨ Features

- 🧪 **Cypress + Cucumber** - BDD testing with Gherkin syntax
- 🏷️ **Test Tagging** - Organize and run specific test groups
- 🌍 **Multi-Environment Support** - dev, qa, uat configurations
- 📊 **Mochawesome Reporting** - Beautiful HTML reports with screenshots
- 🔄 **Jenkins CI/CD** - Ready-to-use pipeline configuration
- 🏗️ **Page Object Model** - Maintainable test structure
- 📱 **Mobile Testing** - Responsive design testing

## 🚀 Quick Start

### Installation
```bash
git clone <repository-url>
cd simple-e2e-framework
npm install
```

### Run Tests
```bash
# Interactive mode
npm run cy:open

# Headless mode
npm run cy:run

# Run specific test groups
npm run test:smoke
npm run test:regression
npm run test:ui

# Run with automatic report opening
npm run test:smoke:report
npm run test:regression:report
npm run test:ui:report
```

### Environment-Specific Testing
```bash
npm run test:dev
npm run test:qa
npm run test:uat
```

## 📊 Reporting

This framework uses **Mochawesome** for clean, professional HTML reports with embedded screenshots and videos.

### Generate Reports
```bash
# After running tests, generate merged report
npm run report:merge
npm run report:generate

# Or do both in one command
npm run report:full

# Open the report
npm run report:open
```

### Report Features
- ✅ **Embedded Screenshots** - Failures automatically captured
- 🎥 **Video Integration** - Test execution videos included
- 📊 **Test Statistics** - Pass/fail rates and timing
- 🎨 **Professional Design** - Clean, readable HTML reports
- 📱 **Mobile Responsive** - View reports on any device

### Report Location
- **HTML Report**: `reports/html/mochawesome.html`
- **JSON Data**: `reports/temp/*.json`
- **Screenshots**: `cypress/screenshots/`
- **Videos**: `cypress/videos/`

## 🏷️ Test Tagging

Organize your tests with tags:

```gherkin
@smoke @ui
Feature: Login functionality

@regression @critical
Scenario: Valid user login
  Given I am on the login page
  When I enter valid credentials
  Then I should be logged in successfully
```

### Available Tags
- `@smoke` - Quick smoke tests
- `@regression` - Full regression suite
- `@ui` - UI-focused tests
- `@critical` - Critical path tests
- `@mobile` - Mobile-specific tests

### Run Tagged Tests
```bash
cypress run --env tags='@smoke'
cypress run --env tags='@regression'
cypress run --env tags='@ui and @critical'
```

## 🌍 Environment Configuration

Configure different environments in the `config/` directory:

### config/dev.json
```json
{
  "baseUrl": "https://dev.example.com",
  "timeout": 10000,
  "users": {
    "testUser": {
      "username": "dev_user",
      "password": "dev_password"
    }
  }
}
```

### config/qa.json
```json
{
  "baseUrl": "https://qa.example.com",
  "timeout": 15000,
  "users": {
    "testUser": {
      "username": "qa_user",
      "password": "qa_password"
    }
  }
}
```

## 📁 Project Structure

```
├── cypress/
│   ├── e2e/features/           # Feature files (.feature)
│   ├── support/
│   │   ├── pages/              # Page Object Model classes
│   │   ├── step_definitions/   # Step implementations
│   │   ├── utilities/          # Helper utilities
│   │   ├── commands.js         # Custom Cypress commands
│   │   └── e2e.js             # Support file
├── config/                     # Environment configurations
├── reports/                    # Generated reports
├── scripts/                    # Utility scripts
├── docs/                       # Documentation
├── cypress.config.js          # Cypress configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🧪 Writing Tests

### Feature File Example
```gherkin
@smoke @ui
Feature: User Authentication

  Background:
    Given I am on the login page

  @critical
  Scenario: Successful login with valid credentials
    When I enter username "testuser" and password "password123"
    And I click the login button
    Then I should see the dashboard
    And I should see welcome message "Welcome, testuser"

  @negative
  Scenario: Failed login with invalid credentials
    When I enter username "invalid" and password "wrong"
    And I click the login button
    Then I should see error message "Invalid credentials"
```

### Step Definition Example
```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../pages/LoginPage';

const loginPage = new LoginPage();

Given('I am on the login page', () => {
  loginPage.visit();
});

When('I enter username {string} and password {string}', (username, password) => {
  loginPage.enterCredentials(username, password);
});

When('I click the login button', () => {
  loginPage.clickLogin();
});

Then('I should see the dashboard', () => {
  cy.url().should('include', '/dashboard');
});
```

### Page Object Example
```javascript
class LoginPage {
  visit() {
    cy.visit('/login');
  }

  enterCredentials(username, password) {
    cy.get('[data-cy=username]').type(username);
    cy.get('[data-cy=password]').type(password);
  }

  clickLogin() {
    cy.get('[data-cy=login-button]').click();
  }
}

export default LoginPage;
```

## 🔄 CI/CD Integration

### Jenkins Pipeline
The framework includes a `Jenkinsfile` for easy CI/CD integration:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm run test:smoke'
            }
        }
        
        stage('Generate Reports') {
            steps {
                sh 'npm run report:full'
            }
        }
        
        stage('Archive Reports') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports/html',
                    reportFiles: 'mochawesome.html',
                    reportName: 'E2E Test Report'
                ])
            }
        }
    }
}
```

## 🛠️ Custom Commands

The framework includes useful custom Cypress commands:

```javascript
// Set mobile viewport
cy.setMobileViewport();

// Take screenshot with custom name
cy.takeScreenshot('custom-name');

// Wait for element with custom timeout
cy.waitForElement('[data-cy=element]', 15000);

// Login with test user
cy.loginAsTestUser();
```

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Usage Guide](docs/USAGE.md) - Comprehensive usage examples
- [Best Practices](docs/BEST_PRACTICES.md) - Testing best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:
- Check the [documentation](docs/)
- Create an issue in the repository
- Contact the E2E Automation Team

---

**Happy Testing! 🧪✨**

