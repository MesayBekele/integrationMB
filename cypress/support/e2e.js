// ***********************************************************
// Cypress 11 + Cucumber + Mochawesome E2E Test Framework
// Support file loaded automatically before test files
// ***********************************************************

// Import commands and utilities
import './commands';

// Import framework utilities (for non-Cucumber tests)
require('./tagging');
require('./data-driven');

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // Customize this based on your application's needs
  console.log('Uncaught exception:', err.message);
  return false;
});

// Add custom Cypress commands for environment handling
Cypress.Commands.add('getEnvironmentConfig', () => {
  return cy.task('log', `Getting config for environment: ${Cypress.env('ENVIRONMENT')}`).then(() => {
    return Cypress.env();
  });
});

// Add command for loading test data
Cypress.Commands.add('loadTestData', (filename) => {
  return cy.task('loadTestData', filename);
});

// Add command for tagging support (for non-Cucumber tests)
Cypress.Commands.add('addTestTags', (tags) => {
  cy.task('log', `Test tags: ${tags.join(', ')}`);
});

// Add command for setting test metadata
Cypress.Commands.add('setTestMetadata', (metadata) => {
  cy.task('log', `Test metadata: ${JSON.stringify(metadata)}`);
});

// Cucumber-specific commands
Cypress.Commands.add('getScenarioContext', () => {
  // Helper to get current scenario context in Cucumber tests
  return cy.wrap({
    scenario: Cypress.currentTest?.title || 'Unknown scenario',
    feature: Cypress.spec?.name || 'Unknown feature'
  });
});

// Global before hook for test setup
beforeEach(() => {
  // Clear browser state
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Log test information
  const testTitle = Cypress.currentTest?.title || 'Unknown test';
  const isFeatureFile = Cypress.spec?.name?.endsWith('.feature');
  
  if (isFeatureFile) {
    cy.task('log', `🥒 Starting Cucumber scenario: ${testTitle}`);
  } else {
    cy.task('log', `🧪 Starting Cypress test: ${testTitle}`);
  }
  
  // Set up environment context
  const environment = Cypress.env('ENVIRONMENT');
  cy.task('log', `🌍 Environment: ${environment}`);
  
  // Add test metadata for reporting
  if (Cypress.currentTest?.tags) {
    cy.addTestTags(Cypress.currentTest.tags);
  }
});

// Global after hook for test cleanup
afterEach(() => {
  const testTitle = Cypress.currentTest?.title || 'Unknown test';
  const testState = Cypress.currentTest?.state || 'unknown';
  const isFeatureFile = Cypress.spec?.name?.endsWith('.feature');
  
  if (isFeatureFile) {
    cy.task('log', `🥒 Cucumber scenario completed: ${testTitle} - Status: ${testState}`);
  } else {
    cy.task('log', `✅ Cypress test completed: ${testTitle} - Status: ${testState}`);
  }
  
  // Take screenshot on failure for Mochawesome report
  if (testState === 'failed') {
    const screenshotName = testTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    cy.screenshot(`failed-${screenshotName}`, { 
      capture: 'fullPage',
      overwrite: true 
    });
  }
});

// Cucumber-specific hooks
before(() => {
  // Global setup for Cucumber features
  if (Cypress.spec?.name?.endsWith('.feature')) {
    cy.task('log', '🥒 Initializing Cucumber feature execution');
    
    // Load common test data for Cucumber scenarios
    cy.fixture('test-data/users').then((users) => {
      Cypress.env('TEST_USERS', users);
    });
  }
});

// Log framework initialization
console.log('🚀 Cypress 11 + Cucumber + Mochawesome Framework Initialized');
console.log(`📊 Reporter: Mochawesome with merge support`);
console.log(`🥒 Cucumber: @badeball/cypress-cucumber-preprocessor 15.1.5`);
console.log(`🏷️  Tagging: Cucumber tags + Custom tagging system`);
console.log(`📈 Data-driven: Cucumber scenario outlines + Parameterized testing`);
console.log(`🌍 Environment: ${Cypress.env('ENVIRONMENT') || 'dev'}`);

// Export framework version info
window.frameworkInfo = {
  name: 'Cypress E2E Framework with Cucumber',
  version: '2.1.0',
  cypress: '11.2.0',
  cucumber: '@badeball/cypress-cucumber-preprocessor 15.1.5',
  reporter: 'Mochawesome 7.1.3',
  features: [
    'Cucumber BDD with Data-Driven Testing',
    'Custom Tagging System', 
    'Multi-Environment Support', 
    'Mochawesome Report Merging',
    'Hybrid Test Architecture'
  ]
};

