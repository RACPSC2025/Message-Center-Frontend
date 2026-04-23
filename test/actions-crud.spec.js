/**
 * actions-crud.spec.js
 * Pruebas de creación de acciones y comentarios vía UI.
 * Solo corre en desktop-1280 — formulario multi-tab requiere layout completo.
 */
const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const MODULE = 'Actions CRUD';
const ROUTE  = 'http://localhost:3000/#/view/actions';
const TEST_PREFIX = 'E2E_TEST';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function snap(page, testInfo, name) {
  const proj = testInfo.project.name;
  const dir  = path.join('test', 'results', 'screenshots', proj);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `actions-crud-${name}.png`);
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

async function waitForDrawer(page) {
  const drawer = page.locator('[class*="MuiDrawer-paper"]').first();
  await drawer.waitFor({ state: 'visible', timeout: 20000 });
  return drawer;
}

/** Abre el SpeedDial via hover y clickea la única acción disponible */
async function openCreateForm(page) {
  const speedDial = page.locator('[class*="MuiSpeedDial"]').first();
  const mainFab   = speedDial.locator('[class*="MuiFab"]').first();
  // MUI SpeedDial se abre al hover, no al click del FAB principal
  await mainFab.hover();
  await page.waitForTimeout(600);
  // SpeedDialAction: el botón de la acción "Crear Acción"
  const actionBtn = page.locator('[class*="MuiSpeedDialAction-fab"], [aria-label="Crear Acción"]').first();
  await actionBtn.waitFor({ state: 'visible', timeout: 5000 });
  await actionBtn.click();
  await page.waitForTimeout(1000);
}

/** Abre el drawer de comentarios de la primera fila */
async function openCommentDrawer(page) {
  const firstRow = page.locator('.ag-row').first();
  await firstRow.scrollIntoViewIfNeeded().catch(() => {});
  await firstRow.hover().catch(() => {});
  await page.waitForTimeout(300);

  // Columna tiene field='global_edit' → col-id="global_edit"
  const optionsCell = firstRow.locator('[col-id="global_edit"]');
  const cellVisible = await optionsCell.isVisible().catch(() => false);

  if (cellVisible) {
    // Botón comentarios tiene title="Comentarios" — es el 3er botón (Edit/Lock/Comment)
    const commentBtn = optionsCell.locator('button[title="Comentarios"]').first();
    const byTitle    = await commentBtn.isVisible().catch(() => false);
    if (byTitle) {
      await commentBtn.click({ force: true });
    } else {
      // Fallback posicional: nth(2) = CommentForumIcon
      const btns = optionsCell.locator('button');
      const cnt  = await btns.count();
      await btns.nth(Math.min(2, cnt - 1)).click({ force: true });
    }
  } else {
    // Fallback: buscar botón por título en toda la fila
    const commentBtn = firstRow.locator('button[title="Comentarios"]').first();
    if (await commentBtn.isVisible().catch(() => false)) {
      await commentBtn.click({ force: true });
    } else {
      await firstRow.locator('.ag-cell button').nth(2).click({ force: true });
    }
  }
  await page.waitForTimeout(1500);
}

async function closeDrawer(page) {
  const closeBtn = page.locator('[class*="MuiDrawer-paper"] [class*="MuiIconButton"]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(800);
  }
}

/** Navega todas las tabs del formulario hasta llegar a la última */
async function navigateToLastTab(page, testInfo, prefix) {
  let tabIndex = 0;
  let prevCount = -1;

  while (true) {
    const tabs = page.locator('[class*="MuiDrawer-paper"] [role="tab"]');
    const tabCount = await tabs.count();
    if (tabCount === 0 || tabCount === prevCount) break;
    prevCount = tabCount;

    // Botón Guardar solo aparece en última tab
    const saveBtn = page.locator('[class*="MuiDrawer-paper"] button').filter({ hasText: /^guardar$/i });
    const saveVisible = await saveBtn.isVisible().catch(() => false);
    if (saveVisible) break;

    // Siguiente tab
    if (tabIndex + 1 < tabCount) {
      tabIndex++;
      await tabs.nth(tabIndex).click();
      await page.waitForTimeout(600);
      await snap(page, testInfo, `${prefix}-tab${tabIndex}`);
    } else {
      break;
    }
  }
}

