const { defineConfig } = require('cypress');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      console.log('🔧 Simple setup - Adding Cucumber preprocessor plugin...');
      await addCucumberPreprocessorPlugin(on, config);
      console.log('🔧 Simple setup complete');
      return config;
    },
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
  },
});
