# Reporte de Pruebas E2E — 22/4/2026, 3:56:12 p. m.

> **Módulo revisado:** Actions CRUD  
> **Ruta:** `http://localhost:3000/#/view/actions`  
> **Resultado global:** ✅ PASÓ  
> **Tests:** 1 total — ✅ 1 pasaron · ❌ 0 fallaron  
> **Duración total:** 15.3s  
> **Resoluciones probadas:** desktop-1280 (1280×800) · tablet-768 (768×1024) · mobile-375 (375×667)  

---

## 📐 desktop-1280  —  1280×800

| Estado | Tests |
|--------|-------|
| ✅ Pasaron | 1 |
| ❌ Fallaron | 0 |

### Actions CRUD — comentarios

#### ✅ agregar un comentario a una acción existente

| Campo | Detalle |
|-------|--------|
| Estado | ✅ passed |
| Duración | `14.2s` |
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

---

## Resumen Global

| Resolución | ✅ Pasaron | ❌ Fallaron | Total |
|------------|-----------|------------|-------|
| `desktop-1280` | 1 | 0 | 1 |
| **TOTAL** | **1** | **0** | **1** |

---

## ✅ Sin Fallos

Todas las pruebas pasaron en todas las resoluciones.

---

## 📁 Archivos Generados

| Tipo | Ruta |
|------|------|
| 📄 Este reporte | `test/results/2026-04-22_15-56-12_actions-crud_results.md` |
| 🖼️ Screenshots desktop | `test/results/screenshots/desktop-1280/` |
| 🖼️ Screenshots tablet | `test/results/screenshots/tablet-768/` |
| 🖼️ Screenshots mobile | `test/results/screenshots/mobile-375/` |
| 🔴 Artifacts de fallo | `test/results/artifacts/` |
| 🌐 Reporte HTML | `test/results/html-report/index.html` |

_Generado automáticamente por `test/md-reporter.js` — 2026-04-22T20:56:27.744Z_
