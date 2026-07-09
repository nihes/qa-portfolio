import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object for the saucedemo.com product detail page ("/inventory-item.html?id=<id>"),
 * reached by clicking a product name/image from the inventory page.
 */
export class ProductPage {
  readonly page: Page;
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.name = page.locator('.inventory_details_name');
    this.price = page.locator('.inventory_details_price');
    this.description = page.locator('.inventory_details_desc');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  /** Clicks a product's name on the inventory page to open its detail page. */
  async openFromInventoryByName(page: Page, productName: string): Promise<void> {
    await page.locator('.inventory_item_name', { hasText: productName }).click();
  }

  /** Asserts the detail page shows the expected product name. */
  async expectName(expectedName: string): Promise<void> {
    await expect(this.name).toHaveText(expectedName);
  }

  /** Asserts the detail page shows a price in the "$X.XX" format. */
  async expectPriceVisible(): Promise<void> {
    await expect(this.price).toBeVisible();
    await expect(this.price).toHaveText(/^\$\d+\.\d{2}$/);
  }

  /** Asserts the detail page shows a non-empty description. */
  async expectDescriptionVisible(): Promise<void> {
    await expect(this.description).toBeVisible();
    const text = await this.description.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  }

  /** Adds the currently displayed product to the cart. The detail-page button is
   * a single [data-test="add-to-cart"] (no product slug, unlike the inventory list). */
  async addToCart(): Promise<void> {
    await this.page.locator('[data-test="add-to-cart"]').click();
  }

  /** Navigates back to the inventory page. */
  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
