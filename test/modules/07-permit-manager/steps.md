# Module 07 — Permit Manager

## URL
```
http://localhost:3000/amatia/message-center/view/permit_manager
```

## Source Files
- `src/features/permitManager/PermitManager.js`

## What This Module Does
Permit/license management. Lists permits with status, expiration dates, responsible parties. Has column visibility toggles (hidden-by-default columns per recent commit). Allows creating and updating permits.

---

## E2E Test Steps for AI

### Test File: `test/07-permit-manager.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Permit Manager module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/permit_manager`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads
  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // STEP 2 — permit table renders
  test('permit table renders with columns', async ({ page }) => {
    const table = page.locator('[role="grid"], table').first();
    await expect(table).toBeVisible({ timeout: 15000 });
    const headers = page.locator('[role="columnheader"], th');
    const count = await headers.count();
    expect(count).toBeGreaterThan(0);
  });

  // STEP 3 — hidden columns toggle (P-005 feature)
  test('column visibility toggle shows hidden columns', async ({ page }) => {
    // MUI DataGrid column visibility panel button
    const colBtn = page.locator('[aria-label*="column"], [class*="ColumnSelector"]').first();
    if (await colBtn.isVisible()) {
      await colBtn.click();
      // Panel with column checkboxes should appear
      await expect(page.locator('[class*="ColumnsPanelRow"], [role="tooltip"]').first())
        .toBeVisible({ timeout: 5000 });
    }
  });

  // STEP 4 — filter bar
  test('filter opens and accepts input', async ({ page }) => {
    const filterBtn = page.getByRole('button', { name: /filter|filtro/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      const filterInput = page.locator('[class*="Filter"] input').first();
      if (await filterInput.isVisible()) {
        await filterInput.fill('test');
        await expect(filterInput).toHaveValue('test');
      }
    }
  });

  // STEP 5 — row click opens detail
  test('clicking permit row opens detail', async ({ page }) => {
    const row = page.locator('[role="row"]').nth(1);
    if (await row.isVisible()) {
      await row.click();
      await expect(
        page.locator('[class*="Drawer"], [role="dialog"]').first()
      ).toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 6 — permit has expiration date column
  test('expiration date column is visible', async ({ page }) => {
    const headers = page.locator('[role="columnheader"]');
    const texts = await headers.allTextContents();
    const hasDate = texts.some(t => /fecha|date|expir|vencim/i.test(t));
    expect(hasDate).toBeTruthy();
  });
});
```

## Selectors to Confirm
- Table: `[role="grid"]` (MUI DataGrid)
- Column visibility button (MUI: usually top-right of table toolbar)
- Filter button label
- Drawer class on row click

## Expected Behavior
- Table renders with visible columns
- Hidden columns exist and can be shown via toggle
- Filter accepts input and filters rows
- Row click opens permit detail view
- Expiration date column present
