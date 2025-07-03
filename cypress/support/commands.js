// Custom Cypress Commands
// This file contains reusable custom commands that extend Cypress functionality

const configManager = require('./utilities/configManager');
const apiHelper = require('./utilities/apiHelper');
const dbHelper = require('./utilities/dbHelper');

/**
 * Authentication Commands
 */

// Login command with different user types
Cypress.Commands.add('loginAs', (userType, options = {}) => {
  const user = configManager.getUser(userType);
  const baseUrl = configManager.getBaseUrl();
  
  cy.session([userType], () => {
    cy.visit(`${baseUrl}/login`);
    cy.get('[data-cy="username"]').type(user.username);
    cy.get('[data-cy="password"]').type(user.password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('not.include', '/login');
  }, {
    validate: () => {
      // Validate session is still active
      cy.visit(`${baseUrl}/dashboard`);
      cy.url().should('include', '/dashboard');
    },
    cacheAcrossSpecs: options.cacheAcrossSpecs !== false
  });
});

// API login command
Cypress.Commands.add('apiLogin', (userType) => {
  const user = configManager.getUser(userType);
  return apiHelper.authenticate(user.username, user.password);
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/login');
});

/**
 * API Commands
 */

// Generic API request command
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, options = {}) => {
  return apiHelper.request(method, endpoint, { ...options, body });
});

// Specific HTTP method commands
Cypress.Commands.add('apiGet', (endpoint, options = {}) => {
  return apiHelper.get(endpoint, options);
});

Cypress.Commands.add('apiPost', (endpoint, body = {}, options = {}) => {
  return apiHelper.post(endpoint, body, options);
});

Cypress.Commands.add('apiPut', (endpoint, body = {}, options = {}) => {
  return apiHelper.put(endpoint, body, options);
});

Cypress.Commands.add('apiPatch', (endpoint, body = {}, options = {}) => {
  return apiHelper.patch(endpoint, body, options);
});

Cypress.Commands.add('apiDelete', (endpoint, options = {}) => {
  return apiHelper.delete(endpoint, options);
});

/**
 * Database Commands
 */

// Database query command
Cypress.Commands.add('dbQuery', (query, params = []) => {
  return dbHelper.query(query, params);
});

// Database CRUD operations
Cypress.Commands.add('dbSelect', (table, conditions = {}, columns = ['*']) => {
  return dbHelper.select(table, conditions, columns);
});

Cypress.Commands.add('dbInsert', (table, data) => {
  return dbHelper.insert(table, data);
});

Cypress.Commands.add('dbUpdate', (table, data, conditions) => {
  return dbHelper.update(table, data, conditions);
});

Cypress.Commands.add('dbDelete', (table, conditions) => {
  return dbHelper.delete(table, conditions);
});

// Test data creation commands
Cypress.Commands.add('createTestUser', (userData = {}) => {
  return dbHelper.createTestUser(userData);
});

Cypress.Commands.add('createTestProduct', (productData = {}) => {
  return dbHelper.createTestProduct(productData);
});

Cypress.Commands.add('createTestOrder', (orderData = {}) => {
  return dbHelper.createTestOrder(orderData);
});

/**
 * UI Interaction Commands
 */

// Enhanced click command with retry logic
Cypress.Commands.add('clickWithRetry', (selector, options = {}) => {
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  
  function attemptClick(attempt = 1) {
    return cy.get(selector).then($el => {
      if ($el.is(':visible') && $el.is(':enabled')) {
        cy.wrap($el).click(options);
      } else if (attempt < maxRetries) {
        cy.wait(retryDelay);
        return attemptClick(attempt + 1);
      } else {
        throw new Error(`Element ${selector} not clickable after ${maxRetries} attempts`);
      }
    });
  }
  
  return attemptClick();
});

// Type with clear command
Cypress.Commands.add('typeWithClear', (selector, text, options = {}) => {
  cy.get(selector).clear().type(text, options);
});

// Select dropdown option by text
Cypress.Commands.add('selectByText', (selector, text) => {
  cy.get(selector).select(text);
});

// Upload file command
Cypress.Commands.add('uploadFile', (selector, fileName, fileType = 'application/json') => {
  cy.get(selector).selectFile({
    contents: `cypress/fixtures/${fileName}`,
    mimeType: fileType
  });
});

/**
 * Wait Commands
 */

// Wait for element to be visible and stable
Cypress.Commands.add('waitForStableElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
  cy.get(selector).should('not.have.class', 'loading');
  cy.get(selector).should('not.have.attr', 'disabled');
});

// Wait for page to load completely
Cypress.Commands.add('waitForPageLoad', (timeout = 30000) => {
  cy.window({ timeout }).should('have.property', 'document');
  cy.document().should('have.property', 'readyState', 'complete');
});

// Wait for API response with alias
Cypress.Commands.add('waitForApi', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

// Wait for multiple API responses
Cypress.Commands.add('waitForMultipleApis', (aliases, timeout = 10000) => {
  aliases.forEach(alias => {
    cy.wait(alias, { timeout });
  });
});

/**
 * Validation Commands
 */

// Validate element text contains
Cypress.Commands.add('shouldContainText', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('contain.text', text);
});

// Validate element is visible
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

