#!/bin/bash

# Jenkins Setup Script for E2E Automation Framework
# This script helps set up Jenkins environment for running E2E tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is already installed: $NODE_VERSION"
        return 0
    fi
    
    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "Node.js installed successfully"
}

# Function to install system dependencies
install_system_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        curl \
        wget \
        gnupg \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        lsb-release \
        unzip \
        xvfb \
        libgtk2.0-0 \
        libgtk-3-0 \
        libgbm-dev \
        libnotify-dev \
        libgconf-2-4 \
        libnss3 \
        libxss1 \
        libasound2 \
        libxtst6 \
        libatspi2.0-0 \
        libdrm2 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libxkbcommon0 \
        libgtk-3-0
    
    print_success "System dependencies installed"
}

# Function to install Chrome browser
install_chrome() {
    print_status "Installing Google Chrome..."
    
    if command_exists google-chrome; then
        CHROME_VERSION=$(google-chrome --version)
        print_success "Google Chrome is already installed: $CHROME_VERSION"
        return 0
    fi
    
    # Add Google Chrome repository
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
    
    # Install Chrome
    sudo apt-get update
    sudo apt-get install -y google-chrome-stable
    
    print_success "Google Chrome installed successfully"
}

# Function to install Firefox browser
install_firefox() {
    print_status "Installing Firefox..."
    
    if command_exists firefox; then
        FIREFOX_VERSION=$(firefox --version)
        print_success "Firefox is already installed: $FIREFOX_VERSION"
        return 0
    fi
    
    sudo apt-get install -y firefox
    
    print_success "Firefox installed successfully"
}

# Function to setup Jenkins user
setup_jenkins_user() {
    print_status "Setting up Jenkins user permissions..."
    
    # Add jenkins user to necessary groups
    sudo usermod -a -G audio,video jenkins || print_warning "Could not add jenkins user to audio/video groups"
    
    # Create necessary directories
    sudo mkdir -p /var/lib/jenkins/.cache
    sudo mkdir -p /var/lib/jenkins/.npm
    sudo mkdir -p /var/lib/jenkins/.cypress
    
    # Set ownership
    sudo chown -R jenkins:jenkins /var/lib/jenkins/.cache
    sudo chown -R jenkins:jenkins /var/lib/jenkins/.npm
    sudo chown -R jenkins:jenkins /var/lib/jenkins/.cypress
    
    print_success "Jenkins user setup completed"
}

# Function to install Jenkins plugins
install_jenkins_plugins() {
    print_status "Installing required Jenkins plugins..."
    
    # List of required plugins
    PLUGINS=(
        "nodejs"
        "pipeline-stage-view"
        "build-timeout"
        "timestamper"
        "ws-cleanup"
        "ant"
        "gradle"
        "workflow-aggregator"
        "github-branch-source"
        "pipeline-github-lib"
        "pipeline-stage-view"
        "git"
        "ssh-slaves"
        "matrix-auth"
        "pam-auth"
        "ldap"
        "email-ext"
        "mailer"
        "slack"
        "htmlpublisher"
        "junit"
        "xvfb"
        "ansicolor"
        "build-name-setter"
        "description-setter"
        "parameterized-trigger"
        "conditional-buildstep"
        "run-condition"
        "copyartifact"
        "archive-artifacts"
        "workspace-cleanup"
    )
    
    # Install plugins using Jenkins CLI (if available)
    if [ -f "/var/lib/jenkins/jenkins-cli.jar" ]; then
        for plugin in "${PLUGINS[@]}"; do
            print_status "Installing plugin: $plugin"
            java -jar /var/lib/jenkins/jenkins-cli.jar -s http://localhost:8080/ install-plugin "$plugin" || print_warning "Could not install plugin: $plugin"
        done
        
        print_status "Restarting Jenkins to activate plugins..."
        java -jar /var/lib/jenkins/jenkins-cli.jar -s http://localhost:8080/ restart || print_warning "Could not restart Jenkins automatically"
    else
        print_warning "Jenkins CLI not found. Please install the following plugins manually:"
        printf '%s\n' "${PLUGINS[@]}"
    fi
    
    print_success "Jenkins plugins installation completed"
}

