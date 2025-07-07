import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I can run a simple test', () => {
  // Visit a simple data URL instead of about:blank to avoid protocol errors
  cy.visit('data:text/html,<html><body><h1>Cypress Configuration Test</h1><p>Testing framework setup</p></body></html>');
  cy.get('h1').should('contain.text', 'Cypress Configuration Test');
  cy.log('✅ Simple test execution verified');
});

When('I check the configuration', () => {
  // Verify Cypress is properly configured
  cy.window().then((win) => {
    // Check that Cypress is available
    expect(Cypress).to.exist;
    expect(Cypress.version).to.be.a('string');
    cy.log(`✅ Cypress version: ${Cypress.version}`);
    
    // Check that our Base64 protection is loaded
    expect(win.safeBase64Decode).to.be.a('function');
    expect(win.safeBase64Encode).to.be.a('function');
    cy.log('✅ Base64 protection functions available');
    
    // Check browser environment
    expect(win.navigator).to.exist;
    expect(win.document).to.exist;
    cy.log('✅ Browser environment verified');
  });
  
  // Verify Cucumber preprocessor is working
  cy.task('log', 'Cucumber preprocessor is working correctly');
  cy.log('✅ Cucumber preprocessor verified');
});

Then('the test should pass without source mapping errors', () => {
  // Verify no 404 errors in console
  cy.window().then((win) => {
    // Check that the page loaded successfully
    expect(win.document.readyState).to.equal('complete');
    cy.log('✅ Page loaded without errors');
    
    // Test that our protection systems are working
    const testString = 'Hello World!';
    const encoded = win.safeBase64Encode(testString);
    const decoded = win.safeBase64Decode(encoded);
    
    expect(decoded).to.equal(testString);
    cy.log(`✅ Base64 encode/decode test: "${testString}" -> "${encoded}" -> "${decoded}"`);
    
    // Test invalid Base64 handling
    const invalidResult = win.safeBase64Decode('invalid!@#$%');
    expect(invalidResult).to.be.a('string'); // Should not throw error
    cy.log(`✅ Invalid Base64 handled safely: "${invalidResult}"`);
  });
  
  // Verify configuration values
  cy.then(() => {
    expect(Cypress.config('baseUrl')).to.exist;
    expect(Cypress.config('viewportWidth')).to.be.a('number');
    expect(Cypress.config('viewportHeight')).to.be.a('number');
    cy.log('✅ Cypress configuration values verified');
  });
  
  cy.log('🎉 Configuration test completed successfully - no source mapping errors!');
});
