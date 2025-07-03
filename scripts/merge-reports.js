#!/usr/bin/env node

/**
 * Script to merge multiple test reports
 * Supports Mochawesome and Cucumber report merging
 */

const reportManager = require('../cypress/support/utilities/reportManager');
const fs = require('fs-extra');
const path = require('path');

class ReportMerger {
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
      type: 'all', // all, mochawesome, cucumber
      input: 'cypress/reports/temp',
      output: 'reports',
      clean: false,
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case '--type':
        case '-t':
          parsed.type = nextArg;
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
        case '--clean':
        case '-c':
          parsed.clean = true;
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
Report Merger for E2E Test Framework

Usage: node scripts/merge-reports.js [options]

Options:
  --type, -t <type>       Report type to merge (all, mochawesome, cucumber) [default: all]
  --input, -i <path>      Input directory for reports [default: cypress/reports/temp]
  --output, -o <path>     Output directory for merged reports [default: reports]
  --clean, -c             Clean old reports before merging
  --help, -h              Show this help message

Examples:
  # Merge all report types
  node scripts/merge-reports.js

  # Merge only Mochawesome reports
  node scripts/merge-reports.js --type mochawesome

  # Merge reports with custom input/output paths
  node scripts/merge-reports.js --input custom/input --output custom/output

  # Clean old reports before merging
  node scripts/merge-reports.js --clean

Report Types:
  - all: Merge all available report types
  - mochawesome: Merge Mochawesome JSON reports into single HTML report
  - cucumber: Merge Cucumber JSON reports into single HTML report
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

    const validTypes = ['all', 'mochawesome', 'cucumber'];
    if (!validTypes.includes(this.args.type)) {
      console.error(`Invalid report type: ${this.args.type}`);
      console.error(`Valid types: ${validTypes.join(', ')}`);
      process.exit(1);
    }

