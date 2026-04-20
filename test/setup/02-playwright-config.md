# 02 — Playwright Config

## Create `playwright.config.js` at Project Root

File path: `c:\wamp64\www\message-center\playwright.config.js`

```js
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.js',
  fullyParallel: false,       // keep false — app uses shared session state
  retries: 1,                 // retry once on flaky network
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',   // auto screenshot on error
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'test-results/',
});
```

## Key Config Decisions

| Option | Value | Reason |
|--------|-------|--------|
| `fullyParallel: false` | false | Session state shared across modules |
| `retries: 1` | 1 | Handle occasional network timeouts |
| `screenshot: 'only-on-failure'` | auto | No manual screenshot needed in tests |
| `trace: 'retain-on-failure'` | auto | Full trace for debugging failures |
| `locale: 'es-CO'` | es-CO | App uses Spanish locale |

## Authentication Strategy

The app likely uses a shared session from Amatia Express. Two strategies:

### Option A — storageState (preferred)
```js
// test/auth.setup.js
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  await page.fill('[name=username]', process.env.TEST_USER);
  await page.fill('[name=password]', process.env.TEST_PASS);
  await page.click('[type=submit]');
  await page.waitForURL('**/message-center**');
  await page.context().storageState({ path: 'test/.auth.json' });
  await browser.close();
})();
```

Add to `playwright.config.js`:
```js
use: {
  storageState: 'test/.auth.json',
}
```

### Option B — Skip Auth (app has no login gate locally)
If `http://localhost:3000/amatia/message-center` loads without login, skip auth setup entirely.

## Run Commands

```bash
# All tests
npx playwright test

# Single module
npx playwright test test/01-notifications.spec.js

# With UI mode (visual debugger)
npx playwright test --ui

# Open HTML report after run
npx playwright show-report
```