# Function to create Jenkins job configuration
create_jenkins_job() {
    print_status "Creating Jenkins job configuration..."
    
    # Create job directory
    JOB_DIR="/var/lib/jenkins/jobs/E2E-Automation-Tests"
    sudo mkdir -p "$JOB_DIR"
    
    # Create job config.xml
    cat > /tmp/job-config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>E2E Automation Test Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.plugins.buildblocker.BuildBlockerProperty plugin="build-blocker-plugin@1.7.3">
      <useBuildBlocker>false</useBuildBlocker>
      <blockLevel>GLOBAL</blockLevel>
      <scanQueueFor>DISABLED</scanQueueFor>
      <blockingJobs></blockingJobs>
    </hudson.plugins.buildblocker.BuildBlockerProperty>
    <com.coravy.hudson.plugins.github.GithubProjectProperty plugin="github@1.33.1">
      <projectUrl>https://github.com/your-org/e2e-automation/</projectUrl>
      <displayName></displayName>
    </com.coravy.hudson.plugins.github.GithubProjectProperty>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.ChoiceParameterDefinition>
          <name>ENVIRONMENT</name>
          <description>Target environment for test execution</description>
          <choices class="java.util.Arrays$ArrayList">
            <a class="string-array">
              <string>dev</string>
              <string>qa</string>
              <string>uat</string>
            </a>
          </choices>
        </hudson.model.ChoiceParameterDefinition>
        <hudson.model.ChoiceParameterDefinition>
          <name>BROWSER</name>
          <description>Browser for test execution</description>
          <choices class="java.util.Arrays$ArrayList">
            <a class="string-array">
              <string>chrome</string>
              <string>firefox</string>
              <string>edge</string>
              <string>electron</string>
            </a>
          </choices>
        </hudson.model.ChoiceParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>TAGS</name>
          <description>Test tags to execute</description>
          <defaultValue>@smoke</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>PARALLEL_EXECUTION</name>
          <description>Enable parallel test execution</description>
          <defaultValue>false</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>HEADLESS_MODE</name>
          <description>Run tests in headless mode</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers/>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.87">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.7.1">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/your-org/e2e-automation.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF
    
    # Copy job configuration
    sudo cp /tmp/job-config.xml "$JOB_DIR/config.xml"
    sudo chown jenkins:jenkins "$JOB_DIR/config.xml"
    
    print_success "Jenkins job configuration created"
}

# Function to setup environment variables
setup_environment_variables() {
    print_status "Setting up environment variables..."
    
    # Create environment script
    cat > /tmp/jenkins-env.sh << 'EOF'
#!/bin/bash

# E2E Automation Framework Environment Variables

# Node.js and npm configuration
export NODE_ENV=production
export NPM_CONFIG_CACHE=/var/lib/jenkins/.npm
export NPM_CONFIG_PREFIX=/var/lib/jenkins/.npm-global

# Cypress configuration
export CYPRESS_CACHE_FOLDER=/var/lib/jenkins/.cypress
export CYPRESS_VERIFY_TIMEOUT=100000
export CYPRESS_INSTALL_BINARY=0

# Display configuration for headless mode
export DISPLAY=:99
export XVFB_WHD=1280x720x16

# Chrome configuration
export CHROME_BIN=/usr/bin/google-chrome
export CHROME_PATH=/usr/bin/google-chrome

# Firefox configuration
export FIREFOX_BIN=/usr/bin/firefox

# Disable Chrome sandbox for Jenkins
export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox

# Memory and performance settings
export NODE_OPTIONS="--max-old-space-size=4096"
export UV_THREADPOOL_SIZE=128

EOF
    
    # Copy environment script
    sudo cp /tmp/jenkins-env.sh /var/lib/jenkins/jenkins-env.sh
    sudo chown jenkins:jenkins /var/lib/jenkins/jenkins-env.sh
    sudo chmod +x /var/lib/jenkins/jenkins-env.sh
    
    # Add to Jenkins startup script
    if [ -f "/etc/default/jenkins" ]; then
        echo "source /var/lib/jenkins/jenkins-env.sh" | sudo tee -a /etc/default/jenkins
    fi
    
    print_success "Environment variables configured"
}

# Function to setup Xvfb for headless browser testing
setup_xvfb() {
    print_status "Setting up Xvfb for headless browser testing..."
    
    # Install Xvfb if not already installed
    sudo apt-get install -y xvfb
    
    # Create Xvfb service
    cat > /tmp/xvfb.service << 'EOF'
[Unit]
Description=X Virtual Frame Buffer Service
After=network.target

[Service]
ExecStart=/usr/bin/Xvfb :99 -screen 0 1280x720x16 -ac +extension GLX +render -noreset
ExecStop=/usr/bin/killall Xvfb
Restart=on-failure
RestartSec=2
User=jenkins
Group=jenkins

[Install]
WantedBy=multi-user.target
EOF
    
    # Install and enable Xvfb service
    sudo cp /tmp/xvfb.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable xvfb
    sudo systemctl start xvfb
    
    print_success "Xvfb service configured and started"
}

