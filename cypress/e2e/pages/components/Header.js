/**
 * Header Component Object
 * Handles interactions with the application header/navigation
 */

const BasePage = require('../base/BasePage');

class Header extends BasePage {
  constructor() {
    super();
    
    // Component selectors
    this.selectors = {
      header: '[data-testid="header"]',
      logo: '[data-testid="logo"]',
      navigationMenu: '[data-testid="nav-menu"]',
      userMenu: '[data-testid="user-menu"]',
      userAvatar: '[data-testid="user-avatar"]',
      welcomeMessage: '[data-testid="welcome-message"]',
      logoutButton: '[data-testid="logout-button"]',
      profileLink: '[data-testid="profile-link"]',
      settingsLink: '[data-testid="settings-link"]',
      notificationIcon: '[data-testid="notification-icon"]',
      notificationBadge: '[data-testid="notification-badge"]',
      searchBox: '[data-testid="search-box"]',
      searchButton: '[data-testid="search-button"]',
      
      // Navigation links
      homeLink: '[data-testid="nav-home"]',
      dashboardLink: '[data-testid="nav-dashboard"]',
      usersLink: '[data-testid="nav-users"]',
      productsLink: '[data-testid="nav-products"]',
      reportsLink: '[data-testid="nav-reports"]',
      
      // Mobile menu
      mobileMenuToggle: '[data-testid="mobile-menu-toggle"]',
      mobileMenu: '[data-testid="mobile-menu"]'
    };
  }

  /**
   * Verify header is visible
   */
  verifyHeaderVisible() {
    this.verifyElementVisible(this.selectors.header);
    return this;
  }

  /**
   * Click on logo
   */
  clickLogo() {
    this.clickElement(this.selectors.logo);
    return this;
  }

  /**
   * Navigate to specific page using navigation menu
   * @param {string} page - Page name (home, dashboard, users, products, reports)
   */
  navigateToPage(page) {
    const linkSelector = this.selectors[`${page}Link`];
    
    if (!linkSelector) {
      throw new Error(`Navigation link for page '${page}' not found`);
    }
    
    this.clickElement(linkSelector);
    return this;
  }

  /**
   * Open user menu
   */
  openUserMenu() {
    this.clickElement(this.selectors.userAvatar);
    this.waitForElement(this.selectors.userMenu);
    return this;
  }

  /**
   * Close user menu
   */
  closeUserMenu() {
    // Click outside the menu to close it
    cy.get('body').click(0, 0);
    this.waitForElementToDisappear(this.selectors.userMenu);
    return this;
  }

  /**
   * Logout user
   */
  logout() {
    this.openUserMenu();
    this.clickElement(this.selectors.logoutButton);
    return this;
  }

  /**
   * Navigate to user profile
   */
  goToProfile() {
    this.openUserMenu();
    this.clickElement(this.selectors.profileLink);
    return this;
  }

  /**
   * Navigate to settings
   */
  goToSettings() {
    this.openUserMenu();
    this.clickElement(this.selectors.settingsLink);
    return this;
  }

  /**
   * Verify welcome message
   * @param {string} expectedMessage - Expected welcome message
   */
  verifyWelcomeMessage(expectedMessage) {
    this.verifyElementContainsText(this.selectors.welcomeMessage, expectedMessage);
    return this;
  }

  /**
   * Verify user is logged in
   * @param {string} username - Expected username
   */
  verifyUserLoggedIn(username) {
    this.verifyElementVisible(this.selectors.userAvatar);
    
    if (username) {
      this.verifyWelcomeMessage(username);
    }
    
    return this;
  }

  /**
   * Search for content
   * @param {string} searchTerm - Term to search for
   */
  search(searchTerm) {
    this.typeText(this.selectors.searchBox, searchTerm);
    this.clickElement(this.selectors.searchButton);
    return this;
  }

  /**
   * Clear search box
   */
  clearSearch() {
    this.getElement(this.selectors.searchBox).clear();
    return this;
  }

  /**
   * Check notification badge
   * @param {number} expectedCount - Expected notification count
   */
  verifyNotificationCount(expectedCount) {
    if (expectedCount > 0) {
      this.verifyElementVisible(this.selectors.notificationBadge);
      this.verifyElementContainsText(this.selectors.notificationBadge, expectedCount.toString());
    } else {
      this.verifyElementNotVisible(this.selectors.notificationBadge);
    }
    
    return this;
  }

  /**
   * Click notification icon
   */
  clickNotifications() {
    this.clickElement(this.selectors.notificationIcon);
    return this;
  }

  /**
   * Toggle mobile menu (for responsive design)
   */
  toggleMobileMenu() {
    this.clickElement(this.selectors.mobileMenuToggle);
    return this;
  }

  /**
   * Verify mobile menu is open
   */
  verifyMobileMenuOpen() {
    this.verifyElementVisible(this.selectors.mobileMenu);
    return this;
  }

  /**
   * Verify mobile menu is closed
   */
  verifyMobileMenuClosed() {
    this.verifyElementNotVisible(this.selectors.mobileMenu);
    return this;
  }

  /**
   * Navigate using mobile menu
   * @param {string} page - Page name
   */
  navigateViaMobileMenu(page) {
    this.toggleMobileMenu();
    this.verifyMobileMenuOpen();
    this.navigateToPage(page);
    return this;
  }

  /**
   * Verify current page is active in navigation
   * @param {string} page - Page name
   */
  verifyActiveNavigation(page) {
    const linkSelector = this.selectors[`${page}Link`];
    this.getElement(linkSelector).should('have.class', 'active');
    return this;
  }

  /**
   * Get all navigation links
   */
  getAllNavigationLinks() {
    return cy.get(`${this.selectors.navigationMenu} a`);
  }

  /**
   * Verify all navigation links are accessible
   */
  verifyNavigationAccessibility() {
    this.getAllNavigationLinks().each($link => {
      cy.wrap($link)
        .should('be.visible')
        .should('have.attr', 'href')
        .and('not.be.empty');
    });
    
    return this;
  }
}

module.exports = Header;

