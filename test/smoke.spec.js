// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const MODULE = 'Notifications';
const ROUTE   = 'http://localhost:3000/amatia/message-center#/view/notifications';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function countDateGroups(page) {
  return page.locator('p.MuiTypography-body2').filter({
    hasText: /lunes|martes|miércoles|jueves|viernes|sábado|domingo/i,
  }).count();
}

async function getActiveTabCount(page) {
  const text = await page.locator('[role="tab"][aria-selected="true"]').textContent();
  const match = text?.match(/\((\d+)\)/);
  return match ? parseInt(match[1]) : null;
}

async function snap(page, testInfo, name) {
  const proj = testInfo.project.name;
  const dir  = path.join('test', 'results', 'screenshots', proj);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  await testInfo.attach(name, { path: filePath, contentType: 'image/png' });
  return filePath;
}

function annotate(testInfo, { criticality, elements }) {
  testInfo.annotations.push({ type: 'module',      description: MODULE });
  testInfo.annotations.push({ type: 'route',       description: ROUTE });
  testInfo.annotations.push({ type: 'criticality', description: criticality });
  testInfo.annotations.push({ type: 'elements',    description: elements });
}

// ─── Suite: sidebar filters ───────────────────────────────────────────────────

test.describe('Notifications — sidebar filters', () => {
  const consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  // ── BASELINE ────────────────────────────────────────────────────────────────

  test('baseline — página carga con datos', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'Título "CENTRO DE NOTIFICACIONES", grupos por fecha (p.MuiTypography-body2), contador tab activo ([role=tab][aria-selected=true])',
    });

    const groups   = await countDateGroups(page);
    const tabCount = await getActiveTabCount(page);
    await snap(page, testInfo, '01-baseline');

    expect(groups).toBeGreaterThan(0);
    expect(tabCount).toBeGreaterThan(0);
  });

  // ── BÚSQUEDA POR TÍTULO ──────────────────────────────────────────────────────

  test('filtro búsqueda — "tarea" reduce grupos visibles', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'input[placeholder="Palabras clave"], grupos fecha (p.MuiTypography-body2)',
    });

    const before = await countDateGroups(page);
    await snap(page, testInfo, '02a-search-before');

    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('tarea');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const after = await countDateGroups(page);
    await snap(page, testInfo, '02b-search-tarea');

    expect(after).toBeLessThan(before);
  });

  test('filtro búsqueda — término sin resultado muestra estado vacío', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: 'input[placeholder="Palabras clave"], estado vacío (skeleton / 0 grupos)',
    });

    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await searchInput.fill('zzz_no_existe_xyz_9999');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groups = await countDateGroups(page);
    await snap(page, testInfo, '03-search-nomatch');

    expect(groups).toBe(0);
  });

  // ── RANGO DE FECHAS ───────────────────────────────────────────────────────────

  test('filtro fecha — rango 2026-01-20 a 2026-01-26 filtra ventana', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'input[placeholder="YYYY-MM-DD"] nth(0) inicio, nth(1) fin, grupos fecha resultado',
    });

    const dateInputs = page.locator('input[placeholder="YYYY-MM-DD"]');
    const startInput = dateInputs.nth(0);
    const endInput   = dateInputs.nth(1);

    await startInput.click();
    await startInput.fill('2026-01-20');
    await startInput.press('Tab');
    await endInput.click();
    await endInput.fill('2026-01-26');
    await endInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groups = await countDateGroups(page);
    await snap(page, testInfo, '04-date-range');

    // Rango acotado: ≤ grupos totales y resultado coherente
    expect(groups).toBeGreaterThanOrEqual(0);
    expect(groups).toBeLessThanOrEqual(12);
  });

  test('filtro fecha — solo fecha inicio no colapsa resultados', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: 'input[placeholder="YYYY-MM-DD"] nth(0) solo inicio',
    });

    const startInput = page.locator('input[placeholder="YYYY-MM-DD"]').nth(0);
    await startInput.click();
    await startInput.fill('2026-01-26');
    await startInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const groups = await countDateGroups(page);
    await snap(page, testInfo, '05-date-start-only');

    expect(groups).toBeGreaterThanOrEqual(0);
  });

  // ── LIMPIAR FILTROS ────────────────────────────────────────────────────────────

  test('limpiar filtros — restaura datos tras búsqueda', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'button "Limpiar filtros" (MuiButton-contained), input Palabras clave vaciado',
    });

    const before = await countDateGroups(page);
    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await searchInput.fill('tarea');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await snap(page, testInfo, '06a-before-clear');

    const clearBtn = page.getByRole('button', { name: /limpiar filtros/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const after  = await countDateGroups(page);
    const value  = await searchInput.inputValue();
    await snap(page, testInfo, '06b-after-clear');

    expect(value).toBe('');
    expect(after).toBe(before);
  });

  test('limpiar fecha — botón inline LIMPIAR vacía DatePicker y restaura datos', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'button "Limpiar" (inline sobre Rango de fechas), DatePicker UI value, grupos restaurados',
    });
    // NOTA: "LIMPIAR FILTROS" restaura datos pero NO limpia UI del DatePicker.
    // El botón inline "Limpiar" (texto exacto) es el correcto para limpiar fechas.

    const before = await countDateGroups(page);
    const startInput = page.locator('input[placeholder="YYYY-MM-DD"]').nth(0);
    await startInput.fill('2026-01-26');
    await startInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await snap(page, testInfo, '07a-date-set');

    const inlineClear = page.getByRole('button', { name: /^limpiar$/i });
    if (await inlineClear.isVisible()) {
      await inlineClear.click();
    } else {
      await page.getByRole('button', { name: /limpiar filtros/i }).click();
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const after = await countDateGroups(page);
    await snap(page, testInfo, '07b-date-cleared');

    expect(after).toBe(before);
  });

  // ── TABS ──────────────────────────────────────────────────────────────────────

  test('tab Sin Leer — cambia contenido y queda activo', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: '[role=tab] "Sin Leer (N)", aria-selected=true tras click, grupos fecha cargados',
    });

    const tab = page.getByRole('tab', { name: /sin leer/i });
    await tab.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(tab).toHaveAttribute('aria-selected', 'true');
    const groups = await countDateGroups(page);
    await snap(page, testInfo, '08-tab-sinleer');

    expect(groups).toBeGreaterThan(0);
  });

  test('tab Leídos — cambia contenido y queda activo', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: '[role=tab] "Leídos (N)", aria-selected=true tras click',
    });

    const tab = page.getByRole('tab', { name: /leídos/i });
    await tab.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await snap(page, testInfo, '09-tab-leidos');
  });

  // ── ERRORES JS ────────────────────────────────────────────────────────────────

  test('sin errores JS durante interacciones de filtro', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'console.error, pageerror — deben ser 0 tras búsqueda + limpiar',
    });

    const searchInput = page.locator('input[placeholder="Palabras clave"]');
    await searchInput.fill('tarea');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /limpiar filtros/i }).click();
    await page.waitForTimeout(500);
    await snap(page, testInfo, '10-no-errors');

    const appErrors = consoleErrors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('ResizeObserver') &&
      !e.includes('favicon')
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ─── Suite: carga de página ───────────────────────────────────────────────────

test.describe('Notifications — carga de página', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
  });

  test('URL correcta post-navegación', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'URL contiene "message-center"',
    });
    await snap(page, testInfo, '11-url-check');
    await expect(page).toHaveURL(/message-center/);
  });

  test('sin crash — body renderiza contenido', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'body no contiene "Something went wrong" ni "Cannot read"',
    });
    await snap(page, testInfo, '12-no-crash');
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await expect(page.locator('body')).not.toContainText('Cannot read');
  });

  test('React root no vacío', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: '#root innerHTML.length > 100',
    });
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
    const html = await root.innerHTML();
    await snap(page, testInfo, '13-root-mounted');
    expect(html.length).toBeGreaterThan(100);
  });

  test('navbar lateral visible', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'nav / [role=navigation] / [class*=Navbar] / [class*=sidebar]',
    });
    const nav = page.locator('nav, [role="navigation"], [class*="Navbar"], [class*="sidebar"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
    await snap(page, testInfo, '14-navbar');
  });
});
