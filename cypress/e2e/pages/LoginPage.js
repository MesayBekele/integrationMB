/**
 * Login Page Object
 * Handles all interactions with the login page
 */

const BasePage = require('./base/BasePage');

class LoginPage extends BasePage {
  constructor() {
    super();
    
    // Page selectors
    this.selectors = {
      usernameInput: '[data-testid="username-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      errorMessage: '[data-testid="error-message"]',
      forgotPasswordLink: '[data-testid="forgot-password-link"]',
      rememberMeCheckbox: '[data-testid="remember-me-checkbox"]',
      signUpLink: '[data-testid="signup-link"]',
      loadingSpinner: '[data-testid="loading-spinner"]',
      
      // Alternative selectors (fallback)
      usernameInputAlt: '#username, input[name="username"], input[type="email"]',
      passwordInputAlt: '#password, input[name="password"], input[type="password"]',
      loginButtonAlt: 'button[type="submit"], .login-btn, #login-button'
    };
    
    // Page URL
    this.url = '/login';
  }

  /**
   * Navigate to login page
   */
  navigateToLogin() {
    this.visit(this.url);
    this.waitForPageLoad();
    return this;
  }

  /**
   * Enter username
   * @param {string} username - Username to enter
   */
  enterUsername(username) {
    // Try primary selector first, fallback to alternative
    cy.get('body').then($body => {
      if ($body.find(this.selectors.usernameInput).length > 0) {
        this.typeText(this.selectors.usernameInput, username);
      } else {
        this.typeText(this.selectors.usernameInputAlt, username);
      }
    });
    
    return this;
  }

  /**
   * Enter password
   * @param {string} password - Password to enter
   */
  enterPassword(password) {
    // Try primary selector first, fallback to alternative
    cy.get('body').then($body => {
      if ($body.find(this.selectors.passwordInput).length > 0) {
        this.typeText(this.selectors.passwordInput, password);
      } else {
        this.typeText(this.selectors.passwordInputAlt, password);
      }
    });
    
    return this;
  }

  /**
   * Click login button
   */
  clickLoginButton() {
    // Try primary selector first, fallback to alternative
    cy.get('body').then($body => {
      if ($body.find(this.selectors.loginButton).length > 0) {
        this.clickElement(this.selectors.loginButton);
      } else {
        this.clickElement(this.selectors.loginButtonAlt);
      }
    });
    
    return this;
  }

  /**
   * Perform complete login
   * @param {string} username - Username
   * @param {string} password - Password
   */
  login(username, password) {
    this.enterUsername(username);
    this.enterPassword(password);
    this.clickLoginButton();
    
    return this;
  }

  /**
   * Login with credentials from environment
   * @param {string} userType - Type of user (admin, user)
   */
  loginWithEnvironmentCredentials(userType = 'user') {
    const credentials = Cypress.env('credentials');
    
    if (!credentials || !credentials[userType]) {
      throw new Error(`Credentials for user type '${userType}' not found in environment config`);
    }
    
    const { username, password } = credentials[userType];
    this.login(username, password);
    
    return this;
  }

  /**
   * Verify login error message
   * @param {string} expectedMessage - Expected error message
   */
  verifyErrorMessage(expectedMessage) {
    this.waitForElement(this.selectors.errorMessage);
    this.verifyElementContainsText(this.selectors.errorMessage, expectedMessage);
    
    return this;
  }

  /**
   * Verify login button is disabled
   */
  verifyLoginButtonDisabled() {
    this.getElement(this.selectors.loginButton).should('be.disabled');
    return this;
  }

  /**
   * Verify login button is enabled
   */
  verifyLoginButtonEnabled() {
    this.getElement(this.selectors.loginButton).should('not.be.disabled');
    return this;
  }

  /**
   * Click forgot password link
   */
  clickForgotPassword() {
    this.clickElement(this.selectors.forgotPasswordLink);
    return this;
  }

  /**
   * Toggle remember me checkbox
   */
  toggleRememberMe() {
    this.clickElement(this.selectors.rememberMeCheckbox);
    return this;
  }

  /**
   * Click sign up link
   */
  clickSignUp() {
    this.clickElement(this.selectors.signUpLink);
    return this;
  }

  /**
   * Wait for login to complete
   */
  waitForLoginCompletion() {
    // Wait for loading spinner to disappear
    this.waitForElementToDisappear(this.selectors.loadingSpinner);
    
    // Verify we're no longer on login page
    cy.url().should('not.include', this.url);
    
    return this;
  }

  /**
   * Verify user remains on login page
   */
  verifyRemainsOnLoginPage() {
    this.verifyCurrentUrl(this.url);
    return this;
  }

  /**
   * Clear login form
   */
  clearLoginForm() {
    this.getElement(this.selectors.usernameInput).clear();
    this.getElement(this.selectors.passwordInput).clear();
    return this;
  }

  /**
   * Verify login form is visible
   */
  verifyLoginFormVisible() {
    this.verifyElementVisible(this.selectors.usernameInput);
    this.verifyElementVisible(this.selectors.passwordInput);
    this.verifyElementVisible(this.selectors.loginButton);
    
    return this;
  }

  /**
   * Get validation errors
   */
  getValidationErrors() {
    return cy.get('[data-testid*="validation-error"], .error, .invalid-feedback')
      .then($errors => {
        return Array.from($errors).map(el => el.textContent.trim());
      });
  }

  /**
   * Verify validation errors are displayed
   * @param {Array} expectedErrors - Array of expected error messages
   */
  verifyValidationErrors(expectedErrors) {
    expectedErrors.forEach(error => {
      cy.contains(error).should('be.visible');
    });
    
    return this;
  }
}

module.exports = LoginPage;

