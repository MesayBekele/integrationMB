# 🔧 Troubleshooting Guide

This guide covers common issues and their solutions when working with the Cypress-Cucumber E2E Testing Framework.

## 📋 Table of Contents

- [Known Issues](#-known-issues)
- [Installation Issues](#-installation-issues)
- [Configuration Issues](#-configuration-issues)
- [Test Execution Issues](#-test-execution-issues)
- [Reporting Issues](#-reporting-issues)
- [CI/CD Issues](#-cicd-issues)
- [Performance Issues](#-performance-issues)
- [Debug Techniques](#-debug-techniques)

## 🚨 Known Issues

### Step Definitions Not Loading

**Status**: 🔴 **CRITICAL KNOWN ISSUE**

**Description**: Feature files are parsed correctly, but step definitions are not being loaded, resulting in pending tests.

**Symptoms**:
- Tests show as "pending" instead of executing
- Console logs from step definition files don't appear
- Test duration is very short (0-400ms)
- No step execution occurs

**Investigation Summary**:
- ✅ Cypress and Cucumber preprocessor properly installed
- ✅ esbuild preprocessor correctly configured
- ✅ Feature files are being parsed and found
- ✅ Configuration files are correct
- ❌ Step definition files are not being loaded at all

**Debugging Steps Taken**:
1. **Configuration Testing**:
   ```bash
   # Tested multiple configuration approaches
   - Fresh configuration files
   - Different step definition patterns
   - Alternative file locations
   - Both CommonJS and ES6 imports
   ```

2. **File Structure Testing**:
   ```bash
   # Tried multiple step definition locations
   cypress/e2e/step_definitions/**/*.js
   cypress/e2e/features/**/*.js (colocated)
   cypress/support/step_definitions/**/*.js
   ```

3. **Preprocessor Testing**:
   ```bash
   # Confirmed esbuild preprocessor is required
   - Without esbuild: 0ms duration (files not processed)
   - With esbuild: 300-400ms duration (files processed, but steps not loaded)
   ```

**Current Workarounds**:

1. **Pure Cypress Approach** (Recommended):
   ```javascript
   // Instead of Cucumber, use pure Cypress
   describe('Login Tests', () => {
     it('should login successfully', () => {
       cy.visit('/login');
       cy.get('[data-testid="username"]').type('user@test.com');
       cy.get('[data-testid="password"]').type('password');
       cy.get('[data-testid="login-button"]').click();
       cy.url().should('not.include', '/login');
     });
   });
   ```

2. **Alternative Preprocessor**:
   ```javascript
   // Try webpack preprocessor instead of esbuild
   const webpack = require('@cypress/webpack-preprocessor');
   
   module.exports = defineConfig({
     e2e: {
       setupNodeEvents(on, config) {
         const options = {
           webpackOptions: {
             resolve: {
               extensions: ['.ts', '.js'],
             },
             module: {
               rules: [
                 {
                   test: /\.feature$/,
                   use: [
                     {
                       loader: '@badeball/cypress-cucumber-preprocessor/webpack',
                       options: config,
                     },
                   ],
                 },
               ],
             },
           },
         };
         on('file:preprocessor', webpack(options));
         return config;
       },
     },
   });
   ```

3. **Version Rollback**:
   ```bash
   # Try older version combinations
   npm install @badeball/cypress-cucumber-preprocessor@19.0.0
   npm install cypress@12.17.4
   ```

**Resolution Status**: 🔍 **Under Investigation**

This issue is being actively investigated. The framework structure is complete and functional for all other features. Once resolved, the Cucumber integration will work seamlessly.

## 🔧 Installation Issues

### Node.js Version Compatibility

**Issue**: Framework requires Node.js >= 18.0.0

**Solution**:
```bash
# Check current version
node --version

# Install Node.js 18+ using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### Cypress Installation Fails

**Issue**: Cypress binary download fails

**Solutions**:
```bash
# Clear Cypress cache
npx cypress cache clear

# Set Cypress cache folder
export CYPRESS_CACHE_FOLDER=~/.cache/Cypress

# Install with verbose logging
DEBUG=cypress:cli npm install cypress

# Manual installation
npx cypress install --force
```

### Permission Issues (Linux/Mac)

**Issue**: Permission denied during installation

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm instead of system Node.js
```

## ⚙️ Configuration Issues

### Environment Configuration Not Loading

**Issue**: Tests don't use environment-specific settings

**Diagnosis**:
```bash
# Check if config file exists
ls -la config/dev.json

# Verify environment variable
echo $CYPRESS_ENV

# Test configuration loading
node -e "console.log(require('./config/dev.json'))"
```

**Solutions**:
```bash
# Set environment explicitly
export CYPRESS_ENV=dev
npm run test:dev

# Or use npm script
npm run test:dev

# Verify in test
cy.task('log', Cypress.env('ENVIRONMENT'));
```

### Base URL Issues

**Issue**: Tests fail to navigate to correct URLs

**Solutions**:
```javascript
// In cypress.config.js
module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://your-app.com',
    // or load from environment
    baseUrl: process.env.CYPRESS_BASE_URL,
  }
});

// In test
cy.visit('/login'); // Uses baseUrl + /login
```

### Timeout Configuration

**Issue**: Tests timeout unexpectedly

**Solutions**:
```javascript
// Global timeout settings
module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
  }
});

// Per-command timeout
cy.get('[data-testid="slow-element"]', { timeout: 20000 });
```

## 🧪 Test Execution Issues

### Tests Not Found

**Issue**: Cypress doesn't find test files

**Solutions**:
```javascript
// Check specPattern in cypress.config.js
module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{feature,cy.js}',
  }
});

// Verify file structure
cypress/
├── e2e/
│   ├── features/
│   │   └── *.feature
│   └── *.cy.js
```

### Element Not Found

**Issue**: Elements not found during test execution

**Solutions**:
```javascript
// Wait for element to exist
cy.get('[data-testid="element"]').should('exist');

// Wait for element to be visible
cy.get('[data-testid="element"]').should('be.visible');

// Use data-testid attributes
<button data-testid="submit-button">Submit</button>

// Robust selectors
cy.get('[data-testid="submit"], #submit, .submit-btn').first();
```

### Flaky Tests

**Issue**: Tests pass/fail inconsistently

**Solutions**:
```javascript
// Add proper waits
cy.intercept('GET', '/api/data').as('getData');
cy.wait('@getData');

// Use should() for assertions
cy.get('[data-testid="result"]').should('contain', 'Success');

// Retry configuration
module.exports = defineConfig({
  e2e: {
    retries: {
      runMode: 2,
      openMode: 0
    }
  }
});
```

### Cross-Origin Issues

**Issue**: Tests fail due to cross-origin restrictions

**Solutions**:
```javascript
// Disable web security (not recommended for production)
module.exports = defineConfig({
  e2e: {
    chromeWebSecurity: false,
  }
});

// Use cy.origin() for cross-origin testing
cy.origin('https://external-site.com', () => {
  cy.visit('/external-page');
  cy.get('[data-testid="external-element"]').click();
});
```

## 📊 Reporting Issues

### Reports Not Generated

**Issue**: HTML/JSON reports are not created

**Diagnosis**:
```bash
# Check if JSON files exist
ls -la reports/json/

# Check for errors in report generation
npm run report:generate 2>&1 | tee report-errors.log

# Verify report script
node scripts/merge-reports.js
```

**Solutions**:
```bash
# Ensure directories exist
mkdir -p reports/json reports/html reports/junit

# Generate reports manually
npm run report:merge
npm run report:generate

# Check Cucumber preprocessor config
cat .cypress-cucumber-preprocessorrc.json
```

### Report Merge Issues

**Issue**: Multiple JSON reports not merging correctly

**Solutions**:
```javascript
// In scripts/merge-reports.js
const jsonFiles = fs.readdirSync(jsonDir)
  .filter(file => file.endsWith('.json') && file !== 'merged-report.json');

// Ensure proper JSON structure
if (Array.isArray(reportData)) {
  mergedReport = mergedReport.concat(reportData);
} else {
  mergedReport.push(reportData);
}
```

### Screenshots Missing

**Issue**: Failure screenshots not captured

**Solutions**:
```javascript
// Enable screenshots
module.exports = defineConfig({
  e2e: {
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
  }
});

// Manual screenshots
cy.screenshot('custom-screenshot');

// Conditional screenshots
if (Cypress.env('ENVIRONMENT') === 'dev') {
  cy.screenshot('debug-screenshot');
}
```

## 🔄 CI/CD Issues

### GitHub Actions Failures

**Issue**: Tests fail in GitHub Actions but pass locally

**Common Causes & Solutions**:

1. **Environment Differences**:
   ```yaml
   # In .github/workflows/cypress.yml
   env:
     CYPRESS_ENV: qa
     DISPLAY: :99
   ```

2. **Headless Browser Issues**:
   ```yaml
   - name: Run Cypress tests
     run: |
       Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
       npm run test:headless
   ```

3. **Dependency Issues**:
   ```yaml
   - name: Install dependencies
     run: |
       npm ci
       npx cypress cache path
       npx cypress cache list
   ```

### Jenkins Pipeline Issues

**Issue**: Jenkins pipeline fails or hangs

**Solutions**:
```groovy
// In Jenkinsfile
pipeline {
  agent {
    docker {
      image 'cypress/included:13.17.0'
      args '-v /var/run/docker.sock:/var/run/docker.sock'
    }
  }
  
  environment {
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
  }
  
  stages {
    stage('Test') {
      steps {
        sh '''
          npm ci
          npx cypress cache path
          npm run test:headless
        '''
      }
    }
  }
}
```

### Docker Issues

**Issue**: Tests fail in Docker containers

**Solutions**:
```dockerfile
# In Dockerfile
FROM cypress/included:13.17.0

# Set display for headless mode
ENV DISPLAY=:99

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Start Xvfb
RUN Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
```

```yaml
# In docker-compose.yml
services:
  cypress:
    environment:
      - DISPLAY=:99
    volumes:
      - /dev/shm:/dev/shm
```

## ⚡ Performance Issues

### Slow Test Execution

**Issue**: Tests run slower than expected

**Solutions**:
```javascript
// Optimize selectors
cy.get('[data-testid="element"]'); // Fast
cy.get('.complex .nested .selector'); // Slow

// Reduce unnecessary waits
cy.get('[data-testid="element"]', { timeout: 5000 });

// Use aliases for repeated elements
cy.get('[data-testid="form"]').as('form');
cy.get('@form').within(() => {
  // Test form elements
});

// Disable video recording for faster runs
module.exports = defineConfig({
  e2e: {
    video: false,
  }
});
```

### Memory Issues

**Issue**: Tests consume too much memory

**Solutions**:
```javascript
// Clear browser state between tests
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Limit browser resources
module.exports = defineConfig({
  e2e: {
    chromeWebSecurity: false,
    experimentalMemoryManagement: true,
  }
});
```

## 🐛 Debug Techniques

### Enable Debug Logging

```bash
# Cypress debug logs
DEBUG=cypress:* npm run test:smoke

# Specific debug categories
DEBUG=cypress:server:* npm run test:smoke
DEBUG=cypress:launcher npm run test:smoke

# Custom debug logs
cy.task('log', 'Debug message');
console.log('Browser console log');
```

### Browser DevTools

```javascript
// Pause test execution
cy.pause();

// Debug in browser
cy.debug();

// Inspect element
cy.get('[data-testid="element"]').debug();
```

### Screenshot Debugging

```javascript
// Take screenshots at specific points
cy.screenshot('before-action');
cy.get('[data-testid="button"]').click();
cy.screenshot('after-action');

// Conditional screenshots
if (Cypress.env('DEBUG')) {
  cy.screenshot(`debug-${Date.now()}`);
}
```

### Network Debugging

```javascript
// Intercept and log network requests
cy.intercept('**', (req) => {
  console.log('Request:', req.method, req.url);
}).as('allRequests');

// Wait for specific requests
cy.intercept('GET', '/api/users').as('getUsers');
cy.wait('@getUsers').then((interception) => {
  console.log('Response:', interception.response.body);
});
```

### Test Data Debugging

```javascript
// Log test data
cy.fixture('users').then((data) => {
  cy.task('log', JSON.stringify(data, null, 2));
});

// Verify environment configuration
cy.task('log', `Environment: ${Cypress.env('ENVIRONMENT')}`);
cy.task('log', `Base URL: ${Cypress.config('baseUrl')}`);
```

## 🆘 Getting Help

### Information to Gather

When reporting issues, include:

1. **Environment Information**:
   ```bash
   node --version
   npm --version
   npx cypress --version
   ```

2. **Error Messages**:
   ```bash
   # Full error output
   npm run test:smoke 2>&1 | tee error.log
   ```

3. **Configuration Files**:
   - `cypress.config.js`
   - `package.json`
   - `.cypress-cucumber-preprocessorrc.json`

4. **Test Files**:
   - Feature file content
   - Step definition content
   - Page object content

### Support Channels

1. **Internal Support**:
   - Create issue in repository
   - Contact QA Automation team
   - Check internal documentation

2. **Community Support**:
   - [Cypress Discord](https://discord.gg/cypress)
   - [Cypress GitHub Issues](https://github.com/cypress-io/cypress/issues)
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/cypress)

3. **Documentation**:
   - [Cypress Documentation](https://docs.cypress.io/)
   - [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
   - Framework documentation in `docs/`

---

## 📝 Contributing to This Guide

If you encounter issues not covered here:

1. Document the issue and solution
2. Add to this troubleshooting guide
3. Submit a pull request
4. Help improve the framework for everyone

---

**Remember**: Most issues have solutions, and the community is here to help! 🤝

