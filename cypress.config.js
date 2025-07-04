const { defineConfig } = require('cypress');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');

module.exports = defineConfig({
  e2e: {
    // Base configuration
    baseUrl: 'https://example.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Test files
    specPattern: 'cypress/e2e/features/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    
    // Screenshots and videos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    
    // Browser settings
    chromeWebSecurity: false,
    
    // Environment variables
    env: {
      environment: 'dev',
      tags: '@smoke'
    },
    
    // Mochawesome reporter configuration - simplified and direct
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'reports/temp',
      overwrite: false,
      html: true,
      json: true,
      timestamp: 'mmddyyyy_HHMMss',
      reportTitle: 'E2E Test Report',
      reportPageTitle: 'Cypress E2E Tests',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      ignoreVideos: false,
      videoOnFailOnly: false
    },
    
    async setupNodeEvents(on, config) {
      // Cucumber preprocessor
      await addCucumberPreprocessorPlugin(on, config);
      
      // Esbuild bundler for step definitions with source mapping fix
      on('file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
          // Fix for source mapping issue
          sourcemap: false,
          target: 'node14',
          format: 'cjs'
        })
      );

      // Mochawesome reporter plugin
      require('cypress-mochawesome-reporter/plugin')(on);

      // Task for logging
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });

      // Load environment-specific configuration
      const environment = config.env.environment || 'dev';
      try {
        const envConfig = require(`./config/${environment}.json`);
        
        // Override base URL if specified in environment config
        if (envConfig.baseUrl) {
          config.baseUrl = envConfig.baseUrl;
        }
        
        // Merge environment config into env
        config.env = { ...config.env, ...envConfig };
        
        console.log(`✅ Loaded configuration for environment: ${environment}`);
      } catch (error) {
        console.warn(`⚠️ Could not load config for ${environment}, using defaults`);
      }

      return config;
    },
  },
  
  // Component testing (optional)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
