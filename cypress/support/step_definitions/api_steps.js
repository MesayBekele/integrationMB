import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
const apiHelper = require('../utilities/apiHelper');
const configManager = require('../utilities/configManager');

// Background steps
Given('the API is available and responding', () => {
  const apiUrl = configManager.getApiUrl();
  cy.request({
    method: 'GET',
    url: `${apiUrl}/health`,
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 404]); // 404 is acceptable if health endpoint doesn't exist
  });
});

Given('I am authenticated as an admin', () => {
  cy.apiLogin('admin').then((response) => {
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
  });
});

Given('I am authenticated as a user', () => {
  cy.apiLogin('user').then((response) => {
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
  });
});

Given('I have products in my cart', () => {
  // Create test products and add to cart
  cy.createTestProduct().then((product) => {
    cy.apiPost('/cart/items', {
      productId: product.id,
      quantity: 2
    }).as('cartItem');
  });
});

Given('I have test data in the database', () => {
  // Create test data for consistency checks
  cy.createTestUser().as('testUser');
  cy.createTestProduct().as('testProduct');
});

Given('there are {int} users in the system', (userCount) => {
  // Create multiple test users for pagination testing
  const userPromises = [];
  for (let i = 0; i < userCount; i++) {
    userPromises.push(
      cy.createTestUser({
        username: `testuser${i}`,
        email: `testuser${i}@example.com`
      })
    );
  }
  cy.wrap(Promise.all(userPromises)).as('testUsers');
});

Given('the database is unavailable', () => {
  // Mock database unavailability
  cy.intercept('GET', '**/users', {
    statusCode: 503,
    body: { message: 'Service temporarily unavailable' }
  }).as('databaseUnavailable');
});

// When steps - HTTP Methods
When('I make a GET request to {string}', (endpoint) => {
  cy.apiGet(endpoint).as('apiResponse');
});

When('I make a POST request to {string}', (endpoint) => {
  cy.apiPost(endpoint, {}).as('apiResponse');
});

When('I make a POST request to {string} with valid credentials', (endpoint) => {
  const user = configManager.getUser('user');
  cy.apiPost(endpoint, {
    username: user.username,
    password: user.password
  }).as('apiResponse');
});

When('I make a POST request to {string} with {string}: {string}', (endpoint, field, value) => {
  const body = {};
  body[field] = value;
  cy.apiPost(endpoint, body).as('apiResponse');
});

When('I make a GET request to {string} without authentication', (endpoint) => {
  // Clear any existing auth headers
  cy.request({
    method: 'GET',
    url: `${configManager.getApiUrl()}${endpoint}`,
    failOnStatusCode: false
  }).as('apiResponse');
});

When('I make a GET request to {string} with invalid token', (endpoint) => {
  cy.request({
    method: 'GET',
    url: `${configManager.getApiUrl()}${endpoint}`,
    headers: {
      'Authorization': 'Bearer invalid_token'
    },
    failOnStatusCode: false
  }).as('apiResponse');
});

When('I make a GET request to {string} as a regular user', (endpoint) => {
  cy.apiLogin('user').then(() => {
    cy.apiGet(endpoint).as('apiResponse');
  });
});

// CRUD Operations
When('I create a new user via POST {string}', (endpoint) => {
  const userData = apiHelper.generateTestData('user');
  cy.apiPost(endpoint, userData).as('createResponse');
  cy.get('@createResponse').then((response) => {
    cy.wrap(response.body.id).as('createdUserId');
  });
});

When('I retrieve the user via GET {string}', (endpoint) => {
  cy.get('@createdUserId').then((userId) => {
    const fullEndpoint = endpoint.replace('{id}', userId);
    cy.apiGet(fullEndpoint).as('retrieveResponse');
  });
});

When('I update the user via PUT {string}', (endpoint) => {
  cy.get('@createdUserId').then((userId) => {
    const fullEndpoint = endpoint.replace('{id}', userId);
    const updateData = { firstName: 'Updated', lastName: 'User' };
    cy.apiPut(fullEndpoint, updateData).as('updateResponse');
  });
});

When('I delete the user via DELETE {string}', (endpoint) => {
  cy.get('@createdUserId').then((userId) => {
    const fullEndpoint = endpoint.replace('{id}', userId);
    cy.apiDelete(fullEndpoint).as('deleteResponse');
  });
});

// Performance testing
When('I make {int} concurrent requests to {string}', (requestCount, endpoint) => {
  const requests = [];
  for (let i = 0; i < requestCount; i++) {
    requests.push(cy.apiGet(endpoint));
  }
  cy.wrap(Promise.all(requests)).as('concurrentResponses');
});

// Order processing
When('I create an order via POST {string}', (endpoint) => {
  cy.get('@cartItem').then((cartItem) => {
    const orderData = {
      items: [cartItem.body],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        zipCode: '12345'
      }
    };
    cy.apiPost(endpoint, orderData).as('orderResponse');
    cy.get('@orderResponse').then((response) => {
      cy.wrap(response.body.id).as('orderId');
    });
  });
});