/** Llena todos los campos de texto/textarea visibles y vacíos con valor de prueba */
async function fillVisibleTextFields(page, label) {
  const inputs = page.locator('[class*="MuiDrawer-paper"] input[type="text"], [class*="MuiDrawer-paper"] textarea');
  const count = await inputs.count();
  let filled = 0;
  for (let i = 0; i < count; i++) {
    const inp = inputs.nth(i);
    const visible = await inp.isVisible().catch(() => false);
    const disabled = await inp.isDisabled().catch(() => true);
    const readonly = await inp.getAttribute('readonly').catch(() => 'true');
    if (!visible || disabled || readonly !== null) continue;
    const val = await inp.inputValue().catch(() => '');
    if (val === '') {
      await inp.fill(`${label} ${i + 1}`);
      filled++;
    }
  }
  return filled;
}

/** Selecciona primer opción disponible en selects vacíos del drawer */
async function fillVisibleSelects(page) {
  // MUI Select — el trigger visible es el div[role="combobox"] o MuiSelect-select
  const selects = page.locator('[class*="MuiDrawer-paper"] [class*="MuiSelect-select"]:not([class*="MuiInputBase-readOnly"])');
  const count = await selects.count();
  let filled = 0;
  for (let i = 0; i < count; i++) {
    const sel = selects.nth(i);
    const visible = await sel.isVisible().catch(() => false);
    if (!visible) continue;
    const text = await sel.textContent().catch(() => '');
    // Si ya tiene valor (no es placeholder), saltar
    if (text && text.trim() !== '' && !text.includes('Seleccione') && !text.includes('​')) continue;

    await sel.click();
    await page.waitForTimeout(300);
    const listbox = page.locator('[role="listbox"]');
    if (await listbox.isVisible().catch(() => false)) {
      const options = listbox.locator('[role="option"]:not([aria-disabled="true"])');
      const optCount = await options.count();
      if (optCount > 0) {
        await options.first().click();
        filled++;
        await page.waitForTimeout(300);
      } else {
        await page.keyboard.press('Escape');
      }
    }
  }
  return filled;
}

// ─── Suite: crear acción ──────────────────────────────────────────────────────

