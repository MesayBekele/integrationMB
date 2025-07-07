@user-management @regression
Feature: User Management
  As an administrator
  I want to manage users in the system
  So that I can control access and permissions

  Background:
    Given I am logged in as "admin" user
    And I am on the user management page

  @smoke @critical
  Scenario: View users list
    Then I should see the users table
    And the table should contain user information
    And I should see pagination controls

  @regression
  Scenario: Create new user
    When I click the "Add New User" button
    Then I should see the create user form
    When I fill in the user details:
      | firstName | John |
      | lastName  | Doe |
      | email     | john.doe@example.com |
      | role      | user |
    And I click the "Create User" button
    Then I should see success message "User created successfully"
    And the new user should appear in the users list

  @regression @data-driven
  Scenario Outline: Create users with different roles
    When I create a new user with the following details:
      | firstName | <firstName> |
      | lastName  | <lastName> |
      | email     | <email> |
      | role      | <role> |
    Then the user should be created successfully
    And the user should have "<role>" permissions

    Examples:
      | firstName | lastName | email | role |
      | Alice | Smith | alice.smith@example.com | admin |
      | Bob | Johnson | bob.johnson@example.com | manager |
      | Carol | Williams | carol.williams@example.com | user |

  @regression
  Scenario: Edit existing user
    Given there is an existing user "test.user@example.com"
    When I click the edit button for "test.user@example.com"
    Then I should see the edit user form
    When I update the user details:
      | firstName | Updated |
      | lastName  | User |
      | role      | manager |
    And I click the "Update User" button
    Then I should see success message "User updated successfully"
    And the user details should be updated in the list

  @regression
  Scenario: Delete user
    Given there is an existing user "delete.me@example.com"
    When I click the delete button for "delete.me@example.com"
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then I should see success message "User deleted successfully"
    And the user should be removed from the list

  @regression
  Scenario: Search users
    Given there are multiple users in the system
    When I enter "john" in the search box
    And I click the search button
    Then I should see only users matching "john"
    When I clear the search
    Then I should see all users again

  @regression
  Scenario: Filter users by role
    Given there are users with different roles
    When I select "admin" from the role filter
    Then I should see only admin users
    When I select "user" from the role filter
    Then I should see only regular users
    When I select "All" from the role filter
    Then I should see all users

  @regression
  Scenario: Sort users
    Given there are multiple users in the system
    When I click on the "Name" column header
    Then the users should be sorted by name in ascending order
    When I click on the "Name" column header again
    Then the users should be sorted by name in descending order

  @regression
  Scenario: Pagination functionality
    Given there are more than 10 users in the system
    Then I should see pagination controls
    When I click on page 2
    Then I should see the next set of users
    And the page indicator should show page 2

  @negative @regression
  Scenario: Create user with duplicate email
    Given there is an existing user "existing@example.com"
    When I try to create a new user with email "existing@example.com"
    Then I should see error message "Email already exists"
    And the user should not be created

  @negative @regression
  Scenario Outline: Create user with invalid data
    When I try to create a user with invalid data:
      | firstName | <firstName> |
      | lastName  | <lastName> |
      | email     | <email> |
      | role      | <role> |
    Then I should see validation error "<expectedError>"

    Examples:
      | firstName | lastName | email | role | expectedError |
      |           | Doe | john@example.com | user | First name is required |
      | John |  | john@example.com | user | Last name is required |
      | John | Doe |  | user | Email is required |
      | John | Doe | invalid-email | user | Please enter a valid email |
      | John | Doe | john@example.com |  | Role is required |

  @regression
  Scenario: Bulk user operations
    Given I have selected multiple users
    When I click the "Bulk Actions" dropdown
    Then I should see bulk action options
    When I select "Delete Selected"
    And I confirm the bulk deletion
    Then the selected users should be deleted
    And I should see success message "Users deleted successfully"

  @regression
  Scenario: Export users list
    When I click the "Export" button
    Then I should see export format options
    When I select "CSV" format
    Then a CSV file should be downloaded
    And the file should contain all user data

  @regression
  Scenario: User profile management
    Given there is an existing user "profile.user@example.com"
    When I click on the user profile link
    Then I should see the user profile page
    And I should see user details and activity history
    When I click "Edit Profile"
    Then I should be able to update profile information

  @security @regression
  Scenario: Access control for user management
    Given I am logged in as "user" role
    When I try to access the user management page
    Then I should see access denied message
    And I should be redirected to the dashboard

  @regression
  Scenario: User status management
    Given there is an active user "status.user@example.com"
    When I click the "Deactivate" button for the user
    Then the user status should change to "Inactive"
    And the user should not be able to login
    When I click the "Activate" button for the user
    Then the user status should change to "Active"
    And the user should be able to login

  @regression @data-driven
  Scenario: Import users from CSV
    Given I have a CSV file with user data:
      | firstName | lastName | email | role |
      | Import1 | User1 | import1@example.com | user |
      | Import2 | User2 | import2@example.com | manager |
      | Import3 | User3 | import3@example.com | admin |
    When I click the "Import Users" button
    And I upload the CSV file
    And I click "Process Import"
    Then all users should be imported successfully
    And I should see import summary report

