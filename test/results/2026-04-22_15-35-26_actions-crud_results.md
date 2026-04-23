# Reporte de Pruebas E2E — 22/4/2026, 3:35:26 p. m.

> **Módulo revisado:** Actions CRUD  
> **Ruta:** `http://localhost:3000/#/view/actions`  
> **Resultado global:** ❌ FALLÓ (14)  
> **Tests:** 21 total — ✅ 1 pasaron · ❌ 14 fallaron  
> **Duración total:** 665.3s  
> **Resoluciones probadas:** desktop-1280 (1280×800) · tablet-768 (768×1024) · mobile-375 (375×667)  

---

## 📐 desktop-1280  —  1280×800

| Estado | Tests |
|--------|-------|
| ✅ Pasaron | 1 |
| ❌ Fallaron | 14 |

### Actions CRUD — crear acción

#### ❌ FAB SpeedDial abre el menú de creación

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `15.2s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
[class*="MuiSpeedDial"] FAB → hover/click → "Crear Acción" visible
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280/attachments/01-fab-closed-26be38752b1b049c099a953360cc9f1623a5f466.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280/attachments/02-fab-open-01e308f1751fe8d3ca8ac80f99c35dc249ff9d3c.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280/test-failed-1.png`

**Error detectado:**
```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280/test-failed-1.png`

#### ❌ FAB SpeedDial abre el menú de creación

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `12.7s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
[class*="MuiSpeedDial"] FAB → hover/click → "Crear Acción" visible
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280-retry1/attachments/01-fab-closed-26be38752b1b049c099a953360cc9f1623a5f466.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280-retry1/attachments/02-fab-open-01e308f1751fe8d3ca8ac80f99c35dc249ff9d3c.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280-retry1/test-failed-1.png`

#### ❌ click en "Crear Acción" abre drawer con formulario

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `12.2s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
SpeedDial → "Crear Acción" → MuiDrawer con tabs y campos de formulario
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--ba189--abre-drawer-con-formulario-desktop-1280/test-failed-1.png`

**Error detectado:**
```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--ba189--abre-drawer-con-formulario-desktop-1280/test-failed-1.png`

#### ❌ click en "Crear Acción" abre drawer con formulario

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `11.9s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
SpeedDial → "Crear Acción" → MuiDrawer con tabs y campos de formulario
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--ba189--abre-drawer-con-formulario-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--ba189--abre-drawer-con-formulario-desktop-1280-retry1/test-failed-1.png`

#### ⏭️ formulario muestra tabs y campos en cada tab

| Campo | Detalle |
|-------|--------|
| Estado | ⏭️ timedOut |
| Duración | `47.5s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Drawer formulario: tabs [role="tab"], inputs text/textarea, MuiSelect en cada tab
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280/test-failed-1.png`

**Error detectado:**
```
Test timeout of 45000ms exceeded.
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280/test-failed-1.png`

#### ⏭️ formulario muestra tabs y campos en cada tab

| Campo | Detalle |
|-------|--------|
| Estado | ⏭️ timedOut |
| Duración | `47.6s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Drawer formulario: tabs [role="tab"], inputs text/textarea, MuiSelect en cada tab
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
Test timeout of 45000ms exceeded.
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280-retry1/test-failed-1.png`

#### ⏭️ llenado de campos y navegación de tabs hasta Guardar

| Campo | Detalle |
|-------|--------|
| Estado | ⏭️ timedOut |
| Duración | `47.3s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Formulario creación: fill inputs, selects, navigate tabs, llegar a botón Guardar
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/test-failed-1.png`

**Error detectado:**
```
Test timeout of 45000ms exceeded.
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/test-failed-1.png`

#### ⏭️ llenado de campos y navegación de tabs hasta Guardar

| Campo | Detalle |
|-------|--------|
| Estado | ⏭️ timedOut |
| Duración | `47.2s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Formulario creación: fill inputs, selects, navigate tabs, llegar a botón Guardar
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
Test timeout of 45000ms exceeded.
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280-retry1/test-failed-1.png`

