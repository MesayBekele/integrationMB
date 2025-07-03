const BasePage = require('./BasePage');

/**
 * Login Page Object Model
 * Handles all login-related interactions
 */
class LoginPage extends BasePage {
  constructor() {
    super();
    
    // Page elements
    this.elements = {
      usernameInput: '[data-cy="username"]',
      passwordInput: '[data-cy="password"]',
      loginButton: '[data-cy="login-button"]',
      forgotPasswordLink: '[data-cy="forgot-password"]',
      rememberMeCheckbox: '[data-cy="remember-me"]',
      errorMessage: '[data-cy="error-message"]',
      successMessage: '[data-cy="success-message"]',
      loadingSpinner: '[data-cy="loading-spinner"]',
      loginForm: '[data-cy="login-form"]',
      signupLink: '[data-cy="signup-link"]',
      socialLoginButtons: {
        google: '[data-cy="google-login"]',
        facebook: '[data-cy="facebook-login"]',
        github: '[data-cy="github-login"]'
      }
    };
    
    // Page URLs
    this.urls = {
      login: '/login',
      dashboard: '/dashboard',
      home: '/'
    };
  }

  /**
   * Navigate to login page
   * @returns {LoginPage} LoginPage instance
   */
  navigateToLogin() {
    this.visit(this.urls.login);
    this.waitForLoginFormToLoad();
    return this;
  }

  /**
   * Wait for login form to load completely
   * @returns {LoginPage} LoginPage instance
   */
  waitForLoginFormToLoad() {
    this.waitForVisible(this.elements.loginForm);
    this.waitForVisible(this.elements.usernameInput);
    this.waitForVisible(this.elements.passwordInput);
    this.waitForVisible(this.elements.loginButton);
    return this;
  }

  /**
   * Enter username
   * @param {string} username - Username to enter
   * @returns {LoginPage} LoginPage instance
   */
  enterUsername(username) {
    this.typeText(this.elements.usernameInput, username);
    return this;
  }

  /**
   * Enter password
   * @param {string} password - Password to enter
   * @returns {LoginPage} LoginPage instance
   */
  enterPassword(password) {
    this.typeText(this.elements.passwordInput, password);
    return this;
  }

  /**
   * Click login button
   * @returns {LoginPage} LoginPage instance
   */
  clickLoginButton() {
    this.clickElement(this.elements.loginButton);
    return this;
  }

  /**
   * Check remember me checkbox
   * @returns {LoginPage} LoginPage instance
   */
  checkRememberMe() {
    this.checkElement(this.elements.rememberMeCheckbox);
    return this;
  }

  /**
   * Click forgot password link
   * @returns {LoginPage} LoginPage instance
   */
  clickForgotPassword() {
    this.clickElement(this.elements.forgotPasswordLink);
    return this;
  }

  /**
   * Click signup link
   * @returns {LoginPage} LoginPage instance
   */
  clickSignupLink() {
    this.clickElement(this.elements.signupLink);
    return this;
  }

  /**
   * Perform complete login with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {boolean} rememberMe - Whether to check remember me
   * @returns {LoginPage} LoginPage instance
   */
  login(username, password, rememberMe = false) {
    this.enterUsername(username);
    this.enterPassword(password);
    
    if (rememberMe) {
      this.checkRememberMe();
    }
    
    this.clickLoginButton();
    return this;
  }

  /**
   * Login with predefined user type
   * @param {string} userType - User type (admin, user, manager)
   * @returns {LoginPage} LoginPage instance
   */
  loginAs(userType) {
    const configManager = require('../utilities/configManager');
    const user = configManager.getUser(userType);
    
    this.login(user.username, user.password);
    return this;
  }

  /**
   * Perform social login
   * @param {string} provider - Social provider (google, facebook, github)
   * @returns {LoginPage} LoginPage instance
   */
  socialLogin(provider) {
    const socialButton = this.elements.socialLoginButtons[provider];
    if (!socialButton) {
      throw new Error(`Unsupported social provider: ${provider}`);
    }
    
    this.clickElement(socialButton);
    return this;
  }

  /**
   * Wait for login to complete successfully
   * @param {number} timeout - Timeout in milliseconds
   * @returns {LoginPage} LoginPage instance
   */
  waitForSuccessfulLogin(timeout = 10000) {
    // Wait for redirect to dashboard or home page
    cy.url({ timeout }).should('not.include', this.urls.login);
    return this;
  }

  /**
   * Wait for loading spinner to appear and disappear
   * @returns {LoginPage} LoginPage instance
   */
  waitForLoading() {
    this.waitForVisible(this.elements.loadingSpinner);
    this.waitForHidden(this.elements.loadingSpinner);
    return this;
  }

  /**
   * Verify login form is displayed
   * @returns {LoginPage} LoginPage instance
   */
  verifyLoginFormDisplayed() {
    this.verifyElementVisible(this.elements.loginForm);
    this.verifyElementVisible(this.elements.usernameInput);
    this.verifyElementVisible(this.elements.passwordInput);
    this.verifyElementVisible(this.elements.loginButton);
    return this;
  }

