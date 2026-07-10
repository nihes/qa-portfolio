import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression config. A small pixel-diff tolerance absorbs anti-aliasing
 * / sub-pixel rendering noise so the check flags real visual changes, not noise.
 */
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://www.saucedemo.com',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
