import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
const LoginPage = require('../pages/LoginPage');
const configManager = require('../utilities/configManager');

const loginPage = new LoginPage();

// Background steps
Given('I am on the login page', () => {
  loginPage.visit();
});

// When steps
When('I enter valid admin credentials', () => {
  const adminUser = configManager.getUser('admin');
  loginPage.enterUsername(adminUser.username);
  loginPage.enterPassword(adminUser.password);
});

When('I enter valid user credentials', () => {
  const user = configManager.getUser('user');
  loginPage.enterUsername(user.username);
  loginPage.enterPassword(user.password);
});

When('I enter username {string}', (username) => {
  loginPage.enterUsername(username);
});

When('I enter password {string}', (password) => {
  loginPage.enterPassword(password);
});

When('I click the login button', () => {
  loginPage.clickLoginButton();
});

When('I check the remember me option', () => {
  loginPage.checkRememberMe();
});

When('I leave the username field empty', () => {
  cy.logStep('Username field left empty');
});

When('I leave the password field empty', () => {
  cy.logStep('Password field left empty');
});

When('I click the {string} link', (linkText) => {
  cy.contains(linkText).click();
});

When('I enter email {string}', (email) => {
  cy.get('[data-cy="email"]').type(email);
});

When('I click the {string} button', (buttonText) => {
  cy.contains('button', buttonText).click();
});

When('I login as {string}', (userType) => {
  cy.loginAs(userType);
});

// Then steps
Then('I should be redirected to the dashboard', () => {
  cy.shouldBeOnPage('/dashboard');
  cy.waitForPageLoad();
});

Then('I should see a welcome message', () => {
  cy.shouldBeVisible('[data-cy="welcome-message"]');
  cy.shouldContainText('[data-cy="welcome-message"]', 'Welcome');
});

Then('the remember me cookie should be set', () => {
  cy.getCookie('remember_me').should('exist');
});

Then('I should see an error message {string}', (expectedMessage) => {
  loginPage.verifyErrorMessage(expectedMessage);
});

Then('I should remain on the login page', () => {
  cy.shouldBeOnPage('/login');
});

Then('I should see validation errors', () => {
  cy.shouldBeVisible('[data-cy="validation-error"]');
});

Then('the login button should be disabled', () => {
  cy.get('[data-cy="login-button"]').should('be.disabled');
});

Then('I should see a username validation error', () => {
  cy.shouldBeVisible('[data-cy="username-error"]');
  cy.shouldContainText('[data-cy="username-error"]', 'Username must be at least 3 characters');
});

Then('I should see a password validation error', () => {
  cy.shouldBeVisible('[data-cy="password-error"]');
  cy.shouldContainText('[data-cy="password-error"]', 'Password must be at least 8 characters');
});

Then('I should be redirected to the password reset page', () => {
  cy.shouldBeOnPage('/forgot-password');
});

Then('I should see a confirmation message', () => {
  cy.shouldBeVisible('[data-cy="confirmation-message"]');
  cy.shouldContainText('[data-cy="confirmation-message"]', 'Reset link sent');
});

Then('I should see social login buttons', () => {
  cy.shouldBeVisible('[data-cy="google-login"]');
  cy.shouldBeVisible('[data-cy="facebook-login"]');
});

Then('I should see the {string} page', (expectedPage) => {
  cy.shouldBeOnPage(`/${expectedPage}`);
});

// Mobile specific steps
Given('I am using a mobile device', () => {
  cy.setMobileViewport('iphone-x');
});

Then('the login form should be mobile-responsive', () => {
  cy.shouldBeVisible('[data-cy="login-form"]');
  cy.get('[data-cy="login-form"]').should('have.css', 'max-width');
});

Then('all elements should be easily accessible', () => {
  cy.get('[data-cy="username"]').should('have.css', 'min-height', '44px');
  cy.get('[data-cy="password"]').should('have.css', 'min-height', '44px');
  cy.get('[data-cy="login-button"]').should('have.css', 'min-height', '44px');
});

// Performance steps
Then('the login process should complete within {int} seconds', (maxSeconds) => {
  cy.measurePerformance(() => {
    loginPage.clickLoginButton();
    cy.waitForPageLoad();
  }).then((duration) => {
    expect(duration).to.be.lessThan(maxSeconds * 1000);
  });
});

// Data-driven steps
When('I login with credentials {string} and {string}', (username, password) => {
  loginPage.enterUsername(username);
  loginPage.enterPassword(password);
  loginPage.clickLoginButton();
});

Then('I should have {string} access level', (accessLevel) => {
  switch (accessLevel) {
    case 'admin':
      cy.shouldBeVisible('[data-cy="admin-menu"]');
      break;
    case 'user':
      cy.shouldBeVisible('[data-cy="user-menu"]');
      break;
    default:
      cy.shouldBeVisible('[data-cy="default-menu"]');
  }
});

// Error handling steps
Then('I should see form validation errors', () => {
  cy.get('[data-cy="form-errors"]').should('be.visible');
});

Then('the form should prevent submission', () => {
  cy.get('[data-cy="login-button"]').should('be.disabled');
});

// Session management
Given('I am already logged in', () => {
  cy.loginAs('user');
});

When('I logout', () => {
  cy.get('[data-cy="logout-button"]').click();
});

Then('I should be logged out', () => {
  cy.shouldBeOnPage('/login');
  cy.getCookie('session').should('not.exist');
});

