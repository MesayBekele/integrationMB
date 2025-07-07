@login @smoke
Feature: User Login
  As a user
  I want to be able to login to the application
  So that I can access my account

  Background:
    Given I am on the login page

  @smoke @critical
  Scenario: Successful login with valid credentials
    When I enter valid credentials for "admin" user
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @smoke @critical
  Scenario Outline: Login with different user roles
    When I enter credentials for "<userRole>" user
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see user profile for "<userRole>"
    And I should have access to "<expectedPermissions>" features

    Examples:
      | userRole | expectedPermissions |
      | admin    | admin,read,write,delete |
      | user     | read,write |
      | manager  | read,write,manage |

  @negative @regression
  Scenario: Login with invalid credentials
    When I enter invalid credentials
      | username | invalid@example.com |
      | password | wrongpassword |
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @negative @regression
  Scenario Outline: Login validation with missing fields
    When I enter login credentials
      | username | <username> |
      | password | <password> |
    And I click the login button
    Then I should see validation error "<expectedError>"

    Examples:
      | username | password | expectedError |
      |          | password123 | Username is required |
      | user@example.com |  | Password is required |
      |          |          | Username and password are required |

  @negative @regression
  Scenario: Login with invalid email format
    When I enter login credentials
      | username | notanemail |
      | password | password123 |
    And I click the login button
    Then I should see validation error "Please enter a valid email address"

  @regression
  Scenario: Remember me functionality
    When I enter valid credentials for "user" user
    And I check the "Remember me" checkbox
    And I click the login button
    Then I should be redirected to the dashboard
    When I logout
    And I return to the login page
    Then the username field should be pre-filled

  @regression
  Scenario: Password visibility toggle
    Given I am on the login page
    When I enter password "mypassword"
    Then the password should be hidden
    When I click the show password button
    Then the password should be visible
    When I click the hide password button
    Then the password should be hidden

  @regression
  Scenario: Forgot password functionality
    When I click the "Forgot Password" link
    Then I should be redirected to the password reset page
    When I enter email "user@example.com"
    And I click the reset password button
    Then I should see confirmation message "Password reset link sent to your email"

  @regression @data-driven
  Scenario: Login with multiple valid users
    When I login with the following users:
      | username | password | role |
      | admin@example.com | Admin123! | admin |
      | user@example.com | User123! | user |
      | manager@example.com | Manager123! | manager |
    Then each login should be successful
    And each user should see their respective dashboard

  @security @regression
  Scenario: Account lockout after multiple failed attempts
    When I attempt to login with invalid credentials 3 times
    Then the account should be temporarily locked
    And I should see message "Account temporarily locked due to multiple failed attempts"
    When I wait for 5 minutes
    Then I should be able to login with valid credentials

  @accessibility @regression
  Scenario: Login form accessibility
    Then the login form should be accessible
    And all form fields should have proper labels
    And the form should be navigable using keyboard only
    And the form should work with screen readers

  @mobile @regression
  Scenario: Mobile login experience
    Given I am using a mobile device
    When I navigate to the login page
    Then the login form should be mobile-friendly
    When I enter valid credentials for "user" user
    And I click the login button
    Then I should be redirected to the mobile dashboard

  @performance @regression
  Scenario: Login performance
    When I measure login performance
    And I enter valid credentials for "user" user
    And I click the login button
    Then the login should complete within 3 seconds
    And the dashboard should load within 5 seconds

