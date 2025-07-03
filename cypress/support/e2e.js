// Import commands.js using ES2015 syntax:
import './commands';

// Import utilities
import './utilities/configManager';
import './utilities/apiHelper';
import './utilities/dbHelper';

// Import Cypress Cucumber Preprocessor
import '@badeball/cypress-cucumber-preprocessor/support';

// Import mochawesome reporter
import 'cypress-mochawesome-reporter/register';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // You can customize this based on your application's behavior
  console.log('Uncaught exception:', err.message);
  return false;
});

// Before each test
beforeEach(() => {
  // Clear cookies and local storage
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Set viewport
  cy.viewport(1280, 720);
  
  // Load environment configuration
  cy.task('log', `Running test in ${Cypress.env('environment')} environment`);
});

// After each test
afterEach(() => {
  // Take screenshot on failure
  if (Cypress.currentTest.state === 'failed') {
    const testName = Cypress.currentTest.title.replace(/\s+/g, '_');
    cy.screenshot(`failed_${testName}`);
  }
});

// Global custom commands
Cypress.Commands.add('loginAs', (userType) => {
  const users = Cypress.env('users') || {};
  const user = users[userType];
  
  if (!user) {
    throw new Error(`User type '${userType}' not found in configuration`);
  }
  
  cy.visit('/login');
  cy.get('[data-cy="username"]').type(user.username);
  cy.get('[data-cy="password"]').type(user.password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('apiRequest', (method, endpoint, body = null, headers = {}) => {
  const apiUrl = Cypress.env('apiUrl');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  return cy.request({
    method,
    url: `${apiUrl}${endpoint}`,
    body,
    headers: defaultHeaders,
    failOnStatusCode: false
  });
});

Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document');
  cy.document().should('have.property', 'readyState', 'complete');
});

Cypress.Commands.add('dragAndDrop', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).trigger('mousedown', { button: 0 });
  cy.get(targetSelector).trigger('mousemove').trigger('mouseup');
});

// Custom assertion commands
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

Cypress.Commands.add('shouldContainText', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('contain.text', text);
});

// Database commands
Cypress.Commands.add('queryDatabase', (query) => {
  return cy.task('queryDb', query);
});

// File operations
Cypress.Commands.add('readTestData', (filename) => {
  return cy.task('readFile', `cypress/fixtures/testData/${filename}`);
});

// Wait for API response
Cypress.Commands.add('waitForApi', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

// Custom logging
Cypress.Commands.add('logStep', (message) => {
  cy.task('log', `STEP: ${message}`);
  cy.log(message);
});

// Environment-specific commands
if (Cypress.env('environment') === 'dev') {
  // Development-specific commands
  Cypress.Commands.add('enableDebugMode', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('debug', 'true');
    });
  });
}

// Performance monitoring
Cypress.Commands.add('measurePerformance', (actionCallback) => {
  const startTime = performance.now();
  
  actionCallback();
  
  cy.then(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    cy.task('log', `Performance: Action took ${duration.toFixed(2)}ms`);
  });
});