// Validate element is hidden
Cypress.Commands.add('shouldBeHidden', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('not.be.visible');
});

// Validate URL contains path
Cypress.Commands.add('urlShouldContain', (path) => {
  cy.url().should('include', path);
});

// Validate page title
Cypress.Commands.add('titleShouldBe', (title) => {
  cy.title().should('eq', title);
});

/**
 * Data Commands
 */

// Load test data from fixtures
Cypress.Commands.add('loadTestData', (fileName) => {
  return cy.fixture(`testData/${fileName}`);
});

// Generate random test data
Cypress.Commands.add('generateTestData', (type) => {
  return cy.task('generateTestData', type);
});

// Save test data to file
Cypress.Commands.add('saveTestData', (fileName, data) => {
  return cy.task('writeFile', {
    filename: `cypress/fixtures/testData/${fileName}`,
    content: JSON.stringify(data, null, 2)
  });
});

/**
 * Screenshot and Video Commands
 */

// Take screenshot with timestamp
Cypress.Commands.add('screenshotWithTimestamp', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  cy.screenshot(`${name}_${timestamp}`);
});

// Take full page screenshot
Cypress.Commands.add('fullPageScreenshot', (name) => {
  cy.screenshot(name, { capture: 'fullPage' });
});

/**
 * Local Storage and Session Commands
 */

// Set local storage item
Cypress.Commands.add('setLocalStorage', (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

// Get local storage item
Cypress.Commands.add('getLocalStorage', (key) => {
  return cy.window().then((win) => {
    return win.localStorage.getItem(key);
  });
});

// Clear specific local storage item
Cypress.Commands.add('removeLocalStorage', (key) => {
  cy.window().then((win) => {
    win.localStorage.removeItem(key);
  });
});

// Set session storage item
Cypress.Commands.add('setSessionStorage', (key, value) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem(key, value);
  });
});

// Get session storage item
Cypress.Commands.add('getSessionStorage', (key) => {
  return cy.window().then((win) => {
    return win.sessionStorage.getItem(key);
  });
});

/**
 * Cookie Commands
 */

// Set cookie with options
Cypress.Commands.add('setCookieWithOptions', (name, value, options = {}) => {
  const defaultOptions = {
    httpOnly: false,
    secure: false,
    sameSite: 'lax'
  };
  cy.setCookie(name, value, { ...defaultOptions, ...options });
});

// Get all cookies
Cypress.Commands.add('getAllCookies', () => {
  return cy.getCookies();
});

/**
 * Performance Commands
 */

// Measure page load time
Cypress.Commands.add('measurePageLoadTime', () => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.navigationStart;
    cy.log(`Page load time: ${loadTime}ms`);
    return loadTime;
  });
});

// Measure element render time
Cypress.Commands.add('measureElementRenderTime', (selector) => {
  const startTime = performance.now();
  cy.get(selector).should('be.visible').then(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    cy.log(`Element ${selector} render time: ${renderTime.toFixed(2)}ms`);
    return renderTime;
  });
});

/**
 * Accessibility Commands
 */

// Check element accessibility
Cypress.Commands.add('checkA11y', (selector = null, options = {}) => {
  // This would integrate with cypress-axe if installed
  cy.log('Accessibility check would run here with cypress-axe');
});

/**
 * Mobile Commands
 */

// Set mobile viewport
Cypress.Commands.add('setMobileViewport', (device = 'iphone-x') => {
  const viewports = {
    'iphone-x': [375, 812],
    'iphone-6': [375, 667],
    'samsung-s10': [360, 760],
    'ipad': [768, 1024]
  };
  
  const [width, height] = viewports[device] || viewports['iphone-x'];
  cy.viewport(width, height);
});

// Simulate touch events
Cypress.Commands.add('touch', (selector) => {
  cy.get(selector).trigger('touchstart').trigger('touchend');
});

/**
 * Drag and Drop Commands
 */

// Drag and drop command
Cypress.Commands.add('dragAndDrop', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).trigger('mousedown', { button: 0 });
  cy.get(targetSelector).trigger('mousemove').trigger('mouseup');
});

/**
 * Utility Commands
 */

// Log step for better test reporting
Cypress.Commands.add('logStep', (message) => {
  cy.task('log', `STEP: ${message}`);
  cy.log(message);
});

// Add custom assertion
Cypress.Commands.add('shouldHaveLength', { prevSubject: 'element' }, (subject, length) => {
  cy.wrap(subject).should('have.length', length);
});

// Retry command with custom logic
Cypress.Commands.add('retryUntil', (commandFn, conditionFn, options = {}) => {
  const maxRetries = options.maxRetries || 5;
  const retryDelay = options.retryDelay || 1000;
  
  function attempt(retryCount = 0) {
    return commandFn().then((result) => {
      if (conditionFn(result)) {
        return result;
      } else if (retryCount < maxRetries) {
        cy.wait(retryDelay);
        return attempt(retryCount + 1);
      } else {
        throw new Error(`Condition not met after ${maxRetries} retries`);
      }
    });
  }
  
  return attempt();
});

// Environment-specific commands
if (Cypress.env('environment') === 'dev') {
  Cypress.Commands.add('enableDebugMode', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('debug', 'true');
      win.console.log('Debug mode enabled');
    });
  });
}

