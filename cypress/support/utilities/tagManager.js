/**
 * Tag Manager for organizing and filtering tests
 * Supports Cucumber tags for selective test execution
 */

class TagManager {
  constructor() {
    this.tagCategories = {
      // Test types
      testTypes: ['@smoke', '@regression', '@sanity', '@integration', '@e2e'],
      
      // Component types
      components: ['@ui', '@api', '@database', '@mobile', '@desktop'],
      
      // Priority levels
      priorities: ['@critical', '@high', '@medium', '@low'],
      
      // Feature areas
      features: ['@login', '@registration', '@checkout', '@payment', '@profile'],
      
      // Browsers
      browsers: ['@chrome', '@firefox', '@safari', '@edge'],
      
      // Environments
      environments: ['@dev', '@qa', '@uat', '@prod'],
      
      // Data types
      dataTypes: ['@data-driven', '@static-data', '@dynamic-data'],
      
      // Execution types
      execution: ['@parallel', '@sequential', '@manual', '@automated'],
      
      // Status
      status: ['@wip', '@ready', '@blocked', '@skip']
    };
    
    this.tagDescriptions = {
      // Test Types
      '@smoke': 'Quick tests to verify basic functionality',
      '@regression': 'Comprehensive tests to ensure no functionality is broken',
      '@sanity': 'Subset of regression tests for quick validation',
      '@integration': 'Tests that verify integration between components',
      '@e2e': 'End-to-end user journey tests',
      
      // Components
      '@ui': 'User interface tests',
      '@api': 'API endpoint tests',
      '@database': 'Database operation tests',
      '@mobile': 'Mobile-specific tests',
      '@desktop': 'Desktop-specific tests',
      
      // Priorities
      '@critical': 'Critical functionality that must work',
      '@high': 'High priority features',
      '@medium': 'Medium priority features',
      '@low': 'Low priority or nice-to-have features',
      
      // Status
      '@wip': 'Work in progress - tests under development',
      '@ready': 'Tests ready for execution',
      '@blocked': 'Tests blocked by dependencies',
      '@skip': 'Tests to be skipped in current run'
    };
  }

  /**
   * Get all available tags by category
   * @param {string} category - Tag category
   * @returns {string[]} Array of tags
   */
  getTagsByCategory(category) {
    return this.tagCategories[category] || [];
  }

  /**
   * Get all available tag categories
   * @returns {string[]} Array of category names
   */
  getCategories() {
    return Object.keys(this.tagCategories);
  }

  /**
   * Get tag description
   * @param {string} tag - Tag name
   * @returns {string} Tag description
   */
  getTagDescription(tag) {
    return this.tagDescriptions[tag] || 'No description available';
  }

  /**
   * Validate tag format
   * @param {string} tag - Tag to validate
   * @returns {boolean} True if valid
   */
  isValidTag(tag) {
    if (!tag.startsWith('@')) {
      return false;
    }
    
    // Check if tag exists in any category
    const allTags = Object.values(this.tagCategories).flat();
    return allTags.includes(tag);
  }

