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
            choices: ['chrome', 'firefox', 'edge'],
            description: 'Browser for test execution'
        )
        string(
            name: 'TAGS',
            defaultValue: '@smoke',
            description: 'Test tags to execute (e.g., "@smoke", "@regression")'
        )
        booleanParam(
            name: 'HEADLESS_MODE',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
    }
    
    environment {
        NODE_VERSION = '18'
        CYPRESS_ENV = "${params.ENVIRONMENT}"
        CYPRESS_BROWSER = "${params.BROWSER}"
        CYPRESS_TAGS = "${params.TAGS}"
    }
    
    stages {
        stage('🚀 Setup') {
            steps {
                script {
                    echo "🔧 Environment: ${params.ENVIRONMENT}"
                    echo "🌐 Browser: ${params.BROWSER}"
                    echo "🏷️ Tags: ${params.TAGS}"
                    echo "👁️ Headless: ${params.HEADLESS_MODE}"
                }
            }
        }
        
        stage('📦 Install Dependencies') {
            steps {
                sh '''
                    echo "📥 Installing dependencies..."
                    npm ci
                    npx cypress verify
                '''
            }
        }
        
        stage('🧪 Run Tests') {
            steps {
                script {
                    def cypressCommand = "npx cypress run --browser ${params.BROWSER}"
                    
                    if (!params.HEADLESS_MODE) {
                        cypressCommand += " --headed"
                    }
                    
                    cypressCommand += " --env environment=${params.ENVIRONMENT},tags='${params.TAGS}'"
                    
                    sh cypressCommand
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
                }
            }
        }
        
        stage('📊 Generate Reports') {
            steps {
                sh '''
                    echo "📊 Generating reports..."
                    npm run report:generate
                '''
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports/html',
                        reportFiles: 'index.html',
                        reportName: 'E2E Test Report'
                    ])
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Tests completed successfully!"
        }
        failure {
            echo "❌ Tests failed!"
        }
    }
}

