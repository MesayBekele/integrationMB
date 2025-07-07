import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Background steps
Given('I am on the login page', () => {
  cy.visit('/login');
  cy.url().should('include', '/login');
  cy.get('[data-cy="login-form"]').should('be.visible');
});

// Credential entry steps
When('I enter valid admin credentials', () => {
  cy.get('[data-cy="username-input"]').type('admin');
  cy.get('[data-cy="password-input"]').type('Admin123!');
});

When('I enter valid user credentials', () => {
  cy.get('[data-cy="username-input"]').type('testuser');
  cy.get('[data-cy="password-input"]').type('User123!');
});

When('I enter username {string}', (username) => {
  cy.get('[data-cy="username-input"]').clear().type(username);
});

When('I enter password {string}', (password) => {
  cy.get('[data-cy="password-input"]').clear().type(password);
});

When('I leave the username field empty', () => {
  cy.get('[data-cy="username-input"]').clear();
});

When('I leave the password field empty', () => {
  cy.get('[data-cy="password-input"]').clear();
});

// Action steps
When('I click the login button', () => {
  cy.get('[data-cy="login-button"]').click();
});

When('I check the remember me option', () => {
  cy.get('[data-cy="remember-me-checkbox"]').check();
});

When('I click the {string} link', (linkText) => {
  cy.contains('a', linkText).click();
});

When('I click the {string} button', (buttonText) => {
  cy.contains('button', buttonText).click();
});

When('I enter email {string}', (email) => {
  cy.get('[data-cy="email-input"]').type(email);
});

When('I login with credentials {string} and {string}', (username, password) => {
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();
});

// Assertion steps
Then('I should be redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');
  cy.get('[data-cy="dashboard-header"]').should('be.visible');
});

Then('I should see a welcome message', () => {
  cy.get('[data-cy="welcome-message"]').should('be.visible');
  cy.get('[data-cy="welcome-message"]').should('contain.text', 'Welcome');
});

Then('I should see an error message {string}', (errorMessage) => {
  cy.get('[data-cy="error-message"]').should('be.visible');
  cy.get('[data-cy="error-message"]').should('contain.text', errorMessage);
});

Then('I should remain on the login page', () => {
  cy.url().should('include', '/login');
  cy.get('[data-cy="login-form"]').should('be.visible');
});

Then('the remember me cookie should be set', () => {
  cy.getCookie('remember_me').should('exist');
});

Then('I should see validation errors', () => {
  cy.get('[data-cy="username-error"]').should('be.visible');
  cy.get('[data-cy="password-error"]').should('be.visible');
});

Then('the login button should be disabled', () => {
  cy.get('[data-cy="login-button"]').should('be.disabled');
});

Then('I should see a username validation error', () => {
  cy.get('[data-cy="username-error"]').should('be.visible');
  cy.get('[data-cy="username-error"]').should('contain.text', 'Username must be at least 3 characters');
});

Then('I should see a password validation error', () => {
  cy.get('[data-cy="password-error"]').should('be.visible');
  cy.get('[data-cy="password-error"]').should('contain.text', 'Password must be at least 8 characters');
});

Then('I should be redirected to the password reset page', () => {
  cy.url().should('include', '/reset-password');
  cy.get('[data-cy="reset-form"]').should('be.visible');
});

Then('I should see a confirmation message', () => {
  cy.get('[data-cy="confirmation-message"]').should('be.visible');
  cy.get('[data-cy="confirmation-message"]').should('contain.text', 'Reset link sent');
});

Then('I should see social login buttons', () => {
  cy.get('[data-cy="google-login"]').should('be.visible');
  cy.get('[data-cy="facebook-login"]').should('be.visible');
  cy.get('[data-cy="github-login"]').should('be.visible');
});

Then('I should see the {string} page', (expectedPage) => {
  cy.url().should('include', `/${expectedPage}`);
  cy.get(`[data-cy="${expectedPage}-header"]`).should('be.visible');
});

Then('I should have {string} access level', (accessLevel) => {
  cy.get('[data-cy="user-role"]').should('contain.text', accessLevel);
});

// Mobile and responsive steps
Given('I am using a mobile device', () => {
  cy.viewport('iphone-x');
});

When('I navigate to the login page', () => {
  cy.visit('/login');
});

Then('the login form should be mobile-responsive', () => {
  cy.get('[data-cy="login-form"]').should('be.visible');
  cy.get('[data-cy="login-form"]').should('have.css', 'max-width');
});

Then('all elements should be easily accessible', () => {
  cy.get('[data-cy="username-input"]').should('be.visible');
  cy.get('[data-cy="password-input"]').should('be.visible');
  cy.get('[data-cy="login-button"]').should('be.visible');
  
  // Check touch targets are large enough (minimum 44px)
  cy.get('[data-cy="login-button"]').should('have.css', 'min-height', '44px');
});

// Performance steps
Then('the login process should complete within 3 seconds', () => {
  const startTime = Date.now();
  cy.get('[data-cy="dashboard-header"]').should('be.visible').then(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).to.be.lessThan(3000);
  });
});

// Session and security steps
Given('I am already logged in', () => {
  // Use cy.session for efficient login state management
  cy.session('user-session', () => {
    cy.visit('/login');
    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="password-input"]').type('User123!');
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
  cy.visit('/dashboard');
});

When('I logout', () => {
  cy.get('[data-cy="logout-button"]').click();
});

Then('I should be logged out', () => {
  cy.url().should('include', '/login');
  cy.getCookie('auth_token').should('not.exist');
});
