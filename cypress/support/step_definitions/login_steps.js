import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
const LoginPage = require('../pages/LoginPage');
const configManager = require('../utilities/configManager');

const loginPage = new LoginPage();

// Background steps
Given('I am on the login page', () => {
  loginPage.navigateToLogin();
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

When('I enter an invalid username {string}', (username) => {
  loginPage.enterUsername(username);
});

When('I enter a valid password {string}', (password) => {
  loginPage.enterPassword(password);
});

When('I enter a valid username {string}', (username) => {
  loginPage.enterUsername(username);
});

When('I enter an invalid password {string}', (password) => {
  loginPage.enterPassword(password);
});

When('I click the login button', () => {
  loginPage.clickLoginButton();
});

When('I check the remember me option', () => {
  loginPage.checkRememberMe();
});

When('I leave the username field empty', () => {
  // Username field is already empty by default
  cy.logStep('Username field left empty');
});

When('I leave the password field empty', () => {
  // Password field is already empty by default
  cy.logStep('Password field left empty');
});

When('I enter a username that is too short {string}', (username) => {
  loginPage.enterUsername(username);
});

When('I enter a password that is too short {string}', (password) => {
  loginPage.enterPassword(password);
});

When('I click the {string} link', (linkText) => {
  cy.contains(linkText).click();
});

When('I enter my email address {string}', (email) => {
  cy.get('[data-cy="email"]').type(email);
});

When('I click the {string} button', (buttonText) => {
  cy.contains('button', buttonText).click();
});

When('I login as {string} with credentials {string} and {string}', (userType, username, password) => {
  loginPage.login(username, password);
});

When('I make a login API request with valid credentials', () => {
  const user = configManager.getUser('user');
  cy.apiPost('/auth/login', {
    username: user.username,
    password: user.password
  }).as('loginApiResponse');
});

When('I attempt to login with invalid credentials {int} times', (attempts) => {
  for (let i = 0; i < attempts; i++) {
    loginPage.clearLoginForm();
    loginPage.login('invaliduser', 'invalidpass');
    cy.wait(1000); // Wait between attempts
  }
});

When('my session expires after {int} minutes of inactivity', (minutes) => {
  // Simulate session expiration
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.wait(minutes * 60 * 1000); // Convert to milliseconds
});

When('I try to access a protected page', () => {
  cy.visit('/dashboard');
});

When('I navigate to the login page', () => {
  loginPage.navigateToLogin();
});

// Then steps
Then('I should be redirected to the dashboard', () => {
  cy.url().should('include', '/dashboard');
  loginPage.waitForSuccessfulLogin();
});

Then('I should see a welcome message', () => {
  cy.get('[data-cy="welcome-message"]').should('be.visible');
  cy.get('[data-cy="welcome-message"]').should('contain.text', 'Welcome');
});

Then('the remember me cookie should be set', () => {
  cy.getCookie('remember_me').should('exist');
});

Then('I should see an error message {string}', (expectedMessage) => {
  loginPage.verifyErrorMessage(expectedMessage);
});

Then('I should remain on the login page', () => {
  loginPage.verifyLoginUrl();
});

Then('I should see validation errors', () => {
  cy.get('[data-cy="validation-error"]').should('be.visible');
});

Then('the login button should be disabled', () => {
  loginPage.verifyLoginButtonDisabled();
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
  cy.url().should('include', '/forgot-password');
});

Then('I should see a confirmation message', () => {
  cy.get('[data-cy="confirmation-message"]').should('be.visible');
  cy.get('[data-cy="confirmation-message"]').should('contain.text', 'Reset link sent');
});

Then('I should see social login buttons', () => {
  loginPage.verifySocialLoginButtonsDisplayed();
});

Then('the Google login button should be visible', () => {
  cy.get('[data-cy="google-login"]').should('be.visible');
});

Then('the Facebook login button should be visible', () => {
  cy.get('[data-cy="facebook-login"]').should('be.visible');
});

Then('the GitHub login button should be visible', () => {
  cy.get('[data-cy="github-login"]').should('be.visible');
});

Then('I should see the {string} page', (expectedPage) => {
  cy.url().should('include', `/${expectedPage}`);
});

Then('I should have {string} access permissions', (accessLevel) => {
  // Verify access level based on user role
  switch (accessLevel) {
    case 'full':
      cy.get('[data-cy="admin-menu"]').should('be.visible');
      break;
    case 'moderate':
      cy.get('[data-cy="manager-menu"]').should('be.visible');
      break;
    case 'limited':
      cy.get('[data-cy="user-menu"]').should('be.visible');
      break;
  }
});

Then('I should receive a valid authentication token', () => {
  cy.get('@loginApiResponse').then((response) => {
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
    expect(response.body.token).to.be.a('string');
    expect(response.body.token).to.have.length.greaterThan(0);
  });
});

Then('the token should have the correct expiration time', () => {
  cy.get('@loginApiResponse').then((response) => {
    expect(response.body).to.have.property('expiresIn');
    expect(response.body.expiresIn).to.be.a('number');
    expect(response.body.expiresIn).to.be.greaterThan(0);
  });
});

Then('the user profile should be included in the response', () => {
  cy.get('@loginApiResponse').then((response) => {
    expect(response.body).to.have.property('user');
    expect(response.body.user).to.have.property('username');
    expect(response.body.user).to.have.property('email');
  });
});

Then('my account should be temporarily locked', () => {
  cy.get('[data-cy="account-locked"]').should('be.visible');
});

Then('I should see a lockout message', () => {
  cy.get('[data-cy="lockout-message"]').should('be.visible');
  cy.get('[data-cy="lockout-message"]').should('contain.text', 'Account temporarily locked');
});

Then('I should not be able to login even with valid credentials', () => {
  const user = configManager.getUser('user');
  loginPage.clearLoginForm();
  loginPage.login(user.username, user.password);
  loginPage.verifyErrorMessage('Account is locked');
});

Then('I should see a session timeout message', () => {
  cy.get('[data-cy="session-timeout"]').should('be.visible');
  cy.get('[data-cy="session-timeout"]').should('contain.text', 'Session expired');
});

Then('the login form should be mobile-responsive', () => {
  cy.get('[data-cy="login-form"]').should('be.visible');
  cy.get('[data-cy="login-form"]').should('have.css', 'max-width');
});

Then('all elements should be easily accessible', () => {
  // Check that form elements are properly sized for mobile
  cy.get('[data-cy="username"]').should('have.css', 'min-height', '44px');
  cy.get('[data-cy="password"]').should('have.css', 'min-height', '44px');
  cy.get('[data-cy="login-button"]').should('have.css', 'min-height', '44px');
});

Then('the virtual keyboard should not obscure the form', () => {
  // Check viewport meta tag and form positioning
  cy.get('meta[name="viewport"]').should('have.attr', 'content').and('include', 'width=device-width');
});

// Given steps for specific scenarios
Given('I am logged in as a user', () => {
  cy.loginAs('user');
});

Given('I am using a mobile device', () => {
  cy.setMobileViewport('iphone-x');
});

// Custom step for data-driven testing
When('I login with user type {string}', (userType) => {
  const user = configManager.getUser(userType);
  loginPage.login(user.username, user.password);
});

// Performance testing steps
Then('the login process should complete within {int} seconds', (maxSeconds) => {
  cy.measurePerformance(() => {
    loginPage.clickLoginButton();
    loginPage.waitForSuccessfulLogin();
  }).then((duration) => {
    expect(duration).to.be.lessThan(maxSeconds * 1000);
  });
});

// Accessibility testing steps
Then('the login form should be accessible', () => {
  // Check for proper labels and ARIA attributes
  cy.get('[data-cy="username"]').should('have.attr', 'aria-label');
  cy.get('[data-cy="password"]').should('have.attr', 'aria-label');
  cy.get('[data-cy="login-button"]').should('have.attr', 'aria-label');
  
  // Check for proper focus management
  cy.get('[data-cy="username"]').should('be.focused');
});

// Database verification steps
Then('the login should be recorded in the audit log', () => {
  const user = configManager.getUser('user');
  cy.dbSelect('audit_logs', { 
    action: 'login', 
    username: user.username 
  }).then((logs) => {
    expect(logs).to.have.length.greaterThan(0);
    expect(logs[0]).to.have.property('timestamp');
    expect(logs[0]).to.have.property('ip_address');
  });
});

// API integration steps
Then('the login should trigger user analytics events', () => {
  cy.wait('@analyticsEvent').then((interception) => {
    expect(interception.request.body).to.have.property('event', 'user_login');
    expect(interception.request.body).to.have.property('timestamp');
  });
});

// Security testing steps
Then('the password should not be visible in network requests', () => {
  cy.window().then((win) => {
    // Check that password is not in plain text in any network requests
    const requests = win.performance.getEntriesByType('resource');
    requests.forEach(request => {
      expect(request.name).to.not.include('password=');
    });
  });
});

Then('the session should be properly secured', () => {
  cy.getCookie('session_id').then((cookie) => {
    expect(cookie).to.have.property('httpOnly', true);
    expect(cookie).to.have.property('secure', true);
    expect(cookie).to.have.property('sameSite', 'strict');
  });
});

