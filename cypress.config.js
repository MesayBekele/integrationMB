const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');

// Load environment configuration
function loadEnvironmentConfig(environment) {
  const configPath = path.join(__dirname, 'config', `${environment}.json`);
  
  if (fs.existsSync(configPath)) {
    console.log(`🔧 Loading configuration for environment: ${environment}`);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(`✅ Configuration loaded successfully`);
    return config;
  } else {
    console.warn(`⚠️  Configuration file not found for environment: ${environment}`);
    console.warn(`   Expected path: ${configPath}`);
    return {};
  }
}

module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      console.log('🔧 Setting up Cypress 11 with Cucumber + Mochawesome...');
      
      // Set up esbuild preprocessor with Cucumber plugin
      const bundler = createBundler({
        plugins: [createEsbuildPlugin(config)],
      });
      
      on('file:preprocessor', bundler);
      await addCucumberPreprocessorPlugin(on, config);
      
      // Load environment-specific configuration
      const environment = config.env.ENVIRONMENT || 'dev';
      const envConfig = loadEnvironmentConfig(environment);
      
      // Merge environment config with Cypress config
      if (envConfig.baseUrl) {
        config.baseUrl = envConfig.baseUrl;
      }
      
      // Set environment variables
      config.env = {
        ...config.env,
        ...envConfig,
        ENVIRONMENT: environment
      };
      
      // Custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Task for loading test data
        loadTestData(filename) {
          const dataPath = path.join(__dirname, 'cypress/fixtures/test-data', filename);
          if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          }
          return null;
        }
      });
      
      console.log(`🌍 Environment: ${environment}`);
      console.log(`🔗 Base URL: ${config.baseUrl}`);
      console.log('✅ Cypress + Cucumber + Mochawesome setup complete');
      
      return config;
    },
    
    // Support both .feature files and .cy.js files
    specPattern: [
      'cypress/e2e/**/*.feature',
      'cypress/e2e/**/*.cy.js'
    ],
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
  },
  
  // Reporter configuration for Mochawesome
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json'
  }
});

