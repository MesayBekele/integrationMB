/**
 * Simple Configuration Manager
 * Manages environment configurations and test data
 */

class ConfigManager {
  constructor() {
    this.currentEnvironment = Cypress.env('environment') || 'dev';
    this.config = null;
    this.loadConfiguration();
  }

  /**
   * Load configuration for current environment
   */
  loadConfiguration() {
    try {
      this.config = require(`../../../config/${this.currentEnvironment}.json`);
      console.log(`✅ Loaded configuration for environment: ${this.currentEnvironment}`);
    } catch (error) {
      console.warn(`⚠️ Could not load config for ${this.currentEnvironment}, using defaults`);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      baseUrl: 'https://example.com',
      timeout: 10000,
      users: {
        admin: {
          username: 'admin',
          password: 'admin123'
        },
        user: {
          username: 'user',
          password: 'user123'
        }
      }
    };
  }

  /**
   * Get base URL for current environment
   */
  getBaseUrl() {
    return this.config.baseUrl;
  }

  /**
   * Get user credentials by type
   */
  getUser(userType) {
    const user = this.config.users[userType];
    if (!user) {
      throw new Error(`User type '${userType}' not found in configuration`);
    }
    return user;
  }

  /**
   * Get timeout value
   */
  getTimeout() {
    return this.config.timeout || 10000;
  }

  /**
   * Get current environment
   */
  getCurrentEnvironment() {
    return this.currentEnvironment;
  }

  /**
   * Get full configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get configuration value by path
   */
  get(path) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Check if configuration is loaded
   */
  isLoaded() {
    return this.config !== null;
  }
}

// Export singleton instance
const configManager = new ConfigManager();

// Make it available globally in Cypress
if (typeof window !== 'undefined') {
  window.configManager = configManager;
}

module.exports = configManager;

