const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.currentEnvironment = Cypress.env('environment') || 'dev';
    this.config = this.loadConfig(this.currentEnvironment);
  }

  /**
   * Load configuration for specified environment
   * @param {string} environment - Environment name (dev, qa, uat)
   * @returns {object} Configuration object
   */
  loadConfig(environment) {
    try {
      const configPath = path.join(process.cwd(), 'config', `${environment}.json`);
      
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }

      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Merge with environment variables if they exist
      this.mergeWithEnvVars(config);
      
      return config;
    } catch (error) {
      console.error(`Error loading configuration for ${environment}:`, error.message);
      throw error;
    }
  }

  /**
   * Merge configuration with environment variables
   * @param {object} config - Configuration object to merge
   */
  mergeWithEnvVars(config) {
    // Override with environment variables if they exist
    if (process.env.BASE_URL) {
      config.baseUrl = process.env.BASE_URL;
    }
    
    if (process.env.API_URL) {
      config.apiUrl = process.env.API_URL;
    }
    
    if (process.env.DB_HOST) {
      config.database.host = process.env.DB_HOST;
    }
    
    if (process.env.DB_PORT) {
      config.database.port = parseInt(process.env.DB_PORT);
    }
    
    if (process.env.DB_NAME) {
      config.database.database = process.env.DB_NAME;
    }
    
    if (process.env.DB_USER) {
      config.database.username = process.env.DB_USER;
    }
    
    if (process.env.DB_PASSWORD) {
      config.database.password = process.env.DB_PASSWORD;
    }
  }

  /**
   * Get configuration value by key path
   * @param {string} keyPath - Dot notation key path (e.g., 'users.admin.username')
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Configuration value
   */
  get(keyPath, defaultValue = null) {
    const keys = keyPath.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Get base URL for current environment
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return this.get('baseUrl');
  }

  /**
   * Get API URL for current environment
   * @returns {string} API URL
   */
  getApiUrl() {
    return this.get('apiUrl');
  }

  /**
   * Get database configuration
   * @returns {object} Database configuration
   */
  getDatabaseConfig() {
    return this.get('database', {});
  }

  /**
   * Get user credentials by type
   * @param {string} userType - User type (admin, user, manager)
   * @returns {object} User credentials
   */
  getUser(userType) {
    const user = this.get(`users.${userType}`);
    if (!user) {
      throw new Error(`User type '${userType}' not found in configuration`);
    }
    return user;
  }

  /**
   * Get API configuration
   * @returns {object} API configuration
   */
  getApiConfig() {
    return this.get('api', {});
  }

  /**
   * Get browser configuration
   * @returns {object} Browser configuration
   */
  getBrowserConfig() {
    return this.get('browser', {});
  }

  /**
   * Check if feature is enabled
   * @param {string} featureName - Feature name
   * @returns {boolean} Feature enabled status
   */
  isFeatureEnabled(featureName) {
    return this.get(`features.${featureName}`, false);
  }

  /**
   * Get test data configuration
   * @returns {object} Test data configuration
   */
  getTestDataConfig() {
    return this.get('testData', {});
  }

  /**
   * Get integration configuration
   * @param {string} integration - Integration name (slack, jira)
   * @returns {object} Integration configuration
   */
  getIntegrationConfig(integration) {
    return this.get(`integrations.${integration}`, {});
  }

  /**
   * Switch to different environment
   * @param {string} environment - Environment name
   */
  switchEnvironment(environment) {
    this.currentEnvironment = environment;
    this.config = this.loadConfig(environment);
  }

  /**
   * Get current environment name
   * @returns {string} Current environment
   */
  getCurrentEnvironment() {
    return this.currentEnvironment;
  }

  /**
   * Validate configuration
   * @returns {object} Validation result
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // Check required fields
    const requiredFields = [
      'baseUrl',
      'apiUrl',
      'database.host',
      'database.port',
      'database.database'
    ];

    requiredFields.forEach(field => {
      if (!this.get(field)) {
        errors.push(`Missing required configuration: ${field}`);
      }
    });

    // Check user configurations
    const userTypes = ['admin', 'user'];
    userTypes.forEach(userType => {
      const user = this.get(`users.${userType}`);
      if (!user) {
        warnings.push(`Missing user configuration: ${userType}`);
      } else {
        if (!user.username || !user.password) {
          errors.push(`Incomplete user configuration for ${userType}`);
        }
      }
    });

    // Check URLs are valid
    const urls = ['baseUrl', 'apiUrl'];
    urls.forEach(urlField => {
      const url = this.get(urlField);
      if (url && !this.isValidUrl(url)) {
        errors.push(`Invalid URL format: ${urlField} = ${url}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if URL is valid
   * @param {string} url - URL to validate
   * @returns {boolean} URL validity
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all available environments
   * @returns {string[]} Array of environment names
   */
  getAvailableEnvironments() {
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      return [];
    }

    return fs.readdirSync(configDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  /**
   * Export configuration for debugging
   * @returns {object} Current configuration (with sensitive data masked)
   */
  exportConfig() {
    const config = JSON.parse(JSON.stringify(this.config));
    
    // Mask sensitive data
    if (config.database && config.database.password) {
      config.database.password = '***MASKED***';
    }
    
    if (config.users) {
      Object.keys(config.users).forEach(userType => {
        if (config.users[userType].password) {
          config.users[userType].password = '***MASKED***';
        }
      });
    }
    
    return config;
  }
}

// Export singleton instance
const configManager = new ConfigManager();

// Make it available globally in Cypress
if (typeof window !== 'undefined') {
  window.configManager = configManager;
}

module.exports = configManager;

