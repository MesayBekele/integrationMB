@smoke @critical @data-driven
Feature: Critical User Paths - Data Driven Smoke Tests
  As a QA engineer
  I want to test critical user journeys with various data combinations
  So that I can ensure core functionality works across different scenarios

  @user-journey @positive
  Scenario Outline: Complete user workflow from login to logout
    Given I am on the login page
    When I login with username "<username>" and password "<password>"
    And I navigate to "<section>" section
    And I perform "<action>" action
    Then I should see "<expectedResult>"
    When I logout from the application
    Then I should be redirected to the login page

    Examples:
      | username | password     | section   | action           | expectedResult    |
      | admin    | Admin123!    | dashboard | view_statistics  | Statistics loaded |
      | manager  | Manager123!  | reports   | generate_report  | Report generated  |
      | user     | User123!     | profile   | update_profile   | Profile updated   |

  @cross-browser @compatibility
  Scenario Outline: Cross-browser compatibility testing
    Given I am using "<browser>" browser with "<viewport>" viewport
    When I login with username "admin" and password "Admin123!"
    And I navigate to the dashboard
    Then the page should render correctly
    And all interactive elements should be functional
    And the response time should be under <maxTime> seconds

    Examples:
      | browser | viewport  | maxTime |
      | chrome  | desktop   | 3       |
      | firefox | desktop   | 4       |
      | chrome  | tablet    | 5       |
      | chrome  | mobile    | 6       |

  @environment @configuration
  Scenario Outline: Multi-environment smoke tests
    Given I am testing against "<environment>" environment
    When I access the application
    Then the environment should be properly configured
    And the base URL should be "<expectedUrl>"
    And the API endpoints should be accessible
    And the database connection should be active

    Examples:
      | environment | expectedUrl                    |
      | dev         | https://dev.example.com        |
      | qa          | https://qa.example.com         |
      | uat         | https://uat.example.com        |

  @data-integrity @validation
  Scenario Outline: Data validation across different input types
    Given I am logged in as "admin"
    When I create a new record with:
      | field_type | <fieldType> |
      | value      | <value>     |
    Then the system should "<expectedBehavior>"
    And the data should be "<dataState>"

    Examples:
      | fieldType | value                    | expectedBehavior | dataState |
      | email     | test@example.com         | accept           | valid     |
      | email     | invalid-email            | reject           | invalid   |
      | phone     | +1-555-123-4567         | accept           | valid     |
      | phone     | invalid-phone           | reject           | invalid   |
      | date      | 2024-12-31              | accept           | valid     |
      | date      | invalid-date            | reject           | invalid   |
      | number    | 12345                   | accept           | valid     |
      | number    | not-a-number            | reject           | invalid   |

