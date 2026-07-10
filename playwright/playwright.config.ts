import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the saucedemo.com E2E test suite.
 * See https://playwright.dev/docs/test-configuration for full option reference.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Cross-browser coverage is opt-in. CI runs chromium only to stay fast and
    // cheap; uncomment these to also run Firefox and WebKit locally (first run
    // `npx playwright install firefox webkit`). Run a single engine with
    // `npx playwright test --project=firefox`.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
