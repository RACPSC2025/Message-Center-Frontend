# Module 09 — Sanctioning Processes

## URL
```
http://localhost:3000/amatia/message-center/view/sanctioning_processes
```

## Source Files
- `src/features/sanctioningProcesses/SanctioningProcesses.js`
- `src/features/sanctioningProcesses/components/`

## What This Module Does
Disciplinary/sanctioning process management. Lists sanctioning processes with status. Recent commits show drawer tabs were changed (`change drawer tabs in sanctioning process`). Drawer has multi-tab layout for process stages.

---

## E2E Test Steps for AI

### Test File: `test/09-sanctioning-processes.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Sanctioning Processes module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/sanctioning_processes`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads
  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await expect(page).not.toHaveURL(/404/);
  });

  // STEP 2 — list or table renders
  test('sanctioning process list renders', async ({ page }) => {
    const content = page.locator(
      '[role="grid"], table, [class*="Sanctioning"], [class*="Process"], [class*="EmptyState"]'
    ).first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  // STEP 3 — open process detail (drawer with tabs)
  test('clicking process opens detail drawer', async ({ page }) => {
    const row = page.locator('[role="row"]').nth(1);
    if (await row.isVisible()) {
      await row.click();
      const drawer = page.locator('[class*="Drawer"]').first();
      await expect(drawer).toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 4 — drawer has multiple tabs (recently changed)
  test('process drawer has tab navigation', async ({ page }) => {
    const row = page.locator('[role="row"]').nth(1);
    if (await row.isVisible()) {
      await row.click();
      await page.locator('[class*="Drawer"]').first().waitFor({ timeout: 8000 });
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(1);
    }
  });

  // STEP 5 — tab navigation works
  test('clicking drawer tab switches content', async ({ page }) => {
    const row = page.locator('[role="row"]').nth(1);
    if (await row.isVisible()) {
      await row.click();
      await page.locator('[class*="Drawer"]').first().waitFor({ timeout: 8000 });
      const tabs = page.locator('[role="tab"]');
      if (await tabs.count() > 1) {
        const secondTab = tabs.nth(1);
        await secondTab.click();
        // tab panel should change — check aria-selected
        await expect(secondTab).toHaveAttribute('aria-selected', 'true');
      }
    }
  });

  // STEP 6 — filter processes
  test('filter bar accessible', async ({ page }) => {
    const filterBtn = page.getByRole('button', { name: /filter|filtro/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await expect(page.locator('[class*="Filter"]').first())
        .toBeVisible({ timeout: 5000 });
    }
  });
});
```

## Important Note for AI
Recent commits changed drawer tabs in this module. Before implementing:
1. Read `src/features/sanctioningProcesses/SanctioningProcesses.js` to see current tab labels
2. Check `src/features/sanctioningProcesses/components/` for drawer tab components
3. Tab labels may be in Spanish — use `getByRole('tab')` not text matchers

## Expected Behavior
- Process list renders (or empty state)
- Row click opens drawer with tabs
- Drawer has > 1 tab (multiple process stages)
- Tab click switches active tab content
