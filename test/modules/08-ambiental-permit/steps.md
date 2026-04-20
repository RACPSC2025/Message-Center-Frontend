# Module 08 — Ambiental Permit

## URL
```
http://localhost:3000/amatia/message-center/view/ambiental_permit
```

## Source Files
- `src/features/ambientalPermit/AmbientalPermit.js`

## What This Module Does
Environmental permit management. Similar to Permit Manager but specific to environmental/ambiental permits. Recently added module (appears in `?? src/features/ambientalPermit/` — untracked in git). Lists environmental authorizations and their compliance status.

---

## E2E Test Steps for AI

### Test File: `test/08-ambiental-permit.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Ambiental Permit module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/ambiental_permit`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads (module may be permission-gated)
  test('page loads or shows permission denied gracefully', async ({ page }) => {
    // Either renders content or shows a permission/empty state — not a crash
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    // Should not redirect to 404
    await expect(page).not.toHaveURL(/404|not-found/);
  });

  // STEP 2 — module renders main content
  test('ambiental permit content renders', async ({ page }) => {
    const content = page.locator(
      '[role="grid"], table, [class*="Ambiental"], [class*="Permit"], [class*="EmptyState"]'
    ).first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  // STEP 3 — table or list is present
  test('permit list or table is visible', async ({ page }) => {
    // Could be table OR empty state if no data
    const hasTable = await page.locator('[role="grid"], table').isVisible().catch(() => false);
    const hasEmpty = await page.locator('[class*="Empty"], [class*="empty"]').isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBeTruthy();
  });

  // STEP 4 — create permit button
  test('create button is accessible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /crear|create|nueva|new|agregar|\+/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(
        page.locator('[class*="Form"], [role="dialog"], [class*="Drawer"]').first()
      ).toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 5 — row click opens detail
  test('clicking permit opens detail drawer', async ({ page }) => {
    const row = page.locator('[role="row"]').nth(1);
    if (await row.isVisible()) {
      await row.click();
      await expect(page.locator('[class*="Drawer"], [role="dialog"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });
});
```

## Important Note for AI
This module is in `src/features/ambientalPermit/` which was untracked at the time this plan was created. Before implementing tests:
1. Read `src/features/ambientalPermit/AmbientalPermit.js` to understand actual rendered elements
2. Confirm the route is enabled in `src/config/generalConfig.js` or `defaultConfig.json`
3. Confirm module key is `ambiental_permit` (check `src/routes/RoutesFile.js`)

## Expected Behavior
- Module renders without crash
- Shows table OR empty state (not an error)
- Create button (if present) opens a form/drawer
- Row click opens detail
