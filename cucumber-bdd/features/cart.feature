Feature: Shopping cart
  As a shopper on Sauce Demo
  I want the cart badge to accurately reflect the items currently in my cart
  So that I always know how many products I am about to buy

  Background:
    Given the shopper is logged in as "standard_user"

  Scenario: Adding an item increments the cart badge
    When the shopper adds "Sauce Labs Backpack" to the cart
    Then the cart badge should show "1"

  Scenario: Removing an item decrements the cart badge
    When the shopper adds "Sauce Labs Backpack" to the cart
    And the shopper adds "Sauce Labs Bike Light" to the cart
    And the shopper removes "Sauce Labs Backpack" from the cart
    Then the cart badge should show "1"
