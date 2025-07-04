#!/usr/bin/env node

/**
 * Enhanced Report Generator
 * Generates a single comprehensive HTML report combining Cypress and Cucumber results
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class EnhancedReportGenerator {
  constructor() {
    this.reportsDir = 'reports';
    this.tempDir = path.join(this.reportsDir, 'temp');
    this.htmlDir = path.join(this.reportsDir, 'html');
    this.cucumberDir = path.join(this.reportsDir, 'cucumber');
  }

  async generateReports() {
    console.log('📊 Generating Comprehensive Test Report...\n');

    try {
      // Ensure directories exist
      await fs.ensureDir(this.htmlDir);
      await fs.ensureDir(this.tempDir);
      await fs.ensureDir(this.cucumberDir);

      // Check if we have test results
      const hasResults = await this.checkForResults();
      if (!hasResults) {
        console.log('⚠️ No test results found. Run tests first.');
        console.log('💡 Try: npm run test:smoke');
        return;
      }

      // Generate comprehensive HTML report
      await this.generateComprehensiveReport();

      console.log('✅ Comprehensive report generated successfully!');
      console.log(`📁 Reports location: ${path.resolve(this.htmlDir)}`);
      console.log(`🌐 Open: ${path.resolve(this.htmlDir, 'index.html')}`);
      console.log('\n💡 Use: npm run report:open');

    } catch (error) {
      console.error('❌ Error generating reports:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  async checkForResults() {
    // Check for mochawesome results
    const mochawesomeFiles = glob.sync(path.join(this.tempDir, 'mochawesome*.json'));
    
    // Check for cucumber results
    const cucumberFile = path.join(this.cucumberDir, 'cucumber-report.json');
    const hasCucumber = await fs.pathExists(cucumberFile);

    // Check for screenshots
    const screenshotsDir = 'cypress/screenshots';
    const hasScreenshots = await fs.pathExists(screenshotsDir);

    // Check for videos
    const videosDir = 'cypress/videos';
    const hasVideos = await fs.pathExists(videosDir);

    console.log(`📊 Found ${mochawesomeFiles.length} Mochawesome files`);
    console.log(`🥒 Cucumber report: ${hasCucumber ? '✅' : '❌'}`);
    console.log(`📸 Screenshots: ${hasScreenshots ? '✅' : '❌'}`);
    console.log(`🎥 Videos: ${hasVideos ? '✅' : '❌'}\n`);

    return mochawesomeFiles.length > 0 || hasCucumber;
  }

  async generateComprehensiveReport() {
    console.log('📄 Generating comprehensive HTML report...');

    // Collect all test data
    const reportData = await this.collectAllReportData();
    
    // Generate merged mochawesome report if available
    await this.generateMochawesomeReport();
    
    // Generate cucumber report if available
    await this.generateCucumberReport();
    
    // Generate main comprehensive report
    const html = this.generateComprehensiveHtmlContent(reportData);
    const reportPath = path.join(this.htmlDir, 'index.html');
    await fs.writeFile(reportPath, html);
    
    // Copy assets
    await this.copyAssets();
    
    console.log('✅ Comprehensive HTML report generated');
  }

  async generateMochawesomeReport() {
    try {
      const { execSync } = require('child_process');
      const mochawesomeFiles = glob.sync(path.join(this.tempDir, 'mochawesome*.json'));
      
      if (mochawesomeFiles.length > 0) {
        console.log('📊 Merging Mochawesome reports...');
        
        // Merge mochawesome reports
        const mergeCommand = `npx mochawesome-merge "${this.tempDir}/mochawesome*.json" > "${this.reportsDir}/merged-mochawesome.json"`;
        execSync(mergeCommand, { stdio: 'pipe' });

        // Generate HTML report
        const generateCommand = `npx mochawesome-report-generator "${this.reportsDir}/merged-mochawesome.json" --reportDir "${this.htmlDir}/mochawesome"`;
        execSync(generateCommand, { stdio: 'pipe' });

        console.log('✅ Mochawesome report generated');
      }
    } catch (error) {
      console.log('⚠️ Could not generate Mochawesome report:', error.message);
    }
  }

  async generateCucumberReport() {
    try {
      const cucumberFile = path.join(this.cucumberDir, 'cucumber-report.json');
      
      if (await fs.pathExists(cucumberFile)) {
        console.log('🥒 Generating Cucumber report...');
        
        const { generate } = require('multiple-cucumber-html-reporter');
        
        generate({
          jsonDir: this.cucumberDir,
          reportPath: path.join(this.htmlDir, 'cucumber'),
          metadata: {
            browser: {
              name: process.env.CYPRESS_BROWSER || 'chrome',
              version: 'latest'
            },
            device: 'Local test machine',
            platform: {
              name: process.platform,
              version: 'latest'
            }
          },
          customData: {
            title: 'E2E Test Execution Report',
            data: [
              { label: 'Project', value: 'Simple E2E Framework' },
              { label: 'Environment', value: process.env.CYPRESS_ENV || 'dev' },
              { label: 'Execution Date', value: new Date().toLocaleString() }
            ]
          }
        });

        console.log('✅ Cucumber report generated');
      }
    } catch (error) {
      console.log('⚠️ Could not generate Cucumber report:', error.message);
    }
  }

  async collectAllReportData() {
    const data = {
      timestamp: new Date().toISOString(),
      environment: process.env.CYPRESS_ENV || 'dev',
      browser: process.env.CYPRESS_BROWSER || 'chrome',
      tags: process.env.CYPRESS_TAGS || '@smoke',
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      features: [],
      tests: [],
      screenshots: [],
      videos: []
    };

    // Collect Mochawesome data
    await this.collectMochawesomeData(data);
    
    // Collect Cucumber data
    await this.collectCucumberData(data);
    
    // Collect media files
    await this.collectMediaFiles(data);

    return data;
  }

  async collectMochawesomeData(data) {
    try {
      const mochawesomeFiles = glob.sync(path.join(this.tempDir, 'mochawesome*.json'));
      
      for (const file of mochawesomeFiles) {
        const fileData = await fs.readJson(file);
        
        if (fileData.stats) {
          data.summary.total += fileData.stats.tests || 0;
          data.summary.passed += fileData.stats.passes || 0;
          data.summary.failed += fileData.stats.failures || 0;
          data.summary.skipped += fileData.stats.skipped || 0;
          data.summary.duration += fileData.stats.duration || 0;
        }

        if (fileData.tests) {
          data.tests.push(...fileData.tests);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not collect Mochawesome data:', error.message);
    }
  }

  async collectCucumberData(data) {
    try {
      const cucumberFile = path.join(this.cucumberDir, 'cucumber-report.json');
      
      if (await fs.pathExists(cucumberFile)) {
        const cucumberData = await fs.readJson(cucumberFile);
        
        if (Array.isArray(cucumberData)) {
          data.features = cucumberData;
          
          // Calculate cucumber stats
          let cucumberStats = { total: 0, passed: 0, failed: 0, skipped: 0 };
          
          cucumberData.forEach(feature => {
            if (feature.elements) {
              feature.elements.forEach(scenario => {
                if (scenario.steps) {
                  cucumberStats.total++;
                  const hasFailedStep = scenario.steps.some(step => 
                    step.result && step.result.status === 'failed'
                  );
                  const hasSkippedStep = scenario.steps.some(step => 
                    step.result && step.result.status === 'skipped'
                  );
                  
                  if (hasFailedStep) {
                    cucumberStats.failed++;
                  } else if (hasSkippedStep) {
                    cucumberStats.skipped++;
                  } else {
                    cucumberStats.passed++;
                  }
                }
              });
            }
          });
          
          // Add to summary
          data.summary.total += cucumberStats.total;
          data.summary.passed += cucumberStats.passed;
          data.summary.failed += cucumberStats.failed;
          data.summary.skipped += cucumberStats.skipped;
        }
      }
    } catch (error) {
      console.log('⚠️ Could not collect Cucumber data:', error.message);
    }
  }

  async collectMediaFiles(data) {
    try {
      // Collect screenshots
      const screenshotsDir = 'cypress/screenshots';
      if (await fs.pathExists(screenshotsDir)) {
        const screenshots = glob.sync(path.join(screenshotsDir, '**/*.png'));
        data.screenshots = screenshots.map(file => ({
          name: path.basename(file),
          path: path.relative('.', file),
          size: (await fs.stat(file)).size
        }));
      }

      // Collect videos
      const videosDir = 'cypress/videos';
      if (await fs.pathExists(videosDir)) {
        const videos = glob.sync(path.join(videosDir, '**/*.mp4'));
        data.videos = videos.map(file => ({
          name: path.basename(file),
          path: path.relative('.', file),
          size: (await fs.stat(file)).size
        }));
      }
    } catch (error) {
      console.log('⚠️ Could not collect media files:', error.message);
    }
  }

  async copyAssets() {
    try {
      // Copy screenshots to report directory
      const screenshotsDir = 'cypress/screenshots';
      if (await fs.pathExists(screenshotsDir)) {
        await fs.copy(screenshotsDir, path.join(this.htmlDir, 'screenshots'));
      }

      // Copy videos to report directory
      const videosDir = 'cypress/videos';
      if (await fs.pathExists(videosDir)) {
        await fs.copy(videosDir, path.join(this.htmlDir, 'videos'));
      }
    } catch (error) {
      console.log('⚠️ Could not copy assets:', error.message);
    }
  }

  generateComprehensiveHtmlContent(data) {
    const passRate = data.summary.total > 0 
      ? Math.round((data.summary.passed / data.summary.total) * 100) 
      : 0;

    const duration = data.summary.duration > 0 
      ? `${Math.round(data.summary.duration / 1000)}s`
      : 'N/A';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Report - Comprehensive</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .nav-tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .nav-tab {
            flex: 1;
            padding: 15px 20px;
            text-align: center;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #666;
            transition: all 0.3s ease;
        }
        
        .nav-tab.active {
            background: white;
            color: #007bff;
            border-bottom: 3px solid #007bff;
        }
        
        .nav-tab:hover {
            background: #e9ecef;
        }
        
        .tab-content {
            display: none;
            padding: 30px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 4px solid #007bff;
        }
        
        .summary-card.passed { border-left-color: #28a745; }
        .summary-card.failed { border-left-color: #dc3545; }
        .summary-card.skipped { border-left-color: #ffc107; }
        
        .summary-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .summary-card.total .number { color: #007bff; }
        .summary-card.passed .number { color: #28a745; }
        .summary-card.failed .number { color: #dc3545; }
        .summary-card.skipped .number { color: #ffc107; }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        
        .info-card h4 {
            color: #333;
            margin-bottom: 10px;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-card p {
            font-size: 1.1em;
            font-weight: 500;
        }
        
        .progress-section {
            margin: 30px 0;
        }
        
        .progress-bar {
            width: 100%;
            height: 25px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 15px 0;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.8s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .report-card {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .report-card-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .report-card-body {
            padding: 20px;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #0056b3;
        }
        
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .media-item {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .media-item img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
        
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
            .info-grid { grid-template-columns: 1fr; }
            .nav-tab { padding: 10px; font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 E2E Test Report</h1>
            <p>Comprehensive Cypress + Cucumber Testing Results</p>
        </div>

        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('overview')">📊 Overview</button>
            <button class="nav-tab" onclick="showTab('reports')">📋 Detailed Reports</button>
            <button class="nav-tab" onclick="showTab('media')">📸 Media</button>
        </div>

        <div id="overview" class="tab-content active">
            <div class="summary-grid">
                <div class="summary-card total">
                    <h3>Total Tests</h3>
                    <div class="number">${data.summary.total}</div>
                </div>
                <div class="summary-card passed">
                    <h3>Passed</h3>
                    <div class="number">${data.summary.passed}</div>
                </div>
                <div class="summary-card failed">
                    <h3>Failed</h3>
                    <div class="number">${data.summary.failed}</div>
                </div>
                <div class="summary-card skipped">
                    <h3>Skipped</h3>
                    <div class="number">${data.summary.skipped}</div>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h4>Environment</h4>
                    <p>${data.environment}</p>
                </div>
                <div class="info-card">
                    <h4>Browser</h4>
                    <p>${data.browser}</p>
                </div>
                <div class="info-card">
                    <h4>Tags</h4>
                    <p>${data.tags}</p>
                </div>
                <div class="info-card">
                    <h4>Duration</h4>
                    <p>${duration}</p>
                </div>
                <div class="info-card">
                    <h4>Execution Time</h4>
                    <p>${new Date(data.timestamp).toLocaleString()}</p>
                </div>
                <div class="info-card">
                    <h4>Pass Rate</h4>
                    <p>${passRate}%</p>
                </div>
            </div>

            <div class="progress-section">
                <h3>Success Rate</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${passRate}%">
                        ${passRate}%
                    </div>
                </div>
                <p style="text-align: center; color: #666; margin-top: 10px;">
                    ${data.summary.passed} out of ${data.summary.total} tests passed
                </p>
            </div>
        </div>

        <div id="reports" class="tab-content">
            <h2>📋 Detailed Test Reports</h2>
            <p>Access detailed reports for different aspects of your test execution:</p>
            
            <div class="reports-grid">
                <div class="report-card">
                    <div class="report-card-header">
                        <h3>🧪 Mochawesome Report</h3>
                    </div>
                    <div class="report-card-body">
                        <p>Detailed Cypress test execution report with screenshots and test details.</p>
                        <a href="mochawesome/mochawesome.html" class="btn" target="_blank">View Mochawesome Report</a>
                    </div>
                </div>
                
                <div class="report-card">
                    <div class="report-card-header">
                        <h3>🥒 Cucumber Report</h3>
                    </div>
                    <div class="report-card-body">
                        <p>BDD feature execution report with scenario details and step results.</p>
                        <a href="cucumber/index.html" class="btn" target="_blank">View Cucumber Report</a>
                    </div>
                </div>
            </div>
        </div>

        <div id="media" class="tab-content">
            <h2>📸 Test Media</h2>
            
            <h3>Screenshots (${data.screenshots.length})</h3>
            <div class="media-grid">
                ${data.screenshots.map(screenshot => `
                    <div class="media-item">
                        <img src="screenshots/${screenshot.name}" alt="${screenshot.name}" onclick="window.open('screenshots/${screenshot.name}', '_blank')">
                        <p><strong>${screenshot.name}</strong></p>
                        <small>${(screenshot.size / 1024).toFixed(1)} KB</small>
                    </div>
                `).join('')}
            </div>
            
            <h3 style="margin-top: 30px;">Videos (${data.videos.length})</h3>
            <div class="media-grid">
                ${data.videos.map(video => `
                    <div class="media-item">
                        <video width="100%" controls>
                            <source src="videos/${video.name}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <p><strong>${video.name}</strong></p>
                        <small>${(video.size / 1024 / 1024).toFixed(1)} MB</small>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="footer">
            <p>Generated by Simple E2E Framework • ${new Date().toLocaleString()}</p>
            <p>Framework Version: 1.0.0 • Report Generated: ${new Date(data.timestamp).toLocaleString()}</p>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Remove active class from all tabs
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }
        
        // Auto-refresh progress bar animation
        window.addEventListener('load', function() {
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                const width = progressFill.style.width;
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.width = width;
                }, 500);
            }
        });
    </script>
</body>
</html>`;
  }

  static showHelp() {
    console.log(`
📊 Enhanced Report Generator

Usage:
  node scripts/generate-reports.js

Features:
  ✅ Single comprehensive HTML report
  ✅ Combines Cypress + Cucumber results
  ✅ Interactive tabs (Overview, Reports, Media)
  ✅ Screenshots and videos integration
  ✅ Detailed test statistics
  ✅ Mobile-responsive design

Output:
  - reports/html/index.html (Main comprehensive report)
  - reports/html/mochawesome/ (Detailed Cypress report)
  - reports/html/cucumber/ (Detailed Cucumber report)
  - reports/html/screenshots/ (Test screenshots)
  - reports/html/videos/ (Test videos)

Examples:
  # Run tests and generate report
  npm run test:smoke:report
  npm run test:regression:report
  
  # Generate report from existing results
  npm run report:generate
  
  # Open report in browser
  npm run report:open
`);
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  EnhancedReportGenerator.showHelp();
  process.exit(0);
}

// Generate reports
const generator = new EnhancedReportGenerator();
generator.generateReports();

