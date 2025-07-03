pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'qa', 'uat'],
            description: 'Target environment for test execution'
        )
        choice(
            name: 'BROWSER',
            choices: ['chrome', 'firefox', 'edge', 'electron'],
            description: 'Browser for test execution'
        )
        string(
            name: 'TAGS',
            defaultValue: '@smoke',
            description: 'Test tags to execute (e.g., "@smoke", "@regression", "@smoke and @ui")'
        )
        booleanParam(
            name: 'PARALLEL_EXECUTION',
            defaultValue: false,
            description: 'Enable parallel test execution'
        )
        booleanParam(
            name: 'HEADLESS_MODE',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
        choice(
            name: 'REPORT_FORMAT',
            choices: ['all', 'html', 'json', 'xml', 'cucumber'],
            description: 'Report format to generate'
        )
        booleanParam(
            name: 'SEND_NOTIFICATIONS',
            defaultValue: true,
            description: 'Send Slack notifications'
        )
        booleanParam(
            name: 'CLEANUP_WORKSPACE',
            defaultValue: true,
            description: 'Clean workspace after execution'
        )
    }
    
    environment {
        // Node.js version
        NODE_VERSION = '18'
        
        // Cypress environment variables
        CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
        CYPRESS_ENV = "${params.ENVIRONMENT}"
        CYPRESS_BROWSER = "${params.BROWSER}"
        CYPRESS_TAGS = "${params.TAGS}"
        
        // Report configuration
        REPORT_FORMAT = "${params.REPORT_FORMAT}"
        REPORT_URL = "${BUILD_URL}artifact/reports/html/index.html"
        
        // Notification settings
        SLACK_WEBHOOK = credentials('slack-webhook-url')
        
        // Database credentials (if needed)
        DB_HOST = credentials("${params.ENVIRONMENT}-db-host")
        DB_USER = credentials("${params.ENVIRONMENT}-db-user")
        DB_PASSWORD = credentials("${params.ENVIRONMENT}-db-password")
        
        // Application URLs
        BASE_URL = credentials("${params.ENVIRONMENT}-base-url")
        API_URL = credentials("${params.ENVIRONMENT}-api-url")
    }
    
    options {
        // Keep builds for 30 days
        buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '50'))
        
        // Timeout for entire pipeline
        timeout(time: 2, unit: 'HOURS')
        
        // Retry on failure
        retry(1)
        
        // Timestamps in console output
        timestamps()
        
        // ANSI color output
        ansiColor('xterm')
    }
    
    stages {
        stage('🚀 Pipeline Initialization') {
            steps {
                script {
                    // Display build information
                    echo "🔧 Build Information:"
                    echo "   Environment: ${params.ENVIRONMENT}"
                    echo "   Browser: ${params.BROWSER}"
                    echo "   Tags: ${params.TAGS}"
                    echo "   Parallel: ${params.PARALLEL_EXECUTION}"
                    echo "   Headless: ${params.HEADLESS_MODE}"
                    echo "   Report Format: ${params.REPORT_FORMAT}"
                    echo "   Build Number: ${BUILD_NUMBER}"
                    echo "   Build URL: ${BUILD_URL}"
                    
                    // Set build description
                    currentBuild.description = "${params.ENVIRONMENT} | ${params.BROWSER} | ${params.TAGS}"
                    
                    // Send start notification
                    if (params.SEND_NOTIFICATIONS) {
                        sendSlackNotification('started')
                    }
                }
            }
        }
        
        stage('📦 Environment Setup') {
            parallel {
                stage('Node.js Setup') {
                    steps {
                        script {
                            // Install Node.js
                            sh '''
                                echo "📦 Setting up Node.js environment..."
                                node --version
                                npm --version
                                
                                # Clean npm cache
                                npm cache clean --force
                                
                                # Install dependencies
                                echo "📥 Installing dependencies..."
                                npm ci --silent
                                
                                # Verify Cypress installation
                                echo "🔍 Verifying Cypress installation..."
                                npx cypress verify
                                npx cypress info
                            '''
                        }
                    }
                }
                
                stage('Environment Validation') {
                    steps {
                        script {
                            sh '''
                                echo "🔍 Validating environment configuration..."
                                
                                # Check if environment config exists
                                if [ ! -f "config/${CYPRESS_ENV}.json" ]; then
                                    echo "❌ Environment configuration not found: config/${CYPRESS_ENV}.json"
                                    exit 1
                                fi
                                
                                # Validate configuration
                                node -e "
                                    const config = require('./config/${CYPRESS_ENV}.json');
                                    console.log('✅ Environment configuration validated');
                                    console.log('   Base URL:', config.baseUrl);
                                    console.log('   API URL:', config.apiUrl);
                                "
                                
                                # Check network connectivity
                                echo "🌐 Checking network connectivity..."
                                curl -f -s -o /dev/null ${BASE_URL} || echo "⚠️ Warning: Could not reach base URL"
                                curl -f -s -o /dev/null ${API_URL}/health || echo "⚠️ Warning: Could not reach API health endpoint"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('🧹 Pre-Test Cleanup') {
            steps {
                script {
                    sh '''
                        echo "🧹 Cleaning up previous test artifacts..."
                        
                        # Remove old reports
                        rm -rf reports/* || true
                        rm -rf cypress/screenshots/* || true
                        rm -rf cypress/videos/* || true
                        
                        # Create report directories
                        mkdir -p reports/{html,json,xml,cucumber,temp}
                        
                        echo "✅ Cleanup completed"
                    '''
                }
            }
        }
        
        stage('🧪 Test Execution') {
            steps {
                script {
                    try {
                        def cypressCommand = buildCypressCommand()
                        
                        echo "🚀 Executing tests with command: ${cypressCommand}"
                        
                        sh """
                            echo "🧪 Starting test execution..."
                            ${cypressCommand}
                        """
                        
                        // Mark build as successful if tests pass
                        currentBuild.result = 'SUCCESS'
                        
                    } catch (Exception e) {
                        // Mark build as unstable if tests fail (not failed)
                        currentBuild.result = 'UNSTABLE'
                        echo "⚠️ Tests failed but continuing pipeline for reporting"
                        echo "Error: ${e.getMessage()}"
                    }
                }
            }
            post {
                always {
                    script {
                        // Archive test artifacts
                        archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
                        archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
                        archiveArtifacts artifacts: 'reports/temp/**/*.json', allowEmptyArchive: true
                    }
                }
            }
        }
        
        stage('📊 Report Generation') {
            steps {
                script {
                    sh '''
                        echo "📊 Generating test reports..."
                        
                        # Merge reports
                        echo "🔄 Merging test reports..."
                        node scripts/merge-reports.js --type all --clean
                        
                        # Generate comprehensive reports
                        echo "📋 Generating comprehensive reports..."
                        node scripts/generate-reports.js \\
                            --format ${REPORT_FORMAT} \\
                            --environment ${CYPRESS_ENV} \\
                            --browser ${CYPRESS_BROWSER} \\
                            --tags "${CYPRESS_TAGS}" \\
                            --title "E2E Test Results - Build #${BUILD_NUMBER}"
                        
                        echo "✅ Report generation completed"
                    '''
                }
            }
            post {
                always {
                    script {
                        // Archive reports
                        archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
                        
                        // Publish HTML reports
                        publishHTML([
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'reports/html',
                            reportFiles: 'index.html',
                            reportName: 'E2E Test Report',
                            reportTitles: 'E2E Test Results'
                        ])
                        
                        // Publish JUnit results if available
                        if (fileExists('reports/xml/junit-report.xml')) {
                            junit 'reports/xml/junit-report.xml'
                        }
                    }
                }
            }
        }
        
        stage('📈 Test Analysis') {
            steps {
                script {
                    sh '''
                        echo "📈 Analyzing test results..."
                        
                        # Generate test statistics
                        node -e "
                            const fs = require('fs');
                            const path = require('path');
                            
                            try {
                                const reportPath = 'reports/json/consolidated-report.json';
                                if (fs.existsSync(reportPath)) {
                                    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
                                    const summary = report.summary;
                                    
                                    console.log('📊 Test Execution Summary:');
                                    console.log('   Total Tests:', summary.totalTests);
                                    console.log('   Passed:', summary.passed);
                                    console.log('   Failed:', summary.failed);
                                    console.log('   Skipped:', summary.skipped);
                                    console.log('   Duration:', Math.round(summary.duration / 1000) + 's');
                                    console.log('   Success Rate:', Math.round((summary.passed / summary.totalTests) * 100) + '%');
                                    
                                    // Set environment variables for notifications
                                    process.env.TEST_TOTAL = summary.totalTests;
                                    process.env.TEST_PASSED = summary.passed;
                                    process.env.TEST_FAILED = summary.failed;
                                    process.env.TEST_SKIPPED = summary.skipped;
                                    process.env.TEST_DURATION = Math.round(summary.duration / 1000);
                                    process.env.SUCCESS_RATE = Math.round((summary.passed / summary.totalTests) * 100);
                                } else {
                                    console.log('⚠️ No consolidated report found');
                                }
                            } catch (error) {
                                console.log('❌ Error analyzing test results:', error.message);
                            }
                        "
                        
                        echo "✅ Test analysis completed"
                    '''
                }
            }
        }
        
        stage('🔄 Post-Test Actions') {
            parallel {
                stage('Database Cleanup') {
                    when {
                        expression { params.ENVIRONMENT != 'prod' }
                    }
                    steps {
                        script {
                            sh '''
                                echo "🗄️ Cleaning up test data..."
                                
                                # Run database cleanup script
                                node -e "
                                    const dbHelper = require('./cypress/support/utilities/dbHelper');
                                    
                                    Promise.all([
                                        dbHelper.cleanupTestUsers(),
                                        dbHelper.cleanupTestProducts(),
                                        dbHelper.cleanupTestOrders()
                                    ]).then(() => {
                                        console.log('✅ Database cleanup completed');
                                    }).catch(error => {
                                        console.log('⚠️ Database cleanup warning:', error.message);
                                    });
                                "
                            '''
                        }
                    }
                }
                
                stage('Artifact Management') {
                    steps {
                        script {
                            sh '''
                                echo "📦 Managing build artifacts..."
                                
                                # Compress large artifacts
                                if [ -d "cypress/videos" ] && [ "$(ls -A cypress/videos)" ]; then
                                    echo "🗜️ Compressing video files..."
                                    tar -czf reports/videos-${BUILD_NUMBER}.tar.gz cypress/videos/
                                fi
                                
                                # Generate artifact manifest
                                echo "📋 Generating artifact manifest..."
                                find reports -type f -name "*.html" -o -name "*.json" -o -name "*.xml" > reports/artifact-manifest.txt
                                
                                echo "✅ Artifact management completed"
                            '''
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Send final notification
                if (params.SEND_NOTIFICATIONS) {
                    sendSlackNotification('completed')
                }
                
                // Clean workspace if requested
                if (params.CLEANUP_WORKSPACE) {
                    cleanWs(
                        cleanWhenAborted: true,
                        cleanWhenFailure: true,
                        cleanWhenNotBuilt: true,
                        cleanWhenSuccess: true,
                        cleanWhenUnstable: true,
                        deleteDirs: true
                    )
                }
            }
        }
        
        success {
            script {
                echo "✅ Pipeline completed successfully!"
                currentBuild.description += " | ✅ SUCCESS"
            }
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline completed with test failures"
                currentBuild.description += " | ⚠️ UNSTABLE"
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed"
                currentBuild.description += " | ❌ FAILED"
                
                // Send failure notification
                if (params.SEND_NOTIFICATIONS) {
                    sendSlackNotification('failed')
                }
            }
        }
        
        aborted {
            script {
                echo "🛑 Pipeline was aborted"
                currentBuild.description += " | 🛑 ABORTED"
            }
        }
    }
}

// Helper function to build Cypress command
def buildCypressCommand() {
    def command = "npx cypress run"
    
    // Environment
    command += " --env environment=${params.ENVIRONMENT}"
    
    // Tags
    if (params.TAGS && params.TAGS.trim() != '') {
        command += ",tags='${params.TAGS}'"
    }
    
    // Browser
    command += " --browser ${params.BROWSER}"
    
    // Headless mode
    if (params.HEADLESS_MODE) {
        command += " --headless"
    }
    
    // Parallel execution
    if (params.PARALLEL_EXECUTION) {
        command += " --parallel --record --key \$CYPRESS_RECORD_KEY"
    }
    
    // Reporter configuration
    command += " --reporter cypress-multi-reporters"
    command += " --reporter-options configFile=reporter-config.json"
    
    return command
}

// Helper function to send Slack notifications
def sendSlackNotification(String status) {
    def color = 'good'
    def message = ''
    def emoji = '✅'
    
    switch(status) {
        case 'started':
            color = '#36a64f'
            emoji = '🚀'
            message = "E2E Test Pipeline Started"
            break
        case 'completed':
            color = currentBuild.result == 'SUCCESS' ? 'good' : 'warning'
            emoji = currentBuild.result == 'SUCCESS' ? '✅' : '⚠️'
            message = "E2E Test Pipeline Completed"
            break
        case 'failed':
            color = 'danger'
            emoji = '❌'
            message = "E2E Test Pipeline Failed"
            break
    }
    
    def slackMessage = [
        channel: '#e2e-tests',
        color: color,
        message: "${emoji} ${message}",
        teamDomain: 'your-team',
        token: env.SLACK_WEBHOOK,
        attachments: [
            [
                color: color,
                fields: [
                    [
                        title: "Environment",
                        value: params.ENVIRONMENT,
                        short: true
                    ],
                    [
                        title: "Browser",
                        value: params.BROWSER,
                        short: true
                    ],
                    [
                        title: "Tags",
                        value: params.TAGS,
                        short: true
                    ],
                    [
                        title: "Build",
                        value: "#${BUILD_NUMBER}",
                        short: true
                    ]
                ],
                actions: [
                    [
                        type: "button",
                        text: "View Build",
                        url: BUILD_URL
                    ],
                    [
                        type: "button",
                        text: "View Report",
                        url: env.REPORT_URL
                    ]
                ]
            ]
        ]
    ]
    
    // Send notification (this would use the actual Slack plugin)
    echo "Slack notification would be sent: ${slackMessage}"
}

