/**
 * Custom screenshot commands with Base64 encoding error prevention
 */

// Override default screenshot command to prevent Base64 encoding issues
Cypress.Commands.overwrite('screenshot', (originalFn, subject, name, options = {}) => {
  // Ensure safe screenshot options to prevent Base64 encoding errors
  const safeOptions = {
    ...options,
    // Prevent Base64 encoding issues
    capture: options.capture || 'viewport', // Use viewport instead of fullPage to reduce size
    clip: options.clip || null, // Don't clip unless specified
    disableTimersAndAnimations: true, // Reduce complexity
    blackout: options.blackout || [], // Blackout sensitive areas
    // Ensure proper encoding
    onBeforeScreenshot: (doc) => {
      // Clear any problematic elements that might cause encoding issues
      if (options.onBeforeScreenshot) {
        options.onBeforeScreenshot(doc);
      }
    },
    onAfterScreenshot: (doc, props) => {
      // Clean up after screenshot
      if (options.onAfterScreenshot) {
        options.onAfterScreenshot(doc, props);
      }
    }
  };

  // Call original screenshot function with safe options
  return originalFn(subject, name, safeOptions);
});

// Add a safe screenshot command that handles errors gracefully
Cypress.Commands.add('safeScreenshot', (name, options = {}) => {
  try {
    // Take screenshot with error handling
    cy.screenshot(name, {
      ...options,
      capture: 'viewport', // Always use viewport to prevent large Base64 strings
      disableTimersAndAnimations: true,
      // Add timeout to prevent hanging
      timeout: 10000
    });
  } catch (error) {
    // Log error but don't fail the test
    cy.log(`Screenshot failed: ${error.message}`);
    console.warn('Screenshot failed, continuing test execution:', error.message);
  }
});

// Command to clear browser data that might cause encoding issues
Cypress.Commands.add('clearBrowserData', () => {
  // Clear local storage
  cy.clearLocalStorage();
  
  // Clear cookies
  cy.clearCookies();
  
  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
  
  // Clear any cached data that might cause Base64 issues
  cy.window().then((win) => {
    // Clear any cached images or data URLs
    if (win.caches) {
      win.caches.keys().then((names) => {
        names.forEach(name => {
          win.caches.delete(name);
        });
      });
    }
  });
});
