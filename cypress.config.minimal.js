const { defineConfig } = require('cypress');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/features/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      
      return config;
    },
  },
});
