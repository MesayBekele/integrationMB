// Import mochawesome reporter
import 'cypress-mochawesome-reporter/register';

// Import commands.js using ES2015 syntax:
import './commands';

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err.message);
  return false;
});

// Before each test
beforeEach(() => {
  // Clear any previous state
  cy.clearCookies();
  cy.clearLocalStorage();
});

// After each test
afterEach(() => {
  // Take screenshot on failure (mochawesome will automatically include it)
  if (Cypress.currentTest && Cypress.currentTest.state === 'failed') {
    const testName = Cypress.currentTest.title.replace(/\s+/g, '-').toLowerCase();
    cy.screenshot(`failed-${testName}`);
  }
});

// Log framework information
console.log('🚀 Simple E2E Framework Initialized (Mochawesome Reporting)');
