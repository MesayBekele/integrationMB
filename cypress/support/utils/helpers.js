/**
 * Helper Utilities
 * Common utility functions for test automation
 */

const moment = require('moment');

class Helpers {
  /**
   * Wait for element to be stable (not moving/changing)
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  static waitForElementStable(selector, timeout = 5000) {
    let previousPosition = null;
    const startTime = Date.now();
    
    return new Cypress.Promise((resolve, reject) => {
      function checkStability() {
        cy.get(selector).then($el => {
          const currentPosition = $el.offset();
          
          if (previousPosition && 
              currentPosition.top === previousPosition.top && 
              currentPosition.left === previousPosition.left) {
            resolve();
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Element did not stabilize within timeout'));
          } else {
            previousPosition = currentPosition;
            setTimeout(checkStability, 100);
          }
        });
      }
      checkStability();
    });
  }

  /**
   * Retry an action until it succeeds or timeout
   * @param {Function} action - Action to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in milliseconds
   */
  static retryAction(action, maxRetries = 3, delay = 1000) {
    let attempts = 0;
    
    function attempt() {
      attempts++;
      return cy.then(() => {
        try {
          return action();
        } catch (error) {
          if (attempts < maxRetries) {
            cy.wait(delay);
            return attempt();
          } else {
            throw error;
          }
        }
      });
    }
    
    return attempt();
  }

  /**
   * Get current timestamp in specified format
   * @param {string} format - Moment.js format string
   */
  static getCurrentTimestamp(format = 'YYYY-MM-DD HH:mm:ss') {
    return moment().format(format);
  }

  /**
   * Generate unique identifier
   * @param {string} prefix - Prefix for the ID
   */
  static generateUniqueId(prefix = 'test') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Convert string to slug format
   * @param {string} text - Text to convert
   */
  static toSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to capitalize
   */
  static capitalizeWords(text) {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @param {string} locale - Locale for formatting
   */
  static formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Parse currency string to number
   * @param {string} currencyString - Currency string to parse
   */
  static parseCurrency(currencyString) {
    return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
  }

  /**
   * Generate random color hex code
   */
  static generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Check if string is valid JSON
   * @param {string} str - String to check
   */
  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Deep clone object
   * @param {Object} obj - Object to clone
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Check if two objects are equal
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   */
  static isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Get random item from array
   * @param {Array} array - Source array
   */
  static getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Remove duplicates from array
   * @param {Array} array - Source array
   */
  static removeDuplicates(array) {
    return [...new Set(array)];
  }

  /**
   * Sort array of objects by property
   * @param {Array} array - Array to sort
   * @param {string} property - Property to sort by
   * @param {string} direction - 'asc' or 'desc'
   */
  static sortByProperty(array, property, direction = 'asc') {
    return array.sort((a, b) => {
      if (direction === 'asc') {
        return a[property] > b[property] ? 1 : -1;
      } else {
        return a[property] < b[property] ? 1 : -1;
      }
    });
  }

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   */
  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Convert bytes to human readable format
   * @param {number} bytes - Number of bytes
   * @param {number} decimals - Number of decimal places
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Generate Lorem Ipsum text
   * @param {number} wordCount - Number of words to generate
   */
  static generateLoremIpsum(wordCount = 50) {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];
    
    const result = [];
    for (let i = 0; i < wordCount; i++) {
      result.push(this.getRandomItem(words));
    }
    
    return result.join(' ');
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Extract domain from URL
   * @param {string} url - URL to extract domain from
   */
  static extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return null;
    }
  }

  /**
   * Generate QR code data URL (for testing QR functionality)
   * @param {string} text - Text to encode
   */
  static generateQRCodeDataURL(text) {
    // This is a simplified version - in real scenarios you might use a QR library
    return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for: ${text}</svg>`)}`;
  }

  /**
   * Calculate percentage
   * @param {number} value - Current value
   * @param {number} total - Total value
   * @param {number} decimals - Number of decimal places
   */
  static calculatePercentage(value, total, decimals = 2) {
    if (total === 0) return 0;
    return parseFloat(((value / total) * 100).toFixed(decimals));
  }

  /**
   * Generate test file content
   * @param {string} type - File type (txt, csv, json)
   * @param {number} size - Approximate size in KB
   */
  static generateTestFileContent(type = 'txt', size = 1) {
    const targetBytes = size * 1024;
    let content = '';
    
    switch (type.toLowerCase()) {
      case 'txt':
        while (content.length < targetBytes) {
          content += this.generateLoremIpsum(100) + '\n';
        }
        break;
      case 'csv':
        content = 'Name,Email,Age,City\n';
        while (content.length < targetBytes) {
          content += `User${Math.random()},user@example.com,${Math.floor(Math.random() * 50) + 18},TestCity\n`;
        }
        break;
      case 'json':
        const jsonData = [];
        while (JSON.stringify(jsonData).length < targetBytes) {
          jsonData.push({
            id: Math.floor(Math.random() * 1000),
            name: `User${Math.random()}`,
            email: `user${Math.random()}@example.com`
          });
        }
        content = JSON.stringify(jsonData, null, 2);
        break;
    }
    
    return content.substring(0, targetBytes);
  }

  /**
   * Log test step with timestamp
   * @param {string} step - Step description
   * @param {string} level - Log level (info, warn, error)
   */
  static logTestStep(step, level = 'info') {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${step}`;
    
    switch (level) {
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
      default:
        console.log(message);
    }
    
    // Also log to Cypress
    cy.log(step);
  }

  /**
   * Create test summary object
   * @param {string} testName - Name of the test
   * @param {string} status - Test status
   * @param {number} duration - Test duration in milliseconds
   * @param {Object} additionalData - Additional test data
   */
  static createTestSummary(testName, status, duration, additionalData = {}) {
    return {
      testName,
      status,
      duration,
      timestamp: this.getCurrentTimestamp(),
      environment: Cypress.env('environment') || 'dev',
      browser: Cypress.browser.name,
      ...additionalData
    };
  }
}

module.exports = Helpers;

