const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const fs = require('fs');
const path = require('path');

// Load environment configuration
function loadConfig(environment = 'dev') {
  const configPath = path.join(__dirname, 'config', `${environment}.json`);
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return {};
}

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      // Cucumber preprocessor plugin
      await addCucumberPreprocessorPlugin(on, config);

      // Esbuild preprocessor for faster compilation
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      // Load environment-specific configuration
      const environment = config.env.environment || 'dev';
      const envConfig = loadConfig(environment);
      
      // Merge environment config with Cypress config
      config.baseUrl = envConfig.baseUrl || config.baseUrl;
      config.env = { ...config.env, ...envConfig };

      // Task for database operations
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Database query task
        queryDb: (query) => {
          return new Promise((resolve, reject) => {
            // Database connection logic will be implemented in utilities
            resolve({ success: true, data: [] });
          });
        },

        // File operations
        readFile: (filename) => {
          return fs.readFileSync(filename, 'utf8');
        },

        writeFile: ({ filename, content }) => {
          fs.writeFileSync(filename, content);
          return null;
        },

        // Generate test data
        generateTestData: (type) => {
          const testDataGenerator = require('./cypress/support/utilities/testDataGenerator');
          return testDataGenerator.generate(type);
        }
      });

      // Filter tests by tags
      on('before:run', (details) => {
        const tags = config.env.tags;
        if (tags) {
          console.log(`Running tests with tags: ${tags}`);
        }
      });

      // Screenshot and video settings
      on('after:screenshot', (details) => {
        console.log('Screenshot taken:', details.path);
      });

      return config;
    },

    // Spec pattern for feature files
    specPattern: 'cypress/e2e/features/**/*.feature',
    
    // Support file
    supportFile: 'cypress/support/e2e.js',
    
    // Base URL (can be overridden by environment config)
    baseUrl: 'http://localhost:3000',
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video and screenshot settings
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    
    // Test settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Browser settings
    chromeWebSecurity: false,
    
    // Environment variables
    env: {
      environment: 'dev',
      tags: '',
      apiUrl: 'http://localhost:3001/api',
      coverage: false,
      hideXHRInCommandLog: true
    },

    // Experimental features
    experimentalStudio: true,
    experimentalWebKitSupport: true
  },

  // Component testing configuration (if needed)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  },

  // Reporter configuration
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json'
  }
});

