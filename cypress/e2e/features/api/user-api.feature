@api @regression @user-api
Feature: User API
  As a developer
  I want to test the user API endpoints
  So that I can ensure the API works correctly

  @get-users
  Scenario: Get all users
    When I send a GET request to "/api/users"
    Then the response status should be 200
    And the response should contain a list of users
    And each user should have required fields:
      | field     |
      | id        |
      | firstName |
      | lastName  |
      | email     |
      | role      |

  @create-user-api
  Scenario: Create user via API
    Given I have valid user data:
      | firstName | lastName | email              | role |
      | API       | User     | api.user@test.com  | User |
    When I send a POST request to "/api/users" with the user data
    Then the response status should be 201
    And the response should contain the created user
    And the user should have a valid ID

  @update-user-api
  Scenario: Update user via API
    Given a user exists with email "update.test@test.com"
    When I send a PUT request to "/api/users/{userId}" with updated data:
      | firstName | lastName | role  |
      | Updated   | User     | Admin |
    Then the response status should be 200
    And the user should be updated in the system

  @delete-user-api
  Scenario: Delete user via API
    Given a user exists with email "delete.test@test.com"
    When I send a DELETE request to "/api/users/{userId}"
    Then the response status should be 204
    And the user should be removed from the system

