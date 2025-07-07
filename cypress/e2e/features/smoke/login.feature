@smoke @critical @ui
Feature: User Login
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given I am on the login page

  @positive
  Scenario: Successful login with valid credentials
    When I enter valid username and password
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @negative
  Scenario: Failed login with invalid credentials
    When I enter invalid username and password
    And I click the login button
    Then I should see an error message
    And I should remain on the login page

  @edge-case
  Scenario: Login with empty credentials
    When I leave username and password empty
    And I click the login button
    Then I should see validation errors
    And the login button should be disabled

