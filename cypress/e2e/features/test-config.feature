@smoke
Feature: Configuration Test

  Scenario: Verify Cypress Cucumber preprocessor configuration
    Given I can run a simple test
    When I check the configuration
    Then the test should pass without source mapping errors

