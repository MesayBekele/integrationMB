/**
 * Login Smoke Tests
 * Critical user authentication functionality
 */

describe('User Login - Smoke Tests', () => {
  
  beforeEach(() => {
    cy.visit('/login');
  });

  taggedTest('Should successfully login with valid admin credentials', 
    [TAGS.SMOKE, TAGS.CRITICAL, TAGS.UI, TAGS.POSITIVE], 
    () => {
      // Load test data
      cy.fixture('test-data/users').then((users) => {
        const adminUser = users.validUsers.find(user => user.role === 'admin');
        
        // Perform login
        cy.get('[data-cy="username-input"]').type(adminUser.username);
        cy.get('[data-cy="password-input"]').type(adminUser.password);
        cy.get('[data-cy="login-button"]').click();
        
        // Verify successful login
        cy.url().should('include', '/dashboard');
        cy.get('[data-cy="welcome-message"]').should('contain', 'Welcome');
        cy.get('[data-cy="user-menu"]').should('be.visible');
      });
    }
  );

  taggedTest('Should show error message with invalid credentials', 
    [TAGS.SMOKE, TAGS.CRITICAL, TAGS.UI, TAGS.NEGATIVE], 
    () => {
      // Use invalid credentials
      cy.get('[data-cy="username-input"]').type('invaliduser');
      cy.get('[data-cy="password-input"]').type('wrongpassword');
      cy.get('[data-cy="login-button"]').click();
      
      // Verify error handling
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
      cy.url().should('include', '/login');
    }
  );

  taggedTest('Should validate required fields', 
    [TAGS.SMOKE, TAGS.UI, TAGS.NEGATIVE], 
    () => {
      // Try to login without entering credentials
      cy.get('[data-cy="login-button"]').click();
      
      // Verify validation messages
      cy.get('[data-cy="username-error"]').should('contain', 'Username is required');
      cy.get('[data-cy="password-error"]').should('contain', 'Password is required');
      cy.get('[data-cy="login-button"]').should('be.disabled');
    }
  );

});

// Data-driven test example
describe('Login with Multiple User Types', () => {
  
  beforeEach(() => {
    cy.visit('/login');
  });

  // Test with multiple valid users
  testWithData('Should login successfully with different user roles', 
    [
      { username: 'admin', password: 'Admin123!', role: 'admin', description: 'Admin user' },
      { username: 'manager', password: 'Manager123!', role: 'manager', description: 'Manager user' },
      { username: 'user', password: 'User123!', role: 'user', description: 'Regular user' }
    ],
    (userData) => {
      cy.get('[data-cy="username-input"]').type(userData.username);
      cy.get('[data-cy="password-input"]').type(userData.password);
      cy.get('[data-cy="login-button"]').click();
      
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy="user-role"]').should('contain', userData.role);
    },
    [TAGS.SMOKE, TAGS.UI, TAGS.POSITIVE]
  );

});

// Performance test example
taggedDescribe('Login Performance Tests', [TAGS.SMOKE, TAGS.FAST], () => {
  
  taggedTest('Should complete login within 3 seconds', 
    [TAGS.PERFORMANCE, TAGS.CRITICAL], 
    () => {
      const startTime = Date.now();
      
      cy.visit('/login');
      cy.get('[data-cy="username-input"]').type('admin');
      cy.get('[data-cy="password-input"]').type('Admin123!');
      cy.get('[data-cy="login-button"]').click();
      
      cy.url().should('include', '/dashboard').then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        expect(duration).to.be.lessThan(3000);
        cy.task('log', `Login completed in ${duration}ms`);
      });
    }
  );

});