When('I make payment via POST {string}', (endpoint) => {
  cy.get('@orderId').then((orderId) => {
    const fullEndpoint = endpoint.replace('{id}', orderId);
    const paymentData = {
      paymentMethod: 'credit_card',
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123'
    };
    cy.apiPost(fullEndpoint, paymentData).as('paymentResponse');
  });
});

When('I check the order status via GET {string}', (endpoint) => {
  cy.get('@orderId').then((orderId) => {
    const fullEndpoint = endpoint.replace('{id}', orderId);
    cy.apiGet(fullEndpoint).as('orderStatusResponse');
  });
});

// Database operations
When('I retrieve user data via API', () => {
  cy.get('@testUser').then((user) => {
    cy.apiGet(`/users/${user.id}`).as('apiUserData');
  });
});

When('I update user data via API', () => {
  cy.get('@testUser').then((user) => {
    const updateData = { firstName: 'Updated API' };
    cy.apiPut(`/users/${user.id}`, updateData).as('apiUpdateResponse');
  });
});

// Rate limiting
When('I make more than {int} requests per minute to {string}', (limit, endpoint) => {
  const requests = [];
  for (let i = 0; i <= limit; i++) {
    requests.push(cy.apiGet(endpoint));
  }
  cy.wrap(Promise.all(requests)).as('rateLimitResponses');
});

When('I wait for the rate limit to reset', () => {
  cy.wait(60000); // Wait 1 minute for rate limit reset
});

// Versioning
When('I make a request to {string} with {string}', (endpoint, acceptHeader) => {
  cy.request({
    method: 'GET',
    url: `${configManager.getApiUrl()}${endpoint}`,
    headers: {
      'Accept': acceptHeader
    }
  }).as('versionedResponse');
});

When('I make a request without version header', () => {
  cy.apiGet('/users').as('defaultVersionResponse');
});

// Caching
When('I make the same request again within cache period', () => {
  cy.apiGet('/products/1').as('cachedResponse');
});

When('I update the product via PUT {string}', (endpoint) => {
  const updateData = { name: 'Updated Product' };
  cy.apiPut(endpoint, updateData).as('productUpdateResponse');
});

// Then steps - Response validation
Then('the response status should be {int}', (expectedStatus) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.status).to.equal(expectedStatus);
  });
});

Then('the response should contain {string}: {string}', (key, expectedValue) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property(key, expectedValue);
  });
});

Then('the response time should be less than {int}ms', (maxTime) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.duration).to.be.lessThan(maxTime);
  });
});

Then('the response should contain a valid JWT token', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('token');
    expect(response.body.token).to.be.a('string');
    expect(response.body.token).to.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });
});

Then('the token should not be expired', () => {
  cy.get('@apiResponse').then((response) => {
    const token = response.body.token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    expect(payload.exp).to.be.greaterThan(currentTime);
  });
});

Then('the response should include user information', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('user');
    expect(response.body.user).to.have.property('username');
    expect(response.body.user).to.have.property('email');
  });
});

Then('the response should contain the created user data', () => {
  cy.get('@createResponse').then((response) => {
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('username');
    expect(response.body).to.have.property('email');
    expect(response.body).to.have.property('createdAt');
  });
});

Then('the user data should match the created user', () => {
  cy.get('@createResponse').then((createResponse) => {
    cy.get('@retrieveResponse').then((retrieveResponse) => {
      expect(retrieveResponse.body.id).to.equal(createResponse.body.id);
      expect(retrieveResponse.body.username).to.equal(createResponse.body.username);
      expect(retrieveResponse.body.email).to.equal(createResponse.body.email);
    });
  });
});

Then('the user data should be updated', () => {
  cy.get('@updateResponse').then((response) => {
    expect(response.body.firstName).to.equal('Updated');
    expect(response.body.lastName).to.equal('User');
  });
});

Then('the response should be a valid JSON array', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.be.an('array');
  });
});

Then('each product should have required fields', () => {
  cy.get('@apiResponse').then((response) => {
    response.body.forEach(product => {
      expect(product).to.have.property('id');
      expect(product).to.have.property('name');
      expect(product).to.have.property('price');
      expect(product).to.have.property('category');
    });
  });
});

Then('the response should only contain electronics products', () => {
  cy.get('@apiResponse').then((response) => {
    response.body.forEach(product => {
      expect(product.category).to.equal('electronics');
    });
  });
});

Then('the response should contain exactly {int} products', (expectedCount) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.length(expectedCount);
  });
});

Then('the response should contain {string}', (expectedMessage) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body.message).to.include(expectedMessage);
  });
});

// Performance validation
Then('all responses should return within {int} seconds', (maxSeconds) => {
  cy.get('@concurrentResponses').then((responses) => {
    responses.forEach(response => {
      expect(response.duration).to.be.lessThan(maxSeconds * 1000);
    });
  });
});

Then('the average response time should be less than {int}ms', (maxAvgTime) => {
  cy.get('@concurrentResponses').then((responses) => {
    const totalTime = responses.reduce((sum, response) => sum + response.duration, 0);
    const avgTime = totalTime / responses.length;
    expect(avgTime).to.be.lessThan(maxAvgTime);
  });
});