  /**
   * Parse tag expression for Cypress execution
   * @param {string} tagExpression - Tag expression (e.g., "@smoke and @ui")
   * @returns {object} Parsed expression
   */
  parseTagExpression(tagExpression) {
    if (!tagExpression) {
      return { isValid: false, error: 'Empty tag expression' };
    }

    try {
      // Basic validation for tag expression syntax
      const validOperators = ['and', 'or', 'not'];
      const tokens = tagExpression.split(/\s+/);
      
      const tags = tokens.filter(token => token.startsWith('@'));
      const operators = tokens.filter(token => validOperators.includes(token.toLowerCase()));
      
      // Validate all tags
      const invalidTags = tags.filter(tag => !this.isValidTag(tag));
      if (invalidTags.length > 0) {
        return {
          isValid: false,
          error: `Invalid tags: ${invalidTags.join(', ')}`
        };
      }

      return {
        isValid: true,
        tags,
        operators,
        expression: tagExpression
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid tag expression: ${error.message}`
      };
    }
  }

  /**
   * Generate tag combinations for test planning
   * @param {string[]} categories - Categories to combine
   * @returns {string[]} Array of tag combinations
   */
  generateTagCombinations(categories) {
    const combinations = [];
    
    categories.forEach(category => {
      const tags = this.getTagsByCategory(category);
      tags.forEach(tag => {
        combinations.push(tag);
      });
    });
    
    return combinations;
  }

  /**
   * Get recommended tags for a feature
   * @param {string} featureType - Type of feature
   * @returns {string[]} Recommended tags
   */
  getRecommendedTags(featureType) {
    const recommendations = {
      'login': ['@smoke', '@ui', '@critical', '@login'],
      'api': ['@api', '@integration', '@high'],
      'checkout': ['@e2e', '@ui', '@critical', '@checkout'],
      'registration': ['@smoke', '@ui', '@medium', '@registration'],
      'payment': ['@critical', '@ui', '@payment', '@integration']
    };
    
    return recommendations[featureType] || ['@medium', '@ui'];
  }

  /**
   * Create tag report
   * @param {string[]} executedTags - Tags that were executed
   * @returns {object} Tag execution report
   */
  createTagReport(executedTags) {
    const report = {
      totalTags: executedTags.length,
      categories: {},
      coverage: {}
    };
    
    // Categorize executed tags
    Object.keys(this.tagCategories).forEach(category => {
      const categoryTags = this.tagCategories[category];
      const executedInCategory = executedTags.filter(tag => categoryTags.includes(tag));
      
      report.categories[category] = {
        total: categoryTags.length,
        executed: executedInCategory.length,
        tags: executedInCategory,
        coverage: (executedInCategory.length / categoryTags.length * 100).toFixed(2) + '%'
      };
    });
    
    return report;
  }

  /**
   * Suggest tags based on test content
   * @param {string} testContent - Test scenario content
   * @returns {string[]} Suggested tags
   */
  suggestTags(testContent) {
    const suggestions = [];
    const content = testContent.toLowerCase();
    
    // Analyze content for keywords
    const keywordMappings = {
      'login': ['@login', '@ui', '@smoke'],
      'api': ['@api', '@integration'],
      'database': ['@database', '@integration'],
      'payment': ['@payment', '@critical'],
      'checkout': ['@checkout', '@e2e'],
      'registration': ['@registration', '@ui'],
      'critical': ['@critical'],
      'smoke': ['@smoke'],
      'regression': ['@regression']
    };
    
    Object.keys(keywordMappings).forEach(keyword => {
      if (content.includes(keyword)) {
        suggestions.push(...keywordMappings[keyword]);
      }
    });
    
    // Remove duplicates
    return [...new Set(suggestions)];
  }

  /**
   * Validate feature file tags
   * @param {string} featureContent - Feature file content
   * @returns {object} Validation result
   */
  validateFeatureTags(featureContent) {
    const tagRegex = /@[\w-]+/g;
    const foundTags = featureContent.match(tagRegex) || [];
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      foundTags: [...new Set(foundTags)]
    };
    
    // Check for invalid tags
    foundTags.forEach(tag => {
      if (!this.isValidTag(tag)) {
        validation.errors.push(`Invalid tag: ${tag}`);
        validation.isValid = false;
      }
    });
    
    // Check for missing recommended tags
    if (!foundTags.some(tag => this.tagCategories.testTypes.includes(tag))) {
      validation.warnings.push('Consider adding a test type tag (@smoke, @regression, etc.)');
    }
    
    if (!foundTags.some(tag => this.tagCategories.priorities.includes(tag))) {
      validation.warnings.push('Consider adding a priority tag (@critical, @high, etc.)');
    }
    
    return validation;
  }

  /**
   * Get execution command for tags
   * @param {string} tagExpression - Tag expression
   * @param {string} environment - Target environment
   * @returns {string} Cypress command
   */
  getExecutionCommand(tagExpression, environment = 'dev') {
    const baseCommand = 'cypress run';
    const envFlag = `--env environment=${environment}`;
    const tagFlag = tagExpression ? `--env tags="${tagExpression}"` : '';
    
    return [baseCommand, envFlag, tagFlag].filter(Boolean).join(' ');
  }

  /**
   * Export tag configuration
   * @returns {object} Tag configuration for external tools
   */
  exportConfiguration() {
    return {
      categories: this.tagCategories,
      descriptions: this.tagDescriptions,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export singleton instance
const tagManager = new TagManager();

// Make it available globally in Cypress
if (typeof window !== 'undefined') {
  window.tagManager = tagManager;
}

module.exports = tagManager;

