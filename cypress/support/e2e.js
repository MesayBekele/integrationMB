// Import commands.js using ES2015 syntax:
import './commands';

// Import mochawesome reporter
import 'cypress-mochawesome-reporter/register';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import configuration manager
const configManager = require('./utilities/configManager');

// Make config manager available globally
Cypress.on('window:before:load', (win) => {
  win.configManager = configManager;
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // You can customize this based on your needs
  console.log('Uncaught exception:', err.message);
  return false;
});

// Custom logging for better debugging
Cypress.on('log:added', (attrs, log) => {
  if (attrs.name === 'logStep') {
    console.log(`🔍 ${attrs.message}`);
  }
});

// Before each test
beforeEach(() => {
  // Clear any previous state
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Set viewport based on environment or test tags
  const currentTest = Cypress.currentTest;
  if (currentTest && currentTest.title.includes('mobile')) {
    cy.setMobileViewport();
  }
});

// After each test
afterEach(() => {
  // Take screenshot on failure
  if (Cypress.currentTest.state === 'failed') {
    const testName = Cypress.currentTest.title.replace(/\s+/g, '-').toLowerCase();
    cy.takeScreenshot(`failed-${testName}`);
  }
});

// Global configuration
Cypress.config('defaultCommandTimeout', configManager.getTimeout());

// Log framework information
console.log('🚀 Simple E2E Framework Initialized');
console.log(`📍 Environment: ${configManager.getCurrentEnvironment()}`);
console.log(`🌐 Base URL: ${configManager.getBaseUrl()}`);
console.log(`⏱️ Timeout: ${configManager.getTimeout()}ms`);

