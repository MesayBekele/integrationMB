@smoke @ui @data-driven
Feature: User Login - Data Driven Testing
  As a user of the application
  I want to be able to login with different credentials
  So that I can access the system with appropriate permissions

  Background:
    Given I am on the login page

  @positive @critical
  Scenario Outline: Successful login with valid credentials
    When I enter username "<username>" and password "<password>"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message for "<role>" user
    And the user menu should be visible

    Examples:
      | username | password     | role    |
      | admin    | Admin123!    | admin   |
      | manager  | Manager123!  | manager |
      | user     | User123!     | user    |

  @negative @critical
  Scenario Outline: Failed login with invalid credentials
    When I enter username "<username>" and password "<password>"
    And I click the login button
    Then I should see an error message "<expectedError>"
    And I should remain on the login page

    Examples:
      | username    | password      | expectedError       |
      | invalid     | wrongpass     | Invalid credentials |
      | admin       | wrongpass     | Invalid password    |
      | wronguser   | Admin123!     | Invalid username    |
      |             |               | Username is required|

  @validation @negative
  Scenario Outline: Form validation with invalid inputs
    When I enter username "<username>" and password "<password>"
    Then the login button should be "<buttonState>"
    And I should see validation message "<validationMessage>"

    Examples:
      | username | password | buttonState | validationMessage        |
      |          | test123  | disabled    | Username is required     |
      | testuser |          | disabled    | Password is required     |
      | a        | test123  | disabled    | Username too short       |
      | testuser | 123      | disabled    | Password too short       |

  @performance @fast
  Scenario Outline: Login performance with different user types
    When I enter username "<username>" and password "<password>"
    And I click the login button
    Then the login should complete within <maxTime> seconds
    And I should be on the "<expectedPage>" page

    Examples:
      | username | password     | maxTime | expectedPage |
      | admin    | Admin123!    | 3       | dashboard    |
      | manager  | Manager123!  | 3       | dashboard    |
      | user     | User123!     | 3       | dashboard    |

