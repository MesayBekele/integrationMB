@regression @ui @user-management
Feature: User Management
  As an admin
  I want to manage user accounts
  So that I can control access to the system

  Background:
    Given I am logged in as an admin
    And I am on the user management page

  @create-user
  Scenario: Create a new user
    When I click the "Add User" button
    And I fill in the user details:
      | field     | value              |
      | firstName | John               |
      | lastName  | Doe                |
      | email     | john.doe@test.com  |
      | role      | User               |
    And I click "Save"
    Then the user should be created successfully
    And I should see the user in the user list

  @edit-user
  Scenario: Edit existing user
    Given a user "jane.doe@test.com" exists
    When I click edit for user "jane.doe@test.com"
    And I update the user role to "Admin"
    And I click "Save"
    Then the user role should be updated
    And I should see the updated role in the user list

  @delete-user
  Scenario: Delete a user
    Given a user "temp.user@test.com" exists
    When I click delete for user "temp.user@test.com"
    And I confirm the deletion
    Then the user should be removed from the system
    And I should not see the user in the user list

