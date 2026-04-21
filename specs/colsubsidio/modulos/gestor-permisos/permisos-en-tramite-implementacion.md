# Implementación — Módulo Permisos Ambientales en Trámite

## 1. Ubicación en el código

```
src/features/ambientalPermit/
├── AmbientalPermit.js          # Componente raíz: filtros + toggle de vistas
├── AmbientalPermitKanban.js    # Vista Kanban con @dnd-kit
├── AmbientalPermitTable.js     # Vista Tabla con MUI Table (sticky headers)
├── AmbientalPermitDrawer.js    # Drawer de detalle con 3 tabs
└── ambientalPermitsData.json   # Datos mock temporales (27 registros)
```

Ruta de acceso en la app: `/view/ambiental_permit`
Habilitado vía config de backend: `modules.ambiental_permit.enabled`

---

## 2. Fuente de datos

**Estado actual:** datos locales (JSON mock).
**Archivo:** `src/features/ambientalPermit/ambientalPermitsData.json`
**Registros:** 27 trámites representativos de la hoja `PERMISOS EN TRÁMITE` del archivo `Permisos_Ambientales_1.xlsx`.

Distribución por estado:

| Estado | Registros |
|---|---|
| En proceso | 10 |
| Desistido | 10 |
| Otorgado | 3 |
| Pendiente Trámitar | 3 |
| Cerrado | 1 |

**Campos incluidos por registro:**

| Campo | Tipo | Nulos permitidos |
|---|---|---|
| `id` | Número único | No |
| `UNIDAD` | Categórico | No |
| `SEDE` | Texto | No |
| `TIPO DE PERMISO` | Categórico | No |
| `TIPO DE TRÁMITE` | Categórico | No |
| `AUTORIDAD` | Categórico | No |
| `ACTO ADMINISTRATIVO INICIAL` | Texto | Sí |
| `EXPEDIENTE` | Texto | Sí |
| `FECHA DE RADICACIÓN DEL PERMISO` | Fecha (dd/mm/yyyy) | Sí |
| `NÚMERO DE RADICADO DE LA SOLICITUD A LA AUTORIDAD AMBIENTAL` | Texto | Sí |
| `FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO` | Fecha (dd/mm/yyyy) | Sí |
| `ESTADO DEL TRÁMITE` | Categórico (ver sección 3) | No |
| `SEMAFORO AMBIENTAL` | `verde` \| `amarillo` \| `rojo` | No |

**Pendiente para integración real:** reemplazar el import de JSON por llamada Axios al endpoint correspondiente. Ver `api-contract.md`.

---

## 3. Estados del trámite (ALIAS canónicos)

```js
const ALIAS_ESTADO = {
  "Pendiente Trámitar": "Pendiente Trámitar",
  "En proceso":         "En proceso",
  "Otorgado":           "Otorgado",
  "Cerrado":            "Cerrado",
  "Desistido":          "Desistido"
};
```

Variantes conocidas en datos reales que deben normalizarse antes de procesar:
- `"Desisitido"` (error tipográfico) → `"Desistido"`
- `"Otorgado "` (espacio trailing) → `"Otorgado"`

---

## 4. Barra superior de filtros

Copiada del patrón de `Tasks.js`. Ubicada sobre las vistas en un strip blanco con `borderBottom`.

| Filtro | Campo | Comportamiento |
|---|---|---|
| Unidad | `UNIDAD` | Independiente; al cambiar, resetea Sede |
| Sede | `SEDE` | Cascading desde Unidad; deshabilitado si no hay opciones |
| Tipo de permiso | `TIPO DE PERMISO` | Independiente |
| Limpiar filtros | — | Visible solo cuando hay al menos un filtro activo |
| Contador | — | Muestra `N trámite(s)` con datos filtrados |

A la derecha: botones de vista (**Tabla** / **Kanban**) con el mismo patrón de icono + label de Tasks.js. El activo se resalta en naranja (`#f57c00`).

---

## 5. Vista Tabla

Componente: `AmbientalPermitTable.js`

