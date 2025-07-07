/**
 * Authentication API Tests
 * Backend API testing for authentication endpoints
 */

describe('Authentication API Tests', () => {

  const apiUrl = Cypress.env('apiUrl') || 'https://api.example.com';

  taggedTest('Should authenticate user via API', 
    [TAGS.API, TAGS.SMOKE, TAGS.CRITICAL], 
    () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: {
          username: 'admin',
          password: 'Admin123!'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
        expect(response.body.user.role).to.eq('admin');
        
        // Store token for subsequent tests
        Cypress.env('authToken', response.body.token);
      });
    }
  );

  taggedTest('Should reject invalid credentials via API', 
    [TAGS.API, TAGS.NEGATIVE, TAGS.CRITICAL], 
    () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: {
          username: 'invalid',
          password: 'wrongpass'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.contain('Invalid credentials');
      });
    }
  );

  taggedTest('Should validate required fields via API', 
    [TAGS.API, TAGS.NEGATIVE], 
    () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('errors');
        expect(response.body.errors).to.include.members(['Username is required', 'Password is required']);
      });
    }
  );

});

// Data-driven API tests
describe('API Authentication with Multiple Users', () => {

  const apiUrl = Cypress.env('apiUrl') || 'https://api.example.com';

  testWithData('Should authenticate different user types via API',
    [
      { username: 'admin', password: 'Admin123!', expectedRole: 'admin' },
      { username: 'manager', password: 'Manager123!', expectedRole: 'manager' },
      { username: 'user', password: 'User123!', expectedRole: 'user' }
    ],
    (userData) => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: {
          username: userData.username,
          password: userData.password
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.user.role).to.eq(userData.expectedRole);
        expect(response.body.token).to.be.a('string');
      });
    },
    [TAGS.API, TAGS.REGRESSION]
  );

});

// Token validation tests
taggedDescribe('Token Validation API Tests', [TAGS.API, TAGS.INTEGRATION], () => {

  const apiUrl = Cypress.env('apiUrl') || 'https://api.example.com';
  let authToken;

  before(() => {
    // Get auth token for protected endpoint tests
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        username: 'admin',
        password: 'Admin123!'
      }
    }).then((response) => {
      authToken = response.body.token;
    });
  });

  taggedTest('Should access protected endpoint with valid token', 
    [TAGS.API, TAGS.POSITIVE], 
    () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/user/profile`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('user');
      });
    }
  );

  taggedTest('Should reject access without token', 
    [TAGS.API, TAGS.NEGATIVE], 
    () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/user/profile`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.contain('Token required');
      });
    }
  );

});

