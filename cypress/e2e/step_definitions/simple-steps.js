import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have a simple test', () => {
  cy.log('✅ Simple test step executed');
});

When('I run the test', () => {
  cy.log('✅ Test execution step completed');
});

Then('it should pass', () => {
  expect(true).to.be.true;
  cy.log('✅ Test assertion passed');
});
