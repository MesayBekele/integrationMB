const { defineConfig } = require('cypress');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');

module.exports = defineConfig({
  e2e: {
    // Base configuration
    baseUrl: null, // Set to null to avoid connection issues during setup
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
    
    // Screenshots and videos - optimized to prevent encoding issues
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    videoCompression: 32, // Reduce compression to prevent encoding issues
    
    // Browser settings
    chromeWebSecurity: false,
    
    // Environment variables
    env: {
      environment: 'dev',
      tags: '@smoke'
    },
    
    // Mochawesome reporter configuration - comprehensive Base64 encoding fix
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'reports/temp',
      overwrite: false,
      html: true,
      json: true,
      timestamp: 'mmddyyyy_HHMMss',
      reportTitle: 'E2E Test Report',
      reportPageTitle: 'Cypress E2E Tests',
      embeddedScreenshots: false, // Fix: Disable to prevent Base64 encoding issues
      inlineAssets: false, // Fix: Disable to prevent asset encoding issues
      saveAllAttempts: false,
      ignoreVideos: false,
      videoOnFailOnly: false,
      // Additional Base64 encoding prevention
      charts: false, // Disable charts that might use Base64 encoding
      code: false, // Disable code display that might cause encoding issues
      autoOpen: false, // Prevent automatic opening that might trigger encoding
      quiet: true // Reduce verbose output that might contain problematic data
    },
    
    async setupNodeEvents(on, config) {
      // Load Node.js level Base64 protection first
      require('./cypress/plugins/base64-protection');
      
      // Mochawesome reporter plugin (setup first to avoid conflicts)
      require('cypress-mochawesome-reporter/plugin')(on);
      
      // Cucumber preprocessor (setup after reporter)
      await addCucumberPreprocessorPlugin(on, config);
      
      // Esbuild bundler for step definitions with source mapping fix
      on('file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
          // Fix for source mapping issue
          sourcemap: false,
          // Dynamic target based on current Node version (currently Node 22)
          target: `node${process.version.split('.')[0].substring(1)}`,
          format: 'cjs'
        })
      );

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
