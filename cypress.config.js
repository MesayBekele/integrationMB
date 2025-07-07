const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const fs = require('fs');
const path = require('path');

// Load environment-specific configuration
function loadEnvironmentConfig(env = 'dev') {
  const configPath = path.join(__dirname, 'config', `${env}.json`);
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  console.warn(`Configuration file for environment '${env}' not found. Using default config.`);
  return {};
}

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      // Load environment configuration
      const env = config.env.ENVIRONMENT || process.env.CYPRESS_ENV || 'dev';
      const envConfig = loadEnvironmentConfig(env);
      
      // Merge environment config with Cypress config
      config.baseUrl = envConfig.baseUrl || config.baseUrl;
      config.defaultCommandTimeout = envConfig.timeout?.default || 4000;
      config.pageLoadTimeout = envConfig.timeout?.pageLoad || 60000;
      config.requestTimeout = envConfig.timeout?.api || 5000;
      
      // Add environment variables
      config.env = {
        ...config.env,
        ...envConfig,
        ENVIRONMENT: env
      };

      // Set up Cucumber preprocessor
      const bundler = createBundler({
        plugins: [createEsbuildPlugin(config)],
      });
      
      on('file:preprocessor', bundler);
      await addCucumberPreprocessorPlugin(on, config);

      // Task for loading test data
      on('task', {
        loadTestData(filename) {
          const dataPath = path.join(__dirname, 'data', filename);
          if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          }
          return null;
        },
        
        log(message) {
          console.log(message);
          return null;
        }
      });

      return config;
    },
    
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    
    // Default timeouts
    defaultCommandTimeout: 4000,
    pageLoadTimeout: 60000,
    requestTimeout: 5000,
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video and screenshot settings
    video: true,
    screenshotOnRunFailure: true,
    
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Browser settings
    chromeWebSecurity: false,
    
    // Environment variables
    env: {
      ENVIRONMENT: 'dev'
    }
  }
});

