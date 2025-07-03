#!/usr/bin/env node

/**
 * Script to run Cypress tests with specific tags
 * Usage: node scripts/run-tagged-tests.js --tags "@smoke and @ui" --env dev
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TaggedTestRunner {
  constructor() {
    this.args = this.parseArguments();
    this.validateArguments();
  }

  /**
   * Parse command line arguments
   * @returns {object} Parsed arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    const parsed = {
      tags: '',
      environment: 'dev',
      browser: 'chrome',
      headless: true,
      parallel: false,
      record: false,
      spec: '',
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case '--tags':
        case '-t':
          parsed.tags = nextArg;
          i++;
          break;
        case '--environment':
        case '--env':
        case '-e':
          parsed.environment = nextArg;
          i++;
          break;
        case '--browser':
        case '-b':
          parsed.browser = nextArg;
          i++;
          break;
        case '--headed':
          parsed.headless = false;
          break;
        case '--headless':
          parsed.headless = true;
          break;
        case '--parallel':
        case '-p':
          parsed.parallel = true;
          break;
        case '--record':
        case '-r':
          parsed.record = true;
          break;
        case '--spec':
        case '-s':
          parsed.spec = nextArg;
          i++;
          break;
        case '--help':
        case '-h':
          parsed.help = true;
          break;
        default:
          if (arg.startsWith('--')) {
            console.warn(`Unknown argument: ${arg}`);
          }
          break;
      }
    }

    return parsed;
  }

  /**
   * Validate arguments
   */
  validateArguments() {
    if (this.args.help) {
      this.showHelp();
      process.exit(0);
    }

    // Validate environment
    const validEnvironments = ['dev', 'qa', 'uat'];
    if (!validEnvironments.includes(this.args.environment)) {
      console.error(`Invalid environment: ${this.args.environment}`);
      console.error(`Valid environments: ${validEnvironments.join(', ')}`);
      process.exit(1);
    }

    // Validate browser
    const validBrowsers = ['chrome', 'firefox', 'edge', 'electron'];
    if (!validBrowsers.includes(this.args.browser)) {
      console.error(`Invalid browser: ${this.args.browser}`);
      console.error(`Valid browsers: ${validBrowsers.join(', ')}`);
      process.exit(1);
    }

    // Check if environment config exists
    const configPath = path.join(process.cwd(), 'config', `${this.args.environment}.json`);
    if (!fs.existsSync(configPath)) {
      console.error(`Environment configuration not found: ${configPath}`);
      process.exit(1);
    }
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log(`
Tagged Test Runner for Cypress

Usage: node scripts/run-tagged-tests.js [options]

Options:
  --tags, -t <expression>     Tag expression to filter tests (e.g., "@smoke and @ui")
  --environment, --env, -e    Target environment (dev, qa, uat) [default: dev]
  --browser, -b <browser>     Browser to use (chrome, firefox, edge, electron) [default: chrome]
  --headed                    Run tests in headed mode
  --headless                  Run tests in headless mode [default]
  --parallel, -p              Run tests in parallel
  --record, -r                Record tests to Cypress Dashboard
  --spec, -s <pattern>        Spec file pattern to run
  --help, -h                  Show this help message

Examples:
  # Run smoke tests in dev environment
  node scripts/run-tagged-tests.js --tags "@smoke" --env dev

  # Run UI tests in QA environment with Firefox
  node scripts/run-tagged-tests.js --tags "@ui" --env qa --browser firefox

  # Run critical tests in headed mode
  node scripts/run-tagged-tests.js --tags "@critical" --headed

  # Run regression tests in parallel
  node scripts/run-tagged-tests.js --tags "@regression" --parallel

  # Run specific feature tests
  node scripts/run-tagged-tests.js --tags "@login and @smoke"

Tag Categories:
  Test Types: @smoke, @regression, @sanity, @integration, @e2e
  Components: @ui, @api, @database, @mobile, @desktop
  Priorities: @critical, @high, @medium, @low
  Features: @login, @registration, @checkout, @payment, @profile
  Status: @wip, @ready, @blocked, @skip

Tag Expressions:
  - Use 'and' for intersection: "@smoke and @ui"
  - Use 'or' for union: "@smoke or @regression"
  - Use 'not' for exclusion: "@regression and not @wip"
  - Use parentheses for grouping: "(@smoke or @sanity) and @ui"
`);
  }

  /**
   * Build Cypress command
   * @returns {object} Command and arguments
   */
  buildCommand() {
    const command = 'npx';
    const args = ['cypress', 'run'];

    // Environment
    args.push('--env', `environment=${this.args.environment}`);

    // Tags
    if (this.args.tags) {
      args.push('--env', `tags=${this.args.tags}`);
    }

    // Browser
    args.push('--browser', this.args.browser);

    // Headless/headed
    if (!this.args.headless) {
      args.push('--headed');
    }

    // Parallel execution
    if (this.args.parallel) {
      args.push('--parallel');
    }

    // Recording
    if (this.args.record) {
      args.push('--record');
    }

    // Spec pattern
    if (this.args.spec) {
      args.push('--spec', this.args.spec);
    }

    return { command, args };
  }

  /**
   * Run the tests
   */
  async run() {
    console.log('🚀 Starting tagged test execution...');
    console.log(`Environment: ${this.args.environment}`);
    console.log(`Browser: ${this.args.browser}`);
    console.log(`Tags: ${this.args.tags || 'All tests'}`);
    console.log(`Mode: ${this.args.headless ? 'Headless' : 'Headed'}`);
    
    if (this.args.parallel) {
      console.log('Parallel execution: Enabled');
    }
    
    console.log('─'.repeat(50));

    const { command, args } = this.buildCommand();
    
    console.log(`Executing: ${command} ${args.join(' ')}`);
    console.log('─'.repeat(50));

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('─'.repeat(50));
        console.log(`Test execution completed in ${duration}s`);
        
        if (code === 0) {
          console.log('✅ All tests passed!');
          resolve(code);
        } else {
          console.log(`❌ Tests failed with exit code: ${code}`);
          reject(new Error(`Tests failed with exit code: ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error('❌ Failed to start test execution:', error.message);
        reject(error);
      });
    });
  }

  /**
   * Generate test execution report
   */
  generateReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      environment: this.args.environment,
      browser: this.args.browser,
      tags: this.args.tags,
      parallel: this.args.parallel,
      headless: this.args.headless
    };

    const reportPath = path.join(process.cwd(), 'reports', 'execution-report.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📊 Execution report saved: ${reportPath}`);
  }
}

// Main execution
if (require.main === module) {
  const runner = new TaggedTestRunner();
  
  runner.run()
    .then(() => {
      runner.generateReport();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test execution failed:', error.message);
      runner.generateReport();
      process.exit(1);
    });
}

module.exports = TaggedTestRunner;

