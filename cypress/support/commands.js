/**
 * Custom Cypress Commands
 * Extends Cypress functionality with reusable commands
 */

// Import utilities
const DataHelpers = require('./data-helpers');

// ***********************************************
// Authentication Commands
// ***********************************************

/**
 * Login command with environment-specific credentials
 * @param {string} userType - Type of user (admin, user)
 */
Cypress.Commands.add('loginAs', (userType = 'user') => {
  const credentials = Cypress.env('credentials');
  
  if (!credentials || !credentials[userType]) {
    throw new Error(`Credentials for user type '${userType}' not found`);
  }
  
  const { username, password } = credentials[userType];
  
  cy.session([userType, username], () => {
    cy.visit('/login');
    cy.get('[data-testid="username-input"], #username, input[name="username"]')
      .type(username);
    cy.get('[data-testid="password-input"], #password, input[name="password"]')
      .type(password);
    cy.get('[data-testid="login-button"], button[type="submit"], .login-btn')
      .click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    cy.get('[data-testid="user-avatar"], .user-menu, .welcome-message')
      .should('be.visible');
  });
});

/**
 * Logout command
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-avatar"], .user-menu-trigger').click();
  cy.get('[data-testid="logout-button"], .logout-btn').click();
  cy.url().should('include', '/login');
});

// ***********************************************
// API Commands
// ***********************************************

/**
 * API request with authentication
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} options - Request options
 */
Cypress.Commands.add('apiRequest', (method, url, options = {}) => {
  const apiUrl = Cypress.env('apiUrl') || Cypress.config('baseUrl');
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;
  
  return cy.request({
    method,
    url: fullUrl,
    failOnStatusCode: false,
    ...options
  });
});

/**
 * Create user via API
 * @param {Object} userData - User data
 */
Cypress.Commands.add('createUserViaAPI', (userData) => {
  return cy.apiRequest('POST', '/api/users', {
    body: userData
  }).then(response => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

/**
 * Delete user via API
 * @param {string} userId - User ID to delete
 */
Cypress.Commands.add('deleteUserViaAPI', (userId) => {
  return cy.apiRequest('DELETE', `/api/users/${userId}`).then(response => {
    expect(response.status).to.be.oneOf([200, 204, 404]);
    return response;
  });
});

// ***********************************************
// Data Management Commands
// ***********************************************

/**
 * Load test data from file
 * @param {string} filename - Data file name
 */
Cypress.Commands.add('loadTestData', (filename) => {
  return cy.task('loadTestData', filename);
});

/**
 * Generate random test user
 * @param {Object} overrides - Properties to override
 */
Cypress.Commands.add('generateTestUser', (overrides = {}) => {
  return cy.wrap(DataHelpers.generateRandomUser(overrides));
});

/**
 * Setup test data for scenario
 * @param {string} scenario - Scenario name
 */
Cypress.Commands.add('setupTestData', (scenario) => {
  const environment = Cypress.env('ENVIRONMENT') || 'dev';
  
  return cy.loadTestData(`${environment}-${scenario}.json`).then(data => {
    if (!data) {
      return cy.loadTestData(`${scenario}.json`);
    }
    return data;
  });
});

// ***********************************************
// UI Interaction Commands
// ***********************************************

/**
 * Wait for element and perform action
 * @param {string} selector - Element selector
 * @param {string} action - Action to perform (click, type, etc.)
 * @param {any} value - Value for action (if applicable)
 */
Cypress.Commands.add('waitAndDo', (selector, action, value) => {
  cy.get(selector, { timeout: 10000 })
    .should('be.visible')
    .then($el => {
      switch (action) {
        case 'click':
          cy.wrap($el).click();
          break;
        case 'type':
          cy.wrap($el).clear().type(value);
          break;
        case 'select':
          cy.wrap($el).select(value);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    });
});

/**
 * Fill form with data
 * @param {Object} formData - Form field data
 */
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    const selector = `[data-testid="${field}"], #${field}, [name="${field}"]`;
    cy.get(selector).clear().type(value);
  });
});

/**
 * Verify table data
 * @param {string} tableSelector - Table selector
 * @param {Array} expectedData - Expected table data
 */
