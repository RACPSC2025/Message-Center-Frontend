// @ts-check
const { defineConfig, devices } = require('@playwright/test');

require('dotenv').config({ path: './test/.env.test' });

module.exports = defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['html', { outputFolder: 'test/results/html-report', open: 'never' }],
    ['junit', { outputFile: 'test/results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },

  outputDir: 'test/results/artifacts',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
