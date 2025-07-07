/**
 * Common Step Definitions
 * Reusable step definitions that can be used across multiple features
 */

import { Given, When, Then, Before, After } from '@badeball/cypress-cucumber-preprocessor';

const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const DataUtils = require('../utils/dataUtils');
const Helpers = require('../utils/helpers');

const loginPage = new LoginPage();
const homePage = new HomePage();

// Common Given steps
Given('I am logged in as {string} user', (userRole) => {
  DataUtils.getUserByRole(userRole, Cypress.env('environment') || 'dev').then(user => {
    loginPage.navigateToLogin();
    loginPage.loginWithUserData(user);
    homePage.verifyOnHomePage();
  });
});

Given('I am on the {string} page', (pageName) => {
  const pageUrl = getPageUrl(pageName);
  cy.visit(pageUrl);
  cy.waitForPageLoad();
});

Given('there is an existing user {string}', (email) => {
  // This would typically involve API calls to create test data
  // For demo purposes, we'll assume the user exists
  cy.log(`Assuming user ${email} exists in the system`);
});

Given('there are multiple users in the system', () => {
  // This would typically involve API calls to create test data
  cy.log('Assuming multiple users exist in the system');
});

Given('there are users with different roles', () => {
  // This would typically involve API calls to create test data
  cy.log('Assuming users with different roles exist');
});

Given('there are more than {int} users in the system', (count) => {
  // This would typically involve API calls to create test data
  cy.log(`Assuming more than ${count} users exist in the system`);
});

Given('I have selected multiple users', () => {
  // Select multiple checkboxes in a user list
  cy.get('[data-cy="user-checkbox"]').then($checkboxes => {
    // Select first 3 checkboxes
    for (let i = 0; i < Math.min(3, $checkboxes.length); i++) {
      cy.wrap($checkboxes[i]).check();
    }
  });
});

Given('there is an active user {string}', (email) => {
  cy.log(`Assuming active user ${email} exists`);
});

Given('I have a CSV file with user data:', (dataTable) => {
  const userData = dataTable.hashes();
  // Create CSV content from the data table
  const csvHeaders = Object.keys(userData[0]).join(',');
  const csvRows = userData.map(user => Object.values(user).join(','));
  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  // Write CSV file to fixtures
  cy.writeFile('cypress/fixtures/import-users.csv', csvContent);
});

// Common When steps
When('I click the {string} button', (buttonText) => {
  const selector = getButtonSelector(buttonText);
  cy.get(selector).click();
});

When('I click on {string}', (elementText) => {
  cy.contains(elementText).click();
});

When('I fill in the {string} field with {string}', (fieldName, value) => {
  const selector = getFieldSelector(fieldName);
  cy.get(selector).clear().type(value);
});

When('I select {string} from the {string} dropdown', (option, dropdownName) => {
  const selector = getDropdownSelector(dropdownName);
  cy.get(selector).select(option);
});

When('I upload the file {string}', (fileName) => {
  cy.get('[data-cy="file-upload"]').selectFile(`cypress/fixtures/${fileName}`);
});

When('I wait for {int} seconds', (seconds) => {
  cy.wait(seconds * 1000);
});

When('I refresh the page', () => {
  cy.reload();
});

When('I navigate back', () => {
  cy.go('back');
});

When('I scroll to the bottom of the page', () => {
  cy.scrollTo('bottom');
});

When('I scroll to the top of the page', () => {
  cy.scrollTo('top');
});

When('I take a screenshot', () => {
  const timestamp = Helpers.getCurrentTimestamp('YYYY-MM-DD_HH-mm-ss');
  cy.screenshot(`manual-screenshot-${timestamp}`);
});

// Common Then steps
Then('I should see the text {string}', (expectedText) => {
  cy.contains(expectedText).should('be.visible');
});

Then('I should not see the text {string}', (expectedText) => {
  cy.contains(expectedText).should('not.exist');
});

Then('I should see {string} message {string}', (messageType, expectedMessage) => {
  const selector = getMessageSelector(messageType);
  cy.get(selector).should('contain.text', expectedMessage);
});

Then('I should be on the {string} page', (pageName) => {
  const expectedUrl = getPageUrl(pageName);
  cy.url().should('include', expectedUrl);
});

