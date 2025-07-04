/**
 * Simple Custom Cypress Commands
 * Common commands for UI testing
 */

// Login command with direct credentials
Cypress.Commands.add('loginAs', (userType) => {
  // Simple user data - can be moved to fixtures later
  const users = {
    admin: { username: 'admin', password: 'admin123' },
    user: { username: 'user', password: 'user123' }
  };
  
  const user = users[userType] || users.user;
  cy.visit('/login');
  cy.get('[data-cy="username"]').type(user.username);
  cy.get('[data-cy="password"]').type(user.password);
  cy.get('[data-cy="login-button"]').click();
});

// Navigation commands
Cypress.Commands.add('navigateTo', (page) => {
  cy.visit(`/${page}`);
});

// Form helpers
Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach(field => {
    cy.get(`[data-cy="${field}"]`).type(formData[field]);
  });
});

Cypress.Commands.add('submitForm', () => {
  cy.get('[data-cy="submit-button"]').click();
});

// Wait helpers
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.url().should('not.include', 'loading');
});

Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Assertion helpers
Cypress.Commands.add('shouldContainText', (selector, text) => {
  cy.get(selector).should('contain.text', text);
});

Cypress.Commands.add('shouldBeVisible', (selector) => {
  cy.get(selector).should('be.visible');
});

Cypress.Commands.add('shouldNotExist', (selector) => {
  cy.get(selector).should('not.exist');
});

// Screenshot helpers
Cypress.Commands.add('takeScreenshot', (name) => {
  cy.screenshot(name || `screenshot-${Date.now()}`);
});

// Mobile viewport helpers
Cypress.Commands.add('setMobileViewport', (device = 'iphone-x') => {
  const viewports = {
    'iphone-x': [375, 812],
    'ipad': [768, 1024],
    'samsung-s10': [360, 760]
  };
  
  const [width, height] = viewports[device] || viewports['iphone-x'];
  cy.viewport(width, height);
});

// Table helpers
Cypress.Commands.add('getTableData', (tableSelector) => {
  return cy.get(tableSelector).within(() => {
    return cy.get('tbody tr').then($rows => {
      const data = [];
      $rows.each((index, row) => {
        const rowData = [];
        Cypress.$(row).find('td').each((i, cell) => {
          rowData.push(Cypress.$(cell).text().trim());
        });
        data.push(rowData);
      });
      return data;
    });
  });
});

// File upload helper
Cypress.Commands.add('uploadFile', (selector, fileName) => {
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`);
});

// Local storage helpers
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

Cypress.Commands.add('setLocalStorage', (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

// URL helpers
Cypress.Commands.add('shouldBeOnPage', (page) => {
  cy.url().should('include', page);
});

// Performance measurement
Cypress.Commands.add('measurePerformance', (actionCallback) => {
  const startTime = performance.now();
  
  return cy.then(() => {
    return actionCallback();
  }).then(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    cy.log(`Performance: ${duration.toFixed(2)}ms`);
    return cy.wrap(duration);
  });
});

// Step logging for better debugging
Cypress.Commands.add('logStep', (message) => {
  cy.log(`🔍 Step: ${message}`);
  cy.task('log', `Step: ${message}`, { log: false });
});

// Simple retry mechanism
Cypress.Commands.add('retryAction', (actionCallback, maxRetries = 3) => {
  let attempts = 0;
  
  function attemptAction() {
    attempts++;
    try {
      return actionCallback();
    } catch (error) {
      if (attempts < maxRetries) {
        cy.wait(1000);
        return attemptAction();
      } else {
        throw error;
      }
    }
  }
  
  return attemptAction();
});

// Environment helpers
Cypress.Commands.add('skipInEnvironment', (environments) => {
  const currentEnv = configManager.getCurrentEnvironment();
  if (environments.includes(currentEnv)) {
    cy.log(`Skipping test in ${currentEnv} environment`);
    return cy.then(() => {
      throw new Error(`Test skipped in ${currentEnv} environment`);
    });
  }
});

// Simple data generation
Cypress.Commands.add('generateTestData', (type) => {
  const generators = {
    email: () => `test${Date.now()}@example.com`,
    username: () => `user${Date.now()}`,
    password: () => 'Test123!',
    name: () => `Test User ${Date.now()}`,
    phone: () => `555-${Math.floor(Math.random() * 9000) + 1000}`
  };
  
  return generators[type] ? generators[type]() : `test-${type}-${Date.now()}`;
});
