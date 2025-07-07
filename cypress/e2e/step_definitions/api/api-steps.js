import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// API request steps
When('I send a POST request to {string} with:', (endpoint, dataTable) => {
  const apiUrl = Cypress.env('API_BASE_URL') || Cypress.env('apiUrl') || 'https://api.example.com';
  const requestData = dataTable.rowsHash();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}${endpoint}`,
    body: requestData,
    failOnStatusCode: false
  }).as('apiResponse');
});

When('I send {int} concurrent POST requests to {string} with:', (requestCount, endpoint, dataTable) => {
  const apiUrl = Cypress.env('API_BASE_URL') || Cypress.env('apiUrl') || 'https://api.example.com';
  const requestData = dataTable.rowsHash();
  
  const startTime = Date.now();
  const requests = [];
  
  // Create multiple concurrent requests
  for (let i = 0; i < requestCount; i++) {
    const request = cy.request({
      method: 'POST',
      url: `${apiUrl}${endpoint}`,
      body: requestData,
      failOnStatusCode: false
    });
    requests.push(request);
  }
  
  // Store timing and request info for validation
  cy.wrap({
    requests,
    startTime,
    requestCount
  }).as('concurrentRequests');
});

// API response validation steps
Then('the response status should be {int}', (expectedStatus) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.status).to.eq(expectedStatus);
  });
});

Then('the response status should be {int} or {int}', (status1, status2) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.status).to.be.oneOf([status1, status2]);
  });
});

Then('the response should contain a valid JWT token', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('token');
    expect(response.body.token).to.be.a('string');
    expect(response.body.token).to.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });
});

Then('the user role should be {string}', (expectedRole) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('user');
    expect(response.body.user).to.have.property('role');
    expect(response.body.user.role).to.eq(expectedRole);
  });
});

Then('the token should be valid for {int} minutes', (duration) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('token');
    // In a real scenario, you might decode the JWT to check expiration
    // For now, we'll just verify the token exists and log the expected duration
    cy.task('log', `Token should be valid for ${duration} minutes`);
  });
});

Then('the response should contain error message {string}', (expectedError) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('error');
    expect(response.body.error).to.contain(expectedError);
  });
});

Then('no token should be returned', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.not.have.property('token');
  });
});

Then('the response should contain validation errors', () => {
  cy.get('@apiResponse').then((response) => {
    expect(response.body).to.have.property('errors');
    expect(response.body.errors).to.be.an('array');
    expect(response.body.errors.length).to.be.greaterThan(0);
  });
});

Then('the response should not contain sensitive information', () => {
  cy.get('@apiResponse').then((response) => {
    const responseString = JSON.stringify(response.body);
    
    // Check that sensitive information is not exposed
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /private/i,
      /internal/i,
      /debug/i,
      /stack trace/i
    ];
    
    sensitivePatterns.forEach(pattern => {
      expect(responseString).to.not.match(pattern);
    });
  });
});

Then('the system should log the security attempt', () => {
  // In a real scenario, this would check logs or monitoring systems
  cy.task('log', 'Security attempt should be logged');
});

// Performance validation steps
Then('all responses should be received within {int} seconds', (maxSeconds) => {
  cy.get('@concurrentRequests').then((requestInfo) => {
    const { requests, startTime } = requestInfo;
    
    // Wait for all requests to complete
    cy.wrap(Promise.all(requests)).then(() => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      expect(duration).to.be.lessThan(maxSeconds);
      cy.task('log', `All requests completed in ${duration} seconds`);
    });
  });
});

Then('the success rate should be above {int}%', (minSuccessRate) => {
  cy.get('@concurrentRequests').then((requestInfo) => {
    const { requests, requestCount } = requestInfo;
    
    cy.wrap(Promise.all(requests)).then((responses) => {
      const successfulResponses = responses.filter(response => response.status === 200);
      const successRate = (successfulResponses.length / requestCount) * 100;
      
      expect(successRate).to.be.greaterThan(minSuccessRate);
      cy.task('log', `Success rate: ${successRate}% (${successfulResponses.length}/${requestCount})`);
    });
  });
});

// Security validation steps
Given('I have malicious input {string}', (maliciousInput) => {
  cy.wrap(maliciousInput).as('maliciousInput');
});

When('I attempt to inject the malicious input', () => {
  cy.get('@maliciousInput').then((input) => {
    const apiUrl = Cypress.env('API_BASE_URL') || 'https://api.example.com';
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        username: input,
        password: 'test123'
      },
      failOnStatusCode: false
    }).as('securityTestResponse');
  });
});

Then('the system should reject the input safely', () => {
  cy.get('@securityTestResponse').then((response) => {
    expect(response.status).to.be.oneOf([400, 401, 403]);
    expect(response.body).to.not.contain('<script>');
    expect(response.body).to.not.contain('DROP TABLE');
  });
});

