/**
 * API Helper Functions
 * Provides utilities for API testing and interactions
 */

class ApiHelpers {
  
  /**
   * Get API base URL from environment configuration
   * @returns {string} API base URL
   */
  static getApiBaseUrl() {
    return Cypress.env('apiUrl') || `${Cypress.config('baseUrl')}/api`;
  }

  /**
   * Get authentication headers
   * @param {string} token - Authentication token
   * @returns {Object} Headers object
   */
  static getAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Cypress.Chainable} Cypress chainable with response
   */
  static makeRequest(method, endpoint, options = {}) {
    const baseUrl = this.getApiBaseUrl();
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method,
      url,
      failOnStatusCode: false,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    return cy.request({ ...defaultOptions, ...options });
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   */
  static get(endpoint, options = {}) {
    return this.makeRequest('GET', endpoint, options);
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   */
  static post(endpoint, body = {}, options = {}) {
    return this.makeRequest('POST', endpoint, { body, ...options });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   */
  static put(endpoint, body = {}, options = {}) {
    return this.makeRequest('PUT', endpoint, { body, ...options });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} options - Request options
   */
  static patch(endpoint, body = {}, options = {}) {
    return this.makeRequest('PATCH', endpoint, { body, ...options });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   */
  static delete(endpoint, options = {}) {
    return this.makeRequest('DELETE', endpoint, options);
  }

  /**
   * Validate response status
   * @param {Object} response - Cypress response object
   * @param {number} expectedStatus - Expected status code
   */
  static validateStatus(response, expectedStatus) {
    expect(response.status).to.eq(expectedStatus);
    return response;
  }

  /**
   * Validate response body structure
   * @param {Object} response - Cypress response object
   * @param {Object} schema - Expected schema
   */
  static validateSchema(response, schema) {
    const body = response.body;
    
    Object.keys(schema).forEach(key => {
      expect(body).to.have.property(key);
      
      if (schema[key].type) {
        expect(typeof body[key]).to.eq(schema[key].type);
      }
      
      if (schema[key].required && schema[key].required === true) {
        expect(body[key]).to.not.be.null;
        expect(body[key]).to.not.be.undefined;
      }
    });
    
    return response;
  }

  /**
   * Validate response contains specific data
   * @param {Object} response - Cypress response object
   * @param {Object} expectedData - Expected data
   */
  static validateResponseData(response, expectedData) {
    const body = response.body;
    
    Object.keys(expectedData).forEach(key => {
      expect(body[key]).to.deep.equal(expectedData[key]);
    });
    
    return response;
  }

  /**
   * Extract data from response
   * @param {Object} response - Cypress response object
   * @param {string} path - Path to extract (e.g., 'data.user.id')
   */
  static extractData(response, path) {
    const pathArray = path.split('.');
    let result = response.body;
    
    pathArray.forEach(key => {
      result = result[key];
    });
    
    return result;
  }

  /**
   * Wait for API endpoint to be available
   * @param {string} endpoint - API endpoint to check
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} interval - Check interval in milliseconds
   */
  static waitForEndpoint(endpoint, timeout = 30000, interval = 1000) {
    const startTime = Date.now();
    
    function checkEndpoint() {
      return cy.request({
        method: 'GET',
        url: `${this.getApiBaseUrl()}${endpoint}`,
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200) {
          return response;
        } else if (Date.now() - startTime > timeout) {
          throw new Error(`Endpoint ${endpoint} not available after ${timeout}ms`);
        } else {
          cy.wait(interval);
          return checkEndpoint();
        }
      });
    }
    
    return checkEndpoint();
  }

  /**
   * Create test user via API
   * @param {Object} userData - User data
   */
  static createUser(userData) {
    const defaultUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'Test123!',
      role: 'user'
    };
    
    const user = { ...defaultUserData, ...userData };
    
    return this.post('/users', user).then(response => {
      this.validateStatus(response, 201);
      return response.body;
    });
  }

  /**
   * Delete test user via API
   * @param {string} userId - User ID
   */
  static deleteUser(userId) {
    return this.delete(`/users/${userId}`).then(response => {
      expect(response.status).to.be.oneOf([200, 204, 404]);
      return response;
    });
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   */
  static getUser(userId) {
    return this.get(`/users/${userId}`).then(response => {
      this.validateStatus(response, 200);
      return response.body;
    });
  }

  /**
   * Update user via API
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   */
  static updateUser(userId, updateData) {
    return this.put(`/users/${userId}`, updateData).then(response => {
      this.validateStatus(response, 200);
      return response.body;
    });
  }

  /**
   * Get all users with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  static getUsers(page = 1, limit = 10) {
    return this.get(`/users?page=${page}&limit=${limit}`).then(response => {
      this.validateStatus(response, 200);
      return response.body;
    });
  }

  /**
   * Search users
   * @param {string} query - Search query
   */
  static searchUsers(query) {
    return this.get(`/users/search?q=${encodeURIComponent(query)}`).then(response => {
      this.validateStatus(response, 200);
      return response.body;
    });
  }

  /**
   * Authenticate user and get token
   * @param {string} email - User email
   * @param {string} password - User password
   */
  static authenticate(email, password) {
    return this.post('/auth/login', { email, password }).then(response => {
      this.validateStatus(response, 200);
      expect(response.body).to.have.property('token');
      return response.body.token;
    });
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT token
   */
  static validateToken(token) {
    return this.get('/auth/validate', {
      headers: this.getAuthHeaders(token)
    }).then(response => {
      this.validateStatus(response, 200);
      return response.body;
    });
  }

  /**
   * Upload file via API
   * @param {string} endpoint - Upload endpoint
   * @param {string} filePath - Path to file in fixtures
   * @param {string} fieldName - Form field name
   */
  static uploadFile(endpoint, filePath, fieldName = 'file') {
    return cy.fixture(filePath, 'binary').then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent);
      const formData = new FormData();
      formData.append(fieldName, blob, filePath);
      
      return cy.request({
        method: 'POST',
        url: `${this.getApiBaseUrl()}${endpoint}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    });
  }

  /**
   * Batch operations helper
   * @param {Array} operations - Array of operation objects
   */
  static batchOperations(operations) {
    const promises = operations.map(op => {
      return this.makeRequest(op.method, op.endpoint, op.options);
    });
    
    return cy.wrap(Promise.all(promises));
  }

  /**
   * Performance testing helper
   * @param {string} endpoint - Endpoint to test
   * @param {number} iterations - Number of requests
   */
  static performanceTest(endpoint, iterations = 10) {
    const startTime = Date.now();
    const requests = [];
    
    for (let i = 0; i < iterations; i++) {
      requests.push(this.get(endpoint));
    }
    
    return cy.wrap(Promise.all(requests)).then(responses => {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;
      
      cy.task('log', `Performance test results:`);
      cy.task('log', `Total time: ${totalTime}ms`);
      cy.task('log', `Average time per request: ${averageTime}ms`);
      cy.task('log', `Requests per second: ${(1000 / averageTime).toFixed(2)}`);
      
      return {
        totalTime,
        averageTime,
        requestsPerSecond: 1000 / averageTime,
        responses
      };
    });
  }
}

module.exports = ApiHelpers;

