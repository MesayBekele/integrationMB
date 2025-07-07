const report = require('multiple-cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

// Configuration for report generation
const reportOptions = {
  jsonDir: 'reports/json',
  reportPath: 'reports/html',
  metadata: {
    browser: {
      name: 'chrome',
      version: '120'
    },
    device: 'Local test machine',
    platform: {
      name: 'ubuntu',
      version: '20.04'
    }
  },
  customData: {
    title: 'E2E Test Results',
    data: [
      { label: 'Project', value: 'E2E Automation Framework' },
      { label: 'Release', value: process.env.BUILD_NUMBER || '1.0.0' },
      { label: 'Cycle', value: process.env.ENVIRONMENT || 'dev' },
      { label: 'Execution Start Time', value: new Date().toISOString() }
    ]
  }
};

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generate HTML report from JSON files
function generateReport() {
  try {
    ensureDirectoryExists(reportOptions.jsonDir);
    ensureDirectoryExists(reportOptions.reportPath);
    
    // Check if JSON files exist
    const jsonFiles = fs.readdirSync(reportOptions.jsonDir).filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('No JSON report files found. Skipping report generation.');
      return;
    }
    
    console.log(`Found ${jsonFiles.length} JSON report files. Generating HTML report...`);
    
    // Generate the report
    report.generate(reportOptions);
    
    console.log('HTML report generated successfully!');
    console.log(`Report location: ${path.resolve(reportOptions.reportPath)}/index.html`);
    
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

// Merge multiple JSON reports into one
function mergeJsonReports() {
  try {
    const jsonDir = reportOptions.jsonDir;
    const jsonFiles = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length <= 1) {
      console.log('No multiple JSON files to merge.');
      return;
    }
    
    console.log(`Merging ${jsonFiles.length} JSON report files...`);
    
    let mergedReport = [];
    
    jsonFiles.forEach(file => {
      const filePath = path.join(jsonDir, file);
      const reportData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (Array.isArray(reportData)) {
        mergedReport = mergedReport.concat(reportData);
      } else {
        mergedReport.push(reportData);
      }
    });
    
    // Write merged report
    const mergedFilePath = path.join(jsonDir, 'merged-report.json');
    fs.writeFileSync(mergedFilePath, JSON.stringify(mergedReport, null, 2));
    
    console.log(`Merged report saved to: ${mergedFilePath}`);
    
  } catch (error) {
    console.error('Error merging JSON reports:', error);
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'merge':
      mergeJsonReports();
      break;
    case 'generate':
      generateReport();
      break;
    case 'all':
      mergeJsonReports();
      generateReport();
      break;
    default:
      console.log('Usage: node merge-reports.js [merge|generate|all]');
      console.log('  merge    - Merge multiple JSON reports');
      console.log('  generate - Generate HTML report from JSON');
      console.log('  all      - Merge and generate (default)');
      generateReport();
  }
}

module.exports = {
  generateReport,
  mergeJsonReports,
  reportOptions
};

