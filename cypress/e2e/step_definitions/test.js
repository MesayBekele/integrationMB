const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

console.log('🚀 TEST STEP DEFINITIONS LOADED!');

Given('I have a simple test', function() {
  console.log('✅ Given step executed');
});

When('I run the test', function() {
  console.log('✅ When step executed');
});

Then('it should pass', function() {
  console.log('✅ Then step executed');
});
