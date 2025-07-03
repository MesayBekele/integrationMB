/**
 * Base Page Object Model class
 * Contains common functionality shared across all page objects
 */

class BasePage {
  constructor() {
    this.timeout = 10000;
    this.retryOptions = { timeout: this.timeout, interval: 500 };
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - URL to navigate to
   * @param {object} options - Navigation options
   */
  visit(url, options = {}) {
    const defaultOptions = {
      timeout: 30000,
      failOnStatusCode: true
    };
    
    cy.visit(url, { ...defaultOptions, ...options });
    this.waitForPageLoad();
    return this;
  }

  /**
   * Wait for page to fully load
   */
  waitForPageLoad() {
    cy.window().should('have.property', 'document');
    cy.document().should('have.property', 'readyState', 'complete');
    return this;
  }

  /**
   * Get element with retry logic
   * @param {string} selector - CSS selector or data-cy attribute
   * @param {object} options - Options for element selection
   * @returns {Cypress.Chainable} Cypress element
   */
  getElement(selector, options = {}) {
    const defaultOptions = { timeout: this.timeout };
    return cy.get(selector, { ...defaultOptions, ...options });
  }

  /**
   * Get element by data-cy attribute
   * @param {string} dataCy - data-cy attribute value
   * @param {object} options - Options for element selection
   * @returns {Cypress.Chainable} Cypress element
   */
  getByDataCy(dataCy, options = {}) {
    return this.getElement(`[data-cy="${dataCy}"]`, options);
  }

  /**
   * Get element by text content
   * @param {string} text - Text content to search for
   * @param {object} options - Options for element selection
   * @returns {Cypress.Chainable} Cypress element
   */
  getByText(text, options = {}) {
    return cy.contains(text, options);
  }

  /**
   * Click element with retry logic
   * @param {string} selector - Element selector
   * @param {object} options - Click options
   */
  clickElement(selector, options = {}) {
    const defaultOptions = { timeout: this.timeout };
    this.getElement(selector, defaultOptions)
      .should('be.visible')
      .should('be.enabled')
      .click(options);
    return this;
  }

  /**
   * Type text into input field
   * @param {string} selector - Input field selector
   * @param {string} text - Text to type
   * @param {object} options - Type options
   */
  typeText(selector, text, options = {}) {
    const defaultOptions = { delay: 50, clear: true };
    this.getElement(selector)
      .should('be.visible')
      .should('be.enabled');
    
    if (defaultOptions.clear) {
      this.getElement(selector).clear();
    }
    
    this.getElement(selector).type(text, { ...defaultOptions, ...options });
    return this;
  }

  /**
   * Select option from dropdown
   * @param {string} selector - Dropdown selector
   * @param {string} value - Value to select
   */
  selectOption(selector, value) {
    this.getElement(selector)
      .should('be.visible')
      .select(value);
    return this;
  }

  /**
   * Check checkbox or radio button
   * @param {string} selector - Checkbox/radio selector
   */
  checkElement(selector) {
    this.getElement(selector)
      .should('be.visible')
      .check();
    return this;
  }

  /**
   * Uncheck checkbox
   * @param {string} selector - Checkbox selector
   */
  uncheckElement(selector) {
    this.getElement(selector)
      .should('be.visible')
      .uncheck();
    return this;
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  waitForVisible(selector, timeout = this.timeout) {
    this.getElement(selector, { timeout }).should('be.visible');
    return this;
  }

  /**
   * Wait for element to be hidden
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  waitForHidden(selector, timeout = this.timeout) {
    this.getElement(selector, { timeout }).should('not.be.visible');
    return this;
  }

  /**
   * Wait for element to contain text
   * @param {string} selector - Element selector
   * @param {string} text - Expected text
   * @param {number} timeout - Timeout in milliseconds
   */
  waitForText(selector, text, timeout = this.timeout) {
    this.getElement(selector, { timeout }).should('contain.text', text);
    return this;
  }

  /**
   * Scroll element into view
   * @param {string} selector - Element selector
   */
  scrollToElement(selector) {
    this.getElement(selector).scrollIntoView();
    return this;
  }

  /**
   * Hover over element
   * @param {string} selector - Element selector
   */
  hoverElement(selector) {
    this.getElement(selector)
      .should('be.visible')
      .trigger('mouseover');
    return this;
  }

  /**
   * Double click element
   * @param {string} selector - Element selector
   */
  doubleClickElement(selector) {
    this.getElement(selector)
      .should('be.visible')
      .dblclick();
    return this;
  }

  /**
   * Right click element
   * @param {string} selector - Element selector
   */
  rightClickElement(selector) {
    this.getElement(selector)
      .should('be.visible')
      .rightclick();
    return this;
  }

  /**
   * Upload file to input
   * @param {string} selector - File input selector
   * @param {string} fileName - File name in fixtures folder
   */
  uploadFile(selector, fileName) {
    this.getElement(selector).selectFile(`cypress/fixtures/${fileName}`);
    return this;
  }

  /**
   * Take screenshot with custom name
   * @param {string} name - Screenshot name
   */
  takeScreenshot(name) {
    cy.screenshot(name);
    return this;
  }

  /**
   * Verify element exists
   * @param {string} selector - Element selector
   */
  verifyElementExists(selector) {
    this.getElement(selector).should('exist');
    return this;
  }

  /**
   * Verify element does not exist
   * @param {string} selector - Element selector
   */
  verifyElementNotExists(selector) {
    cy.get('body').should('not.contain', selector);
    return this;
  }

  /**
   * Verify element is visible
   * @param {string} selector - Element selector
   */
  verifyElementVisible(selector) {
    this.getElement(selector).should('be.visible');
    return this;
  }

  /**
   * Verify element is hidden
   * @param {string} selector - Element selector
   */
  verifyElementHidden(selector) {
    this.getElement(selector).should('not.be.visible');
    return this;
  }

  /**
   * Verify element contains text
   * @param {string} selector - Element selector
   * @param {string} text - Expected text
   */
  verifyElementText(selector, text) {
    this.getElement(selector).should('contain.text', text);
    return this;
  }

  /**
   * Verify element has attribute
   * @param {string} selector - Element selector
   * @param {string} attribute - Attribute name
   * @param {string} value - Expected attribute value
   */
  verifyElementAttribute(selector, attribute, value) {
    this.getElement(selector).should('have.attr', attribute, value);
    return this;
  }

  /**
   * Verify page URL
   * @param {string} expectedUrl - Expected URL or URL pattern
   */
  verifyUrl(expectedUrl) {
    cy.url().should('include', expectedUrl);
    return this;
  }

  /**
   * Verify page title
   * @param {string} expectedTitle - Expected page title
   */
  verifyTitle(expectedTitle) {
    cy.title().should('include', expectedTitle);
    return this;
  }

  /**
   * Wait for API request to complete
   * @param {string} alias - Request alias
   * @param {number} timeout - Timeout in milliseconds
   */
  waitForApiRequest(alias, timeout = this.timeout) {
    cy.wait(alias, { timeout });
    return this;
  }

  /**
   * Intercept API request
   * @param {string} method - HTTP method
   * @param {string} url - API endpoint URL
   * @param {string} alias - Alias for the request
   * @param {object} response - Mock response (optional)
   */
  interceptApiRequest(method, url, alias, response = null) {
    if (response) {
      cy.intercept(method, url, response).as(alias);
    } else {
      cy.intercept(method, url).as(alias);
    }
    return this;
  }

  /**
   * Execute JavaScript in browser
   * @param {string} script - JavaScript code to execute
   */
  executeScript(script) {
    cy.window().then((win) => {
      win.eval(script);
    });
    return this;
  }

  /**
   * Get local storage item
   * @param {string} key - Local storage key
   * @returns {Cypress.Chainable} Local storage value
   */
  getLocalStorageItem(key) {
    return cy.window().then((win) => {
      return win.localStorage.getItem(key);
    });
  }

  /**
   * Set local storage item
   * @param {string} key - Local storage key
   * @param {string} value - Local storage value
   */
  setLocalStorageItem(key, value) {
    cy.window().then((win) => {
      win.localStorage.setItem(key, value);
    });
    return this;
  }

  /**
   * Clear local storage
   */
  clearLocalStorage() {
    cy.clearLocalStorage();
    return this;
  }

  /**
   * Get cookie
   * @param {string} name - Cookie name
   * @returns {Cypress.Chainable} Cookie value
   */
  getCookie(name) {
    return cy.getCookie(name);
  }

  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {object} options - Cookie options
   */
  setCookie(name, value, options = {}) {
    cy.setCookie(name, value, options);
    return this;
  }

  /**
   * Clear cookies
   */
  clearCookies() {
    cy.clearCookies();
    return this;
  }

  /**
   * Reload page
   */
  reloadPage() {
    cy.reload();
    this.waitForPageLoad();
    return this;
  }

  /**
   * Go back in browser history
   */
  goBack() {
    cy.go('back');
    this.waitForPageLoad();
    return this;
  }

  /**
   * Go forward in browser history
   */
  goForward() {
    cy.go('forward');
    this.waitForPageLoad();
    return this;
  }
}

module.exports = BasePage;

