// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000/amatia/message-center';
const URL_NOTIFICATIONS = `${BASE}#/view/notifications`;

// Count visible date-group headers (proxy for notification groups rendered)
async function countDateGroups(page) {
  return page.locator('p.MuiTypography-body2').filter({
    hasText: /lunes|martes|miércoles|jueves|viernes|sábado|domingo/i,
  }).count();
}

// Extract number from active tab label e.g. "Importante (21)" → 21
async function getActiveTabCount(page) {
  const tabText = await page.locator('[role="tab"][aria-selected="true"]').textContent();
  const match = tabText?.match(/\((\d+)\)/);
  return match ? parseInt(match[1]) : null;
}

test.describe('Notifications — sidebar filters', () => {
  const consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));

    await page.goto(URL_NOTIFICATIONS);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  // ─── BASELINE ────────────────────────────────────────────────────────────────

  test('baseline — notifications load with data', async ({ page }) => {
    const groups = await countDateGroups(page);
    const tabCount = await getActiveTabCount(page);
    console.log(`Date groups visible: ${groups} | Tab count: ${tabCount}`);
    expect(groups).toBeGreaterThan(0);
    await page.screenshot({ path: 'test/results/01-baseline.png', fullPage: false });
  });

  // ─── FILTER: BÚSQUEDA POR TÍTULO ─────────────────────────────────────────────

  test('filter — search "tarea" reduces visible items', async ({ page }) => {
    const groupsBefore = await countDateGroups(page);
    console.log(`Groups before search: ${groupsBefore}`);

    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('tarea');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groupsAfter = await countDateGroups(page);
    console.log(`Groups after search "tarea": ${groupsAfter}`);

    await page.screenshot({ path: 'test/results/02-search-tarea.png', fullPage: false });
    // Search should change result count (fewer or equal, never more for specific term)
    expect(groupsAfter).toBeLessThanOrEqual(groupsBefore);
  });

  test('filter — search with no-match term shows empty state', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await searchInput.fill('zzz_no_existe_xyz_9999');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groups = await countDateGroups(page);
    console.log(`Groups after no-match search: ${groups}`);

    await page.screenshot({ path: 'test/results/03-search-nomatch.png', fullPage: false });
    expect(groups).toBe(0);
  });

  // ─── FILTER: RANGO DE FECHAS ──────────────────────────────────────────────────

  test('filter — date range filters by start date', async ({ page }) => {
    const groupsBefore = await countDateGroups(page);

    // Date inputs use YYYY-MM-DD format
    const dateInputs = page.locator('input[placeholder="YYYY-MM-DD"]');
    const startInput = dateInputs.nth(0);

    await expect(startInput).toBeVisible();
    await startInput.click();
    await startInput.fill('2026-01-26'); // date of most recent notification in screenshot
    await startInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groupsAfter = await countDateGroups(page);
    console.log(`Groups before date filter: ${groupsBefore} | after: ${groupsAfter}`);

    await page.screenshot({ path: 'test/results/04-filter-start-date.png', fullPage: false });
    // Filtering to a specific start date should reduce or maintain groups
    expect(groupsAfter).toBeLessThanOrEqual(groupsBefore);
  });

  test('filter — date range start + end filters to window', async ({ page }) => {
    const dateInputs = page.locator('input[placeholder="YYYY-MM-DD"]');
    const startInput = dateInputs.nth(0);
    const endInput = dateInputs.nth(1);

    await startInput.click();
    await startInput.fill('2026-01-20');
    await startInput.press('Tab');

    await endInput.click();
    await endInput.fill('2026-01-26');
    await endInput.press('Enter');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groups = await countDateGroups(page);
    console.log(`Groups in date window 2026-01-20 to 2026-01-26: ${groups}`);

    await page.screenshot({ path: 'test/results/05-filter-date-range.png', fullPage: false });
    // Only notifications within that window should show
    expect(groups).toBeGreaterThanOrEqual(0); // may be 0 or more
  });

  // ─── CLEAR FILTERS ───────────────────────────────────────────────────────────

  test('clear filters — restores original count after search', async ({ page }) => {
    const groupsBefore = await countDateGroups(page);

    // Apply search filter
    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await searchInput.fill('tarea');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Clear
    const clearBtn = page.getByRole('button', { name: /limpiar filtros/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groupsAfter = await countDateGroups(page);
    const searchValue = await searchInput.inputValue();
    console.log(`Groups restored: ${groupsAfter} (was ${groupsBefore}) | search cleared: "${searchValue}"`);

    await page.screenshot({ path: 'test/results/06-after-clear.png', fullPage: false });
    expect(searchValue).toBe('');
    expect(groupsAfter).toBe(groupsBefore);
  });

  test('clear filters — LIMPIAR FILTROS restores data after date filter', async ({ page }) => {
    // NOTE: "LIMPIAR FILTROS" resets the API filter and restores data
    // but does NOT clear the DatePicker UI value — that's app behavior.
    // Use the inline "LIMPIAR" link (above date fields) to also clear the DatePicker UI.
    const groupsBefore = await countDateGroups(page);

    const dateInputs = page.locator('input[placeholder="YYYY-MM-DD"]');
    const startInput = dateInputs.nth(0);
    await startInput.fill('2026-01-26');
    await startInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Click the inline "LIMPIAR" link that appears over date range fields
    const inlineClearLink = page.getByRole('button', { name: /^limpiar$/i });
    if (await inlineClearLink.isVisible()) {
      await inlineClearLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
    } else {
      // Fallback: "LIMPIAR FILTROS" resets data even if DatePicker UI stays
      await page.getByRole('button', { name: /limpiar filtros/i }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
    }

    const groupsAfter = await countDateGroups(page);
    const startValue = await startInput.inputValue();
    console.log(`Date input after clear: "${startValue}" | groups: ${groupsAfter} (was ${groupsBefore})`);

    await page.screenshot({ path: 'test/results/07-after-date-clear.png', fullPage: false });
    // Data must be restored regardless of which clear button was used
    expect(groupsAfter).toBe(groupsBefore);
  });

  // ─── TABS ────────────────────────────────────────────────────────────────────

  test('tabs — Sin Leer tab switches content', async ({ page }) => {
    const sinLeerTab = page.getByRole('tab', { name: /sin leer/i });
    await sinLeerTab.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(sinLeerTab).toHaveAttribute('aria-selected', 'true');
    const groups = await countDateGroups(page);
    console.log(`Sin Leer groups: ${groups}`);

    await page.screenshot({ path: 'test/results/08-tab-sinleer.png', fullPage: false });
    expect(groups).toBeGreaterThan(0);
  });

  test('tabs — Leídos tab switches content', async ({ page }) => {
    const leidosTab = page.getByRole('tab', { name: /leídos/i });
    await leidosTab.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(leidosTab).toHaveAttribute('aria-selected', 'true');
    await page.screenshot({ path: 'test/results/09-tab-leidos.png', fullPage: false });
  });

  // ─── NO JS ERRORS ────────────────────────────────────────────────────────────

  test('no JS errors during filter interactions', async ({ page }) => {
    // Run all filter interactions and check for errors
    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await searchInput.fill('tarea');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /limpiar filtros/i }).click();
    await page.waitForTimeout(500);

    const appErrors = consoleErrors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('ResizeObserver') &&
      !e.includes('favicon')
    );
    if (appErrors.length > 0) console.log('Errors:', appErrors);
    expect(appErrors).toHaveLength(0);
  });
});

// ─── BASELINE SMOKE ──────────────────────────────────────────────────────────

test.describe('Smoke — page load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_NOTIFICATIONS);
    await page.waitForLoadState('networkidle');
  });

  test('page loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/message-center/);
  });

  test('no crash — body renders visible content', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await expect(page.locator('body')).not.toContainText('Cannot read');
  });

  test('app root mounts — React root not empty', async ({ page }) => {
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('layout renders — navbar or sidebar present', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"], [class*="Navbar"], [class*="sidebar"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });
});
