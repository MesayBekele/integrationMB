# E2E Automation Framework Setup Guide

This guide will help you set up the E2E automation testing framework on your local machine and CI/CD environment.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: Latest version
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+

### Browser Requirements
- **Chrome**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Edge**: Version 90+

### Optional Requirements
- **Docker**: For containerized testing
- **Jenkins**: For CI/CD integration
- **Database**: MySQL 8.0+ or PostgreSQL 12+ (for database testing)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd e2e-automation-framework
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
# Verify Cypress installation
npx cypress verify

# Check Cypress info
npx cypress info
```

### 4. Run Your First Test
```bash
# Open Cypress Test Runner
npm run cy:open

# Or run tests headlessly
npm run test:smoke
```

## 🔧 Detailed Setup

### Environment Configuration

1. **Copy Environment Template**
   ```bash
   cp config/dev.json.example config/dev.json
   ```

2. **Update Configuration Files**
   Edit the configuration files in the `config/` directory:
   - `config/dev.json` - Development environment
   - `config/qa.json` - QA environment
   - `config/uat.json` - UAT environment

3. **Set Environment Variables** (Optional)
   Create a `.env` file in the root directory:
   ```bash
   # Application URLs
   BASE_URL=https://dev.example.com
   API_URL=https://api-dev.example.com
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=testdb
   DB_USER=testuser
   DB_PASSWORD=testpass
   
   # Cypress Configuration
   CYPRESS_ENV=dev
   CYPRESS_BROWSER=chrome
   
   # Integrations
   SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   JIRA_BASE_URL=https://yourcompany.atlassian.net
   JIRA_TOKEN=your_jira_token
   ```

### Database Setup (Optional)

If you're using database testing features:

1. **Install Database Client**
   ```bash
   # For MySQL
   npm install mysql2
   
   # For PostgreSQL (already included)
   npm install pg
   ```

2. **Create Test Database**
   ```sql
   -- MySQL
   CREATE DATABASE testdb_dev;
   CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'testpass';
   GRANT ALL PRIVILEGES ON testdb_dev.* TO 'testuser'@'localhost';
   
   -- PostgreSQL
   CREATE DATABASE testdb_dev;
   CREATE USER testuser WITH PASSWORD 'testpass';
   GRANT ALL PRIVILEGES ON DATABASE testdb_dev TO testuser;
   ```

3. **Run Database Migrations** (if applicable)
   ```bash
   # Add your database migration commands here
   npm run db:migrate
   ```

### IDE Configuration

#### Visual Studio Code
1. Install recommended extensions:
   - Cypress Snippets
   - Cucumber (Gherkin) Full Support
   - ESLint
   - Prettier

2. Add to `.vscode/settings.json`:
   ```json
   {
     "cucumberautocomplete.steps": [
       "cypress/support/step_definitions/*.js"
     ],
     "cucumberautocomplete.syncfeatures": "cypress/e2e/features/**/*.feature",
     "cucumberautocomplete.strictGherkinCompletion": true
   }
   ```

#### IntelliJ IDEA / WebStorm
1. Install plugins:
   - Cucumber for JavaScript
   - Gherkin
   - Cypress Support Pro

2. Configure file associations for `.feature` files

## 🐳 Docker Setup

### Build Docker Image
```bash
npm run docker:build
```

### Run Tests in Docker
```bash
npm run docker:run
```

### Custom Docker Configuration
Edit `docker/Dockerfile` to customize the Docker environment.

## 🔄 Jenkins Setup

### Automated Setup
Run the Jenkins setup script:
```bash
sudo bash scripts/jenkins-setup.sh
```

### Manual Setup

1. **Install Required Plugins**
   - NodeJS Plugin
   - Pipeline Plugin
   - HTML Publisher Plugin
   - JUnit Plugin
   - Slack Notification Plugin

2. **Configure Node.js**
   - Go to Manage Jenkins > Global Tool Configuration
   - Add Node.js installation (version 16+)

3. **Create Pipeline Job**
   - New Item > Pipeline
   - Use the provided `Jenkinsfile`
   - Configure parameters as needed

4. **Set Up Credentials**
   Use the template at `/var/lib/jenkins/credentials-template.txt`

## 🧪 Running Tests

### Local Development
```bash
# Open Cypress Test Runner
npm run cy:open

