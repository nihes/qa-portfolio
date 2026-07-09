import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

/**
 * Login flow coverage for saucedemo.com: successful login, locked-out account,
 * and invalid/empty credential validation.
 */
test.describe('Login', () => {
  test('standard_user can log in and lands on the inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await inventoryPage.expectLoaded();
  });

  test('locked_out_user sees a locked-out error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await loginPage.expectErrorMessage('Sorry, this user has been locked out.');
  });

  test('invalid password shows a generic credentials error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');

    await loginPage.expectErrorMessage('Username and password do not match any user in this service');
  });

  test('empty credentials show a required-field error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginButton.click();

    await loginPage.expectErrorMessage('Username is required');
  });

  test('empty password shows a password-required error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.usernameInput.fill('standard_user');
    await loginPage.loginButton.click();

    await loginPage.expectErrorMessage('Password is required');
  });
});
