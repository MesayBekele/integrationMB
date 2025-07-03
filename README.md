# E2E Automation Testing Framework

A comprehensive end-to-end automation testing framework built with **Cypress**, **Cucumber**, and **Jenkins** for robust CI/CD integration.

## 🚀 Features

- **BDD Testing**: Cucumber integration for behavior-driven development
- **Multi-Environment Support**: Dev, QA, UAT environment configurations
- **Test Tagging**: Selective test execution with comprehensive tagging system
- **Data-Driven Testing**: Support for JSON, CSV, and database-driven tests
- **Comprehensive Reporting**: HTML, JSON, and JUnit XML reports with merging capabilities
- **CI/CD Integration**: Jenkins pipeline with parameterized builds
- **Page Object Model**: Clean separation of concerns with reusable components
- **Parallel Execution**: Support for parallel test execution
- **Docker Support**: Containerized test execution
- **API Testing**: Built-in API testing capabilities
- **Database Integration**: MySQL and PostgreSQL support

## 📁 Project Structure

```
├── cypress/
│   ├── e2e/
│   │   └── features/           # Gherkin feature files
│   ├── fixtures/               # Test data files
│   ├── support/
│   │   ├── pages/             # Page Object Model
│   │   ├── step_definitions/  # Cucumber step definitions
│   │   ├── utilities/         # Helper functions and utilities
│   │   ├── commands.js        # Custom Cypress commands
│   │   └── e2e.js            # Support file
├── config/                    # Environment configurations
├── scripts/                   # Utility scripts
├── jenkins/                   # Jenkins pipeline scripts
├── docker/                    # Docker configuration
├── docs/                      # Documentation
└── reports/                   # Generated reports
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e2e-automation-framework
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🎯 Usage

### Running Tests

```bash
# Open Cypress Test Runner
npm run cy:open

# Run all tests headlessly
npm run cy:run

# Run tests by tags
npm run test:smoke      # Smoke tests
npm run test:regression # Regression tests
npm run test:api        # API tests
npm run test:ui         # UI tests

# Run tests by environment
npm run test:dev        # Development environment
npm run test:qa         # QA environment
npm run test:uat        # UAT environment

# Run tests in different browsers
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge
```

### Test Tagging

Use Cucumber tags to organize and execute specific test suites:

```gherkin
@smoke @ui
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  @critical
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in successfully
```

### Data-Driven Testing

```gherkin
@regression @data-driven
Feature: User Registration
  
  Scenario Outline: Register user with different data sets
    Given I am on the registration page
    When I register with "<username>", "<email>", and "<password>"
    Then I should see "<expected_result>"
    
    Examples:
      | username | email           | password | expected_result |
      | user1    | user1@test.com  | Pass123! | Success         |
      | user2    | invalid-email   | weak     | Error           |
```

## 📊 Reporting

The framework generates multiple report formats:

- **HTML Reports**: Interactive HTML reports with screenshots
- **JSON Reports**: Machine-readable JSON format
- **JUnit XML**: For CI/CD integration
- **Cucumber Reports**: BDD-specific reporting

```bash
# Generate and merge reports
npm run report:merge
npm run report:generate

# Open HTML report
npm run report:open
```

## 🔧 Configuration

### Environment Configuration

Create environment-specific configuration files in the `config/` directory:

```json
{
  "baseUrl": "https://dev.example.com",
  "apiUrl": "https://api-dev.example.com",
  "database": {
    "host": "dev-db.example.com",
    "port": 5432,
    "database": "testdb"
  },
  "users": {
    "admin": {
      "username": "admin",
      "password": "admin123"
    }
  }
}
```

### Cypress Configuration

The framework uses `cypress.config.js` for Cypress-specific settings and Cucumber integration.

## 🐳 Docker Support

```bash
# Build Docker image
npm run docker:build

# Run tests in Docker container
npm run docker:run
```

## 🔄 Jenkins Integration

The framework includes a comprehensive Jenkins pipeline (`Jenkinsfile`) with:

- Parameterized builds
- Multi-environment support
- Parallel execution
- Report archival
- Slack notifications

### Pipeline Parameters

- **ENVIRONMENT**: Target environment (dev/qa/uat)
- **TAGS**: Test tags to execute
- **BROWSER**: Browser selection
- **PARALLEL**: Enable parallel execution

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [Setup Guide](docs/SETUP.md)
- [Usage Guide](docs/USAGE.md)
- [Best Practices](docs/BEST_PRACTICES.md)
- [API Reference](docs/API_REFERENCE.md)

## 🧪 Example Tests

The framework includes example tests demonstrating:

- UI automation with Page Object Model
- API testing with data validation
- Database integration
- Multi-environment testing
- Data-driven scenarios

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:

- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review example tests for implementation patterns

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