- MUI `Table` con `stickyHeader`.
- Scroll horizontal y vertical interno.
- Columnas: Semáforo (dot de color), Unidad, Sede, Tipo de Permiso, Tipo de Trámite, Acto Adm. Inicial, Expediente, F. Radicación, N.° Radicado Solicitud, F. Proyectada Otorgamiento, Estado del Trámite.
- Semáforo renderizado como círculo de color con `Tooltip` descriptivo.
- Estado renderizado como `Chip` con colores por estado (ver sección 3).
- Filas alternas: blanco / `#fafbfc`. Hover: `#f0f4ff`.
- Campos nulos muestran `—` en gris italizado.

---

## 6. Vista Kanban

Componente: `AmbientalPermitKanban.js`
Librería: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (MIT, sin costo).

### 6.1 Columnas

Orden de izquierda a derecha:

| Columna | Color | Representa |
|---|---|---|
| Pendiente Trámitar | Naranja `#f57c00` | No radicado aún |
| En proceso | Azul `#1565c0` | Radicado, en gestión con la autoridad |
| Otorgado | Verde `#2e7d32` | Permiso emitido |
| Cerrado | Gris `#455a64` | Cierre formal del expediente |
| Desistido | Rojo `#b71c1c` | Trámite abandonado |

### 6.2 Ordenamiento de cards

Dentro de cada columna, los registros se ordenan por **`FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO` ascendente** (más próxima primero). Registros sin fecha proyectada van al final.

Formatos de fecha soportados: `dd/mm/yyyy` y `yyyy-mm-dd`. Valores `null` o `"Pendiente"` se tratan como sin fecha.

### 6.3 Card — contenido visible

Cada card muestra:
1. **TIPO DE PERMISO** (encabezado en negrita)
2. **SEMAFORO AMBIENTAL** (dot de color con Tooltip descriptivo, esquina superior derecha)
3. Chips: **SEDE** y **AUTORIDAD**
4. **TIPO DE TRÁMITE**
5. **ACTO ADMINISTRATIVO INICIAL** (si existe)
6. **EXPEDIENTE** (si existe)
7. **FECHA DE RADICACIÓN DEL PERMISO**
8. **NÚMERO DE RADICADO DE LA SOLICITUD A LA AUTORIDAD AMBIENTAL**
9. **FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO**

### 6.4 Drag & Drop

- **Drag handle:** ícono `DragIndicator` (MUI) en esquina superior derecha del card. Solo ese handle inicia el arrastre.
- **Click en el resto del card:** abre el drawer de detalle.
- **Drag entre columnas:** se permite. Al soltar en otra columna, el registro cambia visualmente de columna (estado local). Pendiente: disparar PATCH al API al soltar.
- **Drag dentro de la misma columna:** reordena la lista interna.
- **Sensor:** `PointerSensor` con `activationConstraint: { distance: 5 }` (evita drag accidental en click).
- **DragOverlay:** muestra copia del card durante el arrastre.

### 6.5 Reconstrucción de columnas por filtros

Cuando el padre (`AmbientalPermit.js`) actualiza la prop `items` por cambio de filtro, el kanban detecta el cambio comparando las IDs concatenadas y reconstruye las columnas manteniendo el orden proyectado.

---

## 7. Drawer de detalle

Componente: `AmbientalPermitDrawer.js`
Patrón visual: mismo que `TaskDetailsDrawer.js` (AppBar + `BaseTab` + contenido scrollable).

### 7.1 Header

- AppBar color `#00838f` (teal oscuro ambiental).
- Título: `TIPO DE PERMISO` del registro.
- Subtítulo: `SEDE — UNIDAD`.
- Botón cerrar (ícono X blanco, esquina derecha).

Ancho: `{ sm: '80vw', md: '65vw', lg: '45vw' }`.

### 7.2 Tab 1 — Detalles

Tres secciones separadas por `Divider`:

