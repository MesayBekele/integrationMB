#!/usr/bin/env node

/**
 * Simple Report Generator
 * Generates HTML reports from test results
 */

const fs = require('fs-extra');
const path = require('path');

class SimpleReportGenerator {
  constructor() {
    this.reportsDir = 'reports';
    this.tempDir = path.join(this.reportsDir, 'temp');
    this.htmlDir = path.join(this.reportsDir, 'html');
  }

  async generateReports() {
    console.log('📊 Generating Test Reports...\n');

    try {
      // Ensure directories exist
      await fs.ensureDir(this.htmlDir);

      // Check if we have test results
      const hasResults = await this.checkForResults();
      if (!hasResults) {
        console.log('⚠️ No test results found. Run tests first.');
        return;
      }

      // Generate HTML report
      await this.generateHtmlReport();

      console.log('✅ Reports generated successfully!');
      console.log(`📁 Reports location: ${path.resolve(this.htmlDir)}`);
      console.log(`🌐 Open: ${path.resolve(this.htmlDir, 'index.html')}`);

    } catch (error) {
      console.error('❌ Error generating reports:', error.message);
      process.exit(1);
    }
  }

  async checkForResults() {
    // Check for mochawesome results
    const mochawesomePattern = path.join(this.tempDir, 'mochawesome*.json');
    const mochawesomeFiles = await this.findFiles(mochawesomePattern);

    // Check for cucumber results
    const cucumberFile = path.join(this.reportsDir, 'cucumber', 'cucumber-report.json');
    const hasCucumber = await fs.pathExists(cucumberFile);

    return mochawesomeFiles.length > 0 || hasCucumber;
  }

  async findFiles(pattern) {
    try {
      const glob = require('glob');
      return glob.sync(pattern);
    } catch (error) {
      // If glob is not available, check directory manually
      try {
        const files = await fs.readdir(this.tempDir);
        return files.filter(file => file.includes('mochawesome') && file.endsWith('.json'));
      } catch (err) {
        return [];
      }
    }
  }

  async generateHtmlReport() {
    console.log('📄 Generating HTML report...');

    // Try to use mochawesome-merge and mochawesome-report-generator
    try {
      const { execSync } = require('child_process');

      // Merge mochawesome reports
      const mergeCommand = `npx mochawesome-merge "${this.tempDir}/mochawesome*.json" > "${this.reportsDir}/merged-report.json"`;
      execSync(mergeCommand, { stdio: 'pipe' });

      // Generate HTML report
      const generateCommand = `npx mochawesome-report-generator "${this.reportsDir}/merged-report.json" --reportDir "${this.htmlDir}"`;
      execSync(generateCommand, { stdio: 'pipe' });

      console.log('✅ HTML report generated using mochawesome');

    } catch (error) {
      // Fallback to simple HTML generation
      console.log('⚠️ Mochawesome not available, generating simple HTML report...');
      await this.generateSimpleHtmlReport();
    }
  }

  async generateSimpleHtmlReport() {
    const reportData = await this.collectReportData();
    const html = this.generateHtmlContent(reportData);
    
    const reportPath = path.join(this.htmlDir, 'index.html');
    await fs.writeFile(reportPath, html);
    
    console.log('✅ Simple HTML report generated');
  }

  async collectReportData() {
    const data = {
      timestamp: new Date().toISOString(),
      environment: process.env.CYPRESS_ENV || 'dev',
      browser: process.env.CYPRESS_BROWSER || 'chrome',
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      tests: []
    };

    // Try to read mochawesome data
    try {
      const tempFiles = await fs.readdir(this.tempDir);
      const mochawesomeFiles = tempFiles.filter(file => 
        file.includes('mochawesome') && file.endsWith('.json')
      );

      for (const file of mochawesomeFiles) {
        const filePath = path.join(this.tempDir, file);
        const fileData = await fs.readJson(filePath);
        
        if (fileData.stats) {
          data.summary.total += fileData.stats.tests || 0;
          data.summary.passed += fileData.stats.passes || 0;
          data.summary.failed += fileData.stats.failures || 0;
          data.summary.skipped += fileData.stats.skipped || 0;
        }

        if (fileData.tests) {
          data.tests.push(...fileData.tests);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not read mochawesome data');
    }

    return data;
  }

  generateHtmlContent(data) {
    const passRate = data.summary.total > 0 
      ? Math.round((data.summary.passed / data.summary.total) * 100) 
      : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin: 0;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .total { color: #007bff; }
        .details {
            padding: 30px;
        }
        .details h2 {
            margin-top: 0;
            color: #333;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #007bff;
        }
        .info-item strong {
            display: block;
            color: #333;
            margin-bottom: 5px;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
        @media (max-width: 768px) {
            .summary {
                grid-template-columns: repeat(2, 1fr);
            }
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 E2E Test Report</h1>
            <p>Simple Cypress + Cucumber Testing Framework</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number total">${data.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number passed">${data.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number failed">${data.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Skipped</h3>
                <div class="number skipped">${data.summary.skipped}</div>
            </div>
        </div>

        <div class="details">
            <h2>📊 Test Execution Details</h2>
            
            <div class="info-grid">
                <div class="info-item">
                    <strong>Environment</strong>
                    ${data.environment}
                </div>
                <div class="info-item">
                    <strong>Browser</strong>
                    ${data.browser}
                </div>
                <div class="info-item">
                    <strong>Execution Time</strong>
                    ${new Date(data.timestamp).toLocaleString()}
                </div>
                <div class="info-item">
                    <strong>Pass Rate</strong>
                    ${passRate}%
                </div>
            </div>

            <h3>Success Rate</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${passRate}%"></div>
            </div>
            <p style="text-align: center; margin: 10px 0 0 0; color: #666;">
                ${passRate}% of tests passed
            </p>
        </div>

        <div class="footer">
            <p>Generated by Simple E2E Framework • ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  static showHelp() {
    console.log(`
📊 Simple Report Generator

Usage:
  node scripts/generate-reports.js

This script generates HTML reports from your test results.

Requirements:
  - Test results in reports/temp/ directory
  - Mochawesome JSON files or Cucumber JSON files

Output:
  - HTML report in reports/html/index.html

Examples:
  # Generate reports after running tests
  npm run test:smoke
  npm run report:generate
  npm run report:open
`);
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  SimpleReportGenerator.showHelp();
  process.exit(0);
}

// Generate reports
const generator = new SimpleReportGenerator();
generator.generateReports();

