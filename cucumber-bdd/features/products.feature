Feature: Product sorting
  As a shopper on Sauce Demo
  I want to sort the product list
  So that I can browse products in the order that suits me

  Background:
    Given the shopper is logged in as "standard_user"

  @regression @products
  Scenario Outline: Sorting products by <sort option>
    When the shopper sorts products by "<sort value>"
    Then the products should be ordered by "<order type>"

    Examples:
      | sort option       | sort value | order type       |
      | price low to high | lohi       | price ascending  |
      | price high to low | hilo       | price descending |
      | name A to Z       | az         | name ascending   |
      | name Z to A       | za         | name descending  |
