/**
 * Base Page Object Model Class
 * Contains common functionality shared across all page objects
 */

class BasePage {
  constructor() {
    this.timeout = 10000;
  }

  /**
   * Visit a specific URL
   * @param {string} url - The URL to visit
   */
  visit(url = '') {
    cy.visit(url);
    return this;
  }

  /**
   * Wait for page to load completely
   */
  waitForPageLoad() {
    cy.get('body').should('be.visible');
    cy.url().should('not.include', 'loading');
    return this;
  }

  /**
   * Get element by data-cy attribute
   * @param {string} selector - The data-cy selector
   * @param {number} timeout - Optional timeout
   */
  getElement(selector, timeout = this.timeout) {
    return cy.get(`[data-cy="${selector}"]`, { timeout });
  }

  /**
   * Get element by CSS selector
   * @param {string} selector - The CSS selector
   * @param {number} timeout - Optional timeout
   */
  getElementBySelector(selector, timeout = this.timeout) {
    return cy.get(selector, { timeout });
  }

  /**
   * Click an element
   * @param {string} selector - The data-cy selector
   */
  clickElement(selector) {
    this.getElement(selector).click();
    return this;
  }

  /**
   * Type text into an element
   * @param {string} selector - The data-cy selector
   * @param {string} text - Text to type
   * @param {boolean} clear - Whether to clear the field first
   */
  typeText(selector, text, clear = true) {
    const element = this.getElement(selector);
    if (clear) {
      element.clear();
    }
    element.type(text);
    return this;
  }

  /**
   * Select option from dropdown
   * @param {string} selector - The data-cy selector
   * @param {string} value - Value to select
   */
  selectOption(selector, value) {
    this.getElement(selector).select(value);
    return this;
  }

  /**
   * Check if element is visible
   * @param {string} selector - The data-cy selector
   */
  isVisible(selector) {
    return this.getElement(selector).should('be.visible');
  }

  /**
   * Check if element contains text
   * @param {string} selector - The data-cy selector
   * @param {string} text - Expected text
   */
  shouldContainText(selector, text) {
    this.getElement(selector).should('contain.text', text);
    return this;
  }

  /**
   * Check if element has specific value
   * @param {string} selector - The data-cy selector
   * @param {string} value - Expected value
   */
  shouldHaveValue(selector, value) {
    this.getElement(selector).should('have.value', value);
    return this;
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - The data-cy selector
   * @param {number} timeout - Optional timeout
   */
  waitForElement(selector, timeout = this.timeout) {
    this.getElement(selector, timeout).should('be.visible');
    return this;
  }

  /**
   * Wait for element to disappear
   * @param {string} selector - The data-cy selector
   * @param {number} timeout - Optional timeout
   */
  waitForElementToDisappear(selector, timeout = this.timeout) {
    cy.get(`[data-cy="${selector}"]`, { timeout }).should('not.exist');
    return this;
  }

  /**
   * Scroll to element
   * @param {string} selector - The data-cy selector
   */
  scrollToElement(selector) {
    this.getElement(selector).scrollIntoView();
    return this;
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   */
  takeScreenshot(name) {
    cy.screenshot(name || `page-${Date.now()}`);
    return this;
  }

  /**
   * Get current URL
   */
  getCurrentUrl() {
    return cy.url();
  }

  /**
   * Verify current URL contains text
   * @param {string} text - Text that should be in URL
   */
  urlShouldContain(text) {
    cy.url().should('include', text);
    return this;
  }

  /**
   * Get page title
   */
  getTitle() {
    return cy.title();
  }

  /**
   * Verify page title
   * @param {string} title - Expected title
   */
  shouldHaveTitle(title) {
    cy.title().should('eq', title);
    return this;
  }

  /**
   * Wait for specific amount of time
   * @param {number} ms - Milliseconds to wait
   */
  wait(ms) {
    cy.wait(ms);
    return this;
  }

  /**
   * Reload the page
   */
  reload() {
    cy.reload();
    return this;
  }

  /**
   * Go back in browser history
   */
  goBack() {
    cy.go('back');
    return this;
  }

  /**
   * Go forward in browser history
   */
  goForward() {
    cy.go('forward');
    return this;
  }

  /**
   * Handle alerts/confirmations
   * @param {boolean} accept - Whether to accept or dismiss
   */
  handleAlert(accept = true) {
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(accept);
      cy.stub(win, 'alert').returns(accept);
    });
    return this;
  }

  /**
   * Upload file
   * @param {string} selector - The data-cy selector
   * @param {string} fileName - File name in fixtures folder
   */
  uploadFile(selector, fileName) {
    this.getElement(selector).selectFile(`cypress/fixtures/${fileName}`);
    return this;
  }

  /**
   * Clear form field
   * @param {string} selector - The data-cy selector
   */
  clearField(selector) {
    this.getElement(selector).clear();
    return this;
  }

  /**
   * Check checkbox or radio button
   * @param {string} selector - The data-cy selector
   */
  check(selector) {
    this.getElement(selector).check();
    return this;
  }

  /**
   * Uncheck checkbox
   * @param {string} selector - The data-cy selector
   */
  uncheck(selector) {
    this.getElement(selector).uncheck();
    return this;
  }

  /**
   * Get text content of element
   * @param {string} selector - The data-cy selector
   */
  getText(selector) {
    return this.getElement(selector).invoke('text');
  }

  /**
   * Get attribute value of element
   * @param {string} selector - The data-cy selector
   * @param {string} attribute - Attribute name
   */
  getAttribute(selector, attribute) {
    return this.getElement(selector).invoke('attr', attribute);
  }

  /**
   * Double click an element
   * @param {string} selector - The data-cy selector
   */
  doubleClick(selector) {
    this.getElement(selector).dblclick();
    return this;
  }

  /**
   * Right click an element
   * @param {string} selector - The data-cy selector
   */
  rightClick(selector) {
    this.getElement(selector).rightclick();
    return this;
  }

  /**
   * Hover over an element
   * @param {string} selector - The data-cy selector
   */
  hover(selector) {
    this.getElement(selector).trigger('mouseover');
    return this;
  }
}

module.exports = BasePage;

