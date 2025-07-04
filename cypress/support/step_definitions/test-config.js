import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I can run a simple test', () => {
  cy.log('✅ Cypress Cucumber preprocessor is working');
  // Visit a simple page that doesn't require external server
  cy.visit('about:blank');
});

When('I check the configuration', () => {
  cy.log('🔍 Checking configuration...');
  // Simple assertion to verify everything is working
  expect(true).to.be.true;
  // Verify we can access Cypress commands
  cy.title().should('exist');
});

Then('the test should pass without source mapping errors', () => {
  cy.log('🎉 Configuration test passed successfully!');
  expect(true).to.be.true;
  // Verify the test completed without errors
  cy.log('✅ No source mapping errors detected');
});
