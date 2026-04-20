# Module 05 — Inspections

## URL
```
http://localhost:3000/amatia/message-center/view/inspections
```

## Source Files
- `src/features/inspections/Inspections.js`
- `src/features/inspections/InspectionForm.js`
- `src/features/inspections/InspectionDrawer.js`

## What This Module Does
Inspection management. Lists inspections with status. Allows creating new inspections via a form. Clicking an inspection opens a drawer with form details and attachments.

---

## E2E Test Steps for AI

### Test File: `test/05-inspections.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Inspections module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/inspections`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads
  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // STEP 2 — inspection list renders
  test('inspection list or table renders', async ({ page }) => {
    const content = page.locator('[role="grid"], table, [class*="Inspection"]').first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  // STEP 3 — create new inspection
  test('create inspection button is clickable', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /crear|create|nueva|new|\+/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 8000 });
    await createBtn.click();
    // InspectionForm or Dialog should appear
    await expect(
      page.locator('[class*="Form"], [class*="Dialog"], [role="dialog"]').first()
    ).toBeVisible({ timeout: 8000 });
  });

  // STEP 4 — inspection form has required fields
  test('inspection form contains input fields', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /crear|create|nueva|new|\+/i }).first();
    await createBtn.click();
    await page.locator('[class*="Form"], [role="dialog"]').first().waitFor({ timeout: 8000 });
    // at least one text field
    const inputs = page.locator('input[type="text"], textarea').first();
    await expect(inputs).toBeVisible({ timeout: 5000 });
  });

  // STEP 5 — close form/dialog
  test('cancel closes inspection form', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /crear|create|nueva|new|\+/i }).first();
    await createBtn.click();
    await page.locator('[role="dialog"]').first().waitFor({ timeout: 8000 });
    const cancelBtn = page.getByRole('button', { name: /cancel|cerrar|close|cancelar/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    }
  });

  // STEP 6 — open inspection detail
  test('clicking inspection opens detail drawer', async ({ page }) => {
    const row = page.locator('[role="row"], [class*="Inspection"]').nth(1);
    if (await row.isVisible()) {
      await row.click();
      await expect(page.locator('[class*="Drawer"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });
});
```

## Selectors to Confirm
- Inspection list/table selector
- Create button label (Spanish: "Nueva Inspección"?)
- Form/Dialog class after create click
- Drawer class after row click

## Expected Behavior
- List renders with inspection items
- Create button opens `InspectionForm`
- Form has required text fields
- Cancel/close button dismisses form
- Row click opens `InspectionDrawer`
