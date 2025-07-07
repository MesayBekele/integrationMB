pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'qa', 'uat'],
            description: 'Environment to run tests against'
        )
        string(
            name: 'TAGS',
            defaultValue: '@smoke',
            description: 'Cucumber tags to run (e.g., @smoke, @regression)'
        )
        booleanParam(
            name: 'PARALLEL_EXECUTION',
            defaultValue: true,
            description: 'Run tests in parallel'
        )
        choice(
            name: 'BROWSER',
            choices: ['chrome', 'firefox', 'edge'],
            description: 'Browser to run tests in'
        )
    }
    
    environment {
        CYPRESS_ENV = "${params.ENVIRONMENT}"
        CUCUMBER_TAGS = "${params.TAGS}"
        NODE_VERSION = '18'
        CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.BUILD_TIMESTAMP = sh(
                        script: 'date +"%Y-%m-%d_%H-%M-%S"',
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    // Install Node.js
                    sh """
                        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    """
                }
                
                // Install dependencies
                sh 'npm ci'
                
                // Create reports directory
                sh 'mkdir -p reports/json reports/html'
                
                // Verify Cypress installation
                sh 'npx cypress verify'
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Smoke Tests') {
                    when {
                        expression { params.TAGS.contains('@smoke') }
                    }
                    steps {
                        script {
                            runCypressTests('@smoke', 'smoke')
                        }
                    }
                }
                
                stage('Regression Tests') {
                    when {
                        expression { params.TAGS.contains('@regression') }
                    }
                    steps {
                        script {
                            runCypressTests('@regression', 'regression')
                        }
                    }
                }
                
                stage('API Tests') {
                    when {
                        expression { params.TAGS.contains('@api') }
                    }
                    steps {
                        script {
                            runCypressTests('@api', 'api')
                        }
                    }
                }
                
                stage('UI Tests') {
                    when {
                        expression { params.TAGS.contains('@ui') }
                    }
                    steps {
                        script {
                            runCypressTests('@ui', 'ui')
                        }
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                script {
                    // Merge JSON reports
                    sh 'npm run report:merge'
                    
                    // Generate HTML report
                    sh 'npm run report:generate'
                    
                    // Generate JUnit XML for Jenkins
                    sh 'npm run report:junit'
                }
            }
        }
        
        stage('Publish Results') {
            steps {
                // Publish test results
                publishTestResults testResultsPattern: 'reports/junit/*.xml'
                
                // Publish HTML reports
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports/html',
                    reportFiles: 'index.html',
                    reportName: 'Cypress Test Report',
                    reportTitles: 'E2E Test Results'
                ])
                
                // Archive artifacts
                archiveArtifacts artifacts: 'reports/**/*,cypress/screenshots/**/*,cypress/videos/**/*', 
                                fingerprint: true
            }
        }
        
        stage('Quality Gates') {
            steps {
                script {
                    // Parse test results and set quality gates
                    def testResults = readJSON file: 'reports/json/cucumber-report.json'
                    def totalTests = 0
                    def passedTests = 0
                    
                    testResults.each { feature ->
                        feature.elements.each { scenario ->
                            totalTests++
                            if (scenario.steps.every { step -> step.result.status == 'passed' }) {
                                passedTests++
                            }
                        }
                    }
                    
                    def successRate = (passedTests / totalTests) * 100
                    
                    echo "Test Results: ${passedTests}/${totalTests} passed (${successRate}%)"
                    
                    // Set quality gate thresholds
                    if (successRate < 80) {
                        error("Quality gate failed: Success rate ${successRate}% is below 80%")
                    } else if (successRate < 95) {
                        unstable("Quality gate warning: Success rate ${successRate}% is below 95%")
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        
        success {
            script {
                sendNotification('SUCCESS', 'All tests passed successfully! 🎉')
            }
        }
        
        failure {
            script {
                sendNotification('FAILURE', 'Some tests failed. Please check the report. ❌')
            }
        }
        
        unstable {
            script {
                sendNotification('UNSTABLE', 'Tests completed with warnings. ⚠️')
            }
        }
    }
}

def runCypressTests(tags, reportSuffix) {
    sh """
        npx cypress run \\
            --browser ${params.BROWSER} \\
            --env ENVIRONMENT=${params.ENVIRONMENT} \\
            --config video=true,screenshotOnRunFailure=true \\
            --reporter json \\
            --reporter-options "outputFile=reports/json/cypress-${reportSuffix}-${BUILD_TIMESTAMP}.json"
    """
}

def sendNotification(status, message) {
    // Slack notification
    if (env.SLACK_WEBHOOK_URL) {
        sh """
            curl -X POST -H 'Content-type: application/json' \\
                --data '{"text":"Jenkins Build ${status}\\nJob: ${JOB_NAME}\\nBuild: ${BUILD_NUMBER}\\nEnvironment: ${params.ENVIRONMENT}\\nMessage: ${message}\\nReport: ${BUILD_URL}Cypress_Test_Report/"}' \\
                ${env.SLACK_WEBHOOK_URL}
        """
    }
    
    // Email notification
    emailext (
        subject: "E2E Test Results - ${status}",
        body: """
            <h2>E2E Test Execution Results</h2>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Environment:</strong> ${params.ENVIRONMENT}</p>
            <p><strong>Tags:</strong> ${params.TAGS}</p>
            <p><strong>Browser:</strong> ${params.BROWSER}</p>
            <p><strong>Build:</strong> ${BUILD_NUMBER}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><a href="${BUILD_URL}Cypress_Test_Report/">View Test Report</a></p>
        """,
        to: "${env.QA_TEAM_EMAIL}",
        mimeType: 'text/html'
    )
}

