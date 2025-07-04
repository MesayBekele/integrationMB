@smoke @ui @login
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  Background:
    Given I am on the login page

  @critical @smoke
  Scenario: Successful login with valid credentials
    When I enter valid admin credentials
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @smoke @ui
  Scenario: Successful login with remember me option
    When I enter valid user credentials
    And I check the remember me option
    And I click the login button
    Then I should be redirected to the dashboard
    And the remember me cookie should be set

  @regression @ui
  Scenario: Failed login with invalid username
    When I enter username "invaliduser"
    And I enter password "ValidPass123!"
    And I click the login button
    Then I should see an error message "Invalid username or password"
    And I should remain on the login page

  @regression @ui
  Scenario: Failed login with invalid password
    When I enter username "testuser"
    And I enter password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid username or password"
    And I should remain on the login page

  @regression @ui
  Scenario: Login form validation with empty fields
    When I leave the username field empty
    And I leave the password field empty
    And I click the login button
    Then I should see validation errors
    And the login button should be disabled

  @ui @validation
  Scenario: Username validation
    When I enter username "ab"
    Then I should see a username validation error

  @ui @validation
  Scenario: Password validation
    When I enter password "123"
    Then I should see a password validation error

  @ui @navigation
  Scenario: Forgot password functionality
    When I click the "Forgot Password" link
    Then I should be redirected to the password reset page
    When I enter email "user@example.com"
    And I click the "Send Reset Link" button
    Then I should see a confirmation message

  @ui @social
  Scenario: Social login options are visible
    Then I should see social login buttons

  @data-driven @regression
  Scenario Outline: Login with different user types
    When I login with credentials "<username>" and "<password>"
    Then I should see the "<expectedPage>" page
    And I should have "<accessLevel>" access level

    Examples:
      | username | password    | expectedPage | accessLevel |
      | admin    | Admin123!   | dashboard    | admin       |
      | user     | User123!    | profile      | user        |

  @mobile @ui
  Scenario: Mobile login interface
    Given I am using a mobile device
    When I navigate to the login page
    Then the login form should be mobile-responsive
    And all elements should be easily accessible

  @performance @smoke
  Scenario: Login performance
    When I enter valid user credentials
    Then the login process should complete within 3 seconds

  @session @security
  Scenario: Logout functionality
    Given I am already logged in
    When I logout
    Then I should be logged out

