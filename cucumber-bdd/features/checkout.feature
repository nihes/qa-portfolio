Feature: E-shop checkout
  As a shopper on Sauce Demo
  I want to add products to my cart and complete the checkout flow
  So that I can successfully purchase items

  Background:
    Given the shopper is logged in as "standard_user"

  Scenario: Successful checkout of a single product
    When the shopper adds "Sauce Labs Backpack" to the cart
    And the shopper goes to the cart
    And the shopper proceeds to checkout
    And the shopper fills in checkout information with first name "John", last name "Doe" and postal code "12345"
    And the shopper continues to the overview
    And the shopper finishes the checkout
    Then the shopper should see the message "Thank you for your order!"

  Scenario Outline: Adding multiple products updates the cart badge
    When the shopper adds "<first product>" to the cart
    And the shopper adds "<second product>" to the cart
    Then the cart badge should show "<expected count>"

    Examples:
      | first product         | second product          | expected count |
      | Sauce Labs Backpack    | Sauce Labs Bike Light    | 2               |
      | Sauce Labs Bike Light  | Sauce Labs Bolt T-Shirt  | 2               |
