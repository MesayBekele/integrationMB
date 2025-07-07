const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

console.log('🎯 COLOCATED STEP DEFINITIONS LOADED!');

Given('I have a simple test', function() {
  console.log('✅ Given step executed - COLOCATED');
});

When('I run the test', function() {
  console.log('✅ When step executed - COLOCATED');
});

Then('it should pass', function() {
  console.log('✅ Then step executed - COLOCATED');
});
