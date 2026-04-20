# Module 03 — Actions

## URL
```
http://localhost:3000/amatia/message-center/view/actions
```

## Source Files
- `src/features/actions/Actions.js`
- `src/features/actions/ActionsTable.js`
- `src/features/actions/ActionsDetails.js`
- `src/features/actions/ActionsDrawer.js`
- `src/features/actions/ActionsComments.js`

## What This Module Does
Corrective/preventive action management. Shows table of actions with filters, status, assignment. Clicking a row opens `ActionsDrawer` with details and comments tab.

---

## E2E Test Steps for AI

### Test File: `test/03-actions.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Actions module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/actions`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads
  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // STEP 2 — table renders
  test('actions table renders', async ({ page }) => {
    // MUI DataGrid or custom table
    const table = page.locator('[role="grid"], table, [class*="Table"]').first();
    await expect(table).toBeVisible({ timeout: 15000 });
  });

  // STEP 3 — column headers present
  test('table has expected columns', async ({ page }) => {
    await page.locator('[role="grid"], table').first().waitFor({ timeout: 15000 });
    // At least one column header
    const headers = page.locator('[role="columnheader"], th');
    await expect(headers.first()).toBeVisible();
  });

  // STEP 4 — filter bar interaction
  test('filter bar is accessible', async ({ page }) => {
    const filterBtn = page.getByRole('button', { name: /filter|filtro|filtrar/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await expect(page.locator('[class*="Filter"], [class*="Popper"]').first())
        .toBeVisible({ timeout: 5000 });
    }
  });

  // STEP 5 — row click opens drawer
  test('clicking table row opens ActionsDrawer', async ({ page }) => {
    const table = page.locator('[role="grid"], table').first();
    await table.waitFor({ timeout: 15000 });
    const firstRow = page.locator('[role="row"], tr').nth(1); // skip header
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await expect(page.locator('[class*="Drawer"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 6 — drawer has comments tab
  test('action drawer shows comments tab', async ({ page }) => {
    const firstRow = page.locator('[role="row"], tr').nth(1);
    if (await firstRow.isVisible()) {
      await firstRow.click();
      const commentsTab = page.getByRole('tab', { name: /comment|comentario/i });
      if (await commentsTab.isVisible()) {
        await commentsTab.click();
        await expect(page.locator('[class*="Comment"]').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
```

## Selectors to Confirm
- Table: `[role="grid"]` (MUI DataGrid) or `table`
- Row: `[role="row"]`
- Drawer class after row click
- Tab names inside drawer (labels may be in Spanish)

## Expected Behavior
- Table loads with column headers
- Filter button toggles filter panel
- Row click → `ActionsDrawer` slides in from right
- Drawer has at least 2 tabs (details + comments)
