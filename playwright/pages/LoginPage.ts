import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page Object for the saucedemo.com login page ("/").
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorBanner = page.locator('[data-test="error"]');
  }

  /** Navigates to the login page (base URL). */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Fills credentials and submits the login form. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Asserts the error banner is visible and contains the expected message text. */
  async expectErrorMessage(expectedText: string | RegExp): Promise<void> {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toContainText(expectedText);
  }
}
