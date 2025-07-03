#!/usr/bin/env node

/**
 * Framework Validation Script
 * Validates that the E2E automation framework is properly set up and configured
 */

const fs = require('fs-extra');
const path = require('path');

class FrameworkValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validations = [];
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('🔍 Validating E2E Automation Framework...\n');

    await this.validateProjectStructure();
    await this.validateDependencies();
    await this.validateConfiguration();
    await this.validateScripts();
    await this.validateExampleTests();
    await this.validateDocumentation();

    this.printResults();
    return this.errors.length === 0;
  }

  /**
   * Validate project structure
   */
  async validateProjectStructure() {
    console.log('📁 Validating project structure...');

    const requiredDirectories = [
      'cypress/e2e/features',
      'cypress/support/step_definitions',
      'cypress/support/pages',
      'cypress/support/utilities',
      'cypress/fixtures/testData',
      'config',
      'scripts',
      'docs',
      'reports'
    ];

    const requiredFiles = [
      'package.json',
      'cypress.config.js',
      '.cypress-cucumber-preprocessorrc.json',
      'cypress/support/e2e.js',
      'cypress/support/commands.js',
      'Jenkinsfile',
      'README.md',
      '.gitignore'
    ];

    // Check directories
    for (const dir of requiredDirectories) {
      if (await fs.pathExists(dir)) {
        this.addValidation(`✅ Directory exists: ${dir}`);
      } else {
        this.addError(`❌ Missing directory: ${dir}`);
      }
    }

    // Check files
    for (const file of requiredFiles) {
      if (await fs.pathExists(file)) {
        this.addValidation(`✅ File exists: ${file}`);
      } else {
        this.addError(`❌ Missing file: ${file}`);
      }
    }
  }

  /**
   * Validate package.json dependencies
   */
  async validateDependencies() {
    console.log('📦 Validating dependencies...');

    try {
      const packageJson = await fs.readJson('package.json');
      
      const requiredDependencies = [
        '@badeball/cypress-cucumber-preprocessor',
        'cypress',
        'cypress-mochawesome-reporter'
      ];

      const requiredDevDependencies = [
        'eslint',
        'mochawesome',
        'multiple-cucumber-html-reporter'
      ];

      // Check dependencies
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };

      for (const dep of [...requiredDependencies, ...requiredDevDependencies]) {
        if (allDeps[dep]) {
          this.addValidation(`✅ Dependency installed: ${dep}`);
        } else {
          this.addError(`❌ Missing dependency: ${dep}`);
        }
      }

      // Check scripts
      const requiredScripts = [
        'cy:open',
        'cy:run',
        'test:smoke',
        'test:regression',
        'report:merge',
        'report:generate'
      ];

      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.addValidation(`✅ Script defined: ${script}`);
        } else {
          this.addError(`❌ Missing script: ${script}`);
        }
      }

    } catch (error) {
      this.addError(`❌ Error reading package.json: ${error.message}`);
    }
  }

  /**
   * Validate configuration files
   */
  async validateConfiguration() {
    console.log('⚙️ Validating configuration...');

    // Check environment configs
    const environments = ['dev', 'qa', 'uat'];
    for (const env of environments) {
      const configPath = `config/${env}.json`;
      if (await fs.pathExists(configPath)) {
        try {
          const config = await fs.readJson(configPath);
          
          // Validate required fields
          const requiredFields = ['baseUrl', 'apiUrl', 'database', 'users'];
          for (const field of requiredFields) {
            if (config[field]) {
              this.addValidation(`✅ ${env} config has ${field}`);
            } else {
              this.addError(`❌ ${env} config missing ${field}`);
            }
          }

          // Validate user configurations
          if (config.users) {
            const requiredUsers = ['admin', 'user'];
            for (const userType of requiredUsers) {
              if (config.users[userType]) {
                this.addValidation(`✅ ${env} config has ${userType} user`);
              } else {
                this.addError(`❌ ${env} config missing ${userType} user`);
              }
            }
          }

        } catch (error) {
          this.addError(`❌ Invalid JSON in ${configPath}: ${error.message}`);
        }
      } else {
        this.addError(`❌ Missing config file: ${configPath}`);
      }
    }

    // Check Cypress config
    if (await fs.pathExists('cypress.config.js')) {
      try {
        const cypressConfig = require(path.resolve('cypress.config.js'));
        if (cypressConfig.e2e) {
          this.addValidation('✅ Cypress e2e configuration found');
        } else {
          this.addError('❌ Cypress e2e configuration missing');
        }
      } catch (error) {
        this.addError(`❌ Error loading cypress.config.js: ${error.message}`);
      }
    }

    // Check Cucumber preprocessor config
    if (await fs.pathExists('.cypress-cucumber-preprocessorrc.json')) {
      try {
        const cucumberConfig = await fs.readJson('.cypress-cucumber-preprocessorrc.json');
        if (cucumberConfig.stepDefinitions) {
          this.addValidation('✅ Cucumber preprocessor configuration found');
        } else {
          this.addError('❌ Cucumber preprocessor stepDefinitions missing');
        }
      } catch (error) {
        this.addError(`❌ Error reading Cucumber config: ${error.message}`);
      }
    }
  }

  /**
   * Validate utility scripts
   */
  async validateScripts() {
    console.log('📜 Validating scripts...');

    const requiredScripts = [
      'scripts/run-tagged-tests.js',
      'scripts/merge-reports.js',
      'scripts/generate-reports.js',
      'scripts/jenkins-setup.sh'
    ];

    for (const script of requiredScripts) {
      if (await fs.pathExists(script)) {
        // Check if script is executable (for shell scripts)
        if (script.endsWith('.sh')) {
          try {
            const stats = await fs.stat(script);
            if (stats.mode & parseInt('111', 8)) {
              this.addValidation(`✅ Script is executable: ${script}`);
            } else {
              this.addWarning(`⚠️ Script not executable: ${script}`);
            }
          } catch (error) {
            this.addWarning(`⚠️ Could not check permissions for: ${script}`);
          }
        } else {
          this.addValidation(`✅ Script exists: ${script}`);
        }
      } else {
        this.addError(`❌ Missing script: ${script}`);
      }
    }
  }

  /**
   * Validate example tests
   */
  async validateExampleTests() {
    console.log('🧪 Validating example tests...');

    const exampleFeatures = [
      'cypress/e2e/features/examples/login.feature',
      'cypress/e2e/features/examples/api-tests.feature'
    ];

    const stepDefinitions = [
      'cypress/support/step_definitions/login_steps.js',
      'cypress/support/step_definitions/api_steps.js'
    ];

    const pageObjects = [
      'cypress/support/pages/BasePage.js',
      'cypress/support/pages/LoginPage.js'
    ];

    const utilities = [
      'cypress/support/utilities/configManager.js',
      'cypress/support/utilities/apiHelper.js',
      'cypress/support/utilities/dbHelper.js',
      'cypress/support/utilities/tagManager.js',
      'cypress/support/utilities/reportManager.js',
      'cypress/support/utilities/testDataGenerator.js'
    ];

    // Check example features
    for (const feature of exampleFeatures) {
      if (await fs.pathExists(feature)) {
        const content = await fs.readFile(feature, 'utf8');
        if (content.includes('Feature:') && content.includes('Scenario:')) {
          this.addValidation(`✅ Valid feature file: ${feature}`);
        } else {
          this.addError(`❌ Invalid feature file format: ${feature}`);
        }
      } else {
        this.addError(`❌ Missing example feature: ${feature}`);
      }
    }

    // Check step definitions
    for (const stepDef of stepDefinitions) {
      if (await fs.pathExists(stepDef)) {
        const content = await fs.readFile(stepDef, 'utf8');
        if (content.includes('Given') || content.includes('When') || content.includes('Then')) {
          this.addValidation(`✅ Valid step definition: ${stepDef}`);
        } else {
          this.addError(`❌ Invalid step definition format: ${stepDef}`);
        }
      } else {
        this.addError(`❌ Missing step definition: ${stepDef}`);
      }
    }

    // Check page objects
    for (const pageObj of pageObjects) {
      if (await fs.pathExists(pageObj)) {
        const content = await fs.readFile(pageObj, 'utf8');
        if (content.includes('class') && content.includes('module.exports')) {
          this.addValidation(`✅ Valid page object: ${pageObj}`);
        } else {
          this.addError(`❌ Invalid page object format: ${pageObj}`);
        }
      } else {
        this.addError(`❌ Missing page object: ${pageObj}`);
      }
    }

    // Check utilities
    for (const utility of utilities) {
      if (await fs.pathExists(utility)) {
        const content = await fs.readFile(utility, 'utf8');
        if (content.includes('class') || content.includes('function')) {
          this.addValidation(`✅ Valid utility: ${utility}`);
        } else {
          this.addError(`❌ Invalid utility format: ${utility}`);
        }
      } else {
        this.addError(`❌ Missing utility: ${utility}`);
      }
    }
  }

  /**
   * Validate documentation
   */
  async validateDocumentation() {
    console.log('📚 Validating documentation...');

    const requiredDocs = [
      'README.md',
      'docs/SETUP.md',
      'docs/USAGE.md'
    ];

    for (const doc of requiredDocs) {
      if (await fs.pathExists(doc)) {
        const content = await fs.readFile(doc, 'utf8');
        if (content.length > 100) { // Basic content check
          this.addValidation(`✅ Documentation exists: ${doc}`);
        } else {
          this.addWarning(`⚠️ Documentation seems incomplete: ${doc}`);
        }
      } else {
        this.addError(`❌ Missing documentation: ${doc}`);
      }
    }

    // Check if README has basic sections
    if (await fs.pathExists('README.md')) {
      const readme = await fs.readFile('README.md', 'utf8');
      const requiredSections = ['Features', 'Installation', 'Usage', 'Configuration'];
      
      for (const section of requiredSections) {
        if (readme.includes(section)) {
          this.addValidation(`✅ README has ${section} section`);
        } else {
          this.addWarning(`⚠️ README missing ${section} section`);
        }
      }
    }
  }

  /**
   * Add validation result
   */
  addValidation(message) {
    this.validations.push(message);
  }

  /**
   * Add error
   */
  addError(message) {
    this.errors.push(message);
  }

  /**
   * Add warning
   */
  addWarning(message) {
    this.warnings.push(message);
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION RESULTS');
    console.log('='.repeat(60));

    console.log(`\n✅ Validations Passed: ${this.validations.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('🎉 FRAMEWORK VALIDATION SUCCESSFUL!');
      console.log('Your E2E automation framework is properly configured.');
      
      if (this.warnings.length > 0) {
        console.log('\nNote: Please review the warnings above for potential improvements.');
      }
      
      console.log('\nNext steps:');
      console.log('1. Install dependencies: npm install');
      console.log('2. Configure environment settings in config/ files');
      console.log('3. Run example tests: npm run test:smoke');
      console.log('4. Review documentation in docs/ folder');
    } else {
      console.log('❌ FRAMEWORK VALIDATION FAILED!');
      console.log('Please fix the errors above before proceeding.');
      console.log('\nFor help, check:');
      console.log('- docs/SETUP.md for setup instructions');
      console.log('- docs/USAGE.md for usage guidelines');
      console.log('- README.md for overview and quick start');
    }
    
    console.log('='.repeat(60));
  }

  /**
   * Generate validation report
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        validations: this.validations.length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        success: this.errors.length === 0
      },
      details: {
        validations: this.validations,
        warnings: this.warnings,
        errors: this.errors
      }
    };

    const reportPath = 'reports/validation-report.json';
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    console.log(`\n📄 Validation report saved: ${reportPath}`);
    return reportPath;
  }
}

// Main execution
async function main() {
  const validator = new FrameworkValidator();
  
  try {
    const success = await validator.validate();
    await validator.generateReport();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FrameworkValidator;