1. **Identificación:** Unidad, Sede, Autoridad ambiental.
2. **Documentos:** Acto administrativo inicial, Expediente.
3. **Radicación y tiempos:** Fecha de radicación, N.° radicado solicitud, Fecha proyectada de otorgamiento.

Bloque superior con chip de estado (coloreado) y dot de semáforo con Tooltip.

### 7.3 Tab 2 — Actividades

Lista de chequeo de 7 actividades estándar del ciclo de gestión de permisos ambientales:

1. Recopilación de documentos técnicos y legales
2. Elaboración y radicación de la solicitud ante la autoridad
3. Pago de evaluación ambiental y reporte del soporte
4. Seguimiento al auto de inicio de trámite
5. Atención a visita técnica de la autoridad ambiental
6. Respuesta a requerimientos adicionales del acto administrativo
7. Revisión y recepción del acto administrativo final

- Barra de progreso con porcentaje `(completadas / total × 100)`.
- Click en ítem: toggle `done` (estado local).
- Ítems completados: tachados, fondo verde claro, ícono `CheckCircleOutline`.
- **Pendiente para API:** persistir estado de actividades por permiso.

### 7.4 Tab 3 — Comentarios

- Lista de comentarios con: Avatar (iniciales coloreadas), nombre de usuario, fecha formateada (`es-CO`), texto del comentario, chips de archivos adjuntos (nombre + tamaño).
- Estilo de burbuja tipo chat (borde redondeado asimétrico).
- Input al pie: campo de texto multiline + botón adjuntar (sin funcionalidad de upload aún) + botón enviar circular.
- Enter sin Shift = enviar. Shift+Enter = salto de línea.
- Nuevos comentarios se agregan al estado local con usuario `"Usuario actual"`.
- **Pendiente para API:** GET lista de comentarios, POST nuevo comentario, POST adjunto.

### 7.5 Datos mock del drawer

Actividades y comentarios se generan de forma determinista a partir del `id` del registro: `getMockData(item.id)`. Esto garantiza que el mismo permiso siempre muestre los mismos datos mock hasta que se integre el API.

---

## 8. Dependencias nuevas instaladas

| Paquete | Versión | Propósito |
|---|---|---|
| `@dnd-kit/core` | ^6.3.1 | Context y sensores de drag-and-drop |
| `@dnd-kit/sortable` | ^10.0.0 | `useSortable`, `SortableContext`, `arrayMove` |
| `@dnd-kit/utilities` | ^3.2.2 | `CSS.Transform.toString` |

Gestor: **pnpm**. Licencia: MIT.

---

## 9. Pendientes para integración con API

| # | Pendiente | Componente afectado |
|---|---|---|
| 1 | Reemplazar JSON mock por `fetchAmbientalPermits()` (GET con filtros de Unidad/Sede/Tipo) | `AmbientalPermit.js` |
| 2 | PATCH estado del trámite al soltar card en otra columna (kanban) | `AmbientalPermitKanban.js` → `handleDragEnd` |
| 3 | GET actividades por permiso; PUT toggle de actividad | `AmbientalPermitDrawer.js` → `TabActividades` |
| 4 | GET comentarios por permiso; POST nuevo comentario | `AmbientalPermitDrawer.js` → `TabComentarios` |
| 5 | POST adjunto de comentario (actualmente botón sin acción) | `AmbientalPermitDrawer.js` → `TabComentarios` |
| 6 | Normalización de estados en datos reales (ver sección 3) | Thunk de fetch |
| 7 | Paginación / scroll infinito en vista tabla para 134+ registros | `AmbientalPermitTable.js` |

---

## 10. Relación con módulo `permitManager`

El módulo `permitManager` (`/view/permit_manager`) gestiona permisos regulatorios internos de la organización con sus propios estados (Borrador, Revisión, Aprobado, etc.). El módulo `ambientalPermit` es independiente y se enfoca en **trámites ante autoridades ambientales externas** (CAR, SDA, CORPOBOYACÁ, etc.) con el dataset de `PERMISOS EN TRÁMITE`.

No comparten store Redux ni llamadas API en esta fase.