Cypress.Commands.add('verifyTableData', (tableSelector, expectedData) => {
  cy.get(tableSelector).within(() => {
    expectedData.forEach((rowData, index) => {
      cy.get('tbody tr').eq(index).within(() => {
        Object.values(rowData).forEach((cellValue, cellIndex) => {
          cy.get('td').eq(cellIndex).should('contain', cellValue);
        });
      });
    });
  });
});

// ***********************************************
// File Operations Commands
// ***********************************************

/**
 * Upload file
 * @param {string} selector - File input selector
 * @param {string} fileName - File name in fixtures
 */
Cypress.Commands.add('uploadFile', (selector, fileName) => {
  cy.fixture(fileName, 'base64').then(fileContent => {
    cy.get(selector).selectFile({
      contents: Cypress.Buffer.from(fileContent, 'base64'),
      fileName: fileName,
      lastModified: Date.now()
    });
  });
});

/**
 * Download and verify file
 * @param {string} downloadUrl - URL to download from
 * @param {string} expectedFileName - Expected file name
 */
Cypress.Commands.add('downloadAndVerifyFile', (downloadUrl, expectedFileName) => {
  cy.request(downloadUrl).then(response => {
    expect(response.status).to.eq(200);
    expect(response.headers['content-disposition']).to.include(expectedFileName);
  });
});

// ***********************************************
// Database Commands
// ***********************************************

/**
 * Execute database query (if database connection is available)
 * @param {string} query - SQL query
 */
Cypress.Commands.add('dbQuery', (query) => {
  return cy.task('dbQuery', query);
});

/**
 * Clean database for test
 * @param {Array} tables - Tables to clean
 */
Cypress.Commands.add('cleanDatabase', (tables = []) => {
  return cy.task('cleanDatabase', tables);
});

// ***********************************************
// Accessibility Commands
// ***********************************************

/**
 * Check accessibility violations
 */
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y(null, null, (violations) => {
    if (violations.length > 0) {
      cy.task('log', `Accessibility violations found: ${violations.length}`);
      violations.forEach(violation => {
        cy.task('log', `${violation.id}: ${violation.description}`);
      });
    }
  });
});

// ***********************************************
// Performance Commands
// ***********************************************

/**
 * Measure page load time
 */
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then(win => {
    const perfData = win.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    cy.task('log', `Page load time: ${pageLoadTime}ms`);
    return pageLoadTime;
  });
});

// ***********************************************
// Visual Testing Commands
// ***********************************************

/**
 * Take screenshot with timestamp
 * @param {string} name - Screenshot name
 */
Cypress.Commands.add('screenshotWithTimestamp', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  cy.screenshot(`${name}-${timestamp}`);
});

/**
 * Compare visual elements (placeholder for visual testing tools)
 * @param {string} selector - Element selector
 * @param {string} baseline - Baseline image name
 */
Cypress.Commands.add('visualCompare', (selector, baseline) => {
  // This would integrate with visual testing tools like Percy, Applitools, etc.
  cy.get(selector).should('be.visible');
  cy.task('log', `Visual comparison for ${baseline} - implement with visual testing tool`);
});

// ***********************************************
// Environment Commands
// ***********************************************

/**
 * Switch environment configuration
 * @param {string} environment - Environment name
 */
Cypress.Commands.add('switchEnvironment', (environment) => {
  cy.task('log', `Switching to environment: ${environment}`);
  // This would reload configuration for the specified environment
  // Implementation depends on how environment switching is handled
});

// ***********************************************
// Retry Commands
// ***********************************************

/**
 * Retry command with custom logic
 * @param {Function} command - Command to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries
 */
Cypress.Commands.add('retryCommand', (command, maxRetries = 3, delay = 1000) => {
  let attempts = 0;
  
  function attempt() {
    attempts++;
    try {
      return command();
    } catch (error) {
      if (attempts < maxRetries) {
        cy.wait(delay);
        return attempt();
      }
      throw error;
    }
  }
  
  return attempt();
});

// Support for Cucumber step definitions
// This ensures commands are available in step definition files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}

