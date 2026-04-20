# Module 04 — Findings

## URL
```
http://localhost:3000/amatia/message-center/view/findings
```

## Source Files
- `src/features/findings/Findings.js`
- `src/features/findings/FindingsDrawer.js`
- `src/features/findings/FindingsCardViewList.js`

## What This Module Does
Findings/hallazgos management. Has dual view: table and card view. Card view shows findings in a kanban-like grid. Drawer shows finding detail with risk analysis and action plan.

---

## E2E Test Steps for AI

### Test File: `test/04-findings.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Findings module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/findings`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads
  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // STEP 2 — default view renders (table or card)
  test('findings list renders in default view', async ({ page }) => {
    const content = page.locator(
      '[role="grid"], table, [class*="Card"], [class*="FindingCard"]'
    ).first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  // STEP 3 — switch to card view
  test('toggle to card view', async ({ page }) => {
    // Look for view toggle button (grid icon vs list icon)
    const cardViewBtn = page.locator('[aria-label*="card"], [aria-label*="grid"], [class*="ViewToggle"]').first();
    if (await cardViewBtn.isVisible()) {
      await cardViewBtn.click();
      await expect(page.locator('[class*="FindingsCard"], [class*="CardView"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 4 — switch to table view
  test('toggle to table view', async ({ page }) => {
    const tableViewBtn = page.locator('[aria-label*="table"], [aria-label*="list"], [class*="ViewToggle"]').last();
    if (await tableViewBtn.isVisible()) {
      await tableViewBtn.click();
      await expect(page.locator('[role="grid"], table').first())
        .toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 5 — open finding detail
  test('clicking finding opens detail drawer', async ({ page }) => {
    // Works for both card and table row
    const item = page.locator('[role="row"], [class*="FindingCard"], [class*="Card"]').nth(1);
    if (await item.isVisible()) {
      await item.click();
      await expect(page.locator('[class*="Drawer"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 6 — filter findings
  test('filter panel opens', async ({ page }) => {
    const filterBtn = page.getByRole('button', { name: /filter|filtro/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await expect(page.locator('[class*="Filter"], [class*="Popper"]').first())
        .toBeVisible({ timeout: 5000 });
    }
  });
});
```

## Selectors to Confirm
- View toggle buttons (list vs card)
- Card container class (`FindingsCardViewList`)
- Drawer class on finding click

## Expected Behavior
- Default view loads (table or card)
- View toggle switches between layouts
- Clicking any finding item opens `FindingsDrawer`
- Drawer shows risk analysis and action plan sections