    // Check if input directory exists
    if (!fs.existsSync(this.args.input)) {
      console.error(`Input directory not found: ${this.args.input}`);
      process.exit(1);
    }
  }

  /**
   * Clean old reports
   */
  async cleanOldReports() {
    if (!this.args.clean) return;

    console.log('🧹 Cleaning old reports...');
    try {
      reportManager.cleanOldReports(0); // Clean all reports
      console.log('✅ Old reports cleaned successfully');
    } catch (error) {
      console.error('❌ Error cleaning old reports:', error.message);
    }
  }

  /**
   * Merge Mochawesome reports
   */
  async mergeMochawesomeReports() {
    console.log('📊 Merging Mochawesome reports...');
    
    try {
      const pattern = path.join(this.args.input, '*.json');
      const mergedJsonPath = await reportManager.mergeMochawesomeReports(pattern);
      
      if (!mergedJsonPath) {
        console.log('⚠️  No Mochawesome reports found to merge');
        return null;
      }

      console.log('📄 Generating HTML report from merged JSON...');
      const htmlReportPath = await reportManager.generateHtmlReport(mergedJsonPath);
      
      console.log('✅ Mochawesome reports merged successfully');
      console.log(`   JSON: ${mergedJsonPath}`);
      console.log(`   HTML: ${htmlReportPath}`);
      
      return { json: mergedJsonPath, html: htmlReportPath };
    } catch (error) {
      console.error('❌ Error merging Mochawesome reports:', error.message);
      throw error;
    }
  }

  /**
   * Merge Cucumber reports
   */
  async mergeCucumberReports() {
    console.log('🥒 Merging Cucumber reports...');
    
    try {
      const cucumberJsonPath = path.join('reports', 'cucumber', 'cucumber-report.json');
      
      if (!fs.existsSync(cucumberJsonPath)) {
        console.log('⚠️  No Cucumber reports found to merge');
        return null;
      }

      const htmlReportPath = await reportManager.generateCucumberReport(cucumberJsonPath);
      
      console.log('✅ Cucumber reports merged successfully');
      console.log(`   JSON: ${cucumberJsonPath}`);
      console.log(`   HTML: ${htmlReportPath}`);
      
      return { json: cucumberJsonPath, html: htmlReportPath };
    } catch (error) {
      console.error('❌ Error merging Cucumber reports:', error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(mergedReports) {
    console.log('📋 Generating comprehensive report...');
    
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        environment: process.env.CYPRESS_ENV || 'dev',
        browser: process.env.CYPRESS_BROWSER || 'chrome',
        tags: process.env.CYPRESS_TAGS || 'all',
        reports: mergedReports
      };

      const summaryPath = await reportManager.generateSummaryReport(reportData);
      
      console.log('✅ Comprehensive report generated successfully');
      console.log(`   Summary: ${summaryPath}`);
      
      return summaryPath;
    } catch (error) {
      console.error('❌ Error generating comprehensive report:', error.message);
      throw error;
    }
  }

  /**
   * Get report statistics
   */
  async getReportStatistics() {
    try {
      const stats = await reportManager.getReportStatistics();
      
      console.log('\n📈 Report Statistics:');
      console.log(`   Total Reports: ${stats.totalReports}`);
      console.log(`   HTML Reports: ${stats.reportsByType.html || 0}`);
      console.log(`   JSON Reports: ${stats.reportsByType.json || 0}`);
      console.log(`   XML Reports: ${stats.reportsByType.xml || 0}`);
      console.log(`   Cucumber Reports: ${stats.reportsByType.cucumber || 0}`);
      console.log(`   Disk Usage: ${(stats.diskUsage / 1024 / 1024).toFixed(2)} MB`);
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting report statistics:', error.message);
    }
  }

  /**
   * Send notification about merged reports
   */
  async sendNotification(mergedReports) {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        environment: process.env.CYPRESS_ENV || 'dev',
        browser: process.env.CYPRESS_BROWSER || 'chrome',
        tags: process.env.CYPRESS_TAGS || 'all',
        reports: mergedReports
      };

      const hasFailures = false; // This would be determined from actual report data
      
      await reportManager.sendReportNotification(reportData, {
        success: !hasFailures,
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
    console.log('🚀 Starting report merge process...');
    console.log(`Type: ${this.args.type}`);
    console.log(`Input: ${this.args.input}`);
    console.log(`Output: ${this.args.output}`);
    console.log('─'.repeat(50));

    const startTime = Date.now();
    const mergedReports = {};

    try {
      // Clean old reports if requested
      await this.cleanOldReports();

      // Merge reports based on type
      if (this.args.type === 'all' || this.args.type === 'mochawesome') {
        const mochawesomeResult = await this.mergeMochawesomeReports();
        if (mochawesomeResult) {
          mergedReports.mochawesome = mochawesomeResult;
        }
      }

      if (this.args.type === 'all' || this.args.type === 'cucumber') {
        const cucumberResult = await this.mergeCucumberReports();
        if (cucumberResult) {
          mergedReports.cucumber = cucumberResult;
        }
      }

      // Generate comprehensive report if merging all types
      if (this.args.type === 'all' && Object.keys(mergedReports).length > 0) {
        const summaryPath = await this.generateComprehensiveReport(mergedReports);
        mergedReports.summary = summaryPath;
      }

      // Get and display statistics
      await this.getReportStatistics();

      // Send notification if configured
      if (Object.keys(mergedReports).length > 0) {
        await this.sendNotification(mergedReports);
      }

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log('─'.repeat(50));
      console.log(`✅ Report merge completed successfully in ${duration}s`);
      
      if (Object.keys(mergedReports).length === 0) {
        console.log('⚠️  No reports were found to merge');
        process.exit(1);
      }

      // Display merged report paths
      console.log('\n📁 Merged Reports:');
      Object.entries(mergedReports).forEach(([type, paths]) => {
        if (typeof paths === 'object' && paths.html) {
          console.log(`   ${type.toUpperCase()}: ${paths.html}`);
        } else if (typeof paths === 'string') {
          console.log(`   ${type.toUpperCase()}: ${paths}`);
        }
      });

      process.exit(0);
    } catch (error) {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('─'.repeat(50));
      console.error(`❌ Report merge failed after ${duration}s`);
      console.error(`Error: ${error.message}`);
      
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const merger = new ReportMerger();
  merger.validateArguments();
  merger.run();
}

module.exports = ReportMerger;

