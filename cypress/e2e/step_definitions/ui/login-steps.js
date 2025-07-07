import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Login form interaction steps
When('I enter username {string} and password {string}', (username, password) => {
  if (username) {
    cy.get('[data-cy="username-input"]').clear().type(username);
  }
  if (password) {
    cy.get('[data-cy="password-input"]').clear().type(password);
  }
});

When('I login with username {string} and password {string}', (username, password) => {
  cy.get('[data-cy="username-input"]').clear().type(username);
  cy.get('[data-cy="password-input"]').clear().type(password);
  cy.get('[data-cy="login-button"]').click();
});

When('I click the login button', () => {
  cy.get('[data-cy="login-button"]').click();
});

// Navigation steps
When('I navigate to {string} section', (section) => {
  cy.get(`[data-cy="${section}-nav"]`).click();
});

When('I navigate to the dashboard', () => {
  cy.get('[data-cy="dashboard-nav"]').click();
});

When('I perform {string} action', (action) => {
  // Map actions to UI interactions
  const actionMap = {
    'view_statistics': () => cy.get('[data-cy="statistics-tab"]').click(),
    'generate_report': () => cy.get('[data-cy="generate-report-btn"]').click(),
    'update_profile': () => {
      cy.get('[data-cy="edit-profile-btn"]').click();
      cy.get('[data-cy="save-profile-btn"]').click();
    }
  };
  
  if (actionMap[action]) {
    actionMap[action]();
  } else {
    cy.get(`[data-cy="${action}-button"]`).click();
  }
});

When('I logout from the application', () => {
  cy.get('[data-cy="user-menu"]').click();
  cy.get('[data-cy="logout-button"]').click();
});

When('I access the application', () => {
  cy.visit('/');
});

// Validation steps
Then('I should be redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');
});

Then('I should see a welcome message for {string} user', (role) => {
  cy.get('[data-cy="welcome-message"]').should('be.visible');
  cy.get('[data-cy="user-role"]').should('contain', role);
});

Then('the user menu should be visible', () => {
  cy.get('[data-cy="user-menu"]').should('be.visible');
});

Then('I should see an error message {string}', (expectedError) => {
  cy.get('[data-cy="error-message"]').should('be.visible');
  cy.get('[data-cy="error-message"]').should('contain', expectedError);
});

Then('I should remain on the login page', () => {
  cy.url().should('include', '/login');
});

Then('the login button should be {string}', (buttonState) => {
  if (buttonState === 'disabled') {
    cy.get('[data-cy="login-button"]').should('be.disabled');
  } else if (buttonState === 'enabled') {
    cy.get('[data-cy="login-button"]').should('not.be.disabled');
  }
});

Then('I should see validation message {string}', (validationMessage) => {
  cy.contains(validationMessage).should('be.visible');
});

Then('I should be redirected to the login page', () => {
  cy.url().should('include', '/login');
});

Then('I should be on the {string} page', (pageName) => {
  cy.url().should('include', `/${pageName}`);
});

Then('I should see {string}', (expectedResult) => {
  // Map expected results to specific validations
  const resultMap = {
    'Statistics loaded': () => cy.get('[data-cy="statistics-content"]').should('be.visible'),
    'Report generated': () => cy.get('[data-cy="report-content"]').should('be.visible'),
    'Profile updated': () => cy.get('[data-cy="success-message"]').should('contain', 'Profile updated')
  };
  
  if (resultMap[expectedResult]) {
    resultMap[expectedResult]();
  } else {
    cy.contains(expectedResult).should('be.visible');
  }
});

// Performance validation steps
Then('the login should complete within {int} seconds', (maxSeconds) => {
  // This would typically involve measuring the actual time
  // For now, we'll use a timeout-based approach
  cy.url({ timeout: maxSeconds * 1000 }).should('include', '/dashboard');
});

// Form validation steps
When('I enter username {string} and password {string}', (username, password) => {
  if (username !== '') {
    cy.get('[data-cy="username-input"]').clear().type(username);
  } else {
    cy.get('[data-cy="username-input"]').clear();
  }
  
  if (password !== '') {
    cy.get('[data-cy="password-input"]').clear().type(password);
  } else {
    cy.get('[data-cy="password-input"]').clear();
  }
});

