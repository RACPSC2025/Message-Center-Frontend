// @ts-check
const { defineConfig, devices } = require('@playwright/test');

require('dotenv').config({ path: './test/.env.test' });

module.exports = defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 12_000 },

  reporter: [
    ['./test/md-reporter.js'],
    ['html', { outputFolder: 'test/results/html-report', open: 'never' }],
    ['junit', { outputFile: 'test/results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    // Auto-capture on failure — reporter picks up the path
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: true,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },

  outputDir: 'test/results/artifacts',

  projects: [
    {
      name: 'desktop-1280',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'tablet-768',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile-375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 },
      },
    },
  ],
});
