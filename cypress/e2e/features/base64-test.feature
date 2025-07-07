@base64-protection
Feature: Base64 Error Protection Test
  As a test automation engineer
  I want to ensure Base64 encoding errors are handled gracefully
  So that tests don't fail due to invalid Base64 strings

  @smoke
  Scenario: Test Base64 protection system
    Given I have the Base64 protection system loaded
    When I try to decode invalid Base64 strings
    Then the system should handle errors gracefully
    And no "invalid string length must be a multiple of 4" errors should occur
