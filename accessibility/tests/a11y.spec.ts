import { test, expect, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Result } from 'axe-core';

/**
 * Automated accessibility scanning for saucedemo.com using axe-core.
 *
 * Each test runs an axe-core scan restricted to the WCAG 2.0/2.1 A and AA rule
 * sets, attaches the full JSON results to the HTML report for inspection, and
 * fails only when a violation of "critical" impact is found. Violations of
 * lesser impact (serious/moderate/minor) are logged to the console as
 * informational context so the suite stays meaningful without being brittle
 * against every minor contrast/labelling nit on a third-party demo site.
 */

/** Splits axe-core violations by impact and reports them. */
async function reportAndAssertNoCritical(
  violations: Result[],
  testInfo: TestInfo,
  attachmentName: string,
): Promise<void> {
  await testInfo.attach(attachmentName, {
    body: JSON.stringify(violations, null, 2),
    contentType: 'application/json',
  });

  const critical = violations.filter((v) => v.impact === 'critical');
  const serious = violations.filter((v) => v.impact === 'serious');

  if (serious.length > 0) {
    console.log(`[a11y] ${serious.length} serious violation(s) found (not failing the test):`);
    for (const violation of serious) {
      console.log(`  - ${violation.id}: ${violation.help} (${violation.nodes.length} node(s)) — ${violation.helpUrl}`);
    }
  }

  if (critical.length > 0) {
    console.log(`[a11y] ${critical.length} CRITICAL violation(s) found:`);
    for (const violation of critical) {
      console.log(`  - ${violation.id}: ${violation.help} (${violation.nodes.length} node(s)) — ${violation.helpUrl}`);
    }
  }

  expect(critical, `Expected zero critical accessibility violations, found: ${critical.map((v) => v.id).join(', ')}`).toEqual([]);
}

test.describe('Accessibility scans (axe-core)', () => {
  test('login page has no critical accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.locator('#login-button')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    await reportAndAssertNoCritical(results.violations, testInfo, 'axe-results-login.json');
  });

  test('inventory page has no critical accessibility violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('.title')).toHaveText('Products');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    await reportAndAssertNoCritical(results.violations, testInfo, 'axe-results-inventory.json');
  });
});
