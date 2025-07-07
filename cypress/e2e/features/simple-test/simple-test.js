const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

console.log('🔍 COLOCATED STEP DEFINITIONS FILE LOADED!');

Given('I have a simple test', () => {
  console.log('✅ Simple test step executed - COLOCATED');
  cy.log('✅ Simple test step executed - COLOCATED');
});

When('I run the test', () => {
  console.log('✅ Test execution step completed - COLOCATED');
  cy.log('✅ Test execution step completed - COLOCATED');
});

Then('it should pass', () => {
  console.log('✅ Test assertion passed - COLOCATED');
  cy.log('✅ Test assertion passed - COLOCATED');
});
