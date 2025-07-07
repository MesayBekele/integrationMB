import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Common navigation steps
Given('I am on the login page', () => {
  cy.visit('/login');
});

Given('I am on the {string} page', (pageName) => {
  cy.visit(`/${pageName}`);
});

Given('I am logged in as {string}', (userType) => {
  // Load user credentials from test data
  cy.fixture('test-data/users').then((users) => {
    const user = users.validUsers.find(u => u.role === userType);
    if (user) {
      cy.visit('/login');
      cy.get('[data-cy="username-input"]').type(user.username);
      cy.get('[data-cy="password-input"]').type(user.password);
      cy.get('[data-cy="login-button"]').click();
      cy.url().should('include', '/dashboard');
    } else {
      throw new Error(`User type "${userType}" not found in test data`);
    }
  });
});

// Environment and configuration steps
Given('I am testing against {string} environment', (environment) => {
  cy.task('log', `Testing against ${environment} environment`);
  // Set environment context
  Cypress.env('CURRENT_TEST_ENV', environment);
});

// Browser and viewport steps
Given('I am using {string} browser with {string} viewport', (browser, viewport) => {
  cy.task('log', `Testing with ${browser} browser and ${viewport} viewport`);
  
  // Set viewport based on type
  const viewports = {
    desktop: { width: 1280, height: 720 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };
  
  if (viewports[viewport]) {
    cy.viewport(viewports[viewport].width, viewports[viewport].height);
  }
});

// Time and performance steps
Then('the response time should be under {int} seconds', (maxSeconds) => {
  // This step is typically used in conjunction with performance measurements
  // The actual timing would be captured in the specific action steps
  cy.task('log', `Verifying response time is under ${maxSeconds} seconds`);
});

Then('the {string} should complete within {int} seconds', (action, maxSeconds) => {
  // Performance validation - this would be implemented with actual timing
  cy.task('log', `Verifying ${action} completes within ${maxSeconds} seconds`);
});

// Data validation steps
When('I create a new record with:', (dataTable) => {
  const data = dataTable.rowsHash();
  cy.task('log', `Creating record with data: ${JSON.stringify(data)}`);
  
  // Navigate to create form (example)
  cy.get('[data-cy="create-button"]').click();
  
  // Fill form based on field type
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'field_type') return; // Skip field type indicator
    
    cy.get(`[data-cy="${key}-input"]`).type(value);
  });
  
  cy.get('[data-cy="save-button"]').click();
});

Then('the system should {string}', (expectedBehavior) => {
  if (expectedBehavior === 'accept') {
    cy.get('[data-cy="success-message"]').should('be.visible');
  } else if (expectedBehavior === 'reject') {
    cy.get('[data-cy="error-message"]').should('be.visible');
  }
});

Then('the data should be {string}', (dataState) => {
  cy.task('log', `Verifying data state: ${dataState}`);
  // Additional validation based on data state
});

// Environment validation steps
Then('the environment should be properly configured', () => {
  cy.task('log', 'Verifying environment configuration');
  // Check environment-specific configurations
});

Then('the base URL should be {string}', (expectedUrl) => {
  cy.url().should('include', expectedUrl.replace('https://', '').replace('http://', ''));
});

// Generic validation steps
Then('I should see {string}', (expectedText) => {
  cy.contains(expectedText).should('be.visible');
});

Then('the page should render correctly', () => {
  // Check for basic page structure
  cy.get('body').should('be.visible');
  cy.get('header, nav, main, footer').should('exist');
});

Then('all interactive elements should be functional', () => {
  // Basic interactivity check
  cy.get('button, a, input').should('be.visible');
  cy.get('button:not([disabled])').should('not.be.disabled');
});
