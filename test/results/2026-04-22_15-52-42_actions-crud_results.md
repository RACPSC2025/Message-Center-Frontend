# Reporte de Pruebas E2E — 22/4/2026, 3:52:42 p. m.

> **Módulo revisado:** Actions CRUD  
> **Ruta:** `http://localhost:3000/#/view/actions`  
> **Resultado global:** ❌ FALLÓ (2)  
> **Tests:** 12 total — ✅ 10 pasaron · ❌ 2 fallaron  
> **Duración total:** 162.7s  
> **Resoluciones probadas:** desktop-1280 (1280×800) · tablet-768 (768×1024) · mobile-375 (375×667)  

---

## 📐 desktop-1280  —  1280×800

| Estado | Tests |
|--------|-------|
| ✅ Pasaron | 10 |
| ❌ Fallaron | 2 |

### Actions CRUD — crear acción

#### ✅ FAB SpeedDial abre el menú de creación

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `6.4s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
[class*="MuiSpeedDial"] FAB → hover → [class*="MuiSpeedDialAction-fab"] visible
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280/attachments/01-fab-closed-26be38752b1b049c099a953360cc9f1623a5f466.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--1be84-al-abre-el-menú-de-creación-desktop-1280/attachments/02-fab-open-01e308f1751fe8d3ca8ac80f99c35dc249ff9d3c.png`

#### ✅ click en "Crear Acción" abre drawer con formulario

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `9.5s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
SpeedDial hover → SpeedDialAction click → MuiDrawer con tabs y campos de formulario
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--ba189--abre-drawer-con-formulario-desktop-1280/attachments/03-drawer-open-802a29152e5d1ac3528df22f1438c0912d909690.png`

#### ✅ formulario muestra tabs y campos en cada tab

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `12.3s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Drawer formulario: tabs [role="tab"], inputs text/textarea, MuiSelect en cada tab
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280/attachments/04-form-tab1-619730f01e5d554670b1e3d5caeba498e19be4e4.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280/attachments/04-form-tab1-619730f01e5d554670b1e3d5caeba498e19be4e4.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280/attachments/04-form-tab2-25fc48c89587395c584f63801680a5c9d0d9bc41.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280/attachments/04-form-tab3-5a86d063e33b3ee7690b01802446d6e214527023.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--51bc6-a-tabs-y-campos-en-cada-tab-desktop-1280/attachments/04-form-tab4-b497b299ab9bf79ac02c14fd7df257d03c738900.png`

#### ✅ llenado de campos y navegación de tabs hasta Guardar

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `24.5s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Formulario creación: fill inputs, selects, navigate tabs, llegar a botón Guardar
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/attachments/05-form-start-f46760aee7755c2424f5a554a7a18cb62764510c.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/attachments/05-form-tab1-filled-e06f1bd2071cc9892879b9ca6d5bfb927e4afc29.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/attachments/05-form-tab2-filled-871378e0fb9d6f97b2326bad5578ec7174074250.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/attachments/05-form-tab3-filled-21d0eba27d67d0c63fd88eb8c2d7c8bf416fea7b.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/attachments/05-form-tab4-filled-824bc0e8cc85afd12ee99f985f303ba1ef7e61fc.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cc6ef-ación-de-tabs-hasta-Guardar-desktop-1280/attachments/05-form-ready-to-save-9e27255b648fb6b40ac1b65d803e301e39be3b0d.png`

#### ✅ envío del formulario — validación o éxito

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `25.1s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
Submit formulario creación → mensaje éxito "Formulario guardado exitosamente" o errores de validación visibles
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--433fc-ulario-—-validación-o-éxito-desktop-1280/attachments/06-before-submit-ebc5b5956b252cbc667f11c2fbc94ed9c052a19b.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--433fc-ulario-—-validación-o-éxito-desktop-1280/attachments/06-after-submit-fc5588aec419330b88a2ae93787e202bf8fc5d45.png`

### Actions CRUD — comentarios

#### ✅ opciones de fila muestran botón de comentarios

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `5.2s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
[col-id="global_edit"] — 3 botones: Edit, Lock(cerrar), CommentForum(comentarios)
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--cdfcb-estran-botón-de-comentarios-desktop-1280/attachments/07-options-cell-5e4dbea72c52473cc05144a5b53b0b2c9de1fe66.png`

#### ✅ click en botón comentario abre drawer de comentarios

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `9.6s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
button[title="Comentarios"] en [col-id="global_edit"] → MuiDrawer visible
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--94029--abre-drawer-de-comentarios-desktop-1280/attachments/08-comment-drawer-8377e6a123dbb30504296e7715d0811af32bf51a.png`

