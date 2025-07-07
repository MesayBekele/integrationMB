const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

console.log('🔍 STEP DEFINITIONS FILE LOADED!');

Given('I have a simple test', () => {
  console.log('✅ Simple test step executed');
  cy.log('✅ Simple test step executed');
});

When('I run the test', () => {
  console.log('✅ Test execution step completed');
  cy.log('✅ Test execution step completed');
});

Then('it should pass', () => {
  console.log('✅ Test assertion passed');
  cy.log('✅ Test assertion passed');
});
