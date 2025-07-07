const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

Given('I have a simple test', () => {
  // Just pass without any Cypress commands
  console.log('✅ Simple test step executed');
});

When('I run the test', () => {
  // Just pass without any Cypress commands
  console.log('✅ Test execution step completed');
});

Then('it should pass', () => {
  // Just pass without any Cypress commands
  console.log('✅ Test assertion passed');
});
