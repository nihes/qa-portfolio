import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object covering the saucedemo.com checkout flow:
 * step one ("/checkout-step-one.html"), step two ("/checkout-step-two.html")
 * and the completion page ("/checkout-complete.html").
 */
export class CheckoutPage {
  readonly page: Page;

  // Step one - customer information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  // Step two - order overview
  readonly summaryItems: Locator;
  readonly summaryTotalLabel: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('[data-test="continue"]');

    this.summaryItems = page.locator('.cart_item');
    this.summaryTotalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');

    this.completeHeader = page.locator('.complete-header');
  }

  /** Fills the customer information form on checkout step one. */
  async fillCustomerInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /** Submits step one and moves to the order overview (step two). */
  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  /** Asserts the order overview lists the expected number of items. */
  async expectOverviewItemCount(count: number): Promise<void> {
    await expect(this.summaryItems).toHaveCount(count);
  }

  /** Asserts a "Total: $X.XX" label is displayed on the order overview. */
  async expectTotalDisplayed(): Promise<void> {
    await expect(this.summaryTotalLabel).toBeVisible();
    await expect(this.summaryTotalLabel).toHaveText(/Total: \$\d+\.\d{2}/);
  }

  /** Completes the order from the order overview page. */
  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /** Asserts the order completion page shows the "Thank you" confirmation. */
  async expectOrderComplete(): Promise<void> {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
