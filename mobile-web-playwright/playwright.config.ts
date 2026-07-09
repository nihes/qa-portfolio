import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the saucedemo.com MOBILE DEVICE EMULATION suite.
 *
 * This suite intentionally runs the same public demo shop as ../playwright but
 * through Playwright's built-in device emulation profiles, so every test executes
 * with a mobile viewport, mobile user-agent string and touch-input support.
 *
 * See https://playwright.dev/docs/emulation for the full emulation option reference.
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
      // iOS-flavoured emulation profile, driven by WebKit (Safari's engine).
      name: 'iPhone 13',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      // Android-flavoured emulation profile, driven by Chromium.
      name: 'Pixel 5',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
});
