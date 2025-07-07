@smoke @framework
Feature: Framework Verification
  As a test automation engineer
  I want to verify the framework is working correctly
  So that I can run tests without 404 errors

  @critical
  Scenario: Verify framework components are working
    Given the framework is properly initialized
    When I test the core functionality
    Then all components should work without errors
    And no 404 errors should occur

  @source-mapping
  Scenario: Verify source mapping is working
    Given I have a test with source mapping enabled
    When I run the test
    Then source maps should be available inline
    And debugging should work correctly

  @step-definitions
  Scenario: Verify step definitions are found
    Given I have feature files with step definitions
    When Cypress processes the features
    Then all step definitions should be resolved
    And no missing step definition errors should occur