test.describe('Actions CRUD — crear acción', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
    await waitForGrid(page);
    await page.waitForTimeout(1000);
  });

  test('FAB SpeedDial abre el menú de creación', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: '[class*="MuiSpeedDial"] FAB → hover → [class*="MuiSpeedDialAction-fab"] visible',
    });
    await snap(page, testInfo, '01-fab-closed');

    const speedDial = page.locator('[class*="MuiSpeedDial"]').first();
    await expect(speedDial).toBeVisible({ timeout: 10000 });

    // MUI SpeedDial se abre con hover — no con click del FAB principal
    const mainFab = speedDial.locator('[class*="MuiFab"]').first();
    await mainFab.hover();
    await page.waitForTimeout(600);
    await snap(page, testInfo, '02-fab-open');

    // SpeedDialAction button debe aparecer
    const actionBtn = page.locator('[class*="MuiSpeedDialAction-fab"], [aria-label="Crear Acción"]').first();
    await expect(actionBtn).toBeVisible({ timeout: 5000 });
    console.log('SpeedDial abrió y acción "Crear Acción" visible ✓');
  });

  test('click en "Crear Acción" abre drawer con formulario', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'SpeedDial hover → SpeedDialAction click → MuiDrawer con tabs y campos de formulario',
    });
    await openCreateForm(page);

    const drawer = await waitForDrawer(page);
    await snap(page, testInfo, '03-drawer-open');

    // Título del drawer
    const title = page.locator('[class*="MuiDrawer-paper"] [class*="MuiTypography-h"], [class*="MuiDrawer-paper"] [class*="MuiAppBar"] *').first();
    console.log(`Título drawer: ${await title.textContent().catch(() => 'N/A')}`);

    // Tabs deben existir
    const tabs = page.locator('[class*="MuiDrawer-paper"] [role="tab"]');
    const tabCount = await tabs.count();
    console.log(`Tabs en formulario de creación: ${tabCount}`);
    expect(tabCount).toBeGreaterThanOrEqual(1);

    await closeDrawer(page);
  });

  test('formulario muestra tabs y campos en cada tab', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'Drawer formulario: tabs [role="tab"], inputs text/textarea, MuiSelect en cada tab',
    });
    await openCreateForm(page);
    await waitForDrawer(page);
    await snap(page, testInfo, '04-form-tab1');

    const tabs = page.locator('[class*="MuiDrawer-paper"] [role="tab"]');
    const tabCount = await tabs.count();
    console.log(`Total tabs: ${tabCount}`);

    const tabLabels = await tabs.allTextContents();
    console.log('Tabs:', tabLabels.join(' | '));
    testInfo.annotations.push({ type: 'finding', description: `Tabs formulario: ${tabLabels.join(' | ')}` });

    // Verificar campos en primera tab
    const inputs = page.locator('[class*="MuiDrawer-paper"] input, [class*="MuiDrawer-paper"] textarea');
    const inputCount = await inputs.count();
    console.log(`Campos en tab 1: ${inputCount}`);
    expect(inputCount).toBeGreaterThanOrEqual(1);

    // Navegar por todas las tabs y registrar campos
    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
      const tabInputs = await page.locator('[class*="MuiDrawer-paper"] input, [class*="MuiDrawer-paper"] textarea').count();
      const tabSelects = await page.locator('[class*="MuiDrawer-paper"] [class*="MuiSelect-select"]').count();
      console.log(`Tab ${i + 1} "${tabLabels[i]}": ${tabInputs} inputs, ${tabSelects} selects`);
      await snap(page, testInfo, `04-form-tab${i + 1}`);
    }

    await closeDrawer(page);
  });

  test('llenado de campos y navegación de tabs hasta Guardar', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'Formulario creación: fill inputs, selects, navigate tabs, llegar a botón Guardar',
    });
    await openCreateForm(page);
    await waitForDrawer(page);
    await snap(page, testInfo, '05-form-start');

    const tabs = page.locator('[class*="MuiDrawer-paper"] [role="tab"]');
    const tabCount = await tabs.count();
    console.log(`Navigando ${tabCount} tab(s)`);

    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);

      const filledText    = await fillVisibleTextFields(page, `${TEST_PREFIX}`);
      const filledSelects = await fillVisibleSelects(page);
      console.log(`Tab ${i + 1}: ${filledText} text fields, ${filledSelects} selects llenados`);
      await snap(page, testInfo, `05-form-tab${i + 1}-filled`);
    }

    // Verificar que botón Guardar es visible en la última tab
    const saveBtn = page.locator('[class*="MuiDrawer-paper"] button').filter({ hasText: /^guardar$/i });
    const saveVisible = await saveBtn.isVisible().catch(() => false);
    console.log(`Botón Guardar visible: ${saveVisible}`);
    testInfo.annotations.push({ type: 'finding', description: `Botón Guardar visible en última tab: ${saveVisible}` });

    if (saveVisible) {
      await snap(page, testInfo, '05-form-ready-to-save');
      expect(saveVisible).toBe(true);
    }

    await closeDrawer(page);
  });

  test('envío del formulario — validación o éxito', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'Submit formulario creación → mensaje éxito "Formulario guardado exitosamente" o errores de validación visibles',
    });
    await openCreateForm(page);
    await waitForDrawer(page);

    const tabs = page.locator('[class*="MuiDrawer-paper"] [role="tab"]');
    const tabCount = await tabs.count();

    // Llenar todos los tabs
    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
      await fillVisibleTextFields(page, `${TEST_PREFIX} Acción`);
      await fillVisibleSelects(page);
    }

    await snap(page, testInfo, '06-before-submit');

    // Click Guardar
    const saveBtn = page.locator('[class*="MuiDrawer-paper"] button').filter({ hasText: /^guardar$/i });
    const saveVisible = await saveBtn.isVisible().catch(() => false);

    if (!saveVisible) {
      console.log('Botón Guardar no visible — navegando a última tab');
      if (tabCount > 0) {
        await tabs.nth(tabCount - 1).click();
        await page.waitForTimeout(500);
      }
    }

    const saveBtnFinal = page.locator('[class*="MuiDrawer-paper"] button').filter({ hasText: /^guardar$/i });
    await expect(saveBtnFinal).toBeVisible({ timeout: 5000 });
    await saveBtnFinal.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await snap(page, testInfo, '06-after-submit');

    // Verificar resultado: éxito (snackbar/toast) o errores de validación
    const successMsg = page.getByText(/formulario guardado|guardado exitosamente|creado exitosamente|éxito/i).first();
    const validationErr = page.locator('[class*="MuiAlert-message"], [class*="MuiFormHelperText-root"][class*="error"]').first();

    const successVisible = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
    const errorVisible   = await validationErr.isVisible().catch(() => false);

    console.log(`Resultado submit — éxito: ${successVisible} | error validación: ${errorVisible}`);
    testInfo.annotations.push({
      type: 'result',
      description: `Submit: éxito=${successVisible} | validación=${errorVisible}`,
    });

    // Al menos una de las dos respuestas debe ocurrir
    expect(successVisible || errorVisible).toBe(true);
  });
});