# Function to create test credentials
create_test_credentials() {
    print_status "Creating test credentials template..."
    
    cat > /tmp/credentials-template.txt << 'EOF'
# Jenkins Credentials Template for E2E Automation Framework

# Create the following credentials in Jenkins:
# (Manage Jenkins > Manage Credentials > Global > Add Credentials)

1. Slack Webhook URL
   - Kind: Secret text
   - ID: slack-webhook-url
   - Description: Slack webhook URL for notifications
   - Secret: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

2. Development Environment Database Host
   - Kind: Secret text
   - ID: dev-db-host
   - Description: Development database host
   - Secret: dev-db.example.com

3. Development Environment Database User
   - Kind: Secret text
   - ID: dev-db-user
   - Description: Development database username
   - Secret: dev_user

4. Development Environment Database Password
   - Kind: Secret text
   - ID: dev-db-password
   - Description: Development database password
   - Secret: dev_password

5. Development Environment Base URL
   - Kind: Secret text
   - ID: dev-base-url
   - Description: Development environment base URL
   - Secret: https://dev.example.com

6. Development Environment API URL
   - Kind: Secret text
   - ID: dev-api-url
   - Description: Development environment API URL
   - Secret: https://api-dev.example.com

# Repeat similar credentials for QA and UAT environments:
# qa-db-host, qa-db-user, qa-db-password, qa-base-url, qa-api-url
# uat-db-host, uat-db-user, uat-db-password, uat-base-url, uat-api-url

7. Cypress Record Key (if using Cypress Dashboard)
   - Kind: Secret text
   - ID: cypress-record-key
   - Description: Cypress Dashboard record key
   - Secret: YOUR_CYPRESS_RECORD_KEY

8. GitHub Token (if using private repositories)
   - Kind: Secret text
   - ID: github-token
   - Description: GitHub personal access token
   - Secret: YOUR_GITHUB_TOKEN

EOF
    
    sudo cp /tmp/credentials-template.txt /var/lib/jenkins/credentials-template.txt
    sudo chown jenkins:jenkins /var/lib/jenkins/credentials-template.txt
    
    print_success "Credentials template created at /var/lib/jenkins/credentials-template.txt"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js: $NODE_VERSION"
    else
        print_error "Node.js not found"
        return 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm: $NPM_VERSION"
    else
        print_error "npm not found"
        return 1
    fi
    
    # Check browsers
    if command_exists google-chrome; then
        CHROME_VERSION=$(google-chrome --version)
        print_success "Chrome: $CHROME_VERSION"
    else
        print_warning "Google Chrome not found"
    fi
    
    if command_exists firefox; then
        FIREFOX_VERSION=$(firefox --version)
        print_success "Firefox: $FIREFOX_VERSION"
    else
        print_warning "Firefox not found"
    fi
    
    # Check Xvfb
    if command_exists xvfb-run; then
        print_success "Xvfb: Available"
    else
        print_warning "Xvfb not found"
    fi
    
    # Check Jenkins
    if systemctl is-active --quiet jenkins; then
        print_success "Jenkins: Running"
    else
        print_warning "Jenkins service not running"
    fi
    
    print_success "Installation verification completed"
}

# Main execution
main() {
    print_status "Starting Jenkins setup for E2E Automation Framework..."
    
    # Check if running as root or with sudo
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
    
    # Install system dependencies
    install_system_dependencies
    
    # Install Node.js
    install_nodejs
    
    # Install browsers
    install_chrome
    install_firefox
    
    # Setup Jenkins user
    setup_jenkins_user
    
    # Setup Xvfb
    setup_xvfb
    
    # Setup environment variables
    setup_environment_variables
    
    # Create Jenkins job
    create_jenkins_job
    
    # Create credentials template
    create_test_credentials
    
    # Install Jenkins plugins
    install_jenkins_plugins
    
    # Verify installation
    verify_installation
    
    print_success "Jenkins setup completed successfully!"
    print_status "Next steps:"
    echo "1. Configure credentials in Jenkins using the template at /var/lib/jenkins/credentials-template.txt"
    echo "2. Update the GitHub repository URL in the Jenkins job configuration"
    echo "3. Install project dependencies: npm install"
    echo "4. Run a test build to verify everything is working"
    echo "5. Configure webhook triggers if needed"
}

# Run main function
main "$@"

