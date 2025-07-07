/**
 * Data-Driven Testing Utilities
 * Provides functionality for parameterized testing without Cucumber
 */

/**
 * Run a test with multiple data sets
 * @param {string} testTitle - Base test title
 * @param {Array} dataSet - Array of test data objects
 * @param {Function} testFn - Test function that receives data as parameter
 * @param {string[]} tags - Optional tags for the test
 */
function testWithData(testTitle, dataSet, testFn, tags = []) {
  dataSet.forEach((data, index) => {
    const title = `${testTitle} - Dataset ${index + 1}: ${data.description || JSON.stringify(data)}`;
    
    if (tags.length > 0) {
      taggedTest(title, tags, () => testFn(data));
    } else {
      it(title, () => testFn(data));
    }
  });
}

/**
 * Run a test suite with multiple data sets
 * @param {string} suiteTitle - Base suite title
 * @param {Array} dataSet - Array of test data objects
 * @param {Function} suiteFn - Suite function that receives data as parameter
 * @param {string[]} tags - Optional tags for the suite
 */
function describeWithData(suiteTitle, dataSet, suiteFn, tags = []) {
  dataSet.forEach((data, index) => {
    const title = `${suiteTitle} - Dataset ${index + 1}: ${data.description || JSON.stringify(data)}`;
    
    if (tags.length > 0) {
      taggedDescribe(title, tags, () => suiteFn(data));
    } else {
      describe(title, () => suiteFn(data));
    }
  });
}

/**
 * Load test data from JSON file
 * @param {string} filename - Name of the JSON file in fixtures/test-data
 * @returns {Promise} - Promise that resolves to the test data
 */
function loadTestData(filename) {
  return cy.task('loadTestData', filename);
}

/**
 * Load test data from fixture
 * @param {string} fixturePath - Path to fixture file
 * @returns {Cypress.Chainable} - Cypress chainable with fixture data
 */
function loadFixture(fixturePath) {
  return cy.fixture(fixturePath);
}

/**
 * Generate test data combinations
 * @param {Object} dataMatrix - Object with arrays of values for each parameter
 * @returns {Array} - Array of all possible combinations
 */
function generateCombinations(dataMatrix) {
  const keys = Object.keys(dataMatrix);
  const values = keys.map(key => dataMatrix[key]);
  
  function cartesianProduct(arrays) {
    return arrays.reduce((acc, curr) => {
      const result = [];
      acc.forEach(a => {
        curr.forEach(c => {
          result.push([...a, c]);
        });
      });
      return result;
    }, [[]]);
  }
  
  const combinations = cartesianProduct(values);
  
  return combinations.map(combination => {
    const obj = {};
    keys.forEach((key, index) => {
      obj[key] = combination[index];
    });
    return obj;
  });
}

/**
 * Create parameterized test from CSV-like data
 * @param {string} testTitle - Base test title
 * @param {string} csvData - CSV string data
 * @param {Function} testFn - Test function
 * @param {string[]} tags - Optional tags
 */
function testWithCSV(testTitle, csvData, testFn, tags = []) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const dataRows = lines.slice(1);
  
  const dataSet = dataRows.map((row, index) => {
    const values = row.split(',').map(v => v.trim());
    const dataObj = {};
    headers.forEach((header, i) => {
      dataObj[header] = values[i];
    });
    dataObj.description = `Row ${index + 1}`;
    return dataObj;
  });
  
  testWithData(testTitle, dataSet, testFn, tags);
}

/**
 * Utility functions for common test data patterns
 */
const DataPatterns = {
  /**
   * Generate user credentials data
   */
  userCredentials: () => [
    { username: 'admin', password: 'Admin123!', role: 'admin', description: 'Admin user' },
    { username: 'user', password: 'User123!', role: 'user', description: 'Regular user' },
    { username: 'guest', password: 'Guest123!', role: 'guest', description: 'Guest user' }
  ],
  
  /**
   * Generate browser configurations
   */
  browsers: () => [
    { name: 'Chrome', viewport: { width: 1280, height: 720 }, description: 'Chrome desktop' },
    { name: 'Firefox', viewport: { width: 1280, height: 720 }, description: 'Firefox desktop' },
    { name: 'Mobile', viewport: { width: 375, height: 667 }, description: 'Mobile view' }
  ],
  
  /**
   * Generate form validation data
   */
  invalidInputs: () => [
    { input: '', expected: 'Field is required', description: 'Empty input' },
    { input: 'a', expected: 'Too short', description: 'Too short' },
    { input: 'a'.repeat(256), expected: 'Too long', description: 'Too long' },
    { input: '<script>alert("xss")</script>', expected: 'Invalid characters', description: 'XSS attempt' }
  ]
};

// Export functions
module.exports = {
  testWithData,
  describeWithData,
  loadTestData,
  loadFixture,
  generateCombinations,
  testWithCSV,
  DataPatterns
};

// Make functions available globally
global.testWithData = testWithData;
global.describeWithData = describeWithData;
global.loadTestData = loadTestData;
global.loadFixture = loadFixture;
global.generateCombinations = generateCombinations;
global.testWithCSV = testWithCSV;
global.DataPatterns = DataPatterns;