#### ⏭️ envío del formulario — validación o éxito

| Campo | Detalle |
|-------|--------|
| Estado | ⏭️ timedOut |
| Duración | `47.3s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
Submit formulario creación → mensaje éxito "Formulario guardado exitosamente" o errores de validación visibles
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--433fc-ulario-—-validación-o-éxito-desktop-1280/test-failed-1.png`

**Error detectado:**
```
Test timeout of 45000ms exceeded.
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--433fc-ulario-—-validación-o-éxito-desktop-1280/test-failed-1.png`

#### ⏭️ envío del formulario — validación o éxito

| Campo | Detalle |
|-------|--------|
| Estado | ⏭️ timedOut |
| Duración | `47.1s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
Submit formulario creación → mensaje éxito "Formulario guardado exitosamente" o errores de validación visibles
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--433fc-ulario-—-validación-o-éxito-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
Test timeout of 45000ms exceeded.
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--433fc-ulario-—-validación-o-éxito-desktop-1280-retry1/test-failed-1.png`

### Actions CRUD — comentarios

#### ✅ opciones de fila muestran botón de comentarios

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `5.3s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
.ag-row [col-id="options"] — botones icon Edit, Comment, Close
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cdfcb-estran-botón-de-comentarios-desktop-1280/attachments/07-row-buttons-87c295c489e93778a7a77c95e6eca0c088c12a9c.png`

#### ❌ click en botón comentario abre drawer de comentarios

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `16.1s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
.ag-row [col-id="options"] button:nth(1) → MuiDrawer con tabs Lista / Formulario
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280/attachments/08-comment-drawer-8377e6a123dbb30504296e7715d0811af32bf51a.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280/test-failed-1.png`

**Error detectado:**
```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="MuiDrawer-paper"]').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('[class*="MuiDrawer-paper"]').first()

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280/test-failed-1.png`

#### ❌ click en botón comentario abre drawer de comentarios

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `16.0s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
.ag-row [col-id="options"] button:nth(1) → MuiDrawer con tabs Lista / Formulario
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280-retry1/attachments/08-comment-drawer-8377e6a123dbb30504296e7715d0811af32bf51a.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="MuiDrawer-paper"]').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('[class*="MuiDrawer-paper"]').first()

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280-retry1/test-failed-1.png`

#### ❌ drawer de comentarios tiene tabs Lista y Formulario

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.5s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
MuiDrawer tabs: [role="tab"] con texto "Lista" y "Formulario"
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--d7108-ene-tabs-Lista-y-Formulario-desktop-1280/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--d7108-ene-tabs-Lista-y-Formulario-desktop-1280/test-failed-1.png`

#### ❌ drawer de comentarios tiene tabs Lista y Formulario

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.5s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
MuiDrawer tabs: [role="tab"] con texto "Lista" y "Formulario"
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--d7108-ene-tabs-Lista-y-Formulario-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--d7108-ene-tabs-Lista-y-Formulario-desktop-1280-retry1/test-failed-1.png`

#### ❌ tab Formulario muestra campos para agregar comentario

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.5s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Tab "Formulario" → textarea Comentario, select Estado, slider Progreso
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--388fc-pos-para-agregar-comentario-desktop-1280/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--388fc-pos-para-agregar-comentario-desktop-1280/test-failed-1.png`

#### ❌ tab Formulario muestra campos para agregar comentario

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.0s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Tab "Formulario" → textarea Comentario, select Estado, slider Progreso
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--388fc-pos-para-agregar-comentario-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--388fc-pos-para-agregar-comentario-desktop-1280-retry1/test-failed-1.png`

#### ❌ agregar un comentario a una acción existente

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.1s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
Drawer comentarios → tab Formulario → fill textarea → submit → éxito o error validación
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/test-failed-1.png`

#### ❌ agregar un comentario a una acción existente

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.9s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
Drawer comentarios → tab Formulario → fill textarea → submit → éxito o error validación
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/test-failed-1.png`