Then('no requests should fail', () => {
  cy.get('@concurrentResponses').then((responses) => {
    responses.forEach(response => {
      expect(response.status).to.be.within(200, 299);
    });
  });
});

// Order processing validation
Then('the order should have status {string}', (expectedStatus) => {
  cy.get('@orderResponse').then((response) => {
    expect(response.body.status).to.equal(expectedStatus);
  });
});

Then('the order status should be updated to {string}', (expectedStatus) => {
  cy.get('@paymentResponse').then((response) => {
    expect(response.body.status).to.equal(expectedStatus);
  });
});

Then('the order should show payment confirmation', () => {
  cy.get('@orderStatusResponse').then((response) => {
    expect(response.body).to.have.property('paymentConfirmed', true);
    expect(response.body).to.have.property('paymentDate');
  });
});

Then('inventory should be updated accordingly', () => {
  // Verify inventory reduction
  cy.get('@testProduct').then((product) => {
    cy.apiGet(`/products/${product.id}`).then((response) => {
      expect(response.body.stockQuantity).to.be.lessThan(product.stockQuantity);
    });
  });
});

// Database consistency
Then('the API response should match database records', () => {
  cy.get('@testUser').then((dbUser) => {
    cy.get('@apiUserData').then((apiResponse) => {
      expect(apiResponse.body.username).to.equal(dbUser.username);
      expect(apiResponse.body.email).to.equal(dbUser.email);
    });
  });
});

Then('the database should reflect the changes', () => {
  cy.get('@testUser').then((user) => {
    cy.dbSelect('users', { id: user.id }).then((dbUsers) => {
      expect(dbUsers[0].firstName).to.equal('Updated API');
    });
  });
});

Then('the updated timestamp should be current', () => {
  cy.get('@testUser').then((user) => {
    cy.dbSelect('users', { id: user.id }).then((dbUsers) => {
      const updatedAt = new Date(dbUsers[0].updatedAt);
      const now = new Date();
      const diffInMinutes = (now - updatedAt) / (1000 * 60);
      expect(diffInMinutes).to.be.lessThan(1); // Updated within last minute
    });
  });
});

// Pagination validation
Then('the response should contain {int} users', (expectedCount) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body.data).to.have.length(expectedCount);
  });
});

Then('the response should include pagination metadata', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('pagination');
    expect(response.body.pagination).to.have.property('page');
    expect(response.body.pagination).to.have.property('limit');
    expect(response.body.pagination).to.have.property('total');
  });
});

Then('the {string} link should point to page {int}', (linkType, pageNumber) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body.pagination.links[linkType]).to.include(`page=${pageNumber}`);
  });
});

Then('the {string} link should be null', (linkType) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body.pagination.links[linkType]).to.be.null;
  });
});

// Rate limiting validation
Then('subsequent requests should return status {int}', (expectedStatus) => {
  cy.get('@rateLimitResponses').then((responses) => {
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.status).to.equal(expectedStatus);
  });
});

Then('the response should include {string} header', (headerName) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.headers).to.have.property(headerName.toLowerCase());
  });
});

Then('I should be able to make requests again', () => {
  cy.apiGet('/api/search').then((response) => {
    expect(response.status).to.equal(200);
  });
});

// Versioning validation
Then('the response should use v1 format', () => {
  cy.get('@versionedResponse').then((response) => {
    expect(response.body).to.have.property('version', 'v1');
  });
});

Then('the response should use v2 format', () => {
  cy.get('@versionedResponse').then((response) => {
    expect(response.body).to.have.property('version', 'v2');
  });
});

Then('the response should include additional fields', () => {
  cy.get('@versionedResponse').then((response) => {
    expect(response.body).to.have.property('metadata');
    expect(response.body).to.have.property('links');
  });
});

Then('the response should use the latest version', () => {
  cy.get('@defaultVersionResponse').then((response) => {
    expect(response.body).to.have.property('version', 'v2'); // Assuming v2 is latest
  });
});

// Caching validation
Then('the response should include cache headers', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.headers).to.have.property('cache-control');
  });
});

Then('the {string} header should be present', (headerName) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.headers).to.have.property(headerName.toLowerCase());
  });
});

Then('the response should be served from cache', () => {
  cy.get('@cachedResponse').then((response) => {
    expect(response.headers).to.have.property('x-cache-status', 'HIT');
  });
});

Then('the response time should be significantly faster', () => {
  cy.get('@apiResponse').then((firstResponse) => {
    cy.get('@cachedResponse').then((cachedResponse) => {
      expect(cachedResponse.duration).to.be.lessThan(firstResponse.duration * 0.5);
    });
  });
});

Then('the cache should be invalidated', () => {
  cy.get('@productUpdateResponse').then((response) => {
    expect(response.status).to.equal(200);
  });
});

Then('subsequent GET requests should return fresh data', () => {
  cy.apiGet('/products/1').then((response) => {
    expect(response.body.name).to.equal('Updated Product');
    expect(response.headers).to.not.have.property('x-cache-status');
  });
});

