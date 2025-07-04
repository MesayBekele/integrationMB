#!/usr/bin/env node

/**
 * Simple Tagged Test Runner
 * Runs Cypress tests with specific tags and environments
 */

const { execSync } = require('child_process');
const path = require('path');

class SimpleTestRunner {
  constructor() {
    this.args = this.parseArguments();
  }

  parseArguments() {
    const args = {
      tags: '@smoke',
      environment: 'dev',
      browser: 'chrome',
      headless: true,
      spec: null
    };

    // Parse command line arguments
    process.argv.forEach((arg, index) => {
      if (arg === '--tags' && process.argv[index + 1]) {
        args.tags = process.argv[index + 1];
      }
      if (arg === '--env' && process.argv[index + 1]) {
        args.environment = process.argv[index + 1];
      }
      if (arg === '--browser' && process.argv[index + 1]) {
        args.browser = process.argv[index + 1];
      }
      if (arg === '--headed') {
        args.headless = false;
      }
      if (arg === '--spec' && process.argv[index + 1]) {
        args.spec = process.argv[index + 1];
      }
    });

    return args;
  }

  buildCypressCommand() {
    let command = 'npx cypress run';

    // Add browser
    command += ` --browser ${this.args.browser}`;

    // Add headless mode
    if (!this.args.headless) {
      command += ' --headed';
    }

    // Add environment variables
    const envVars = [
      `environment=${this.args.environment}`,
      `tags='${this.args.tags}'`
    ];
    command += ` --env ${envVars.join(',')}`;

    // Add specific spec if provided
    if (this.args.spec) {
      command += ` --spec "${this.args.spec}"`;
    }

    return command;
  }

  run() {
    console.log('🚀 Simple E2E Test Runner');
    console.log('========================');
    console.log(`Environment: ${this.args.environment}`);
    console.log(`Tags: ${this.args.tags}`);
    console.log(`Browser: ${this.args.browser}`);
    console.log(`Headless: ${this.args.headless}`);
    if (this.args.spec) {
      console.log(`Spec: ${this.args.spec}`);
    }
    console.log('========================\n');

    const command = this.buildCypressCommand();
    console.log(`Executing: ${command}\n`);

    try {
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('\n✅ Tests completed successfully!');
    } catch (error) {
      console.log('\n❌ Tests failed!');
      process.exit(1);
    }
  }

  static showHelp() {
    console.log(`
🚀 Simple E2E Test Runner

Usage:
  node scripts/run-tagged-tests.js [options]

Options:
  --tags <tags>        Test tags to run (default: @smoke)
  --env <environment>  Environment to test (default: dev)
  --browser <browser>  Browser to use (default: chrome)
  --headed            Run in headed mode (default: headless)
  --spec <spec>       Specific spec file to run
  --help              Show this help message

Examples:
  # Run smoke tests in dev environment
  node scripts/run-tagged-tests.js --tags "@smoke" --env dev

  # Run regression tests in QA with Firefox
  node scripts/run-tagged-tests.js --tags "@regression" --env qa --browser firefox

  # Run UI tests in headed mode
  node scripts/run-tagged-tests.js --tags "@ui" --headed

  # Run specific feature file
  node scripts/run-tagged-tests.js --spec "cypress/e2e/features/examples/login.feature"

Available Tags:
  @smoke      - Quick smoke tests
  @regression - Full regression tests
  @ui         - UI-focused tests
  @critical   - Critical functionality tests
  @mobile     - Mobile-specific tests

Available Environments:
  dev  - Development environment
  qa   - QA environment
  uat  - UAT environment

Available Browsers:
  chrome   - Google Chrome
  firefox  - Mozilla Firefox
  edge     - Microsoft Edge
  electron - Electron (default Cypress browser)
`);
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  SimpleTestRunner.showHelp();
  process.exit(0);
}

// Run the tests
const runner = new SimpleTestRunner();
runner.run();

