/**
 * Home Page Object Model
 * Handles all home page interactions
 */

const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor() {
    super();
    this.url = '/dashboard';
    
    // Page elements
    this.elements = {
      welcomeMessage: 'welcome-message',
      userProfile: 'user-profile',
      navigationMenu: 'navigation-menu',
      logoutButton: 'logout-button',
      searchBox: 'search-box',
      searchButton: 'search-button',
      notificationBell: 'notification-bell',
      settingsButton: 'settings-button',
      helpButton: 'help-button',
      mainContent: 'main-content',
      sidebar: 'sidebar',
      footer: 'footer',
      breadcrumb: 'breadcrumb',
      pageTitle: 'page-title',
      loadingIndicator: 'loading-indicator',
      errorAlert: 'error-alert',
      successAlert: 'success-alert',
      userMenu: 'user-menu',
      profilePicture: 'profile-picture'
    };

    // Navigation menu items
    this.menuItems = {
      dashboard: 'menu-dashboard',
      users: 'menu-users',
      reports: 'menu-reports',
      settings: 'menu-settings',
      help: 'menu-help'
    };
  }

  /**
   * Navigate to home page
   */
  navigateToHome() {
    this.visit(this.url);
    this.waitForPageLoad();
    return this;
  }

  /**
   * Verify user is on home page
   */
  verifyOnHomePage() {
    this.urlShouldContain('/dashboard');
    this.isVisible(this.elements.mainContent);
    return this;
  }

  /**
   * Verify welcome message is displayed
   * @param {string} expectedMessage - Expected welcome message
   */
  verifyWelcomeMessage(expectedMessage) {
    this.isVisible(this.elements.welcomeMessage);
    if (expectedMessage) {
      this.shouldContainText(this.elements.welcomeMessage, expectedMessage);
    }
    return this;
  }

  /**
   * Verify user profile information
   * @param {string} username - Expected username
   */
  verifyUserProfile(username) {
    this.isVisible(this.elements.userProfile);
    if (username) {
      this.shouldContainText(this.elements.userProfile, username);
    }
    return this;
  }

  /**
   * Click logout button
   */
  logout() {
    this.clickElement(this.elements.logoutButton);
    return this;
  }

  /**
   * Open user menu
   */
  openUserMenu() {
    this.clickElement(this.elements.userMenu);
    return this;
  }

  /**
   * Navigate to specific menu item
   * @param {string} menuItem - Menu item to click
   */
  navigateToMenuItem(menuItem) {
    if (this.menuItems[menuItem]) {
      this.clickElement(this.menuItems[menuItem]);
    } else {
      throw new Error(`Menu item '${menuItem}' not found`);
    }
    return this;
  }

  /**
   * Perform search
   * @param {string} searchTerm - Term to search for
   */
  search(searchTerm) {
    this.typeText(this.elements.searchBox, searchTerm);
    this.clickElement(this.elements.searchButton);
    return this;
  }

  /**
   * Search using Enter key
   * @param {string} searchTerm - Term to search for
   */
  searchWithEnter(searchTerm) {
    this.typeText(this.elements.searchBox, searchTerm);
    this.getElement(this.elements.searchBox).type('{enter}');
    return this;
  }

  /**
   * Clear search box
   */
  clearSearch() {
    this.clearField(this.elements.searchBox);
    return this;
  }

  /**
   * Click notifications
   */
  clickNotifications() {
    this.clickElement(this.elements.notificationBell);
    return this;
  }

  /**
   * Open settings
   */
  openSettings() {
    this.clickElement(this.elements.settingsButton);
    return this;
  }

  /**
   * Open help
   */
  openHelp() {
    this.clickElement(this.elements.helpButton);
    return this;
  }

  /**
   * Verify navigation menu is visible
   */
  verifyNavigationMenuVisible() {
    this.isVisible(this.elements.navigationMenu);
    return this;
  }

  /**
   * Verify sidebar is visible
   */
  verifySidebarVisible() {
    this.isVisible(this.elements.sidebar);
    return this;
  }

  /**
   * Verify page title
   * @param {string} expectedTitle - Expected page title
   */
  verifyPageTitle(expectedTitle) {
    this.isVisible(this.elements.pageTitle);
    if (expectedTitle) {
      this.shouldContainText(this.elements.pageTitle, expectedTitle);
    }
    return this;
  }

  /**
   * Verify breadcrumb navigation
   * @param {string} expectedBreadcrumb - Expected breadcrumb text
   */
  verifyBreadcrumb(expectedBreadcrumb) {
    this.isVisible(this.elements.breadcrumb);
    if (expectedBreadcrumb) {
      this.shouldContainText(this.elements.breadcrumb, expectedBreadcrumb);
    }
    return this;
  }

  /**
   * Wait for page to load completely
   */
  waitForHomePageLoad() {
    this.waitForElementToDisappear(this.elements.loadingIndicator);
    this.isVisible(this.elements.mainContent);
    return this;
  }

  /**
   * Verify success alert
   * @param {string} expectedMessage - Expected success message
   */
  verifySuccessAlert(expectedMessage) {
    this.isVisible(this.elements.successAlert);
    if (expectedMessage) {
      this.shouldContainText(this.elements.successAlert, expectedMessage);
    }
    return this;
  }

  /**
   * Verify error alert
   * @param {string} expectedMessage - Expected error message
   */
  verifyErrorAlert(expectedMessage) {
    this.isVisible(this.elements.errorAlert);
    if (expectedMessage) {
      this.shouldContainText(this.elements.errorAlert, expectedMessage);
    }
    return this;
  }

  /**
   * Dismiss alert
   */
  dismissAlert() {
    // Try to find and click close button on alert
    cy.get('[data-cy="alert-close"]').click();
    return this;
  }

  /**
   * Verify footer is visible
   */
  verifyFooterVisible() {
    this.isVisible(this.elements.footer);
    return this;
  }

  /**
   * Verify profile picture is visible
   */
  verifyProfilePictureVisible() {
    this.isVisible(this.elements.profilePicture);
    return this;
  }

  /**
   * Get current user name from profile
   */
  getCurrentUserName() {
    return this.getText(this.elements.userProfile);
  }

  /**
   * Verify all main page elements are loaded
   */
  verifyPageElementsLoaded() {
    this.verifyNavigationMenuVisible();
    this.verifySidebarVisible();
    this.isVisible(this.elements.mainContent);
    this.verifyFooterVisible();
    return this;
  }

  /**
   * Verify user has specific permissions/access
   * @param {Array} expectedMenuItems - Array of menu items that should be visible
   */
  verifyUserPermissions(expectedMenuItems) {
    expectedMenuItems.forEach(menuItem => {
      if (this.menuItems[menuItem]) {
        this.isVisible(this.menuItems[menuItem]);
      }
    });
    return this;
  }

  /**
   * Take screenshot of home page
   */
  takeHomePageScreenshot() {
    this.takeScreenshot('home-page');
    return this;
  }

  /**
   * Verify responsive design elements
   */
  verifyResponsiveElements() {
    // Check if elements adapt to viewport
    cy.viewport(768, 1024); // Tablet view
    this.verifyNavigationMenuVisible();
    
    cy.viewport(375, 667); // Mobile view
    this.verifyNavigationMenuVisible();
    
    cy.viewport(1920, 1080); // Desktop view
    this.verifyNavigationMenuVisible();
    
    return this;
  }

  /**
   * Verify home page accessibility
   */
  verifyAccessibility() {
    // Check for basic accessibility attributes
    this.getElement(this.elements.searchBox).should('have.attr', 'aria-label');
    this.getElement(this.elements.logoutButton).should('have.attr', 'aria-label');
    return this;
  }
}

module.exports = HomePage;