#### ❌ tab Lista muestra comentarios existentes de la acción

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.6s` |
| Criticidad | 🟡 MEDIO |

**Elementos revisados:**
```
Tab "Lista" en drawer comentarios — muestra CommentCard o estado vacío
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--996e7-ios-existentes-de-la-acción-desktop-1280/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--996e7-ios-existentes-de-la-acción-desktop-1280/test-failed-1.png`

#### ❌ tab Lista muestra comentarios existentes de la acción

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `23.4s` |
| Criticidad | 🟡 MEDIO |

**Elementos revisados:**
```
Tab "Lista" en drawer comentarios — muestra CommentCard o estado vacío
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--996e7-ios-existentes-de-la-acción-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--996e7-ios-existentes-de-la-acción-desktop-1280-retry1/test-failed-1.png`

---

## Resumen Global

| Resolución | ✅ Pasaron | ❌ Fallaron | Total |
|------------|-----------|------------|-------|
| `desktop-1280` | 1 | 14 | 21 |
| **TOTAL** | **1** | **14** | **21** |

---

## ❌ Fallos Detallados

### ❌ [desktop-1280] Actions CRUD — crear acción › FAB SpeedDial abre el menú de creación

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — crear acción › FAB SpeedDial abre el menú de creación

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280-retry1/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — crear acción › click en "Crear Acción" abre drawer con formulario

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--ba189--abre-drawer-con-formulario-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — crear acción › click en "Crear Acción" abre drawer con formulario

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/crear\s*acci[oó]n/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/crear\s*acci[oó]n/i).first()

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--ba189--abre-drawer-con-formulario-desktop-1280-retry1/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › click en botón comentario abre drawer de comentarios

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="MuiDrawer-paper"]').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('[class*="MuiDrawer-paper"]').first()

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › click en botón comentario abre drawer de comentarios

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[class*="MuiDrawer-paper"]').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('[class*="MuiDrawer-paper"]').first()

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280-retry1/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › agregar un comentario a una acción existente

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › agregar un comentario a una acción existente

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › drawer de comentarios tiene tabs Lista y Formulario

- **Criticidad:** 🟠 ALTO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--d7108-ene-tabs-Lista-y-Formulario-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › drawer de comentarios tiene tabs Lista y Formulario

- **Criticidad:** 🟠 ALTO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--d7108-ene-tabs-Lista-y-Formulario-desktop-1280-retry1/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › tab Formulario muestra campos para agregar comentario

- **Criticidad:** 🟠 ALTO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--388fc-pos-para-agregar-comentario-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › tab Formulario muestra campos para agregar comentario

- **Criticidad:** 🟠 ALTO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--388fc-pos-para-agregar-comentario-desktop-1280-retry1/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › tab Lista muestra comentarios existentes de la acción

- **Criticidad:** 🟡 MEDIO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--996e7-ios-existentes-de-la-acción-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › tab Lista muestra comentarios existentes de la acción

- **Criticidad:** 🟡 MEDIO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[class*="MuiDrawer-paper"]').first() to be visible

```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--996e7-ios-existentes-de-la-acción-desktop-1280-retry1/test-failed-1.png`

---

## 📁 Archivos Generados

| Tipo | Ruta |
|------|------|
| 📄 Este reporte | `test/results/2026-04-22_15-35-26_actions-crud_results.md` |
| 🖼️ Screenshots desktop | `test/results/screenshots/desktop-1280/` |
| 🖼️ Screenshots tablet | `test/results/screenshots/tablet-768/` |
| 🖼️ Screenshots mobile | `test/results/screenshots/mobile-375/` |
| 🔴 Artifacts de fallo | `test/results/artifacts/` |
| 🌐 Reporte HTML | `test/results/html-report/index.html` |

_Generado automáticamente por `test/md-reporter.js` — 2026-04-22T20:46:31.773Z_
