import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object for the saucedemo.com cart page ("/cart.html").
 */
export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  /** Navigates directly to the cart page. */
  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  /** Asserts the cart contains the expected number of line items. */
  async expectItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  /** Proceeds to the checkout flow (step one). */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
