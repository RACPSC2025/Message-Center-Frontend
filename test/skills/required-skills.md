# Required Skills for E2E Testing — Message Center

## Skill List

### 1. Playwright — Core Navigation & Interaction
**What:** Navigate pages, click elements, fill forms, wait for network.
**Key APIs:**
```js
page.goto(url)
page.waitForLoadState('networkidle')
page.locator(selector).click()
page.locator(selector).fill(value)
page.getByRole('button', { name: /text/i })
expect(locator).toBeVisible({ timeout: N })
```

### 2. Playwright — Auto Screenshots on Failure
**What:** Configure Playwright to auto-capture screenshots/video/trace when test fails.
**Config:**
```js
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',
}
```
**Manual screenshot in test:**
```js
await page.screenshot({ path: 'test-results/step-name.png', fullPage: true });
```

### 3. MUI Component Selectors
**What:** Material UI components render with `[role]` ARIA attributes. Use these instead of class names.
**Key selectors:**
```js
[role="grid"]          // MUI DataGrid table
[role="row"]           // Table row
[role="columnheader"]  // Table column header
[role="tab"]           // MUI Tab
[role="dialog"]        // MUI Dialog/Modal
[role="treeitem"]      // MUI TreeItem
```

### 4. React SPA Navigation
**What:** React Router SPA — full page reloads don't happen. Use `waitForLoadState('networkidle')` after navigation.
**Pattern:**
```js
await page.goto(url);
await page.waitForLoadState('networkidle'); // wait for GraphQL/API calls to settle
```

### 5. GraphQL / Apollo Intercept (Optional but useful)
**What:** App uses Apollo Client for data. Mock slow or failing API calls in tests.
**Pattern:**
```js
await page.route('**/graphql', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { ... } }),
  });
});
```

### 6. Redux Store State (Read-Only, Debug Use)
**What:** App uses Redux. Read store state via browser console in debug mode.
**Pattern (in page.evaluate):**
```js
const state = await page.evaluate(() => window.__REDUX_STORE__?.getState());
```
Use only for debugging flaky tests — do not depend on store access in assertions.

### 7. Authentication / Storage State
**What:** Persist login session across all tests using Playwright storageState.
**Pattern:**
```js
// Save session after login
await context.storageState({ path: 'test/.auth.json' });

// Reuse in playwright.config.js
use: { storageState: 'test/.auth.json' }
```

### 8. Page Object Model (POM) — Optional
**What:** Encapsulate page interactions in reusable classes to avoid selector duplication.
**When to use:** After initial tests pass. Refactor repeated selectors into POM classes.
**Example:**
```js
class ActionsPage {
  constructor(page) { this.page = page; }
  get table() { return this.page.locator('[role="grid"]'); }
  async openFirstRow() { await this.page.locator('[role="row"]').nth(1).click(); }
}
```

### 9. Console Error Monitoring
**What:** Catch JS errors thrown by React during test execution.
**Pattern:**
```js
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
// at end of test:
expect(errors.filter(e => !e.includes('Warning:'))).toHaveLength(0);
```

### 10. Playwright HTML Report
**What:** Generate and view visual test report with screenshots embedded.
**Commands:**
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## Skill Priority Order for AI Implementation

1. **Core navigation** (skill 1) — needed for all tests
2. **Auto screenshots** (skill 2) — configure once in `playwright.config.js`
3. **MUI selectors** (skill 3) — needed to find elements reliably
4. **React SPA patterns** (skill 4) — avoid timing issues
5. **Console error monitoring** (skill 9) — catch silent failures
6. **Auth persistence** (skill 7) — if app requires login
7. **GraphQL mocking** (skill 5) — for isolated/offline testing
8. **POM refactor** (skill 8) — only after all tests pass
