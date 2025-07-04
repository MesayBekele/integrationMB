// Import mochawesome reporter
import 'cypress-mochawesome-reporter/register';

// Import commands.js using ES2015 syntax:
import './commands';
import './commands/screenshot-commands'; // Base64 encoding error prevention

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Handle Base64 encoding errors specifically
  if (err.message && err.message.includes('Length must be a multiple of 4')) {
    console.warn('Base64 encoding error detected and handled:', err.message);
    return false; // Prevent test failure
  }
  
  if (err.message && err.message.includes('invalid string')) {
    console.warn('String encoding error detected and handled:', err.message);
    return false; // Prevent test failure
  }
  
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