# Run all tests headlessly
npm run cy:run

# Run specific test types
npm run test:smoke
npm run test:regression
npm run test:api
npm run test:ui

# Run tests in specific environment
npm run test:dev
npm run test:qa
npm run test:uat

# Run tests with specific browser
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge
```

### Using Tags
```bash
# Run tests with specific tags
npm run cy:run -- --env tags="@smoke"
npm run cy:run -- --env tags="@smoke and @ui"
npm run cy:run -- --env tags="@regression and not @wip"

# Using the tag runner script
node scripts/run-tagged-tests.js --tags "@smoke" --env dev
```

### Parallel Execution
```bash
# Run tests in parallel (requires Cypress Dashboard)
npm run test:parallel
```

## 📊 Report Generation

### Generate Reports
```bash
# Merge and generate all reports
npm run report:merge
npm run report:generate

# Open HTML report
npm run report:open
```

### Custom Report Generation
```bash
# Generate specific report format
node scripts/generate-reports.js --format html
node scripts/generate-reports.js --format cucumber
node scripts/generate-reports.js --format json
```

## 🔍 Troubleshooting

### Common Issues

#### Cypress Installation Issues
```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall Cypress
npm uninstall cypress
npm install cypress

# Verify installation
npx cypress verify
```

#### Browser Issues
```bash
# Install missing dependencies (Linux)
sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 libatspi2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxkbcommon0 libgtk-3-0

# For headless mode issues
export DISPLAY=:99
Xvfb :99 -screen 0 1280x720x16 &
```

#### Network Issues
```bash
# Configure proxy (if needed)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Configure Cypress proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

#### Permission Issues
```bash
# Fix npm permissions (Linux/Mac)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.cypress

# Or use npm prefix
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Debug Mode
```bash
# Enable Cypress debug mode
DEBUG=cypress:* npm run cy:run

# Enable specific debug categories
DEBUG=cypress:server:* npm run cy:run
```

### Log Files
Check log files for detailed error information:
- Cypress logs: `~/.cypress/logs/`
- Application logs: `logs/`
- Test reports: `reports/`

## 🔧 Advanced Configuration

### Custom Commands
Add custom commands in `cypress/support/commands.js`:
```javascript
Cypress.Commands.add('customCommand', (param) => {
  // Your custom command logic
});
```

### Environment-Specific Overrides
Create environment-specific configuration files:
- `cypress.dev.config.js`
- `cypress.qa.config.js`
- `cypress.uat.config.js`

### Plugin Configuration
Configure additional Cypress plugins in `cypress.config.js`:
```javascript
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Add your plugins here
    },
  },
});
```

## 📚 Next Steps

1. **Read the Usage Guide**: [USAGE.md](USAGE.md)
2. **Review Best Practices**: [BEST_PRACTICES.md](BEST_PRACTICES.md)
3. **Check API Reference**: [API_REFERENCE.md](API_REFERENCE.md)
4. **Explore Examples**: Look at the example tests in `cypress/e2e/features/examples/`

## 🆘 Getting Help

- **Documentation**: Check the `docs/` folder for detailed guides
- **Examples**: Review example tests for implementation patterns
- **Issues**: Create an issue in the repository for bugs or feature requests
- **Community**: Join the team Slack channel for questions and discussions

## 📝 Validation Checklist

After setup, verify everything is working:

- [ ] Node.js and npm are installed and working
- [ ] Cypress opens successfully with `npm run cy:open`
- [ ] Environment configuration files are properly set up
- [ ] Database connection works (if using database features)
- [ ] Sample tests run successfully
- [ ] Reports are generated correctly
- [ ] CI/CD pipeline is configured (if applicable)

Congratulations! Your E2E automation framework is now set up and ready to use. 🎉

