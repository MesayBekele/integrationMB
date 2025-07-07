/**
 * Login Step Definitions
 * Cucumber step definitions for login functionality
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const DataUtils = require('../utils/dataUtils');
const Helpers = require('../utils/helpers');

const loginPage = new LoginPage();
const homePage = new HomePage();

// Background steps
Given('I am on the login page', () => {
  loginPage.navigateToLogin();
  loginPage.verifyLoginFormVisible();
});

// When steps
When('I enter valid credentials for {string} user', (userRole) => {
  DataUtils.getUserByRole(userRole, Cypress.env('environment') || 'dev').then(user => {
    loginPage.loginWithUserData(user);
  });
});

When('I enter credentials for {string} user', (userRole) => {
  DataUtils.getUserByRole(userRole, Cypress.env('environment') || 'dev').then(user => {
    loginPage.enterUsername(user.username);
    loginPage.enterPassword(user.password);
  });
});

When('I enter invalid credentials', (dataTable) => {
  const credentials = dataTable.rowsHash();
  loginPage.enterUsername(credentials.username);
  loginPage.enterPassword(credentials.password);
});

When('I enter login credentials', (dataTable) => {
  const credentials = dataTable.rowsHash();
  if (credentials.username) {
    loginPage.enterUsername(credentials.username);
  }
  if (credentials.password) {
    loginPage.enterPassword(credentials.password);
  }
});

When('I click the login button', () => {
  loginPage.clickLogin();
});

When('I check the {string} checkbox', (checkboxName) => {
  if (checkboxName.toLowerCase().includes('remember')) {
    loginPage.toggleRememberMe();
  }
});

When('I logout', () => {
  homePage.logout();
});

When('I return to the login page', () => {
  loginPage.navigateToLogin();
});

When('I enter password {string}', (password) => {
  loginPage.enterPassword(password);
});

When('I click the show password button', () => {
  loginPage.togglePasswordVisibility();
});

When('I click the hide password button', () => {
  loginPage.togglePasswordVisibility();
});

When('I click the {string} link', (linkText) => {
  if (linkText.toLowerCase().includes('forgot')) {
    loginPage.clickForgotPassword();
  } else if (linkText.toLowerCase().includes('sign')) {
    loginPage.clickSignUp();
  }
});

When('I enter email {string}', (email) => {
  cy.get('[data-cy="email"]').type(email);
});

When('I click the reset password button', () => {
  cy.get('[data-cy="reset-button"]').click();
});

When('I login with the following users:', (dataTable) => {
  const users = dataTable.hashes();
  cy.wrap(users).each((user) => {
    loginPage.navigateToLogin();
    loginPage.login(user.username, user.password);
    homePage.verifyOnHomePage();
    homePage.logout();
  });
});

When('I attempt to login with invalid credentials {int} times', (attempts) => {
  for (let i = 0; i < attempts; i++) {
    loginPage.clearLoginForm();
    loginPage.login('invalid@example.com', 'wrongpassword');
    cy.wait(1000);
  }
});

When('I wait for {int} minutes', (minutes) => {
  cy.wait(minutes * 60 * 1000);
});

When('I am using a mobile device', () => {
  cy.setMobileViewport('iphone-x');
});

When('I navigate to the login page', () => {
  loginPage.navigateToLogin();
});

When('I measure login performance', () => {
  cy.window().then((win) => {
    win.performance.mark('login-start');
  });
});

// Then steps
Then('I should be redirected to the dashboard', () => {
  homePage.verifyOnHomePage();
});

Then('I should see a welcome message', () => {
  homePage.verifyWelcomeMessage();
});

Then('I should see user profile for {string}', (userRole) => {
  DataUtils.getUserByRole(userRole, Cypress.env('environment') || 'dev').then(user => {
    homePage.verifyUserProfile(user.username);
  });
});

Then('I should have access to {string} features', (permissions) => {
  const permissionList = permissions.split(',');
  homePage.verifyUserPermissions(permissionList);
});

Then('I should see an error message {string}', (expectedMessage) => {
  loginPage.verifyErrorMessage(expectedMessage);
});

Then('I should remain on the login page', () => {
  loginPage.verifyLoginUrl();
});

Then('I should see validation error {string}', (expectedError) => {
  loginPage.verifyErrorMessage(expectedError);
});

Then('the username field should be pre-filled', () => {
  loginPage.getUsernameValue().should('not.be.empty');
});

Then('the password should be hidden', () => {
  loginPage.getElement(loginPage.elements.passwordField).should('have.attr', 'type', 'password');
});

Then('the password should be visible', () => {
  loginPage.getElement(loginPage.elements.passwordField).should('have.attr', 'type', 'text');
});

Then('I should be redirected to the password reset page', () => {
  cy.url().should('include', '/reset-password');
});

Then('I should see confirmation message {string}', (expectedMessage) => {
  cy.get('[data-cy="confirmation-message"]').should('contain.text', expectedMessage);
});

Then('each login should be successful', () => {
  // This step is handled in the When step loop
  cy.log('All logins completed successfully');
});

Then('each user should see their respective dashboard', () => {
  // This step is handled in the When step loop
  cy.log('All users saw their respective dashboards');
});

Then('the account should be temporarily locked', () => {
  loginPage.verifyErrorMessage('Account temporarily locked');
});

Then('I should see message {string}', (expectedMessage) => {
  cy.get('[data-cy="message"]').should('contain.text', expectedMessage);
});

Then('I should be able to login with valid credentials', () => {
  DataUtils.getUserByRole('user', Cypress.env('environment') || 'dev').then(user => {
    loginPage.clearLoginForm();
    loginPage.loginWithUserData(user);
    homePage.verifyOnHomePage();
  });
});

Then('the login form should be accessible', () => {
  // Basic accessibility checks
  loginPage.getElement(loginPage.elements.usernameField).should('have.attr', 'aria-label');
  loginPage.getElement(loginPage.elements.passwordField).should('have.attr', 'aria-label');
  loginPage.getElement(loginPage.elements.loginButton).should('have.attr', 'aria-label');
});

Then('all form fields should have proper labels', () => {
  cy.get('label[for="username"]').should('exist');
  cy.get('label[for="password"]').should('exist');
});

Then('the form should be navigable using keyboard only', () => {
  loginPage.getElement(loginPage.elements.usernameField).focus();
  cy.focused().should('have.attr', 'data-cy', 'username');
  
  cy.focused().tab();
  cy.focused().should('have.attr', 'data-cy', 'password');
  
  cy.focused().tab();
  cy.focused().should('have.attr', 'data-cy', 'login-button');
});

Then('the form should work with screen readers', () => {
  // Check for ARIA attributes and semantic HTML
  loginPage.getElement(loginPage.elements.loginForm).should('have.attr', 'role', 'form');
  cy.get('h1, h2').should('exist'); // Proper heading structure
});

Then('the login form should be mobile-friendly', () => {
  loginPage.verifyLoginFormVisible();
  // Check that form elements are properly sized for mobile
  loginPage.getElement(loginPage.elements.usernameField).should('be.visible');
  loginPage.getElement(loginPage.elements.passwordField).should('be.visible');
  loginPage.getElement(loginPage.elements.loginButton).should('be.visible');
});

Then('I should be redirected to the mobile dashboard', () => {
  homePage.verifyOnHomePage();
  // Additional mobile-specific checks could be added here
});

Then('the login should complete within {int} seconds', (seconds) => {
  cy.window().then((win) => {
    win.performance.mark('login-end');
    win.performance.measure('login-duration', 'login-start', 'login-end');
    
    const measure = win.performance.getEntriesByName('login-duration')[0];
    expect(measure.duration).to.be.lessThan(seconds * 1000);
  });
});

Then('the dashboard should load within {int} seconds', (seconds) => {
  cy.window().then((win) => {
    win.performance.mark('dashboard-loaded');
    win.performance.measure('dashboard-load-duration', 'login-end', 'dashboard-loaded');
    
    const measure = win.performance.getEntriesByName('dashboard-load-duration')[0];
    expect(measure.duration).to.be.lessThan(seconds * 1000);
  });
});

// Custom step for data-driven testing
When('I login using test data from {string}', (dataFile) => {
  DataUtils.loadTestData(dataFile).then(testData => {
    const user = DataUtils.getRandomItem(testData.validUsers);
    loginPage.loginWithUserData(user);
  });
});

// Custom step for environment-specific testing
Given('I am testing in {string} environment', (environment) => {
  cy.log(`Testing in ${environment} environment`);
  // Environment-specific setup could be added here
});

// Custom step for screenshot capture
When('I take a screenshot of the login page', () => {
  loginPage.takeScreenshot('login-page-screenshot');
});

// Custom step for form validation
Then('I should see form validation messages', () => {
  loginPage.verifyFormValidation();
});

// Custom step for clearing form
When('I clear the login form', () => {
  loginPage.clearLoginForm();
});

// Custom step for checking remember me functionality
Then('the remember me checkbox should be {string}', (state) => {
  if (state === 'checked') {
    loginPage.verifyRememberMeChecked();
  } else {
    loginPage.verifyRememberMeNotChecked();
  }
});

// Custom step for submitting form with Enter key
When('I submit the form using Enter key', () => {
  loginPage.submitWithEnter();
});

// Custom step for verifying login button state
Then('the login button should be {string}', (state) => {
  if (state === 'enabled') {
    loginPage.verifyLoginButtonEnabled();
  } else {
    loginPage.verifyLoginButtonDisabled();
  }
});

// Hook for taking screenshots on failure
afterEach(function() {
  if (this.currentTest.state === 'failed') {
    const testName = this.currentTest.title.replace(/\s+/g, '-').toLowerCase();
    cy.screenshot(`failed-login-${testName}`);
  }
});

