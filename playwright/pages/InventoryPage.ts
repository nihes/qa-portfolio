import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object for the saucedemo.com inventory / products page ("/inventory.html").
 */
export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.items = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
  }

  /** Navigates directly to the inventory page. */
  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** Asserts the page has loaded and shows the "Products" title. */
  async expectLoaded(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
  }

  /**
   * Adds a product to the cart using its slug, e.g. "sauce-labs-backpack".
   * Slugs map to the product name with spaces/periods replaced by hyphens, lowercased.
   */
  async addToCartBySlug(slug: string): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${slug}"]`).click();
  }

  /** Removes a product from the cart (while still on the inventory page) using its slug. */
  async removeFromCartBySlug(slug: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${slug}"]`).click();
  }

  /** Selects a sort option by its option value: az, za, lohi, hilo. */
  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(value);
  }

  /** Returns the item prices (in listed order) as numbers, e.g. "$29.99" -> 29.99. */
  async getPrices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((text) => Number(text.replace('$', '')));
  }

  /** Returns the item names in the order currently rendered on the page. */
  async getNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  /** Asserts the shopping cart badge shows the expected count. */
  async expectCartBadgeCount(count: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  /** Opens the cart page via the cart icon link. */
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
