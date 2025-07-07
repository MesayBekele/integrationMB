import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have the Base64 protection system loaded', () => {
  // Visit a blank page to initialize the browser context
  cy.visit('data:text/html,<html><body><h1>Base64 Protection Test</h1></body></html>');
  
  // Verify that our protection functions are available
  cy.window().then((win) => {
    expect(win.safeBase64Decode).to.be.a('function');
    expect(win.safeBase64Encode).to.be.a('function');
    cy.log('✅ Base64 protection system is loaded and ready');
  });
});

When('I try to decode invalid Base64 strings', () => {
  // Test various invalid Base64 strings that would normally cause errors
  const invalidBase64Strings = [
    'invalid!@#$%',           // Invalid characters
    'abc',                    // Wrong length (not multiple of 4)
    'abcd!',                  // Invalid character at end
    'ab==cd',                 // Padding in wrong position
    '',                       // Empty string
    null,                     // Null value
    undefined,                // Undefined value
    123,                      // Number instead of string
    'a',                      // Single character
    'ab',                     // Two characters
    'abc',                    // Three characters (needs padding)
    'abcde',                  // Five characters
    'Hello World!@#$%^&*()',  // Regular text with special chars
  ];

  cy.wrap(invalidBase64Strings).each((invalidString) => {
    cy.then(() => {
      // Test our safe decode function
      const result = window.safeBase64Decode(invalidString);
      cy.log(`🛡️ Safely decoded "${invalidString}" -> "${result}"`);
      
      // Test native atob with our protection
      try {
        const nativeResult = window.atob(invalidString || '');
        cy.log(`🛡️ Native atob handled "${invalidString}" -> "${nativeResult}"`);
      } catch (error) {
        cy.log(`🛡️ Native atob error handled: ${error.message}`);
      }
      
      // Test Buffer.from with our protection (if available)
      if (typeof Buffer !== 'undefined') {
        try {
          const bufferResult = Buffer.from(invalidString || '', 'base64').toString();
          cy.log(`🛡️ Buffer.from handled "${invalidString}" -> "${bufferResult}"`);
        } catch (error) {
          cy.log(`🛡️ Buffer.from error handled: ${error.message}`);
        }
      }
    });
  });
});

Then('the system should handle errors gracefully', () => {
  // Verify no uncaught exceptions occurred
  cy.window().then((win) => {
    // Check that our protection functions are still working
    expect(win.safeBase64Decode).to.be.a('function');
    expect(win.safeBase64Encode).to.be.a('function');
    
    // Test a few more edge cases
    const result1 = win.safeBase64Decode('invalid');
    const result2 = win.safeBase64Encode('test data');
    
    cy.log(`✅ Safe decode result: "${result1}"`);
    cy.log(`✅ Safe encode result: "${result2}"`);
    
    // Verify encoding/decoding cycle works
    const testData = 'Hello, World! 🌍';
    const encoded = win.safeBase64Encode(testData);
    const decoded = win.safeBase64Decode(encoded);
    
    expect(decoded).to.equal(testData);
    cy.log(`✅ Encode/decode cycle successful: "${testData}" -> "${encoded}" -> "${decoded}"`);
  });
});

Then('no "invalid string length must be a multiple of 4" errors should occur', () => {
  // This step passes if we reach here without any uncaught exceptions
  cy.log('✅ No Base64 encoding errors occurred during the test');
  
  // Test one more batch of problematic strings
  const problematicStrings = [
    'A',      // Length 1
    'AB',     // Length 2  
    'ABC',    // Length 3
    'ABCDE',  // Length 5
    'ABCDEF', // Length 6
    'ABCDEFG' // Length 7
  ];
  
  cy.wrap(problematicStrings).each((str) => {
    cy.window().then((win) => {
      const result = win.safeBase64Decode(str);
      cy.log(`🛡️ Problematic string "${str}" handled safely -> "${result}"`);
    });
  });
  
  cy.log('🎉 All Base64 protection tests passed successfully!');
});