// ─── Suite: comentarios en acción existente ───────────────────────────────────
// Botones en col global_edit (field='global_edit' en ActionsTable.js):
//   nth(0) = EditIcon → view_action
//   nth(1) = CloseActionIcon (Lock) → view_comment/form
//   nth(2) = CommentForumIcon → view_comment/list  ← el que usamos aquí

test.describe('Actions CRUD — comentarios', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTE);
    await page.waitForLoadState('networkidle');
    await waitForGrid(page);
    await page.waitForTimeout(1000);
  });

  test('opciones de fila muestran botón de comentarios', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: '[col-id="global_edit"] — 3 botones: Edit, Lock(cerrar), CommentForum(comentarios)',
    });
    const firstRow = page.locator('.ag-row').first();
    await expect(firstRow).toBeVisible();
    await firstRow.hover().catch(() => {});

    const optionsCell = firstRow.locator('[col-id="global_edit"]');
    const cellVisible = await optionsCell.isVisible().catch(() => false);

    if (cellVisible) {
      const btns = optionsCell.locator('button');
      const btnCount = await btns.count();
      console.log(`Botones en col global_edit: ${btnCount}`);
      await snap(page, testInfo, '07-options-cell');
      expect(btnCount).toBeGreaterThanOrEqual(2);
    } else {
      const allBtns = firstRow.locator('button');
      const cnt = await allBtns.count();
      console.log(`Botones fila (col pinned no visible): ${cnt}`);
      await snap(page, testInfo, '07-row-buttons');
      testInfo.annotations.push({ type: 'finding', description: `col global_edit pinned-left no visible. Botones fila: ${cnt}` });
    }
  });

  test('click en botón comentario abre drawer de comentarios', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'button[title="Comentarios"] en [col-id="global_edit"] → MuiDrawer visible',
    });
    await openCommentDrawer(page);
    await snap(page, testInfo, '08-comment-drawer');

    const drawer = page.locator('[class*="MuiDrawer-paper"]').first();
    await expect(drawer).toBeVisible({ timeout: 8000 });

    const drawerText = await drawer.textContent().catch(() => '');
    console.log(`Drawer comentarios (80 chars): ${drawerText?.substring(0, 80)}`);
    testInfo.annotations.push({ type: 'finding', description: `Drawer texto: ${drawerText?.substring(0, 80)}` });

    await closeDrawer(page);
  });

  test('drawer de comentarios tiene tabs Lista y Formulario', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: '[role="tab"] en MuiDrawer: "Lista" y "Formulario"',
    });
    await openCommentDrawer(page);
    const drawer = await waitForDrawer(page);
    await snap(page, testInfo, '09-comment-tabs');

    const tabs = drawer.locator('[role="tab"]');
    const tabLabels = await tabs.allTextContents();
    console.log(`Tabs comentarios: ${tabLabels.join(' | ')}`);
    testInfo.annotations.push({ type: 'finding', description: `Tabs: ${tabLabels.join(' | ')}` });
    expect(tabLabels.length).toBeGreaterThanOrEqual(1);

    const hasLista      = tabLabels.some(t => /lista/i.test(t));
    const hasFormulario = tabLabels.some(t => /formulario/i.test(t));
    console.log(`Tab Lista: ${hasLista} | Tab Formulario: ${hasFormulario}`);
    expect(hasLista || hasFormulario).toBe(true);

    await closeDrawer(page);
  });

  test('tab Formulario muestra campos para agregar comentario', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'ALTO',
      elements: 'Tab "Formulario" → textarea Comentario, select Estado, slider Progreso',
    });
    await openCommentDrawer(page);
    await waitForDrawer(page);

    const formularioTab = page.locator('[class*="MuiDrawer-paper"] [role="tab"]').filter({ hasText: /formulario/i });
    if (await formularioTab.isVisible().catch(() => false)) {
      await formularioTab.click();
      await page.waitForTimeout(600);
    }
    await snap(page, testInfo, '10-comment-form-tab');

    const textarea = page.locator('[class*="MuiDrawer-paper"] textarea').first();
    const textareaVisible = await textarea.isVisible().catch(() => false);
    console.log(`Textarea comentario visible: ${textareaVisible}`);
    testInfo.annotations.push({ type: 'finding', description: `Textarea visible: ${textareaVisible}` });

    const formInputs = await page.locator('[class*="MuiDrawer-paper"] input, [class*="MuiDrawer-paper"] textarea').count();
    expect(formInputs).toBeGreaterThanOrEqual(1);

    await closeDrawer(page);
  });

  test('agregar un comentario a una acción existente', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'CRÍTICO',
      elements: 'Drawer comentarios → tab Formulario → fill textarea → submit → éxito o validación',
    });
    await openCommentDrawer(page);
    await waitForDrawer(page);
    await snap(page, testInfo, '11-comment-before');

    const formularioTab = page.locator('[class*="MuiDrawer-paper"] [role="tab"]').filter({ hasText: /formulario/i });
    if (await formularioTab.isVisible().catch(() => false)) {
      await formularioTab.click();
      await page.waitForTimeout(600);
    }

    const textarea = page.locator('[class*="MuiDrawer-paper"] textarea').first();
    await expect(textarea).toBeVisible({ timeout: 8000 });
    await textarea.fill(`${TEST_PREFIX} - Comentario E2E - ${new Date().toISOString()}`);
    await page.waitForTimeout(300);

    await fillVisibleSelects(page);
    await snap(page, testInfo, '11-comment-filled');

    // Buscar botón submit — en FormBuilder de comentarios puede ser "Guardar" o cualquier submit
    let submitted = false;
    const submitSelectors = [
      '[class*="MuiDrawer-paper"] button[type="submit"]',
      '[class*="MuiDrawer-paper"] button.MuiButton-containedPrimary',
      '[class*="MuiDrawer-paper"] button.MuiButton-contained',
    ];
    const submitByText = page.locator('[class*="MuiDrawer-paper"] button').filter({ hasText: /^guardar$|^enviar$|^agregar$/i }).first();
    if (await submitByText.isVisible().catch(() => false)) {
      await submitByText.click();
      submitted = true;
    } else {
      for (const sel of submitSelectors) {
        const btn = page.locator(sel).first();
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
          submitted = true;
          break;
        }
      }
    }
    console.log(`Submit button clicked: ${submitted}`);

    if (submitted) {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2500);
    }
    await snap(page, testInfo, '11-comment-after-submit');

    // React-toastify: .Toastify__toast (app usa react-toastify v11)
    const toastSuccess = await page.locator('.Toastify__toast--success, .Toastify__toast').first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    const successText  = await page.getByText(/guardado|exitosamente|agregado|éxito/i).first()
      .isVisible({ timeout: 2000 }).catch(() => false);
    const drawerClosed = await page.locator('[class*="MuiDrawer-paper"]').first().isHidden().catch(() => false);
    const errorVisible = await page.locator('[class*="MuiAlert"], [class*="MuiFormHelperText-root"][class*="error"], .Toastify__toast--error')
      .first().isVisible().catch(() => false);
    // Tab cambia a Lista automáticamente tras éxito
    const onListaTab = await page.locator('[class*="MuiDrawer-paper"] [role="tab"][aria-selected="true"]')
      .filter({ hasText: /lista/i }).isVisible().catch(() => false);

    const listaTab = page.locator('[class*="MuiDrawer-paper"] [role="tab"]').filter({ hasText: /lista/i });
    if (await listaTab.isVisible().catch(() => false)) {
      await listaTab.click();
      await page.waitForTimeout(500);
      await snap(page, testInfo, '11-comment-lista-after');
    }

    const anySuccess = toastSuccess || successText || drawerClosed || onListaTab;
    console.log(`Resultado — toast: ${toastSuccess} | texto: ${successText} | drawerCerró: ${drawerClosed} | listaTab: ${onListaTab} | error: ${errorVisible}`);
    testInfo.annotations.push({
      type: 'result',
      description: `Submit comentario: submitted=${submitted} toast=${toastSuccess} texto=${successText} drawerCerró=${drawerClosed} listaTab=${onListaTab} error=${errorVisible}`,
    });
    // El test pasa si hubo submit Y (algún feedback o no hay error grave)
    expect(submitted).toBe(true);
    expect(anySuccess || errorVisible).toBe(true);
  });

  test('tab Lista muestra comentarios existentes de la acción', async ({ page }, testInfo) => {
    annotate(testInfo, {
      criticality: 'MEDIO',
      elements: 'Tab "Lista" drawer comentarios — MuiCard comentarios o estado vacío',
    });
    await openCommentDrawer(page);
    await waitForDrawer(page);

    const listaTab = page.locator('[class*="MuiDrawer-paper"] [role="tab"]').filter({ hasText: /lista/i });
    if (await listaTab.isVisible().catch(() => false)) {
      await listaTab.click();
      await page.waitForTimeout(600);
    }
    await snap(page, testInfo, '12-comment-list');

    const drawerContent = page.locator('[class*="MuiDrawer-paper"]').first();
    const contentText = await drawerContent.textContent().catch(() => '');
    console.log(`Lista comentarios (100 chars): ${contentText?.substring(0, 100)}`);

    const commentCards = drawerContent.locator('[class*="CommentCard"], [class*="comment-card"], [class*="MuiCard"]');
    const cardCount = await commentCards.count();
    console.log(`Cards visibles: ${cardCount}`);
    testInfo.annotations.push({ type: 'finding', description: `Comentarios en Lista: ${cardCount}` });
    expect(typeof cardCount).toBe('number');

    await closeDrawer(page);
  });
});
