@api @integration
Feature: API Testing
  As a developer
  I want to test the API endpoints
  So that I can ensure the backend services work correctly

  Background:
    Given the API is available and responding

  @smoke @api @critical
  Scenario: Health check endpoint
    When I make a GET request to "/health"
    Then the response status should be 200
    And the response should contain "status": "healthy"
    And the response time should be less than 1000ms

  @smoke @api @critical
  Scenario: Authentication endpoint
    When I make a POST request to "/auth/login" with valid credentials
    Then the response status should be 200
    And the response should contain a valid JWT token
    And the token should not be expired
    And the response should include user information

  @regression @api @high
  Scenario: User CRUD operations
    Given I am authenticated as an admin
    When I create a new user via POST "/users"
    Then the response status should be 201
    And the response should contain the created user data
    When I retrieve the user via GET "/users/{id}"
    Then the response status should be 200
    And the user data should match the created user
    When I update the user via PUT "/users/{id}"
    Then the response status should be 200
    And the user data should be updated
    When I delete the user via DELETE "/users/{id}"
    Then the response status should be 204

  @regression @api @medium
  Scenario: Product catalog API
    When I make a GET request to "/products"
    Then the response status should be 200
    And the response should be a valid JSON array
    And each product should have required fields
    When I make a GET request to "/products?category=electronics"
    Then the response should only contain electronics products
    When I make a GET request to "/products?limit=10&offset=0"
    Then the response should contain exactly 10 products

  @data-driven @api @medium
  Scenario Outline: API input validation
    When I make a POST request to "/users" with "<field>": "<value>"
    Then the response status should be <expectedStatus>
    And the response should contain "<expectedMessage>"

    Examples:
      | field    | value           | expectedStatus | expectedMessage        |
      | email    | invalid-email   | 400            | Invalid email format   |
      | username | ab              | 400            | Username too short     |
      | password | 123             | 400            | Password too weak      |
      | age      | -5              | 400            | Age must be positive   |
      | email    |                 | 400            | Email is required      |

  @security @api @critical
  Scenario: API authentication and authorization
    When I make a GET request to "/admin/users" without authentication
    Then the response status should be 401
    And the response should contain "Authentication required"
    When I make a GET request to "/admin/users" with invalid token
    Then the response status should be 401
    And the response should contain "Invalid token"
    When I make a GET request to "/admin/users" as a regular user
    Then the response status should be 403
    And the response should contain "Insufficient permissions"

  @performance @api @medium
  Scenario: API performance testing
    When I make 100 concurrent requests to "/products"
    Then all responses should return within 5 seconds
    And the average response time should be less than 500ms
    And no requests should fail

  @api @integration @high
  Scenario: Order processing workflow
    Given I am authenticated as a user
    And I have products in my cart
    When I create an order via POST "/orders"
    Then the response status should be 201
    And the order should have status "pending"
    When I make payment via POST "/orders/{id}/payment"
    Then the response status should be 200
    And the order status should be updated to "paid"
    When I check the order status via GET "/orders/{id}"
    Then the order should show payment confirmation
    And inventory should be updated accordingly

  @api @database @integration
  Scenario: Database consistency checks
    Given I have test data in the database
    When I retrieve user data via API
    Then the API response should match database records
    When I update user data via API
    Then the database should reflect the changes
    And the updated timestamp should be current

  @api @error-handling @medium
  Scenario: API error handling
    When I make a GET request to "/users/999999"
    Then the response status should be 404
    And the response should contain "User not found"
    When I make a POST request to "/users" with malformed JSON
    Then the response status should be 400
    And the response should contain "Invalid JSON format"
    When the database is unavailable
    And I make a GET request to "/users"
    Then the response status should be 503
    And the response should contain "Service temporarily unavailable"

  @api @pagination @medium
  Scenario: API pagination
    Given there are 100 users in the system
    When I make a GET request to "/users?page=1&limit=10"
    Then the response should contain 10 users
    And the response should include pagination metadata
    And the "next" link should point to page 2
    When I make a GET request to "/users?page=10&limit=10"
    Then the response should contain 10 users
    And the "next" link should be null
    And the "previous" link should point to page 9

  @api @rate-limiting @security
  Scenario: API rate limiting
    When I make more than 100 requests per minute to "/api/search"
    Then subsequent requests should return status 429
    And the response should contain "Rate limit exceeded"
    And the response should include "Retry-After" header
    When I wait for the rate limit to reset
    Then I should be able to make requests again

  @api @versioning @medium
  Scenario: API versioning
    When I make a request to "/v1/users" with "Accept: application/vnd.api+json;version=1"
    Then the response should use v1 format
    When I make a request to "/v2/users" with "Accept: application/vnd.api+json;version=2"
    Then the response should use v2 format
    And the response should include additional fields
    When I make a request without version header
    Then the response should use the latest version

  @api @caching @performance
  Scenario: API caching behavior
    When I make a GET request to "/products/1"
    Then the response should include cache headers
    And the "Cache-Control" header should be present
    When I make the same request again within cache period
    Then the response should be served from cache
    And the response time should be significantly faster
    When I update the product via PUT "/products/1"
    Then the cache should be invalidated
    And subsequent GET requests should return fresh data

