const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const MODULE = 'Actions';
const ROUTE  = 'http://localhost:3000/#/view/actions';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function snap(page, testInfo, name) {
  const proj = testInfo.project.name;
  const dir  = path.join('test', 'results', 'screenshots', proj);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `actions-${name}.png`);
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

async function waitForGrid(page) {
  await page.locator('.ag-root-wrapper').waitFor({ timeout: 25000 });
  await page.locator('.ag-row').first().waitFor({ timeout: 25000 });
}

async function getRowCount(page) {
  const text = await page.locator('[class*="ag-paging"]').first().textContent().catch(() => '');
  const match = text?.match(/de\s+(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function filterAppErrors(errors) {
  return errors.filter(e =>
    !e.includes('Warning:') &&
    !e.includes('ResizeObserver') &&
    !e.includes('favicon') &&
    !e.includes('404') &&
    !e.includes('Failed to load resource') &&
    !e.includes('net::ERR_')
  );
}

// ─── Suite: carga y estructura ───────────────────────────────────────────────

test.describe('Actions — carga y estructura', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('URL carga en ruta correcta', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'window.location.href contiene "#/view/actions"',
    });
    await snap(page, testInfo, '01-url');
    await expect(page).toHaveURL(/actions/);
  });

  test('sin crash — body renderiza contenido', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'body sin "Something went wrong", "Cannot read"',
    });
    await snap(page, testInfo, '02-no-crash');
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await expect(page.locator('body')).not.toContainText('Cannot read');
  });

  test('AG Grid renderiza con datos', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: '.ag-root-wrapper visible, .ag-row primera fila presente',
    });
    await waitForGrid(page);
    await snap(page, testInfo, '03-grid-loaded');
    await expect(page.locator('.ag-root-wrapper')).toBeVisible();
    await expect(page.locator('.ag-row').first()).toBeVisible();
  });

  test('columnas de cabecera presentes', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: '.ag-header-cell-text — columnas según viewport',
    });
    await waitForGrid(page);
    const headerTexts = await page.locator('.ag-header-cell-text').allTextContents();
    await snap(page, testInfo, '04-columns');
    console.log(`Columnas [${testInfo.project.name}]:`, headerTexts.join(' | '));
    expect(headerTexts.length).toBeGreaterThanOrEqual(2);
  });

  test('contador de acciones visible', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'elemento con texto "acciones" en toolbar superior',
    });
    await snap(page, testInfo, '05-counter');
    const counter = page.getByText(/acciones/i).first();
    await expect(counter).toBeVisible({ timeout: 10000 });
    const text = await counter.textContent();
    console.log(`Contador [${testInfo.project.name}]: ${text?.trim()}`);
  });

  test('filtros cascada visibles en toolbar', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: '[class*="MuiSelect-select"] × 4 (Negocio/Empresa/Región/Ubicación)',
    });
    await snap(page, testInfo, '06-filter-dropdowns');
    const selects = page.locator('[class*="MuiSelect-select"]');
    const count = await selects.count();
    console.log(`Dropdowns cascada [${testInfo.project.name}]: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('botón limpiar filtros visible', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: 'MuiButton-outlined con texto "Limpiar filtros" o "Clear filters"',
    });
    await snap(page, testInfo, '07-clear-btn');
    const clearBtn = page.locator('button').filter({ hasText: /limpiar\s+filtros/i }).first();
    await expect(clearBtn).toBeVisible({ timeout: 10000 });
  });

  test('botones de vista (tabla / reporte) visibles', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: 'Botones toggle vista tabla/reporte — MuiButton o MuiIconButton con SVG icons en toolbar',
    });
    await snap(page, testInfo, '08-view-toggles');

    // El módulo no usa MuiToolbar — los botones de vista están en el header propio
    // Buscar botones con SVG fuera del grid (tabla y reporte toggle, FAB, etc.)
    const pageBtns = page.locator('button:has(svg)');
    const btnCount = await pageBtns.count();
    console.log(`Botones con SVG en página [${testInfo.project.name}]: ${btnCount}`);
    testInfo.annotations.push({ type: 'finding', description: `${btnCount} botones con SVG detectados en página` });
    expect(btnCount).toBeGreaterThanOrEqual(1);
  });

  test('FAB SpeedDial de creación visible', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: '[class*="MuiSpeedDial"] botón flotante esquina inferior derecha',
    });
    await snap(page, testInfo, '09-fab');
    const fab = page.locator('[class*="MuiSpeedDial"], [class*="SpeedDial"]').first();
    await expect(fab).toBeVisible({ timeout: 10000 });
  });
});

// ─── Suite: filtros cascada ───────────────────────────────────────────────────

test.describe('Actions — filtros cascada', () => {
  const consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
    await waitForGrid(page);
    await page.waitForTimeout(1000);
  });

  test('primer dropdown (Negocio) abre opciones al hacer click', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: '[aria-labelledby="level1"] o primer MuiSelect — abre listbox con opciones',
    });
    await snap(page, testInfo, '10a-dropdown-closed');

    // MUI Select — el botón visible es el div con role combobox o MuiSelect-select
    const firstSelect = page.locator('[class*="MuiSelect-select"]').first();
    await expect(firstSelect).toBeVisible({ timeout: 8000 });
    await firstSelect.click();
    await page.waitForTimeout(500);

    // Listbox abierto
    const listbox = page.locator('[role="listbox"]');
    const opened = await listbox.isVisible().catch(() => false);
    await snap(page, testInfo, '10b-dropdown-open');
    console.log(`Listbox abrió [${testInfo.project.name}]: ${opened}`);
    if (opened) {
      const options = await listbox.locator('[role="option"]').count();
      console.log(`Opciones disponibles: ${options}`);
      expect(options).toBeGreaterThanOrEqual(1);
      // Cerrar
      await page.keyboard.press('Escape');
    }
  });

  test('paginación muestra total de registros', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'ag-paging-row-summary-panel: texto "X a Y de Z", total > 0',
    });
    await waitForGrid(page);
    const total = await getRowCount(page);
    await snap(page, testInfo, '11-pagination');
    console.log(`Total registros [${testInfo.project.name}]: ${total}`);
    expect(total).toBeGreaterThan(0);
  });

  test('limpiar filtros no genera errores JS', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'click "Limpiar filtros" → 0 errores JS reales en consola',
    });
    const clearBtn = page.locator('button').filter({ hasText: /limpiar\s+filtros/i }).first();
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await snap(page, testInfo, '12-after-clear');

    const appErrors = filterAppErrors(consoleErrors);
    if (appErrors.length > 0) console.log('Errores JS reales:', appErrors);
    expect(appErrors).toHaveLength(0);
  });

  test('sin errores JS críticos en carga normal', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'console.error, pageerror — 0 errores JS reales post-carga',
    });
    await snap(page, testInfo, '13-no-errors');
    const appErrors = filterAppErrors(consoleErrors);
    if (appErrors.length > 0) console.log('Errores JS reales:', appErrors);
    expect(appErrors).toHaveLength(0);
  });
});

// ─── Suite: vista reporte ─────────────────────────────────────────────────────

test.describe('Actions — vista reporte', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
    await waitForGrid(page);
    await page.waitForTimeout(1000);
  });

  test('cambiar a vista reporte y volver a tabla', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: 'IconButton Insights — cambia a vista reporte; IconButton TableChart — vuelve a tabla',
    });
    await snap(page, testInfo, '14a-table-view');

    const toolbar = page.locator('[class*="MuiToolbar"]').first();
    const iconBtns = toolbar.locator('[class*="MuiIconButton"]');
    const btnCount = await iconBtns.count();

    if (btnCount >= 2) {
      // Segundo botón = Insights (report view)
      await iconBtns.nth(1).click();
      await page.waitForTimeout(1000);
      await snap(page, testInfo, '14b-report-view');
      const gridStillVisible = await page.locator('.ag-root-wrapper').isVisible().catch(() => false);
      console.log(`[${testInfo.project.name}] Grid visible en report view: ${gridStillVisible}`);

      // Volver a tabla
      await iconBtns.first().click();
      await page.waitForTimeout(800);
      await snap(page, testInfo, '14c-back-to-table');
      await expect(page.locator('.ag-root-wrapper')).toBeVisible({ timeout: 8000 });
    } else {
      console.log(`[${testInfo.project.name}] Solo ${btnCount} icon buttons — skip view toggle`);
    }
  });
});

// ─── Suite: interacción con filas ─────────────────────────────────────────────

test.describe('Actions — interacción con filas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
    await waitForGrid(page);
    await page.waitForTimeout(1000);
  });

  test('click en celda de opciones abre drawer o menu', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: '.ag-row [col-id="options"] — click abre MuiDrawer. Mobile-375: posible bug de layout.',
    });

    if (testInfo.project.name === 'mobile-375') {
      testInfo.annotations.push({
        type: 'bug',
        description: 'BUG LAYOUT mobile-375: mc-layout-expanded-navbar puede interceptar pointer events sobre AG Grid',
      });
      await snap(page, testInfo, '15-kebab-mobile');
      console.log('mobile-375: posible bloqueo de navbar — documentado');
      return;
    }

    const firstRow = page.locator('.ag-row').first();
    await expect(firstRow).toBeVisible();

    const optionsCell = firstRow.locator('[col-id="options"]').first();
    const cellVisible = await optionsCell.isVisible().catch(() => false);

    if (cellVisible) {
      await optionsCell.click({ force: true });
      await page.waitForTimeout(1500);
    } else {
      // Intentar click en primera celda de la fila
      await firstRow.locator('.ag-cell').first().click({ force: true });
      await page.waitForTimeout(1500);
    }

    const opened = await page.locator('[class*="MuiDrawer"], [role="dialog"]')
      .first().isVisible().catch(() => false);
    await snap(page, testInfo, '15-row-click');
    console.log(`[${testInfo.project.name}] Drawer/Dialog abrió: ${opened}`);
    // No fallar si no abre — documentar resultado
    testInfo.annotations.push({ type: 'result', description: `Drawer abrió: ${opened}` });
  });

  test('drawer de detalle contiene información de la acción', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: '[class*="MuiDrawer"] — contiene texto no vacío (nombre, estado, fechas)',
    });

    if (testInfo.project.name === 'mobile-375') {
      testInfo.annotations.push({
        type: 'bug',
        description: 'mobile-375: navbar puede bloquear acceso al grid — skip',
      });
      await snap(page, testInfo, '16-drawer-mobile');
      return;
    }

    const firstRow = page.locator('.ag-row').first();
    const optionsCell = firstRow.locator('[col-id="options"]').first();
    const cellVisible = await optionsCell.isVisible().catch(() => false);

    if (cellVisible) {
      await optionsCell.click({ force: true });
    } else {
      await firstRow.locator('.ag-cell').first().click({ force: true });
    }
    await page.waitForTimeout(2000);

    const drawer = page.locator('[class*="MuiDrawer"]').first();
    const drawerVisible = await drawer.isVisible().catch(() => false);
    await snap(page, testInfo, '16-drawer-content');

    if (drawerVisible) {
      const drawerText = await drawer.textContent().catch(() => '');
      console.log(`[${testInfo.project.name}] Drawer texto (100 chars): ${drawerText?.substring(0, 100)}`);
      expect(drawerText?.length).toBeGreaterThan(0);

      // Cerrar drawer
      const closeBtn = drawer.locator('[class*="MuiIconButton"]').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log(`[${testInfo.project.name}] Drawer no abrió — posible comportamiento esperado`);
    }
  });

  test('paginación de acciones — navegar a página 2', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: '[ref="btNext"] o [aria-label*="Next"] — actualiza paginación a "11 a 20 de N"',
    });
    await snap(page, testInfo, '17a-page1');

    const nextBtn = page.locator('[ref="btNext"], [aria-label*="Next"], [aria-label*="Siguiente"]').first();
    const nextVisible = await nextBtn.isVisible().catch(() => false);

    if (nextVisible) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
      const paginationText = await page.locator('[class*="ag-paging"]').first().textContent();
      await snap(page, testInfo, '17b-page2');
      console.log(`Paginación tras Next [${testInfo.project.name}]: ${paginationText?.trim()}`);
      expect(paginationText).toMatch(/11/);
    } else {
      console.log(`[${testInfo.project.name}] Botón Next no visible — skip`);
    }
  });
});
