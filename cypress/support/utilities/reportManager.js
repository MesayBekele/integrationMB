const fs = require('fs-extra');
const path = require('path');
const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

/**
 * Report Manager for handling test reports
 * Supports multiple report formats and merging
 */
class ReportManager {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.tempDir = path.join(this.reportsDir, 'temp');
    this.htmlDir = path.join(this.reportsDir, 'html');
    this.jsonDir = path.join(this.reportsDir, 'json');
    this.xmlDir = path.join(this.reportsDir, 'xml');
    this.cucumberDir = path.join(this.reportsDir, 'cucumber');
    
    this.ensureDirectories();
  }

  /**
   * Ensure all report directories exist
   */
  ensureDirectories() {
    const directories = [
      this.reportsDir,
      this.tempDir,
      this.htmlDir,
      this.jsonDir,
      this.xmlDir,
      this.cucumberDir
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Clean old reports
   * @param {number} daysOld - Days old to clean (default: 7)
   */
  cleanOldReports(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const cleanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          if (stats.isDirectory()) {
            fs.removeSync(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
          console.log(`Cleaned old report: ${filePath}`);
        }
      });
    };

    [this.htmlDir, this.jsonDir, this.xmlDir, this.cucumberDir].forEach(cleanDirectory);
  }

  /**
   * Merge Mochawesome JSON reports
   * @param {string} pattern - File pattern to merge
   * @returns {Promise} Merge result
   */
  async mergeMochawesomeReports(pattern = 'cypress/reports/temp/*.json') {
    try {
      const reportFiles = await this.findReportFiles(pattern);
      
      if (reportFiles.length === 0) {
        console.log('No Mochawesome reports found to merge');
        return null;
      }

      console.log(`Merging ${reportFiles.length} Mochawesome reports...`);
      
      const mergedReport = await merge({
        files: reportFiles,
        inline: false
      });

      const mergedReportPath = path.join(this.jsonDir, 'merged-report.json');
      await fs.writeJson(mergedReportPath, mergedReport, { spaces: 2 });
      
      console.log(`Merged report saved: ${mergedReportPath}`);
      return mergedReportPath;
    } catch (error) {
      console.error('Error merging Mochawesome reports:', error);
      throw error;
    }
  }

  /**
   * Generate HTML report from merged JSON
   * @param {string} jsonReportPath - Path to merged JSON report
   * @returns {Promise} Generation result
   */
  async generateHtmlReport(jsonReportPath) {
    try {
      if (!fs.existsSync(jsonReportPath)) {
        throw new Error(`JSON report not found: ${jsonReportPath}`);
      }

      console.log('Generating HTML report...');
      
      const options = {
        reportDir: this.htmlDir,
        reportFilename: 'index.html',
        reportTitle: 'E2E Test Results',
        reportPageTitle: 'Cypress E2E Test Report',
        inline: false,
        charts: true,
        code: true,
        autoOpen: false,
        overwrite: true,
        timestamp: true,
        showPassed: true,
        showFailed: true,
        showPending: true,
        showSkipped: true,
        showHooks: 'failed',
        saveJson: true,
        dev: false
      };

      await generator.create(jsonReportPath, options);
      
      const htmlReportPath = path.join(this.htmlDir, 'index.html');
      console.log(`HTML report generated: ${htmlReportPath}`);
      
      return htmlReportPath;
    } catch (error) {
      console.error('Error generating HTML report:', error);
      throw error;
    }
  }

  /**
   * Generate Cucumber HTML report
   * @param {string} jsonReportPath - Path to Cucumber JSON report
   * @returns {Promise} Generation result
   */
  async generateCucumberReport(jsonReportPath) {
    try {
      const reporter = require('multiple-cucumber-html-reporter');
      
      const options = {
        jsonDir: this.cucumberDir,
        reportPath: this.cucumberDir,
        reportName: 'Cucumber Test Report',
        pageTitle: 'E2E Cucumber Test Results',
        displayDuration: true,
        displayReportTime: true,
        metadata: {
          browser: {
            name: 'chrome',
            version: 'latest'
          },
          device: 'Local test machine',
          platform: {
            name: process.platform,
            version: process.version
          }
        },
        customData: {
          title: 'Run Info',
          data: [
            { label: 'Project', value: 'E2E Automation Framework' },
            { label: 'Release', value: '1.0.0' },
            { label: 'Cycle', value: 'Regression' },
            { label: 'Execution Start Time', value: new Date().toISOString() },
            { label: 'Execution End Time', value: new Date().toISOString() }
          ]
        }
      };

      reporter.generate(options);
      
      const cucumberReportPath = path.join(this.cucumberDir, 'index.html');
      console.log(`Cucumber report generated: ${cucumberReportPath}`);
      
      return cucumberReportPath;
    } catch (error) {
      console.error('Error generating Cucumber report:', error);
      throw error;
    }
  }

  /**
   * Generate JUnit XML report
   * @param {object} testResults - Test results data
   * @returns {Promise} Generation result
   */
  async generateJUnitReport(testResults) {
    try {
      const xmlBuilder = require('xmlbuilder');
      
      const root = xmlBuilder.create('testsuites');
      root.att('name', 'E2E Tests');
      root.att('tests', testResults.stats.tests);
      root.att('failures', testResults.stats.failures);
      root.att('errors', testResults.stats.failures);
      root.att('time', testResults.stats.duration / 1000);
      root.att('timestamp', new Date().toISOString());

      testResults.suites.forEach(suite => {
        const testSuite = root.ele('testsuite');
        testSuite.att('name', suite.title);
        testSuite.att('tests', suite.tests.length);
        testSuite.att('failures', suite.failures);
        testSuite.att('errors', suite.failures);
        testSuite.att('time', suite.duration / 1000);

        suite.tests.forEach(test => {
          const testCase = testSuite.ele('testcase');
          testCase.att('name', test.title);
          testCase.att('classname', suite.title);
          testCase.att('time', test.duration / 1000);

          if (test.state === 'failed') {
            const failure = testCase.ele('failure');
            failure.att('message', test.err.message);
            failure.txt(test.err.stack);
          }

          if (test.state === 'pending') {
            testCase.ele('skipped');
          }
        });
      });

      const xmlContent = root.end({ pretty: true });
      const xmlReportPath = path.join(this.xmlDir, 'junit-report.xml');
      
      await fs.writeFile(xmlReportPath, xmlContent);
      console.log(`JUnit XML report generated: ${xmlReportPath}`);
      
      return xmlReportPath;
    } catch (error) {
      console.error('Error generating JUnit report:', error);
      throw error;
    }
  }

  /**
   * Find report files by pattern
   * @param {string} pattern - File pattern
   * @returns {Promise<string[]>} Array of file paths
   */
  async findReportFiles(pattern) {
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
   * Generate comprehensive test report
   * @param {object} options - Report generation options
   * @returns {Promise} Generation result
   */
  async generateComprehensiveReport(options = {}) {
    try {
      console.log('Starting comprehensive report generation...');
      
      const reportData = {
        timestamp: new Date().toISOString(),
        environment: options.environment || 'dev',
        browser: options.browser || 'chrome',
        tags: options.tags || 'all',
        reports: {}
      };

      // Merge Mochawesome reports
      const mergedJsonPath = await this.mergeMochawesomeReports();
      if (mergedJsonPath) {
        reportData.reports.mochawesome = {
          json: mergedJsonPath,
          html: await this.generateHtmlReport(mergedJsonPath)
        };
      }

      // Generate Cucumber report if JSON exists
      const cucumberJsonPath = path.join(this.cucumberDir, 'cucumber-report.json');
      if (fs.existsSync(cucumberJsonPath)) {
        reportData.reports.cucumber = {
          json: cucumberJsonPath,
          html: await this.generateCucumberReport(cucumberJsonPath)
        };
      }

      // Generate summary report
      const summaryPath = await this.generateSummaryReport(reportData);
      reportData.reports.summary = summaryPath;

      // Save report metadata
      const metadataPath = path.join(this.reportsDir, 'report-metadata.json');
      await fs.writeJson(metadataPath, reportData, { spaces: 2 });

      console.log('Comprehensive report generation completed');
      return reportData;
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      throw error;
    }
  }

  /**
   * Generate summary report
   * @param {object} reportData - Report data
   * @returns {Promise<string>} Summary report path
   */
  async generateSummaryReport(reportData) {
    try {
      const summaryHtml = this.createSummaryHtml(reportData);
      const summaryPath = path.join(this.htmlDir, 'summary.html');
      
      await fs.writeFile(summaryPath, summaryHtml);
      console.log(`Summary report generated: ${summaryPath}`);
      
      return summaryPath;
    } catch (error) {
      console.error('Error generating summary report:', error);
      throw error;
    }
  }

  /**
   * Create summary HTML content
   * @param {object} reportData - Report data
   * @returns {string} HTML content
   */
  createSummaryHtml(reportData) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .header .timestamp { color: #666; font-size: 14px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .info-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
        .info-card h3 { margin: 0 0 10px 0; color: #333; font-size: 16px; }
        .info-card p { margin: 0; color: #666; font-size: 14px; }
        .reports-section { margin-top: 30px; }
        .reports-section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .report-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px; }
        .report-link { display: block; padding: 15px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; text-align: center; transition: background-color 0.3s; }
        .report-link:hover { background: #0056b3; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>E2E Test Execution Summary</h1>
            <div class="timestamp">Generated on: ${new Date(reportData.timestamp).toLocaleString()}</div>
        </div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>Environment</h3>
                <p>${reportData.environment.toUpperCase()}</p>
            </div>
            <div class="info-card">
                <h3>Browser</h3>
                <p>${reportData.browser}</p>
            </div>
            <div class="info-card">
                <h3>Tags</h3>
                <p>${reportData.tags}</p>
            </div>
            <div class="info-card">
                <h3>Execution Time</h3>
                <p>${new Date(reportData.timestamp).toLocaleTimeString()}</p>
            </div>
        </div>
        
        <div class="reports-section">
            <h2>Available Reports</h2>
            <div class="report-links">
                ${reportData.reports.mochawesome ? `<a href="index.html" class="report-link">📊 Mochawesome Report</a>` : ''}
                ${reportData.reports.cucumber ? `<a href="../cucumber/index.html" class="report-link">🥒 Cucumber Report</a>` : ''}
                <a href="../json/" class="report-link">📄 JSON Reports</a>
                <a href="../xml/" class="report-link">📋 XML Reports</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by E2E Automation Framework v1.0.0</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Archive old reports
   * @param {number} daysOld - Days old to archive
   * @returns {Promise} Archive result
   */
  async archiveOldReports(daysOld = 30) {
    try {
      const archiveDir = path.join(this.reportsDir, 'archive');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const archiveTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = path.join(archiveDir, `reports-${archiveTimestamp}.zip`);

      // This would use a zip library to archive old reports
      console.log(`Reports would be archived to: ${archivePath}`);
      
      return archivePath;
    } catch (error) {
      console.error('Error archiving reports:', error);
      throw error;
    }
  }

  /**
   * Send report notification
   * @param {object} reportData - Report data
   * @param {object} options - Notification options
   * @returns {Promise} Notification result
   */
  async sendReportNotification(reportData, options = {}) {
    try {
      const configManager = require('./configManager');
      const slackConfig = configManager.getIntegrationConfig('slack');
      
      if (!slackConfig.enabled || !slackConfig.webhook) {
        console.log('Slack notifications not configured');
        return;
      }

      const message = {
        text: `E2E Test Results - ${reportData.environment.toUpperCase()}`,
        attachments: [
          {
            color: options.success ? 'good' : 'danger',
            fields: [
              {
                title: 'Environment',
                value: reportData.environment,
                short: true
              },
              {
                title: 'Browser',
                value: reportData.browser,
                short: true
              },
              {
                title: 'Tags',
                value: reportData.tags,
                short: true
              },
              {
                title: 'Execution Time',
                value: new Date(reportData.timestamp).toLocaleString(),
                short: true
              }
            ],
            actions: [
              {
                type: 'button',
                text: 'View Report',
                url: options.reportUrl || '#'
              }
            ]
          }
        ]
      };

      // This would send the notification to Slack
      console.log('Slack notification would be sent:', JSON.stringify(message, null, 2));
      
    } catch (error) {
      console.error('Error sending report notification:', error);
    }
  }

  /**
   * Get report statistics
   * @returns {Promise<object>} Report statistics
   */
  async getReportStatistics() {
    try {
      const stats = {
        totalReports: 0,
        reportsByType: {},
        diskUsage: 0,
        oldestReport: null,
        newestReport: null
      };

      const reportTypes = ['html', 'json', 'xml', 'cucumber'];
      
      for (const type of reportTypes) {
        const typeDir = path.join(this.reportsDir, type);
        if (fs.existsSync(typeDir)) {
          const files = fs.readdirSync(typeDir);
          stats.reportsByType[type] = files.length;
          stats.totalReports += files.length;
        }
      }

      // Calculate disk usage (simplified)
      const calculateDirSize = (dirPath) => {
        let size = 0;
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              size += stat.size;
            } else if (stat.isDirectory()) {
              size += calculateDirSize(filePath);
            }
          });
        }
        return size;
      };

      stats.diskUsage = calculateDirSize(this.reportsDir);
      
      return stats;
    } catch (error) {
      console.error('Error getting report statistics:', error);
      return {};
    }
  }
}

// Export singleton instance
const reportManager = new ReportManager();

module.exports = reportManager;