#### ✅ drawer de comentarios tiene tabs Lista y Formulario

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `9.6s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
[role="tab"] en MuiDrawer: "Lista" y "Formulario"
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--d7108-ene-tabs-Lista-y-Formulario-desktop-1280/attachments/09-comment-tabs-e07cbb860270c5825925e294b718ec9140a573d1.png`

#### ✅ tab Formulario muestra campos para agregar comentario

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `10.1s` |
| Criticidad | 🟠 ALTO |

**Elementos revisados:**
```
Tab "Formulario" → textarea Comentario, select Estado, slider Progreso
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--388fc-pos-para-agregar-comentario-desktop-1280/attachments/10-comment-form-tab-9ff0c991151cf7021d4ff98b5c1dbb29d523eea5.png`

#### ❌ agregar un comentario a una acción existente

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `14.1s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
Drawer comentarios → tab Formulario → fill textarea → submit → éxito o validación
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/attachments/11-comment-before-fa45c5b83935a3d1b8042ee515bf7b2fbeaa5d61.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/attachments/11-comment-filled-2f59948fc0566683cb4a65f950c60de476610d5e.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/attachments/11-comment-after-submit-a3a369053f0ff0223d4da08d1ffc516af27c1b69.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/attachments/11-comment-lista-after-a8919d98200a8629aec75142f2ba8512066c7ebb.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/test-failed-1.png`

**Error detectado:**
```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/test-failed-1.png`

#### ❌ agregar un comentario a una acción existente

| Campo | Detalle |
|-------|--------|
| Estado | ❌ failed |
| Duración | `14.7s` |
| Criticidad | 🔴 CRÍTICO |

**Elementos revisados:**
```
Drawer comentarios → tab Formulario → fill textarea → submit → éxito o validación
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/attachments/11-comment-before-fa45c5b83935a3d1b8042ee515bf7b2fbeaa5d61.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/attachments/11-comment-filled-2f59948fc0566683cb4a65f950c60de476610d5e.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/attachments/11-comment-after-submit-a3a369053f0ff0223d4da08d1ffc516af27c1b69.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/attachments/11-comment-lista-after-a8919d98200a8629aec75142f2ba8512066c7ebb.png`
- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/test-failed-1.png`

**Error detectado:**
```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

**Screenshot del error:** `test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/test-failed-1.png`

#### ✅ tab Lista muestra comentarios existentes de la acción

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `10.2s` |
| Criticidad | 🟡 MEDIO |

**Elementos revisados:**
```
Tab "Lista" drawer comentarios — MuiCard comentarios o estado vacío
```

**Screenshots:**

- 📸 `test/results/artifacts/actions-crud-Actions-CRUD--996e7-ios-existentes-de-la-acción-desktop-1280/attachments/12-comment-list-3710b155f22d88b69cba3affe1f680a5d7911077.png`

---

## Resumen Global

| Resolución | ✅ Pasaron | ❌ Fallaron | Total |
|------------|-----------|------------|-------|
| `desktop-1280` | 10 | 2 | 12 |
| **TOTAL** | **10** | **2** | **12** |

---

## ❌ Fallos Detallados

### ❌ [desktop-1280] Actions CRUD — comentarios › agregar un comentario a una acción existente

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280/test-failed-1.png`

### ❌ [desktop-1280] Actions CRUD — comentarios › agregar un comentario a una acción existente

- **Criticidad:** 🔴 CRÍTICO
- **Ruta:** `http://localhost:3000/#/view/actions`
- **Resolución:** `desktop-1280`

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

**Screenshot auto-capturado en fallo:**
`test/results/artifacts/actions-crud-Actions-CRUD--2e252-ario-a-una-acción-existente-desktop-1280-retry1/test-failed-1.png`

---

## 📁 Archivos Generados

| Tipo | Ruta |
|------|------|
| 📄 Este reporte | `test/results/2026-04-22_15-52-42_actions-crud_results.md` |
| 🖼️ Screenshots desktop | `test/results/screenshots/desktop-1280/` |
| 🖼️ Screenshots tablet | `test/results/screenshots/tablet-768/` |
| 🖼️ Screenshots mobile | `test/results/screenshots/mobile-375/` |
| 🔴 Artifacts de fallo | `test/results/artifacts/` |
| 🌐 Reporte HTML | `test/results/html-report/index.html` |

_Generado automáticamente por `test/md-reporter.js` — 2026-04-22T20:55:25.252Z_
