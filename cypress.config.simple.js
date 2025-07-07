const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      console.log('🔧 Simple setup - Adding Cucumber preprocessor plugin...');
      
      // Set up esbuild preprocessor with Cucumber plugin
      const bundler = createBundler({
        plugins: [createEsbuildPlugin(config)],
      });
      
      on('file:preprocessor', bundler);
      await addCucumberPreprocessorPlugin(on, config);
      
      console.log('🔧 Simple setup complete');
      return config;
    },
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
  },
});
