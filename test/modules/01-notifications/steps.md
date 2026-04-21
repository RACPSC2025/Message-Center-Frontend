# Module 01 — Notifications

## URL
```
http://localhost:3000/amatia/message-center#/view/notifications
```
> App uses HashRouter — note the `#` before `/view/`

## Source Files
- `src/features/MessageCenterNotifications.js`
- `src/features/MessageCenterCardDetails.js`

## What This Module Does
Main dashboard. Shows notification cards grouped by date (date group headers are `<p>` MuiTypography-body2 elements). Entry point of the app. Has 3 tabs: Importante / Sin Leer / Leídos.

## Confirmed Real Selectors (verified via Playwright)
| Element | Selector |
|---------|----------|
| Search input | `input[placeholder="Palabras clave"]` |
| Date start | `input[placeholder="YYYY-MM-DD"]` nth(0) |
| Date end | `input[placeholder="YYYY-MM-DD"]` nth(1) |
| Clear date (inline) | `button` with text `"Limpiar"` (exact) |
| Clear all filters | `button` with text `"Limpiar filtros"` |
| Date group headers | `p.MuiTypography-body2` filtered by day name regex |
| Tabs | `[role="tab"]` |

## Known App Behavior (discovered via E2E)
- **"LIMPIAR FILTROS"** button resets the API data filter but does **NOT** clear DatePicker UI value
- **"LIMPIAR"** inline link (appears above date range when a date is set) clears the DatePicker UI
- Search "tarea": 12 groups → 4 groups (filter works, highlights term in yellow)
- No-match search: 0 groups, panel shows skeleton loader
- Date range `2026-01-20` to `2026-01-26`: shows 2 groups
- Start date `2026-01-26` alone: shows all 12 groups (start date only not filtering as expected — possible API behavior)

---

## E2E Test Steps for AI

### Test File: `test/01-notifications.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Notifications module', () => {
  // STEP 1 — navigate to module
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/notifications`);
    // wait for main container — adjust selector after inspecting DOM
    await page.waitForSelector('[class*="MessageCenter"]', { timeout: 15000 });
  });

  // STEP 2 — page loads without error
  test('page renders without crash', async ({ page }) => {
    await expect(page).not.toHaveTitle(/error/i);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // STEP 3 — notification cards visible
  test('notification cards render', async ({ page }) => {
    const cards = page.locator('[class*="Card"], [class*="card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  // STEP 4 — clicking a card opens detail
  test('card click opens detail view', async ({ page }) => {
    const firstCard = page.locator('[class*="Card"], [class*="card"]').first();
    await firstCard.click();
    // detail panel or modal should appear
    await expect(page.locator('[class*="Drawer"], [class*="Dialog"], [class*="Detail"]').first())
      .toBeVisible({ timeout: 8000 });
  });

  // STEP 5 — navbar shows notifications as active
  test('navbar highlights notifications item', async ({ page }) => {
    const activeNav = page.locator('[class*="active"], [aria-current="page"]').first();
    await expect(activeNav).toBeVisible();
  });
});
```

## Selectors to Inspect
Open DevTools on `http://localhost:3000/amatia/message-center/view/notifications` and confirm:
- Main container class name
- Card component class or `data-testid`
- Detail drawer/panel class

## Screenshot Capture Points
Playwright auto-captures on failure. For manual evidence, add:
```js
await page.screenshot({ path: 'test-results/notifications-cards.png' });
```

## Expected Behavior
- Page loads in < 5s
- At least 1 card visible (if data exists)
- Card click opens side drawer or modal
- No console errors of type `error` (check with `page.on('console', ...)`)
