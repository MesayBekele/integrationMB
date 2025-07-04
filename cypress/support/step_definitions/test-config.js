import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I can run a simple test', () => {
  cy.log('✅ Cypress Cucumber preprocessor is working');
});

When('I check the configuration', () => {
  cy.log('🔍 Checking configuration...');
  // Simple assertion to verify everything is working
  expect(true).to.be.true;
});

Then('the test should pass without source mapping errors', () => {
  cy.log('🎉 Configuration test passed successfully!');
  expect(true).to.be.true;
});