  /**
   * Verify error message is displayed
   * @param {string} expectedMessage - Expected error message
   * @returns {LoginPage} LoginPage instance
   */
  verifyErrorMessage(expectedMessage) {
    this.waitForVisible(this.elements.errorMessage);
    if (expectedMessage) {
      this.verifyElementText(this.elements.errorMessage, expectedMessage);
    }
    return this;
  }

  /**
   * Verify success message is displayed
   * @param {string} expectedMessage - Expected success message
   * @returns {LoginPage} LoginPage instance
   */
  verifySuccessMessage(expectedMessage) {
    this.waitForVisible(this.elements.successMessage);
    if (expectedMessage) {
      this.verifyElementText(this.elements.successMessage, expectedMessage);
    }
    return this;
  }

  /**
   * Verify login button is disabled
   * @returns {LoginPage} LoginPage instance
   */
  verifyLoginButtonDisabled() {
    this.getElement(this.elements.loginButton).should('be.disabled');
    return this;
  }

  /**
   * Verify login button is enabled
   * @returns {LoginPage} LoginPage instance
   */
  verifyLoginButtonEnabled() {
    this.getElement(this.elements.loginButton).should('be.enabled');
    return this;
  }

  /**
   * Verify username field has focus
   * @returns {LoginPage} LoginPage instance
   */
  verifyUsernameFieldFocused() {
    this.getElement(this.elements.usernameInput).should('be.focused');
    return this;
  }

  /**
   * Verify password field is masked
   * @returns {LoginPage} LoginPage instance
   */
  verifyPasswordFieldMasked() {
    this.getElement(this.elements.passwordInput).should('have.attr', 'type', 'password');
    return this;
  }

  /**
   * Clear login form
   * @returns {LoginPage} LoginPage instance
   */
  clearLoginForm() {
    this.getElement(this.elements.usernameInput).clear();
    this.getElement(this.elements.passwordInput).clear();
    return this;
  }

  /**
   * Get username field value
   * @returns {Cypress.Chainable} Username value
   */
  getUsernameValue() {
    return this.getElement(this.elements.usernameInput).invoke('val');
  }

  /**
   * Get password field value
   * @returns {Cypress.Chainable} Password value
   */
  getPasswordValue() {
    return this.getElement(this.elements.passwordInput).invoke('val');
  }

  /**
   * Verify remember me checkbox is checked
   * @returns {LoginPage} LoginPage instance
   */
  verifyRememberMeChecked() {
    this.getElement(this.elements.rememberMeCheckbox).should('be.checked');
    return this;
  }

  /**
   * Verify remember me checkbox is unchecked
   * @returns {LoginPage} LoginPage instance
   */
  verifyRememberMeUnchecked() {
    this.getElement(this.elements.rememberMeCheckbox).should('not.be.checked');
    return this;
  }

  /**
   * Verify social login buttons are displayed
   * @returns {LoginPage} LoginPage instance
   */
  verifySocialLoginButtonsDisplayed() {
    Object.values(this.elements.socialLoginButtons).forEach(selector => {
      this.verifyElementVisible(selector);
    });
    return this;
  }

  /**
   * Verify page title
   * @returns {LoginPage} LoginPage instance
   */
  verifyPageTitle() {
    this.verifyTitle('Login');
    return this;
  }

  /**
   * Verify login URL
   * @returns {LoginPage} LoginPage instance
   */
  verifyLoginUrl() {
    this.verifyUrl(this.urls.login);
    return this;
  }

  /**
   * Perform invalid login attempt
   * @param {string} username - Invalid username
   * @param {string} password - Invalid password
   * @returns {LoginPage} LoginPage instance
   */
  attemptInvalidLogin(username, password) {
    this.login(username, password);
    this.verifyErrorMessage();
    return this;
  }

  /**
   * Test login form validation
   * @returns {LoginPage} LoginPage instance
   */
  testFormValidation() {
    // Test empty form submission
    this.clickLoginButton();
    this.verifyErrorMessage();
    
    // Test with only username
    this.enterUsername('testuser');
    this.clickLoginButton();
    this.verifyErrorMessage();
    
    // Clear and test with only password
    this.clearLoginForm();
    this.enterPassword('testpass');
    this.clickLoginButton();
    this.verifyErrorMessage();
    
    return this;
  }

  /**
   * Intercept login API request
   * @param {object} mockResponse - Mock response for login API
   * @returns {LoginPage} LoginPage instance
   */
  interceptLoginApi(mockResponse = null) {
    const configManager = require('../utilities/configManager');
    const apiUrl = configManager.getApiUrl();
    
    this.interceptApiRequest('POST', `${apiUrl}/auth/login`, 'loginApi', mockResponse);
    return this;
  }

  /**
   * Wait for login API request to complete
   * @returns {LoginPage} LoginPage instance
   */
  waitForLoginApi() {
    this.waitForApiRequest('@loginApi');
    return this;
  }
}

module.exports = LoginPage;

