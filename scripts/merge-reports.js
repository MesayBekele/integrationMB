const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function mergeReports() {
  try {
    console.log('🔄 Starting Mochawesome report merge process...');
    
    // Define paths
    const reportsDir = 'cypress/reports/mochawesome';
    const outputDir = 'cypress/reports';
    const mergedReportPath = path.join(outputDir, 'merged-report.json');
    const htmlReportPath = path.join(outputDir, 'merged-report.html');
    
    // Ensure output directory exists
    await fs.ensureDir(outputDir);
    
    // Check if reports directory exists
    if (!fs.existsSync(reportsDir)) {
      console.log('❌ No reports directory found. Skipping merge.');
      return;
    }
    
    // Get all JSON report files using glob pattern
    const reportPattern = path.join(reportsDir, '**/*.json');
    const reportFiles = glob.sync(reportPattern);
    
    if (reportFiles.length === 0) {
      console.log('❌ No JSON report files found. Skipping merge.');
      return;
    }
    
    console.log(`📊 Found ${reportFiles.length} report files to merge:`);
    reportFiles.forEach(file => console.log(`   - ${path.relative(process.cwd(), file)}`));
    
    // Merge JSON reports
    console.log('🔄 Merging JSON reports...');
    const mergedReport = await merge({
      files: reportFiles
    });
    
    // Save merged JSON report
    await fs.writeJson(mergedReportPath, mergedReport, { spaces: 2 });
    console.log(`✅ Merged JSON report saved: ${mergedReportPath}`);
    
    // Generate HTML report from merged JSON
    console.log('🔄 Generating HTML report...');
    await generator.create(mergedReport, {
      reportDir: outputDir,
      reportFilename: 'merged-report',
      reportTitle: 'E2E Test Results - Cypress 11 + Mochawesome',
      reportPageTitle: 'Cypress E2E Test Results',
      inline: true,
      charts: true,
      enableCharts: true,
      code: true,
      autoOpen: false,
      overwrite: true,
      timestamp: 'isoDateTime',
      showPassed: true,
      showFailed: true,
      showPending: true,
      showSkipped: true,
      showHooks: 'failed',
      saveJson: false,
      saveHtml: true,
      dev: false,
      assetsDir: path.join(outputDir, 'assets')
    });
    
    console.log(`✅ HTML report generated: ${htmlReportPath}`);
    
    // Clean up individual report files (optional)
    if (process.env.CLEANUP_INDIVIDUAL_REPORTS === 'true') {
      console.log('🧹 Cleaning up individual report files...');
      await fs.remove(reportsDir);
      console.log('✅ Individual report files cleaned up');
    }
    
    console.log('🎉 Report merge completed successfully!');
    
    // Print detailed summary
    const stats = mergedReport.stats;
    console.log('\n📈 Test Execution Summary:');
    console.log('═'.repeat(50));
    console.log(`   📊 Total Tests: ${stats.tests}`);
    console.log(`   ✅ Passed: ${stats.passes} (${((stats.passes / stats.tests) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${stats.failures} (${((stats.failures / stats.tests) * 100).toFixed(1)}%)`);
    console.log(`   ⏳ Pending: ${stats.pending}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ⏱️  Duration: ${(stats.duration / 1000).toFixed(2)}s`);
    console.log(`   📅 Start Time: ${new Date(stats.start).toLocaleString()}`);
    console.log(`   📅 End Time: ${new Date(stats.end).toLocaleString()}`);
    console.log('═'.repeat(50));
    
    // Print suite breakdown
    if (mergedReport.results && mergedReport.results.length > 0) {
      console.log('\n📋 Test Suite Breakdown:');
      mergedReport.results.forEach(result => {
        if (result.suites && result.suites.length > 0) {
          result.suites.forEach(suite => {
            const suiteStats = suite.stats || {};
            console.log(`   📁 ${suite.title}: ${suiteStats.passes || 0} passed, ${suiteStats.failures || 0} failed`);
          });
        }
      });
    }
    
    return {
      success: true,
      mergedReportPath,
      htmlReportPath,
      stats
    };
    
  } catch (error) {
    console.error('❌ Error merging reports:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Utility function to clean old reports
async function cleanOldReports() {
  try {
    const reportsDir = 'cypress/reports';
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();
    
    if (fs.existsSync(reportsDir)) {
      const files = await fs.readdir(reportsDir);
      
      for (const file of files) {
        const filePath = path.join(reportsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
          console.log(`🗑️  Removed old report: ${file}`);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not clean old reports:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  mergeReports();
}

module.exports = { 
  mergeReports,
  cleanOldReports
};

