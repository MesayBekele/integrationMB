/**
 * Login Page Object Model
 * Handles all login-related interactions
 */

const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor() {
    super();
    this.url = '/login';
    
    // Page elements
    this.elements = {
      usernameField: 'username',
      passwordField: 'password',
      loginButton: 'login-button',
      forgotPasswordLink: 'forgot-password-link',
      signUpLink: 'signup-link',
      errorMessage: 'error-message',
      successMessage: 'success-message',
      rememberMeCheckbox: 'remember-me',
      showPasswordButton: 'show-password',
      loginForm: 'login-form',
      loadingSpinner: 'loading-spinner'
    };
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
    this.typeText(this.elements.usernameField, username);
    return this;
  }

  /**
   * Enter password
   * @param {string} password - Password to enter
   */
  enterPassword(password) {
    this.typeText(this.elements.passwordField, password);
    return this;
  }

  /**
   * Click login button
   */
  clickLogin() {
    this.clickElement(this.elements.loginButton);
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
    this.clickLogin();
    return this;
  }

  /**
   * Login with user data object
   * @param {Object} userData - Object containing username and password
   */
  loginWithUserData(userData) {
    return this.login(userData.username, userData.password);
  }

  /**
   * Click forgot password link
   */
  clickForgotPassword() {
    this.clickElement(this.elements.forgotPasswordLink);
    return this;
  }

  /**
   * Click sign up link
   */
  clickSignUp() {
    this.clickElement(this.elements.signUpLink);
    return this;
  }

  /**
   * Toggle remember me checkbox
   */
  toggleRememberMe() {
    this.clickElement(this.elements.rememberMeCheckbox);
    return this;
  }

  /**
   * Show/hide password
   */
  togglePasswordVisibility() {
    this.clickElement(this.elements.showPasswordButton);
    return this;
  }

  /**
   * Verify login form is visible
   */
  verifyLoginFormVisible() {
    this.isVisible(this.elements.loginForm);
    this.isVisible(this.elements.usernameField);
    this.isVisible(this.elements.passwordField);
    this.isVisible(this.elements.loginButton);
    return this;
  }

  /**
   * Verify error message is displayed
   * @param {string} expectedMessage - Expected error message
   */
  verifyErrorMessage(expectedMessage) {
    this.isVisible(this.elements.errorMessage);
    if (expectedMessage) {
      this.shouldContainText(this.elements.errorMessage, expectedMessage);
    }
    return this;
  }

  /**
   * Verify success message is displayed
   * @param {string} expectedMessage - Expected success message
   */
  verifySuccessMessage(expectedMessage) {
    this.isVisible(this.elements.successMessage);
    if (expectedMessage) {
      this.shouldContainText(this.elements.successMessage, expectedMessage);
    }
    return this;
  }

  /**
   * Wait for login to complete
   */
  waitForLoginComplete() {
    // Wait for loading spinner to disappear
    this.waitForElementToDisappear(this.elements.loadingSpinner);
    return this;
  }

  /**
   * Verify login button is enabled
   */
  verifyLoginButtonEnabled() {
    this.getElement(this.elements.loginButton).should('not.be.disabled');
    return this;
  }

  /**
   * Verify login button is disabled
   */
  verifyLoginButtonDisabled() {
    this.getElement(this.elements.loginButton).should('be.disabled');
    return this;
  }

  /**
   * Clear login form
   */
  clearLoginForm() {
    this.clearField(this.elements.usernameField);
    this.clearField(this.elements.passwordField);
    return this;
  }

  /**
   * Verify username field has focus
   */
  verifyUsernameFieldFocused() {
    this.getElement(this.elements.usernameField).should('be.focused');
    return this;
  }

  /**
   * Get username field value
   */
  getUsernameValue() {
    return this.getElement(this.elements.usernameField).invoke('val');
  }

  /**
   * Get password field value
   */
  getPasswordValue() {
    return this.getElement(this.elements.passwordField).invoke('val');
  }

  /**
   * Verify remember me is checked
   */
  verifyRememberMeChecked() {
    this.getElement(this.elements.rememberMeCheckbox).should('be.checked');
    return this;
  }

  /**
   * Verify remember me is not checked
   */
  verifyRememberMeNotChecked() {
    this.getElement(this.elements.rememberMeCheckbox).should('not.be.checked');
    return this;
  }

  /**
   * Submit form using Enter key
   */
  submitWithEnter() {
    this.getElement(this.elements.passwordField).type('{enter}');
    return this;
  }

  /**
   * Verify page title
   */
  verifyLoginPageTitle() {
    this.shouldHaveTitle('Login - Your App');
    return this;
  }

  /**
   * Verify login URL
   */
  verifyLoginUrl() {
    this.urlShouldContain('/login');
    return this;
  }

  /**
   * Login with invalid credentials and verify error
   * @param {string} username - Invalid username
   * @param {string} password - Invalid password
   * @param {string} expectedError - Expected error message
   */
  loginWithInvalidCredentials(username, password, expectedError) {
    this.login(username, password);
    this.verifyErrorMessage(expectedError);
    return this;
  }

  /**
   * Verify all form validation messages
   */
  verifyFormValidation() {
    // Try to submit empty form
    this.clickLogin();
    
    // Verify validation messages appear
    this.verifyErrorMessage();
    return this;
  }
}

module.exports = LoginPage;

