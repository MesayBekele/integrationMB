const configManager = require('./configManager');

/**
 * API Helper utility for making HTTP requests and API testing
 */
class ApiHelper {
  constructor() {
    this.baseUrl = configManager.getApiUrl();
    this.config = configManager.getApiConfig();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.config.baseHeaders
    };
    this.authToken = null;
  }

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = null;
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make HTTP request using Cypress
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Cypress.Chainable} Cypress request response
   */
  request(method, endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const requestOptions = {
      method: method.toUpperCase(),
      url,
      headers: { ...this.defaultHeaders, ...options.headers },
      timeout: this.config.timeout || 10000,
      failOnStatusCode: options.failOnStatusCode !== false,
      ...options
    };

    // Add body for POST, PUT, PATCH requests
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(requestOptions.method)) {
      requestOptions.body = options.body;
    }

    // Add query parameters
    if (options.qs) {
      requestOptions.qs = options.qs;
    }

    return cy.request(requestOptions);
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Cypress.Chainable} Cypress request response
   */
  get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} options - Request options
   * @returns {Cypress.Chainable} Cypress request response
   */
  post(endpoint, body = {}, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} options - Request options
   * @returns {Cypress.Chainable} Cypress request response
   */
  put(endpoint, body = {}, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} options - Request options
   * @returns {Cypress.Chainable} Cypress request response
   */
  patch(endpoint, body = {}, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Cypress.Chainable} Cypress request response
   */
  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * Authenticate user and get token
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Cypress.Chainable} Authentication response
   */
  authenticate(username, password) {
    return this.post('/auth/login', { username, password })
      .then((response) => {
        if (response.body && response.body.token) {
          this.setAuthToken(response.body.token);
        }
        return response;
      });
  }

  /**
   * Authenticate with predefined user
   * @param {string} userType - User type (admin, user, manager)
   * @returns {Cypress.Chainable} Authentication response
   */
  authenticateAs(userType) {
    const user = configManager.getUser(userType);
    return this.authenticate(user.username, user.password);
  }

  /**
   * Logout user
   * @returns {Cypress.Chainable} Logout response
   */
  logout() {
    return this.post('/auth/logout')
      .then((response) => {
        this.clearAuthToken();
        return response;
      });
  }

  /**
   * Validate response status
   * @param {Cypress.Chainable} response - Response to validate
   * @param {number} expectedStatus - Expected status code
   * @returns {Cypress.Chainable} Response
   */
  validateStatus(response, expectedStatus) {
    return response.then((res) => {
      expect(res.status).to.equal(expectedStatus);
      return res;
    });
  }

  /**
   * Validate response body structure
   * @param {Cypress.Chainable} response - Response to validate
   * @param {object} schema - Expected schema
   * @returns {Cypress.Chainable} Response
   */
  validateSchema(response, schema) {
    return response.then((res) => {
      Object.keys(schema).forEach(key => {
        expect(res.body).to.have.property(key);
        if (schema[key] !== null) {
          expect(res.body[key]).to.be.a(schema[key]);
        }
      });
      return res;
    });
  }

  /**
   * Validate response contains specific data
   * @param {Cypress.Chainable} response - Response to validate
   * @param {object} expectedData - Expected data
   * @returns {Cypress.Chainable} Response
   */
  validateResponseData(response, expectedData) {
    return response.then((res) => {
      Object.keys(expectedData).forEach(key => {
        expect(res.body).to.have.property(key, expectedData[key]);
      });
      return res;
    });
  }

  /**
   * Validate response time
   * @param {Cypress.Chainable} response - Response to validate
   * @param {number} maxTime - Maximum response time in milliseconds
   * @returns {Cypress.Chainable} Response
   */
  validateResponseTime(response, maxTime) {
    return response.then((res) => {
      expect(res.duration).to.be.lessThan(maxTime);
      return res;
    });
  }

  /**
   * Create test data via API
   * @param {string} endpoint - API endpoint for creation
   * @param {object} data - Data to create
   * @returns {Cypress.Chainable} Creation response
   */
  createTestData(endpoint, data) {
    return this.post(endpoint, data)
      .then((response) => {
        // Store created data ID for cleanup
        if (response.body && response.body.id) {
          this.addToCleanupList(endpoint, response.body.id);
        }
        return response;
      });
  }

  /**
   * Update test data via API
   * @param {string} endpoint - API endpoint for update
   * @param {string|number} id - Resource ID
   * @param {object} data - Data to update
   * @returns {Cypress.Chainable} Update response
   */
  updateTestData(endpoint, id, data) {
    return this.put(`${endpoint}/${id}`, data);
  }

  /**
   * Delete test data via API
   * @param {string} endpoint - API endpoint for deletion
   * @param {string|number} id - Resource ID
   * @returns {Cypress.Chainable} Deletion response
   */
  deleteTestData(endpoint, id) {
    return this.delete(`${endpoint}/${id}`);
  }

  /**
   * Get paginated data
   * @param {string} endpoint - API endpoint
   * @param {object} pagination - Pagination parameters
   * @returns {Cypress.Chainable} Paginated response
   */
  getPaginatedData(endpoint, pagination = {}) {
    const defaultPagination = {
      page: 1,
      limit: 10,
      sort: 'id',
      order: 'asc'
    };
    
    const params = { ...defaultPagination, ...pagination };
    return this.get(endpoint, { qs: params });
  }

  /**
   * Search data via API
   * @param {string} endpoint - Search endpoint
   * @param {string} query - Search query
   * @param {object} filters - Additional filters
   * @returns {Cypress.Chainable} Search response
   */
  searchData(endpoint, query, filters = {}) {
    const searchParams = { q: query, ...filters };
    return this.get(endpoint, { qs: searchParams });
  }

  /**
   * Upload file via API
   * @param {string} endpoint - Upload endpoint
   * @param {string} filePath - Path to file in fixtures
   * @param {string} fieldName - Form field name
   * @returns {Cypress.Chainable} Upload response
   */
  uploadFile(endpoint, filePath, fieldName = 'file') {
    return cy.fixture(filePath, 'binary').then((fileContent) => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent);
      const formData = new FormData();
      formData.append(fieldName, blob, filePath);

      return this.request('POST', endpoint, {
        body: formData,
        headers: {
          ...this.defaultHeaders,
          'Content-Type': 'multipart/form-data'
        }
      });
    });
  }

  /**
   * Intercept API request for testing
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {string} alias - Alias for the intercept
   * @param {object} mockResponse - Mock response (optional)
   */
  interceptRequest(method, endpoint, alias, mockResponse = null) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    if (mockResponse) {
      cy.intercept(method, url, mockResponse).as(alias);
    } else {
      cy.intercept(method, url).as(alias);
    }
  }

  /**
   * Wait for intercepted request
   * @param {string} alias - Request alias
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Cypress.Chainable} Intercepted request
   */
  waitForRequest(alias, timeout = this.config.timeout) {
    return cy.wait(`@${alias}`, { timeout });
  }

  /**
   * Validate API error response
   * @param {Cypress.Chainable} response - Response to validate
   * @param {number} expectedStatus - Expected error status
   * @param {string} expectedMessage - Expected error message
   * @returns {Cypress.Chainable} Response
   */
  validateErrorResponse(response, expectedStatus, expectedMessage = null) {
    return response.then((res) => {
      expect(res.status).to.equal(expectedStatus);
      if (expectedMessage) {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.include(expectedMessage);
      }
      return res;
    });
  }

  /**
   * Add resource to cleanup list
   * @param {string} endpoint - Resource endpoint
   * @param {string|number} id - Resource ID
   */
  addToCleanupList(endpoint, id) {
    if (!this.cleanupList) {
      this.cleanupList = [];
    }
    this.cleanupList.push({ endpoint, id });
  }

  /**
   * Clean up test data
   * @returns {Promise} Cleanup promise
   */
  cleanup() {
    if (!this.cleanupList || this.cleanupList.length === 0) {
      return Promise.resolve();
    }

    const cleanupPromises = this.cleanupList.map(item => {
      return this.deleteTestData(item.endpoint, item.id)
        .then(() => {
          cy.log(`Cleaned up ${item.endpoint}/${item.id}`);
        })
        .catch((error) => {
          cy.log(`Failed to cleanup ${item.endpoint}/${item.id}: ${error.message}`);
        });
    });

    this.cleanupList = [];
    return Promise.all(cleanupPromises);
  }

  /**
   * Generate random test data
   * @param {string} type - Data type (user, product, order, etc.)
   * @returns {object} Generated test data
   */
  generateTestData(type) {
    const generators = {
      user: () => ({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User'
      }),
      product: () => ({
        name: `Test Product ${Date.now()}`,
        description: 'Test product description',
        price: Math.floor(Math.random() * 1000) + 1,
        category: 'test-category'
      }),
      order: () => ({
        productId: 1,
        quantity: Math.floor(Math.random() * 10) + 1,
        customerEmail: `customer_${Date.now()}@example.com`
      })
    };

    return generators[type] ? generators[type]() : {};
  }
}

// Export singleton instance
const apiHelper = new ApiHelper();

// Make it available globally in Cypress
if (typeof window !== 'undefined') {
  window.apiHelper = apiHelper;
}

module.exports = apiHelper;

