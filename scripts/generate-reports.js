#!/usr/bin/env node

/**
 * Script to generate various test reports
 * Supports multiple report formats and customization
 */

const reportManager = require('../cypress/support/utilities/reportManager');
const fs = require('fs-extra');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.args = this.parseArguments();
  }

  /**
   * Parse command line arguments
   * @returns {object} Parsed arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    const parsed = {
      format: 'all', // all, html, json, xml, cucumber
      input: 'cypress/reports',
      output: 'reports',
      template: 'default',
      title: 'E2E Test Results',
      environment: process.env.CYPRESS_ENV || 'dev',
      browser: process.env.CYPRESS_BROWSER || 'chrome',
      tags: process.env.CYPRESS_TAGS || 'all',
      merge: true,
      open: false,
      notify: false,
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case '--format':
        case '-f':
          parsed.format = nextArg;
          i++;
          break;
        case '--input':
        case '-i':
          parsed.input = nextArg;
          i++;
          break;
        case '--output':
        case '-o':
          parsed.output = nextArg;
          i++;
          break;
        case '--template':
        case '-t':
          parsed.template = nextArg;
          i++;
          break;
        case '--title':
          parsed.title = nextArg;
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
        case '--tags':
          parsed.tags = nextArg;
          i++;
          break;
        case '--no-merge':
          parsed.merge = false;
          break;
        case '--open':
          parsed.open = true;
          break;
        case '--notify':
        case '-n':
          parsed.notify = true;
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
   * Show help message
   */
  showHelp() {
    console.log(`
Report Generator for E2E Test Framework

Usage: node scripts/generate-reports.js [options]

Options:
  --format, -f <format>   Report format (all, html, json, xml, cucumber) [default: all]
  --input, -i <path>      Input directory for test results [default: cypress/reports]
  --output, -o <path>     Output directory for reports [default: reports]
  --template, -t <name>   Report template (default, minimal, detailed) [default: default]
  --title <title>         Report title [default: E2E Test Results]
  --environment, -e <env> Test environment [default: dev]
  --browser, -b <browser> Browser used for tests [default: chrome]
  --tags <tags>           Test tags executed [default: all]
  --no-merge              Don't merge multiple report files
  --open                  Open generated report in browser
  --notify, -n            Send notification after generation
  --help, -h              Show this help message

Examples:
  # Generate all report formats
  node scripts/generate-reports.js

  # Generate only HTML report
  node scripts/generate-reports.js --format html

  # Generate report with custom title and template
  node scripts/generate-reports.js --title "Regression Tests" --template detailed

  # Generate report and open in browser
  node scripts/generate-reports.js --open

  # Generate report with notification
  node scripts/generate-reports.js --notify

Report Formats:
  - all: Generate all available report formats
  - html: Interactive HTML report with charts and details
  - json: Machine-readable JSON format
  - xml: JUnit XML format for CI/CD integration
  - cucumber: BDD-style Cucumber HTML report

Templates:
  - default: Standard report with all sections
  - minimal: Compact report with essential information
  - detailed: Comprehensive report with extended details
`);
  }

  /**
   * Validate arguments
   */
  validateArguments() {
    if (this.args.help) {
      this.showHelp();
      process.exit(0);
    }

    const validFormats = ['all', 'html', 'json', 'xml', 'cucumber'];
    if (!validFormats.includes(this.args.format)) {
      console.error(`Invalid report format: ${this.args.format}`);
      console.error(`Valid formats: ${validFormats.join(', ')}`);
      process.exit(1);
    }

    const validTemplates = ['default', 'minimal', 'detailed'];
    if (!validTemplates.includes(this.args.template)) {
      console.error(`Invalid template: ${this.args.template}`);
      console.error(`Valid templates: ${validTemplates.join(', ')}`);
      process.exit(1);
    }

    // Check if input directory exists
    if (!fs.existsSync(this.args.input)) {
      console.error(`Input directory not found: ${this.args.input}`);
      process.exit(1);
    }
  }

  /**
   * Collect test results from input directory
   */
  async collectTestResults() {
    console.log('📊 Collecting test results...');
    
    const results = {
      mochawesome: [],
      cucumber: [],
      junit: [],
      screenshots: [],
      videos: []
    };

    try {
      // Collect Mochawesome JSON files
      const mochawesomePattern = path.join(this.args.input, '**/*.json');
      const mochawesomeFiles = await this.findFiles(mochawesomePattern);
      results.mochawesome = mochawesomeFiles.filter(file => 
        !file.includes('cucumber') && !file.includes('junit')
      );

      // Collect Cucumber JSON files
      const cucumberFiles = await this.findFiles(path.join(this.args.input, '**/cucumber*.json'));
      results.cucumber = cucumberFiles;

      // Collect JUnit XML files
      const junitFiles = await this.findFiles(path.join(this.args.input, '**/*.xml'));
      results.junit = junitFiles;

      // Collect screenshots
      const screenshotFiles = await this.findFiles(path.join('cypress/screenshots', '**/*.png'));
      results.screenshots = screenshotFiles;

      // Collect videos
      const videoFiles = await this.findFiles(path.join('cypress/videos', '**/*.mp4'));
      results.videos = videoFiles;

      console.log(`   Mochawesome files: ${results.mochawesome.length}`);
      console.log(`   Cucumber files: ${results.cucumber.length}`);
      console.log(`   JUnit files: ${results.junit.length}`);
      console.log(`   Screenshots: ${results.screenshots.length}`);
      console.log(`   Videos: ${results.videos.length}`);

      return results;
    } catch (error) {
      console.error('❌ Error collecting test results:', error.message);
      throw error;
    }
  }

  /**
   * Find files by pattern
   */
  async findFiles(pattern) {
    const glob = require('glob');
    return new Promise((resolve, reject) => {
      glob(pattern, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport(testResults) {
    console.log('🌐 Generating HTML report...');
    
    try {
      let htmlReportPath = null;

      if (testResults.mochawesome.length > 0) {
        // Merge Mochawesome reports first if needed
        if (this.args.merge && testResults.mochawesome.length > 1) {
          const mergedJsonPath = await reportManager.mergeMochawesomeReports(
            testResults.mochawesome.join(',')
          );
          htmlReportPath = await reportManager.generateHtmlReport(mergedJsonPath);
        } else if (testResults.mochawesome.length === 1) {
          htmlReportPath = await reportManager.generateHtmlReport(testResults.mochawesome[0]);
        }
      }

      if (htmlReportPath) {
        console.log(`✅ HTML report generated: ${htmlReportPath}`);
        return htmlReportPath;
      } else {
        console.log('⚠️  No Mochawesome data found for HTML report');
        return null;
      }
    } catch (error) {
      console.error('❌ Error generating HTML report:', error.message);
      throw error;
    }
  }

  /**
   * Generate JSON report
   */
  async generateJsonReport(testResults) {
    console.log('📄 Generating JSON report...');
    
    try {
      const jsonReportPath = path.join(this.args.output, 'json', 'consolidated-report.json');
      
      const consolidatedData = {
        metadata: {
          title: this.args.title,
          environment: this.args.environment,
          browser: this.args.browser,
          tags: this.args.tags,
          timestamp: new Date().toISOString(),
          generator: 'E2E Automation Framework v1.0.0'
        },
        summary: {
          totalTests: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0
        },
        results: {
          mochawesome: testResults.mochawesome,
          cucumber: testResults.cucumber,
          junit: testResults.junit
        },
        artifacts: {
          screenshots: testResults.screenshots,
          videos: testResults.videos
        }
      };

      // Calculate summary from Mochawesome data if available
      if (testResults.mochawesome.length > 0) {
        for (const file of testResults.mochawesome) {
          try {
            const data = await fs.readJson(file);
            if (data.stats) {
              consolidatedData.summary.totalTests += data.stats.tests || 0;
              consolidatedData.summary.passed += data.stats.passes || 0;
              consolidatedData.summary.failed += data.stats.failures || 0;
              consolidatedData.summary.skipped += data.stats.pending || 0;
              consolidatedData.summary.duration += data.stats.duration || 0;
            }
          } catch (error) {
            console.warn(`Warning: Could not parse ${file}`);
          }
        }
      }

      await fs.ensureDir(path.dirname(jsonReportPath));
      await fs.writeJson(jsonReportPath, consolidatedData, { spaces: 2 });
      
      console.log(`✅ JSON report generated: ${jsonReportPath}`);
      return jsonReportPath;
    } catch (error) {
      console.error('❌ Error generating JSON report:', error.message);
      throw error;
    }
  }

  /**
   * Generate XML report
   */
  async generateXmlReport(testResults) {
    console.log('📋 Generating XML report...');
    
    try {
      if (testResults.junit.length === 0) {
        console.log('⚠️  No JUnit XML data found');
        return null;
      }

      const xmlReportPath = path.join(this.args.output, 'xml', 'consolidated-junit.xml');
      
      // If multiple JUnit files, merge them
      if (testResults.junit.length > 1) {
        const xmlBuilder = require('xmlbuilder');
        const root = xmlBuilder.create('testsuites');
        
        let totalTests = 0;
        let totalFailures = 0;
        let totalErrors = 0;
        let totalTime = 0;

        for (const junitFile of testResults.junit) {
          try {
            const xmlContent = await fs.readFile(junitFile, 'utf8');
            // Parse and merge XML content (simplified)
            // In a real implementation, you'd use a proper XML parser
            console.log(`Processing JUnit file: ${junitFile}`);
          } catch (error) {
            console.warn(`Warning: Could not process ${junitFile}`);
          }
        }

        root.att('name', this.args.title);
        root.att('tests', totalTests);
        root.att('failures', totalFailures);
        root.att('errors', totalErrors);
        root.att('time', totalTime);
        root.att('timestamp', new Date().toISOString());

        const xmlContent = root.end({ pretty: true });
        await fs.ensureDir(path.dirname(xmlReportPath));
        await fs.writeFile(xmlReportPath, xmlContent);
      } else {
        // Single file, just copy it
        await fs.ensureDir(path.dirname(xmlReportPath));
        await fs.copy(testResults.junit[0], xmlReportPath);
      }
      
      console.log(`✅ XML report generated: ${xmlReportPath}`);
      return xmlReportPath;
    } catch (error) {
      console.error('❌ Error generating XML report:', error.message);
      throw error;
    }
  }

  /**
   * Generate Cucumber report
   */
  async generateCucumberReport(testResults) {
    console.log('🥒 Generating Cucumber report...');
    
    try {
      if (testResults.cucumber.length === 0) {
        console.log('⚠️  No Cucumber JSON data found');
        return null;
      }

      const cucumberReportPath = await reportManager.generateCucumberReport(
        testResults.cucumber[0]
      );
      
      console.log(`✅ Cucumber report generated: ${cucumberReportPath}`);
      return cucumberReportPath;
    } catch (error) {
      console.error('❌ Error generating Cucumber report:', error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(generatedReports) {
    console.log('📋 Generating comprehensive report...');
    
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        title: this.args.title,
        environment: this.args.environment,
        browser: this.args.browser,
        tags: this.args.tags,
        template: this.args.template,
        reports: generatedReports
      };

      const summaryPath = await reportManager.generateSummaryReport(reportData);
      
      console.log(`✅ Comprehensive report generated: ${summaryPath}`);
      return summaryPath;
    } catch (error) {
      console.error('❌ Error generating comprehensive report:', error.message);
      throw error;
    }
  }

  /**
   * Open report in browser
   */
  async openReport(reportPath) {
    if (!this.args.open || !reportPath) return;

    try {
      const open = require('open');
      await open(reportPath);
      console.log(`🌐 Opened report in browser: ${reportPath}`);
    } catch (error) {
      console.error('❌ Error opening report:', error.message);
    }
  }

  /**
   * Send notification
   */
  async sendNotification(generatedReports) {
    if (!this.args.notify) return;

    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        environment: this.args.environment,
        browser: this.args.browser,
        tags: this.args.tags,
        reports: generatedReports
      };

      await reportManager.sendReportNotification(reportData, {
        success: true, // This would be determined from actual test results
        reportUrl: process.env.REPORT_URL || 'http://localhost:3000/reports'
      });
      
      console.log('📧 Notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending notification:', error.message);
    }
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🚀 Starting report generation...');
    console.log(`Format: ${this.args.format}`);
    console.log(`Template: ${this.args.template}`);
    console.log(`Environment: ${this.args.environment}`);
    console.log(`Browser: ${this.args.browser}`);
    console.log(`Tags: ${this.args.tags}`);
    console.log('─'.repeat(50));

    const startTime = Date.now();
    const generatedReports = {};

    try {
      // Collect test results
      const testResults = await this.collectTestResults();

      // Generate reports based on format
      if (this.args.format === 'all' || this.args.format === 'html') {
        const htmlReport = await this.generateHtmlReport(testResults);
        if (htmlReport) {
          generatedReports.html = htmlReport;
        }
      }

      if (this.args.format === 'all' || this.args.format === 'json') {
        const jsonReport = await this.generateJsonReport(testResults);
        if (jsonReport) {
          generatedReports.json = jsonReport;
        }
      }

      if (this.args.format === 'all' || this.args.format === 'xml') {
        const xmlReport = await this.generateXmlReport(testResults);
        if (xmlReport) {
          generatedReports.xml = xmlReport;
        }
      }

      if (this.args.format === 'all' || this.args.format === 'cucumber') {
        const cucumberReport = await this.generateCucumberReport(testResults);
        if (cucumberReport) {
          generatedReports.cucumber = cucumberReport;
        }
      }

      // Generate comprehensive report if multiple formats
      if (this.args.format === 'all' && Object.keys(generatedReports).length > 0) {
        const summaryReport = await this.generateComprehensiveReport(generatedReports);
        generatedReports.summary = summaryReport;
      }

      // Open report in browser if requested
      const primaryReport = generatedReports.html || generatedReports.summary;
      await this.openReport(primaryReport);

      // Send notification if requested
      await this.sendNotification(generatedReports);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log('─'.repeat(50));
      console.log(`✅ Report generation completed successfully in ${duration}s`);
      
      if (Object.keys(generatedReports).length === 0) {
        console.log('⚠️  No reports were generated');
        process.exit(1);
      }

      // Display generated report paths
      console.log('\n📁 Generated Reports:');
      Object.entries(generatedReports).forEach(([type, path]) => {
        console.log(`   ${type.toUpperCase()}: ${path}`);
      });

      process.exit(0);
    } catch (error) {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('─'.repeat(50));
      console.error(`❌ Report generation failed after ${duration}s`);
      console.error(`Error: ${error.message}`);
      
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const generator = new ReportGenerator();
  generator.validateArguments();
  generator.run();
}

module.exports = ReportGenerator;

