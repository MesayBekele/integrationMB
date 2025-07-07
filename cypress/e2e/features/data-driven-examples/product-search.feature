@data-driven @ui @search
Feature: Product Search
  As a customer
  I want to search for products
  So that I can find what I'm looking for

  Background:
    Given I am on the product search page

  @search-valid
  Scenario Outline: Search with valid terms
    When I search for "<searchTerm>"
    Then I should see search results
    And the results should contain products related to "<searchTerm>"
    And I should see at least <minResults> results

    Examples:
      | searchTerm | minResults |
      | laptop     | 5          |
      | phone      | 10         |
      | tablet     | 3          |
      | headphones | 8          |

  @search-invalid
  Scenario Outline: Search with invalid terms
    When I search for "<invalidTerm>"
    Then I should see a "no results" message
    And I should see search suggestions

    Examples:
      | invalidTerm |
      | xyz123      |
      | !@#$%       |
      | ""          |

  @search-filters
  Scenario: Search with filters
    When I search for "laptop"
    And I apply the following filters:
      | filter   | value    |
      | brand    | Dell     |
      | price    | 500-1000 |
      | rating   | 4+       |
    Then I should see filtered results
    And all results should match the applied filters

