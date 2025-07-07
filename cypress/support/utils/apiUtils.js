/**
 * API Utilities
 * Helper functions for API interactions (if needed for test setup/teardown)
 */

class ApiUtils {
  /**
   * Get API base URL for current environment
   */
  static getApiBaseUrl() {
    const environment = Cypress.env('environment') || 'dev';
    const config = Cypress.env();
    return config.apiUrl || `https://api-${environment}.example.com`;
  }

  /**
   * Get authentication headers
   */
  static getAuthHeaders() {
    const token = Cypress.env('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @param {Object} headers - Additional headers
   */
  static makeRequest(method, endpoint, body = null, headers = {}) {
    const baseUrl = this.getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const requestOptions = {
      method: method.toUpperCase(),
      url: url,
      headers: {
        ...this.getAuthHeaders(),
        ...headers
      },
      failOnStatusCode: false
    };

    if (body) {
      requestOptions.body = body;
    }

    return cy.request(requestOptions);
  }

  /**
   * Create test user via API
   * @param {Object} userData - User data
   */
  static createUser(userData) {
    return this.makeRequest('POST', '/api/users', userData);
  }

  /**
   * Delete test user via API
   * @param {string} userId - User ID to delete
   */
  static deleteUser(userId) {
    return this.makeRequest('DELETE', `/api/users/${userId}`);
  }

  /**
   * Get user by email via API
   * @param {string} email - User email
   */
  static getUserByEmail(email) {
    return this.makeRequest('GET', `/api/users?email=${email}`);
  }

  /**
   * Update user via API
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   */
  static updateUser(userId, userData) {
    return this.makeRequest('PUT', `/api/users/${userId}`, userData);
  }

  /**
   * Authenticate user and get token
   * @param {string} username - Username
   * @param {string} password - Password
   */
  static authenticate(username, password) {
    return this.makeRequest('POST', '/api/auth/login', {
      username,
      password
    }).then(response => {
      if (response.status === 200 && response.body.token) {
        Cypress.env('authToken', response.body.token);
        return response.body.token;
      }
      throw new Error('Authentication failed');
    });
  }

  /**
   * Logout user
   */
  static logout() {
    return this.makeRequest('POST', '/api/auth/logout').then(() => {
      Cypress.env('authToken', null);
    });
  }

  /**
   * Get all users via API
   * @param {Object} filters - Optional filters
   */
  static getUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/users?${queryParams}` : '/api/users';
    return this.makeRequest('GET', endpoint);
  }

  /**
   * Create multiple test users
   * @param {Array} usersData - Array of user data objects
   */
  static createMultipleUsers(usersData) {
    const promises = usersData.map(userData => this.createUser(userData));
    return Promise.all(promises);
  }

  /**
   * Clean up test data
   * @param {Array} userIds - Array of user IDs to delete
   */
  static cleanupTestData(userIds) {
    const promises = userIds.map(userId => this.deleteUser(userId));
    return Promise.all(promises);
  }

  /**
   * Reset user password via API
   * @param {string} email - User email
   */
  static resetPassword(email) {
    return this.makeRequest('POST', '/api/auth/reset-password', { email });
  }

  /**
   * Verify email via API
   * @param {string} token - Verification token
   */
  static verifyEmail(token) {
    return this.makeRequest('POST', '/api/auth/verify-email', { token });
  }

  /**
   * Get user permissions via API
   * @param {string} userId - User ID
   */
  static getUserPermissions(userId) {
    return this.makeRequest('GET', `/api/users/${userId}/permissions`);
  }

  /**
   * Update user permissions via API
   * @param {string} userId - User ID
   * @param {Array} permissions - Array of permissions
   */
  static updateUserPermissions(userId, permissions) {
    return this.makeRequest('PUT', `/api/users/${userId}/permissions`, { permissions });
  }

  /**
   * Get system health status
   */
  static getHealthStatus() {
    return this.makeRequest('GET', '/api/health');
  }

  /**
   * Upload file via API
   * @param {string} filePath - Path to file
   * @param {string} endpoint - Upload endpoint
   */
  static uploadFile(filePath, endpoint = '/api/upload') {
    return cy.fixture(filePath, 'binary').then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent);
      const formData = new FormData();
      formData.append('file', blob, filePath);

      return cy.request({
        method: 'POST',
        url: `${this.getApiBaseUrl()}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
        body: formData
      });
    });
  }

  /**
   * Download file via API
   * @param {string} fileId - File ID
   */
  static downloadFile(fileId) {
    return this.makeRequest('GET', `/api/files/${fileId}/download`);
  }

  /**
   * Search users via API
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   */
  static searchUsers(query, filters = {}) {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest('GET', `/api/users/search?${queryString}`);
  }

  /**
   * Get user activity logs
   * @param {string} userId - User ID
   * @param {Object} options - Options like limit, offset
   */
  static getUserActivityLogs(userId, options = {}) {
    const queryString = new URLSearchParams(options).toString();
    const endpoint = queryString ? 
      `/api/users/${userId}/activity?${queryString}` : 
      `/api/users/${userId}/activity`;
    return this.makeRequest('GET', endpoint);
  }

  /**
   * Bulk operations on users
   * @param {string} operation - Operation type (delete, activate, deactivate)
   * @param {Array} userIds - Array of user IDs
   */
  static bulkUserOperation(operation, userIds) {
    return this.makeRequest('POST', '/api/users/bulk', {
      operation,
      userIds
    });
  }

  /**
   * Export users data
   * @param {string} format - Export format (csv, json, xlsx)
   * @param {Object} filters - Export filters
   */
  static exportUsers(format = 'csv', filters = {}) {
    const params = { format, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest('GET', `/api/users/export?${queryString}`);
  }

  /**
   * Import users from file
   * @param {string} filePath - Path to import file
   */
  static importUsers(filePath) {
    return this.uploadFile(filePath, '/api/users/import');
  }

  /**
   * Get import status
   * @param {string} importId - Import job ID
   */
  static getImportStatus(importId) {
    return this.makeRequest('GET', `/api/users/import/${importId}/status`);
  }

  /**
   * Validate API response structure
   * @param {Object} response - API response
   * @param {Object} expectedStructure - Expected response structure
   */
  static validateResponseStructure(response, expectedStructure) {
    expect(response).to.have.property('status');
    expect(response).to.have.property('body');
    
    if (expectedStructure) {
      Object.keys(expectedStructure).forEach(key => {
        expect(response.body).to.have.property(key);
        if (typeof expectedStructure[key] === 'string') {
          expect(response.body[key]).to.be.a(expectedStructure[key]);
        }
      });
    }
  }

  /**
   * Wait for async operation to complete
   * @param {string} operationId - Operation ID
   * @param {number} timeout - Timeout in milliseconds
   */
  static waitForOperation(operationId, timeout = 30000) {
    const startTime = Date.now();
    
    function checkStatus() {
      return this.makeRequest('GET', `/api/operations/${operationId}`)
        .then(response => {
          if (response.body.status === 'completed') {
            return response;
          } else if (response.body.status === 'failed') {
            throw new Error(`Operation failed: ${response.body.error}`);
          } else if (Date.now() - startTime > timeout) {
            throw new Error('Operation timeout');
          } else {
            return cy.wait(1000).then(() => checkStatus.call(this));
          }
        });
    }
    
    return checkStatus.call(this);
  }

  /**
   * Mock API response for testing
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} mockResponse - Mock response data
   */
  static mockApiResponse(method, endpoint, mockResponse) {
    const baseUrl = this.getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    cy.intercept(method.toUpperCase(), url, mockResponse).as(`mock${method}${endpoint.replace(/\//g, '')}`);
  }

  /**
   * Wait for API call to complete
   * @param {string} alias - Cypress alias for the intercepted request
   */
  static waitForApiCall(alias) {
    return cy.wait(`@${alias}`);
  }

  /**
   * Verify API call was made
   * @param {string} alias - Cypress alias for the intercepted request
   * @param {Object} expectedRequest - Expected request data
   */
  static verifyApiCall(alias, expectedRequest = {}) {
    return cy.get(`@${alias}`).then(interception => {
      if (expectedRequest.body) {
        expect(interception.request.body).to.deep.include(expectedRequest.body);
      }
      if (expectedRequest.headers) {
        Object.keys(expectedRequest.headers).forEach(header => {
          expect(interception.request.headers).to.have.property(header.toLowerCase());
        });
      }
    });
  }
}

module.exports = ApiUtils;

