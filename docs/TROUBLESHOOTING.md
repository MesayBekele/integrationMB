# 🔧 Troubleshooting Guide

This guide helps resolve common issues with the E2E automation framework.

## 🚨 Common Issues and Solutions

### 1. Cypress Cucumber Preprocessor Source Mapping Error

**Error Message:**
```
cypress-cucumber-preprocessor: unable to find source mapping url within the response
```

**Root Cause:**
This error occurs when the esbuild bundler tries to generate source maps for Cucumber step definitions, but the source mapping configuration is incompatible.

**✅ Solution Applied:**
The framework has been configured to resolve this issue:

#### **cypress.config.js Configuration:**
```javascript
// Esbuild bundler for step definitions with source mapping fix
on('file:preprocessor',
  createBundler({
    plugins: [createEsbuildPlugin(config)],
    // Fix for source mapping issue
    sourcemap: false,        // Disable source maps
    target: 'node14',        // Set compatible target
    format: 'cjs'           // Use CommonJS format
  })
);
```

#### **package.json Configuration:**
```json
{
  "cypress-cucumber-preprocessor": {
    "stepDefinitions": ["cypress/support/step_definitions/**/*.js"],
    "html": {
      "enabled": true,
      "output": "reports/cucumber/cucumber-report.html"
    },
    "json": {
      "enabled": true,
      "output": "reports/cucumber/cucumber-report.json"
    },
    "filterSpecs": true,
    "omitFiltered": true,
    "messages": {
      "enabled": false    // Prevents source mapping issues
    }
  }
}
```

#### **Additional Configuration File:**
`.cypress-cucumber-preprocessorrc.json` provides extra configuration to ensure compatibility.

### 2. Missing Dependencies in CI/CD

**Error Messages:**
- `Your system is missing the dependency: Xvfb`
- `error while loading shared libraries: libnss3.so`
- `error while loading shared libraries: libgbm.so.1`

**✅ Solution:**
Install required system dependencies:

```bash
# For Ubuntu/Debian systems
sudo apt-get update
sudo apt-get install -y \
  xvfb \
  libnss3-dev \
  libgconf-2-4 \
  libxss1 \
  libxtst6 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libcairo-gobject2 \
  libgtk-3-0 \
  libgdk-pixbuf2.0-0 \
  libgbm1
```

### 3. Report Generation Issues

**Error Message:**
```
Cannot find module 'fs-extra'
```

**✅ Solution:**
The framework has been simplified to use only Mochawesome reporting without custom scripts:

```bash
# Use these commands instead
npm run report:merge      # Merge JSON files
npm run report:generate   # Create HTML report
npm run report:full       # Do both steps
npm run report:open       # Open report
```

### 4. Step Definitions Not Found

**Error Message:**
```
Step implementation missing for: Given I am on the login page
```

**✅ Solution:**
Ensure step definitions are in the correct location:

```
cypress/support/step_definitions/
├── login.js
├── common.js
└── test-config.js
```

Example step definition:
```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the login page', () => {
  cy.visit('/login');
});
```

### 5. Environment Configuration Issues

**Error Message:**
```
Could not load config for dev, using defaults
```

**✅ Solution:**
Ensure environment configuration files exist:

```
config/
├── dev.json
├── qa.json
└── uat.json
```

Example configuration:
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

## 🔍 Debugging Tips

### 1. Verify Configuration
```bash
# Check Cypress configuration
node -e "require('./cypress.config.js'); console.log('✅ Config valid');"

# Check package.json configuration
node -e "const pkg = require('./package.json'); console.log(pkg['cypress-cucumber-preprocessor']);"
```

### 2. Test Simple Feature
Create a minimal test to verify setup:

**cypress/e2e/features/test-config.feature:**
```gherkin
@smoke
Feature: Configuration Test
  Scenario: Verify setup
    Given I can run a simple test
    Then the test should pass
```

**cypress/support/step_definitions/test-config.js:**
```javascript
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I can run a simple test', () => {
  cy.log('✅ Configuration working');
});

Then('the test should pass', () => {
  expect(true).to.be.true;
});
```

### 3. Check Dependencies
```bash
# Verify Cypress installation
npx cypress verify

# Check installed packages
npm list @badeball/cypress-cucumber-preprocessor
npm list cypress-mochawesome-reporter
```

## 📞 Getting Help

If you encounter issues not covered here:

1. **Check the logs** - Look for specific error messages
2. **Verify dependencies** - Ensure all packages are installed
3. **Test incrementally** - Start with simple tests
4. **Check configuration** - Validate syntax and paths
5. **Review documentation** - Check official Cypress and Cucumber docs

## 🎯 Prevention

To avoid common issues:

1. **Use the provided npm scripts** - Don't run Cypress commands directly
2. **Follow the project structure** - Keep files in designated directories
3. **Test configuration changes** - Verify setup after modifications
4. **Keep dependencies updated** - Regularly update packages
5. **Use environment configs** - Don't hardcode values

---

**The framework has been designed to minimize common issues and provide clear error messages when problems occur! 🛠️✨**