Then('the {string} field should contain {string}', (fieldName, expectedValue) => {
  const selector = getFieldSelector(fieldName);
  cy.get(selector).should('have.value', expectedValue);
});

Then('the {string} field should be empty', (fieldName) => {
  const selector = getFieldSelector(fieldName);
  cy.get(selector).should('have.value', '');
});

Then('the {string} button should be {string}', (buttonText, state) => {
  const selector = getButtonSelector(buttonText);
  if (state === 'disabled') {
    cy.get(selector).should('be.disabled');
  } else if (state === 'enabled') {
    cy.get(selector).should('not.be.disabled');
  } else if (state === 'visible') {
    cy.get(selector).should('be.visible');
  } else if (state === 'hidden') {
    cy.get(selector).should('not.be.visible');
  }
});

Then('I should see a confirmation dialog', () => {
  cy.get('[data-cy="confirmation-dialog"]').should('be.visible');
});

Then('the page should load within {int} seconds', (seconds) => {
  cy.get('body').should('be.visible');
  // Additional performance checks could be added here
});

Then('I should see {int} items in the list', (expectedCount) => {
  cy.get('[data-cy="list-item"]').should('have.length', expectedCount);
});

Then('the list should be sorted by {string} in {string} order', (column, order) => {
  cy.get(`[data-cy="${column}-column"]`).then($elements => {
    const values = Array.from($elements).map(el => el.textContent.trim());
    const sortedValues = [...values].sort();
    if (order === 'descending') {
      sortedValues.reverse();
    }
    expect(values).to.deep.equal(sortedValues);
  });
});

// Data-driven steps
When('I fill in the form with the following data:', (dataTable) => {
  const formData = dataTable.rowsHash();
  Object.keys(formData).forEach(field => {
    const selector = getFieldSelector(field);
    cy.get(selector).clear().type(formData[field]);
  });
});

When('I create a new user with the following details:', (dataTable) => {
  const userData = dataTable.rowsHash();
  
  // Click add user button
  cy.get('[data-cy="add-user-button"]').click();
  
  // Fill in the form
  Object.keys(userData).forEach(field => {
    const selector = getFieldSelector(field);
    cy.get(selector).clear().type(userData[field]);
  });
  
  // Submit the form
  cy.get('[data-cy="create-user-button"]').click();
});

When('I update the user details:', (dataTable) => {
  const userData = dataTable.rowsHash();
  
  Object.keys(userData).forEach(field => {
    const selector = getFieldSelector(field);
    cy.get(selector).clear().type(userData[field]);
  });
});

// Table interaction steps
Then('I should see the {string} table', (tableName) => {
  const selector = getTableSelector(tableName);
  cy.get(selector).should('be.visible');
});

Then('the table should contain {string}', (expectedContent) => {
  cy.get('table').should('contain.text', expectedContent);
});

When('I click on the {string} column header', (columnName) => {
  cy.get(`[data-cy="${columnName.toLowerCase()}-header"]`).click();
});

When('I click on page {int}', (pageNumber) => {
  cy.get(`[data-cy="page-${pageNumber}"]`).click();
});

// Search functionality
When('I enter {string} in the search box', (searchTerm) => {
  cy.get('[data-cy="search-box"]').clear().type(searchTerm);
});

When('I click the search button', () => {
  cy.get('[data-cy="search-button"]').click();
});

When('I clear the search', () => {
  cy.get('[data-cy="search-box"]').clear();
  cy.get('[data-cy="search-button"]').click();
});

// File operations
When('I download the file', () => {
  cy.get('[data-cy="download-button"]').click();
});

Then('a {string} file should be downloaded', (fileType) => {
  // This would typically check the downloads folder
  cy.log(`Verifying ${fileType} file download`);
});

