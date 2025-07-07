/**
 * Base Page Object Class
 * Contains common functionality shared across all page objects
 */

class BasePage {
  constructor() {
    this.timeout = Cypress.env('timeout') || {};
    this.defaultTimeout = this.timeout.default || 10000;
    this.pageLoadTimeout = this.timeout.pageLoad || 30000;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - URL to navigate to
   * @param {Object} options - Cypress visit options
   */
  visit(url, options = {}) {
    const baseUrl = Cypress.config('baseUrl');
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    cy.visit(fullUrl, {
      timeout: this.pageLoadTimeout,
      ...options
    });
    
    return this;
  }

  /**
   * Wait for page to load completely
   * @param {string} selector - Selector to wait for
   * @param {number} timeout - Custom timeout
   */
  waitForPageLoad(selector = 'body', timeout = this.pageLoadTimeout) {
    cy.get(selector, { timeout }).should('be.visible');
    cy.get('.loading, .spinner', { timeout: 5000 }).should('not.exist');
    
    return this;
  }

  /**
   * Get element with default timeout
   * @param {string} selector - CSS selector
   * @param {Object} options - Cypress get options
   */
  getElement(selector, options = {}) {
    return cy.get(selector, {
      timeout: this.defaultTimeout,
      ...options
    });
  }

  /**
   * Click element with retry logic
   * @param {string} selector - CSS selector
   * @param {Object} options - Click options
   */
  clickElement(selector, options = {}) {
    this.getElement(selector)
      .should('be.visible')
      .should('not.be.disabled')
      .click(options);
    
    return this;
  }

  /**
   * Type text into input field
   * @param {string} selector - CSS selector
   * @param {string} text - Text to type
   * @param {Object} options - Type options
   */
  typeText(selector, text, options = {}) {
    this.getElement(selector)
      .should('be.visible')
      .clear()
      .type(text, {
        delay: 50,
        ...options
      });
    
    return this;
  }

  /**
   * Select option from dropdown
   * @param {string} selector - CSS selector
   * @param {string} value - Value to select
   */
  selectOption(selector, value) {
    this.getElement(selector)
      .should('be.visible')
      .select(value);
    
    return this;
  }

  /**
   * Check if element exists
   * @param {string} selector - CSS selector
   * @param {number} timeout - Custom timeout
   */
  elementExists(selector, timeout = 5000) {
    return cy.get('body').then($body => {
      return $body.find(selector).length > 0;
    });
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - CSS selector
   * @param {number} timeout - Custom timeout
   */
  waitForElement(selector, timeout = this.defaultTimeout) {
    cy.get(selector, { timeout }).should('be.visible');
    return this;
  }

  /**
   * Wait for element to disappear
   * @param {string} selector - CSS selector
   * @param {number} timeout - Custom timeout
   */
  waitForElementToDisappear(selector, timeout = this.defaultTimeout) {
    cy.get(selector, { timeout }).should('not.exist');
    return this;
  }

  /**
   * Scroll element into view
   * @param {string} selector - CSS selector
   */
  scrollToElement(selector) {
    this.getElement(selector).scrollIntoView();
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
   * Verify page title
   * @param {string} expectedTitle - Expected page title
   */
  verifyPageTitle(expectedTitle) {
    cy.title().should('contain', expectedTitle);
    return this;
  }

  /**
   * Verify current URL
   * @param {string} expectedUrl - Expected URL or URL pattern
   */
  verifyCurrentUrl(expectedUrl) {
    cy.url().should('include', expectedUrl);
    return this;
  }

  /**
   * Get text content of element
   * @param {string} selector - CSS selector
   */
  getElementText(selector) {
    return this.getElement(selector).invoke('text');
  }

  /**
   * Get attribute value of element
   * @param {string} selector - CSS selector
   * @param {string} attribute - Attribute name
   */
  getElementAttribute(selector, attribute) {
    return this.getElement(selector).invoke('attr', attribute);
  }

  /**
   * Verify element contains text
   * @param {string} selector - CSS selector
   * @param {string} text - Expected text
   */
  verifyElementContainsText(selector, text) {
    this.getElement(selector).should('contain.text', text);
    return this;
  }

  /**
   * Verify element is visible
   * @param {string} selector - CSS selector
   */
  verifyElementVisible(selector) {
    this.getElement(selector).should('be.visible');
    return this;
  }

  /**
   * Verify element is not visible
   * @param {string} selector - CSS selector
   */
  verifyElementNotVisible(selector) {
    cy.get(selector).should('not.be.visible');
    return this;
  }

  /**
   * Handle alerts/confirmations
   * @param {string} action - 'accept' or 'dismiss'
   */
  handleAlert(action = 'accept') {
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert');
      cy.stub(win, 'confirm').returns(action === 'accept');
    });
    
    return this;
  }

  /**
   * Switch to iframe
   * @param {string} selector - Iframe selector
   */
  switchToIframe(selector) {
    cy.get(selector)
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap);
    
    return this;
  }

  /**
   * Log custom message
   * @param {string} message - Message to log
   */
  log(message) {
    cy.log(message);
    return this;
  }
}

module.exports = BasePage;

