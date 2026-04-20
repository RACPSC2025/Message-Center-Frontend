# Module 06 — Legal Matriz

## URL
```
http://localhost:3000/amatia/message-center/view/LegalMatriz
```

## Source Files
- `src/features/MessageCenterLegalMatriz.js`
- `src/features/MessageCenterLegalMatriz/LegalMatrizForm.js`
- `src/features/MessageCenterLegalMatriz/LegalMatrizDrawer.js`
- `src/features/MessageCenterLegalMatriz/JSTreeComponent.js`

## What This Module Does
Legal compliance matrix. Has a hierarchical tree view (JSTree) showing legal requirements organized by category. Selecting a node shows details in a drawer. Has form for creating/editing legal requirements.

---

## E2E Test Steps for AI

### Test File: `test/06-legal-matriz.spec.js`

```js
const { test, expect } = require('@playwright/test');
const BASE = '/amatia/message-center';

test.describe('Legal Matriz module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/view/LegalMatriz`);
    await page.waitForLoadState('networkidle');
  });

  // STEP 1 — page loads
  test('page renders without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // STEP 2 — tree or list renders
  test('legal tree or list renders', async ({ page }) => {
    const content = page.locator(
      '[class*="Tree"], [class*="LegalMatriz"], [role="tree"], [class*="jstree"]'
    ).first();
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  // STEP 3 — expand tree node
  test('tree node expands on click', async ({ page }) => {
    const treeNode = page.locator(
      '[role="treeitem"], [class*="TreeItem"], [class*="jstree-node"]'
    ).first();
    if (await treeNode.isVisible()) {
      const expandBtn = treeNode.locator('[class*="expand"], [class*="toggle"], [class*="arrow"]').first();
      if (await expandBtn.isVisible()) {
        await expandBtn.click();
        await page.waitForTimeout(500);
        // children should appear
        const children = page.locator('[role="treeitem"]').nth(1);
        await expect(children).toBeVisible({ timeout: 5000 });
      }
    }
  });

  // STEP 4 — select node opens drawer
  test('clicking tree node opens detail drawer', async ({ page }) => {
    const treeNode = page.locator('[role="treeitem"], [class*="jstree-node"]').first();
    if (await treeNode.isVisible()) {
      await treeNode.click();
      await expect(page.locator('[class*="Drawer"]').first())
        .toBeVisible({ timeout: 8000 });
    }
  });

  // STEP 5 — drawer shows legal detail
  test('drawer contains legal requirement details', async ({ page }) => {
    const treeNode = page.locator('[role="treeitem"]').first();
    if (await treeNode.isVisible()) {
      await treeNode.click();
      const drawer = page.locator('[class*="Drawer"]').first();
      await drawer.waitFor({ timeout: 8000 });
      // Should have some text content (requirement title, description, etc.)
      await expect(drawer).not.toBeEmpty();
    }
  });

  // STEP 6 — filter/search legal items
  test('search input filters tree items', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(800); // debounce
      // Results should update
      await expect(page.locator('[role="treeitem"], [class*="jstree-node"]').first())
        .toBeVisible({ timeout: 5000 });
    }
  });
});
```

## Selectors to Confirm
- Tree container: `[class*="jstree"]` or `[role="tree"]`
- Tree items: `[role="treeitem"]`
- Expand arrows on tree nodes
- Drawer class on node selection

## Expected Behavior
- Tree renders with hierarchical nodes
- Expand button collapses/expands children
- Node click opens `LegalMatrizDrawer`
- Drawer shows requirement metadata
- Search filters tree items
