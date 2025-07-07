/**
 * Data Utilities for Test Data Management
 * Provides functions for reading and manipulating test data
 */

const moment = require('moment');
const _ = require('lodash');

class DataUtils {
  /**
   * Load test data from fixtures
   * @param {string} fileName - Name of the fixture file (without .json)
   */
  static loadTestData(fileName) {
    return cy.fixture(`testdata/${fileName}`);
  }

  /**
   * Get user data by role
   * @param {string} role - User role (admin, user, manager)
   * @param {string} environment - Environment (dev, staging, prod)
   */
  static getUserByRole(role, environment = 'dev') {
    return this.loadTestData('credentials').then(data => {
      return data.environments[environment][role];
    });
  }

  /**
   * Get random user from valid users list
   */
  static getRandomValidUser() {
    return this.loadTestData('users').then(data => {
      const validUsers = data.validUsers;
      return validUsers[Math.floor(Math.random() * validUsers.length)];
    });
  }

  /**
   * Get random invalid user for negative testing
   */
  static getRandomInvalidUser() {
    return this.loadTestData('users').then(data => {
      const invalidUsers = data.invalidUsers;
      return invalidUsers[Math.floor(Math.random() * invalidUsers.length)];
    });
  }

  /**
   * Generate unique test data
   * @param {string} type - Type of data to generate
   */
  static generateUniqueData(type) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    const generators = {
      email: () => `test${timestamp}${random}@example.com`,
      username: () => `user${timestamp}${random}`,
      firstName: () => `FirstName${random}`,
      lastName: () => `LastName${random}`,
      companyName: () => `Company${random}`,
      phoneNumber: () => `555-${Math.floor(Math.random() * 9000) + 1000}`,
      address: () => `${random} Test Street`,
      city: () => `TestCity${random}`,
      zipCode: () => `${Math.floor(Math.random() * 90000) + 10000}`,
      password: () => `TestPass${random}!`,
      url: () => `https://test${random}.example.com`
    };

    return generators[type] ? generators[type]() : `test-${type}-${timestamp}`;
  }

  /**
   * Generate test user object
   * @param {string} role - User role
   */
  static generateTestUser(role = 'user') {
    return {
      username: this.generateUniqueData('email'),
      password: this.generateUniqueData('password'),
      firstName: this.generateUniqueData('firstName'),
      lastName: this.generateUniqueData('lastName'),
      role: role,
      email: this.generateUniqueData('email'),
      phone: this.generateUniqueData('phoneNumber')
    };
  }

  /**
   * Format date for testing
   * @param {string} format - Moment.js format string
   * @param {Date} date - Date to format (defaults to now)
   */
  static formatDate(format = 'YYYY-MM-DD', date = new Date()) {
    return moment(date).format(format);
  }

  /**
   * Get date relative to today
   * @param {number} days - Number of days (positive for future, negative for past)
   * @param {string} format - Format string
   */
  static getRelativeDate(days, format = 'YYYY-MM-DD') {
    return moment().add(days, 'days').format(format);
  }

  /**
   * Generate random string
   * @param {number} length - Length of string
   * @param {string} charset - Character set to use
   */
  static generateRandomString(length = 10, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generate random number within range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  static generateRandomNumber(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   */
  static isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  /**
   * Deep merge objects (useful for test data combination)
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   */
  static mergeTestData(target, source) {
    return _.merge({}, target, source);
  }

  /**
   * Pick random items from array
   * @param {Array} array - Source array
   * @param {number} count - Number of items to pick
   */
  static pickRandomItems(array, count = 1) {
    return _.sampleSize(array, count);
  }

  /**
   * Shuffle array
   * @param {Array} array - Array to shuffle
   */
  static shuffleArray(array) {
    return _.shuffle([...array]);
  }

  /**
   * Create test data combinations for data-driven testing
   * @param {Object} dataSet - Object containing arrays of test values
   */
  static createDataCombinations(dataSet) {
    const keys = Object.keys(dataSet);
    const combinations = [];
    
    function generateCombinations(index, current) {
      if (index === keys.length) {
        combinations.push({ ...current });
        return;
      }
      
      const key = keys[index];
      const values = dataSet[key];
      
      values.forEach(value => {
        current[key] = value;
        generateCombinations(index + 1, current);
      });
    }
    
    generateCombinations(0, {});
    return combinations;
  }

  /**
   * Load CSV data (if you have CSV files in fixtures)
   * @param {string} fileName - CSV file name
   */
  static loadCSVData(fileName) {
    return cy.readFile(`cypress/fixtures/${fileName}.csv`).then(csvContent => {
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
          });
          data.push(row);
        }
      }
      
      return data;
    });
  }

  /**
   * Filter test data based on criteria
   * @param {Array} data - Array of test data objects
   * @param {Object} criteria - Filter criteria
   */
  static filterTestData(data, criteria) {
    return data.filter(item => {
      return Object.keys(criteria).every(key => {
        return item[key] === criteria[key];
      });
    });
  }

  /**
   * Get environment-specific test data
   * @param {string} environment - Environment name
   */
  static getEnvironmentData(environment = Cypress.env('environment') || 'dev') {
    return this.loadTestData('credentials').then(data => {
      return data.environments[environment];
    });
  }

  /**
   * Create test data for form filling
   * @param {Array} fields - Array of field names
   */
  static createFormData(fields) {
    const formData = {};
    fields.forEach(field => {
      switch (field.toLowerCase()) {
        case 'email':
          formData[field] = this.generateUniqueData('email');
          break;
        case 'firstname':
        case 'first_name':
          formData[field] = this.generateUniqueData('firstName');
          break;
        case 'lastname':
        case 'last_name':
          formData[field] = this.generateUniqueData('lastName');
          break;
        case 'phone':
        case 'phonenumber':
          formData[field] = this.generateUniqueData('phoneNumber');
          break;
        case 'password':
          formData[field] = this.generateUniqueData('password');
          break;
        default:
          formData[field] = this.generateRandomString(8);
      }
    });
    return formData;
  }

  /**
   * Wait for data to be available
   * @param {Function} dataFunction - Function that returns data
   * @param {number} timeout - Timeout in milliseconds
   */
  static waitForData(dataFunction, timeout = 5000) {
    const startTime = Date.now();
    
    function checkData() {
      return new Promise((resolve, reject) => {
        try {
          const data = dataFunction();
          if (data) {
            resolve(data);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for data'));
          } else {
            setTimeout(() => checkData().then(resolve).catch(reject), 100);
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error);
          } else {
            setTimeout(() => checkData().then(resolve).catch(reject), 100);
          }
        }
      });
    }
    
    return checkData();
  }
}

module.exports = DataUtils;

