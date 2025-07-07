const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      console.log('🔧 Setting up node events...');
      
      // This is the exact order from the working example
      const bundler = createBundler({
        plugins: [createEsbuildPlugin(config)],
      });
      
      console.log('🔧 Setting up file preprocessor...');
      on('file:preprocessor', bundler);
      
      console.log('🔧 Adding Cucumber preprocessor plugin...');
      await addCucumberPreprocessorPlugin(on, config);
      
      console.log('🔧 Configuration complete:', config);
      return config;
    },
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
  },
});
