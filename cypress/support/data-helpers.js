/**
 * Data Helper Functions for E2E Testing
 * Provides utilities for loading, generating, and managing test data
 */

class DataHelpers {
  
  /**
   * Load test data from JSON file
   * @param {string} filename - Name of the JSON file in the data directory
   * @returns {Promise<Object>} - Parsed JSON data
   */
  static loadTestData(filename) {
    return cy.task('loadTestData', filename);
  }

  /**
   * Generate random user data
   * @param {Object} overrides - Properties to override in generated data
   * @returns {Object} - Generated user object
   */
  static generateRandomUser(overrides = {}) {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    
    return {
      firstName: `Test${randomId}`,
      lastName: `User${timestamp}`,
      email: `test.user.${timestamp}@example.com`,
      password: 'Test123!',
      role: 'user',
      active: true,
      ...overrides
    };
  }

  /**
   * Generate random product data
   * @param {Object} overrides - Properties to override in generated data
   * @returns {Object} - Generated product object
   */
  static generateRandomProduct(overrides = {}) {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    
    return {
      name: `Test Product ${randomId}`,
      price: Math.floor(Math.random() * 1000) + 10,
      category: 'test',
      brand: 'TestBrand',
      rating: Math.floor(Math.random() * 5) + 1,
      sku: `TEST-${timestamp}-${randomId}`,
      ...overrides
    };
  }

  /**
   * Get environment-specific test data
   * @param {string} dataKey - Key to retrieve from environment config
   * @returns {any} - Environment-specific data
   */
  static getEnvironmentData(dataKey) {
    return cy.then(() => {
      const envData = Cypress.env();
      return dataKey ? envData[dataKey] : envData;
    });
  }

  /**
   * Generate unique identifier
   * @param {string} prefix - Prefix for the identifier
   * @returns {string} - Unique identifier
   */
  static generateUniqueId(prefix = 'test') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Clean up test data after test execution
   * @param {Array} dataToCleanup - Array of data objects to cleanup
   */
  static cleanupTestData(dataToCleanup) {
    dataToCleanup.forEach(data => {
      if (data.type === 'user' && data.id) {
        // Add cleanup logic for users
        cy.log(`Cleaning up user: ${data.id}`);
      } else if (data.type === 'product' && data.id) {
        // Add cleanup logic for products
        cy.log(`Cleaning up product: ${data.id}`);
      }
    });
  }

  /**
   * Validate data structure
   * @param {Object} data - Data object to validate
   * @param {Array} requiredFields - Array of required field names
   * @returns {boolean} - True if valid, false otherwise
   */
  static validateDataStructure(data, requiredFields) {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    return requiredFields.every(field => {
      return data.hasOwnProperty(field) && data[field] !== null && data[field] !== undefined;
    });
  }

  /**
   * Get test data for specific environment
   * @param {string} environment - Environment name (dev, qa, uat)
   * @param {string} dataType - Type of data to retrieve
   * @returns {Promise<Object>} - Environment-specific test data
   */
  static getEnvironmentTestData(environment, dataType) {
    const filename = `${environment}-${dataType}.json`;
    return this.loadTestData(filename).then(data => {
      if (!data) {
        // Fallback to default data
        return this.loadTestData(`${dataType}.json`);
      }
      return data;
    });
  }

  /**
   * Create test data fixture
   * @param {string} fixtureName - Name of the fixture
   * @param {Object} data - Data to save as fixture
   */
  static createFixture(fixtureName, data) {
    cy.writeFile(`cypress/fixtures/${fixtureName}.json`, data);
  }

  /**
   * Load fixture data
   * @param {string} fixtureName - Name of the fixture file
   * @returns {Cypress.Chainable} - Cypress chainable with fixture data
   */
  static loadFixture(fixtureName) {
    return cy.fixture(fixtureName);
  }
}

module.exports = DataHelpers;