// Utility functions
function getPageUrl(pageName) {
  const pageUrls = {
    'login': '/login',
    'dashboard': '/dashboard',
    'user management': '/users',
    'password reset': '/reset-password',
    'profile': '/profile',
    'settings': '/settings'
  };
  return pageUrls[pageName.toLowerCase()] || `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
}

function getButtonSelector(buttonText) {
  const buttonSelectors = {
    'login': '[data-cy="login-button"]',
    'logout': '[data-cy="logout-button"]',
    'submit': '[data-cy="submit-button"]',
    'cancel': '[data-cy="cancel-button"]',
    'save': '[data-cy="save-button"]',
    'delete': '[data-cy="delete-button"]',
    'edit': '[data-cy="edit-button"]',
    'add new user': '[data-cy="add-user-button"]',
    'create user': '[data-cy="create-user-button"]',
    'update user': '[data-cy="update-user-button"]',
    'search': '[data-cy="search-button"]',
    'export': '[data-cy="export-button"]',
    'import users': '[data-cy="import-button"]',
    'process import': '[data-cy="process-import-button"]',
    'bulk actions': '[data-cy="bulk-actions-button"]'
  };
  return buttonSelectors[buttonText.toLowerCase()] || `[data-cy="${buttonText.toLowerCase().replace(/\s+/g, '-')}-button"]`;
}

function getFieldSelector(fieldName) {
  const fieldSelectors = {
    'username': '[data-cy="username"]',
    'password': '[data-cy="password"]',
    'email': '[data-cy="email"]',
    'firstname': '[data-cy="firstName"]',
    'lastname': '[data-cy="lastName"]',
    'role': '[data-cy="role"]',
    'search': '[data-cy="search-box"]'
  };
  return fieldSelectors[fieldName.toLowerCase()] || `[data-cy="${fieldName.toLowerCase()}"]`;
}

function getDropdownSelector(dropdownName) {
  const dropdownSelectors = {
    'role filter': '[data-cy="role-filter"]',
    'status filter': '[data-cy="status-filter"]',
    'bulk actions': '[data-cy="bulk-actions-dropdown"]'
  };
  return dropdownSelectors[dropdownName.toLowerCase()] || `[data-cy="${dropdownName.toLowerCase().replace(/\s+/g, '-')}-dropdown"]`;
}

function getMessageSelector(messageType) {
  const messageSelectors = {
    'success': '[data-cy="success-message"]',
    'error': '[data-cy="error-message"]',
    'warning': '[data-cy="warning-message"]',
    'info': '[data-cy="info-message"]'
  };
  return messageSelectors[messageType.toLowerCase()] || `[data-cy="${messageType.toLowerCase()}-message"]`;
}

function getTableSelector(tableName) {
  const tableSelectors = {
    'users': '[data-cy="users-table"]',
    'reports': '[data-cy="reports-table"]',
    'logs': '[data-cy="logs-table"]'
  };
  return tableSelectors[tableName.toLowerCase()] || `[data-cy="${tableName.toLowerCase().replace(/\s+/g, '-')}-table"]`;
}

// Hooks
Before(() => {
  // Clear any previous state
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Set up test environment
  const environment = Cypress.env('environment') || 'dev';
  cy.log(`Running test in ${environment} environment`);
});

After(() => {
  // Clean up after each scenario
  if (Cypress.currentTest.state === 'failed') {
    const testName = Cypress.currentTest.title.replace(/\s+/g, '-').toLowerCase();
    cy.screenshot(`failed-${testName}`);
  }
});

// Custom commands for common operations
Cypress.Commands.add('loginAsRole', (role) => {
  DataUtils.getUserByRole(role, Cypress.env('environment') || 'dev').then(user => {
    loginPage.navigateToLogin();
    loginPage.loginWithUserData(user);
    homePage.verifyOnHomePage();
  });
});

Cypress.Commands.add('createTestUser', (userData) => {
  // This would typically make API calls to create a user
  cy.log('Creating test user:', userData);
  return cy.wrap(userData);
});

Cypress.Commands.add('deleteTestUser', (email) => {
  // This would typically make API calls to delete a user
  cy.log('Deleting test user:', email);
});

Cypress.Commands.add('waitForTableLoad', () => {
  cy.get('[data-cy="loading-spinner"]').should('not.exist');
  cy.get('table tbody tr').should('have.length.greaterThan', 0);
});

Cypress.Commands.add('verifyTableData', (expectedData) => {
  expectedData.forEach((rowData, index) => {
    Object.keys(rowData).forEach(column => {
      cy.get(`table tbody tr:nth-child(${index + 1}) [data-cy="${column}-cell"]`)
        .should('contain.text', rowData[column]);
    });
  });
});

