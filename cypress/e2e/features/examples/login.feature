@smoke @ui @login
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account and use the system

  Background:
    Given I am on the login page

  @critical @smoke
  Scenario: Successful login with valid credentials
    When I enter valid admin credentials
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @critical @smoke
  Scenario: Successful login with remember me option
    When I enter valid user credentials
    And I check the remember me option
    And I click the login button
    Then I should be redirected to the dashboard
    And the remember me cookie should be set

  @medium @regression
  Scenario: Failed login with invalid username
    When I enter an invalid username "invaliduser"
    And I enter a valid password "ValidPass123!"
    And I click the login button
    Then I should see an error message "Invalid username or password"
    And I should remain on the login page

  @medium @regression
  Scenario: Failed login with invalid password
    When I enter a valid username "testuser"
    And I enter an invalid password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid username or password"
    And I should remain on the login page

  @medium @regression
  Scenario: Failed login with empty credentials
    When I leave the username field empty
    And I leave the password field empty
    And I click the login button
    Then I should see validation errors
    And the login button should be disabled

  @low @regression
  Scenario: Login form validation
    When I enter a username that is too short "ab"
    Then I should see a username validation error
    When I enter a password that is too short "123"
    Then I should see a password validation error

  @medium @ui
  Scenario: Forgot password functionality
    When I click the "Forgot Password" link
    Then I should be redirected to the password reset page
    When I enter my email address "user@example.com"
    And I click the "Send Reset Link" button
    Then I should see a confirmation message

  @low @ui
  Scenario: Social login options
    Then I should see social login buttons
    And the Google login button should be visible
    And the Facebook login button should be visible
    And the GitHub login button should be visible

  @data-driven @regression
  Scenario Outline: Login with different user types
    When I login as "<userType>" with credentials "<username>" and "<password>"
    Then I should see the "<expectedPage>" page
    And I should have "<accessLevel>" access permissions

    Examples:
      | userType | username    | password      | expectedPage | accessLevel |
      | admin    | admin       | Admin123!     | dashboard    | full        |
      | user     | testuser    | User123!      | profile      | limited     |
      | manager  | manager     | Manager123!   | reports      | moderate    |

  @api @integration
  Scenario: Login API integration
    When I make a login API request with valid credentials
    Then I should receive a valid authentication token
    And the token should have the correct expiration time
    And the user profile should be included in the response

  @security @critical
  Scenario: Account lockout after multiple failed attempts
    When I attempt to login with invalid credentials 3 times
    Then my account should be temporarily locked
    And I should see a lockout message
    And I should not be able to login even with valid credentials

  @security @medium
  Scenario: Session timeout handling
    Given I am logged in as a user
    When my session expires after 30 minutes of inactivity
    And I try to access a protected page
    Then I should be redirected to the login page
    And I should see a session timeout message

  @mobile @ui
  Scenario: Mobile login interface
    Given I am using a mobile device
    When I navigate to the login page
    Then the login form should be mobile-responsive
    And all elements should be easily accessible
    And the virtual keyboard should not obscure the form

