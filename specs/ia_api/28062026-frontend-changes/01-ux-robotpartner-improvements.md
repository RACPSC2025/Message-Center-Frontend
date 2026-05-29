# 28-06-2026 — UX: robotPartnerLegalMatrix — Progreso, Paginación y PARÁGRAFOS

**Fecha:** 2026-06-28  
**Contexto:** Mejoras de interfaz y experiencia de usuario para el módulo `robotPartnerLegalMatrix`.  
**Archivos afectados:** exclusivamente dentro de `src/features/robotPartnerLegalMatrix/`.  
**Breaking changes en backend:** ninguno nuevo — requiere que el Sprint previo haya implementado `allow_partial` en `GET /v1/documents/taxonomy`.

---

## 1. Barra de progreso de indexación + acceso a artículos en tiempo real

### 1.1 Backend: cambio requerido previo

`GET /v1/documents/taxonomy` — parámetro nuevo `allow_partial: bool = false`:

- Cuando `allow_partial=true`: devolver árbol vacío (`total_articles: 0`, `tree: {}`) en vez de `404` si el documento aún no tiene artículos indexados.
- Permite polling de taxonomía durante ingestión sin recibir errores.

### 1.2 Frontend: modo asíncrono de ingestión

**Antes:** `useIngest` usaba `POST /v1/documents/ingest` síncrono — bloqueaba hasta completar, sin visibilidad de progreso.

**Ahora:** flujo completo asíncrono con polling:

```
POST /v1/documents/ingest?async_mode=true  →  { job_id, poll_url }
GET  /v1/documents/ingest/status/{job_id}  →  { progress, indexed_chunks, total_chunks, status, processed_files }
```

Polling cada **1500 ms**. Termina cuando `status === "completed"` o `"failed"`.

**Nuevas propiedades expuestas por `useIngest`:**

| Prop | Tipo | Descripción |
|---|---|---|
| `progress` | `float 0–1` | Progreso del job de ingestión |
| `source` | `string \| null` | Nombre del archivo (`processed_files[0]`) tan pronto como el backend lo reporta |
| `indexedChunks` | `number` | Fragmentos ya indexados |
| `totalChunks` | `number` | Total de fragmentos del documento |

### 1.3 Frontend: IndexingState rediseñado

Layout nuevo:
```
┌─────────────────────────────────────────────────────┐
│  [LinearProgress / status bar]  X% · N/M fragmentos │  ← flexShrink: 0
├──────────────────────────┬──────────────────────────┤
│                          │  TaxonomyPanel (readOnly) │
│       PDF viewer         │  aparece cuando `source`  │
│                          │  es conocido (≥1 chunk)   │
└──────────────────────────┴──────────────────────────┘
```

- La barra superior es `LinearProgress` con `variant="determinate"` cuando `totalChunks > 0`; `indeterminate` al inicio.
- `TaxonomyPanel` se monta con `readOnly={true}`, `allowPartial={true}`, `pollInterval={3000}`.
- Cuando `status === "done"` el poll de taxonomía se detiene (`pollInterval={0}`).
- Al completar, `onIndexingComplete` se llama igual que antes → transición a `ReadyState`.

### 1.4 Nuevas funciones en `api/robotPartnerApi.js`

```js
export async function ingestPDFAsync(file, docType = null)
// POST /v1/documents/ingest?async_mode=true
// Devuelve: { job_id, status, poll_url }

export async function pollIngestStatus(jobId)
// GET /v1/documents/ingest/status/{jobId}
// Devuelve: IngestStatusResponse flat
```

---

## 2. Paginación de taxonomía (frontend puro)

**Sin cambios en backend.**

### 2.1 Nuevo modo de vista: lista paginada

`TaxonomyPanel` ahora tiene 3 modos (toggle):

| Icono | Modo | Descripción |
|---|---|---|
| `AccountTree` | `tree` | Árbol jerárquico colapsable (comportamiento anterior) |
| `SubjectRounded` | `text` | Texto pre-formateado (comportamiento anterior) |
| `FormatListBulleted` | `list` | **Nuevo** — lista plana paginada con breadcrumb |

### 2.2 Función `flattenArticles(tree)`

Extrae todos los artículos del árbol en orden de lectura, con su ruta jerárquica:

```js
// Resultado:
[
  { number: "1", paragraphs: [...], path: ["DECRETA"] },
  { number: "2", paragraphs: [...], path: ["DECRETA", "TÍTULO I", "CAPÍTULO 1", "SECCIÓN 1"] },
  ...
]
```

Cubre todos los niveles: `major_sections.orphan_articles`, `titles.orphan_articles`, `chapters.orphan_articles`, `sections.articles`.

### 2.3 Controles de paginación

- **Selector de tamaño**: `[10, 30, 50]` artículos por página (MUI `Select` + `variant="standard"`).
- **Navegación**: botones `NavigateBefore` / `NavigateNext` + indicador `"página / total"`.
- El estado de página se resetea al cambiar `source` o `pageSize`.
- Cada artículo en lista muestra breadcrumb en gris arriba: `DECRETA › CAPÍTULO 1 › SECCIÓN 2`.

---

## 3. PARÁGRAFOS como nodos jerárquicos seleccionables

### 3.1 Contexto

Los `paragraphs[]` de cada artículo son **PARÁGRAFOS** jurídicos (`PARÁGRAFO ÚNICO`, `PARÁGRAFO 1`, etc.), unidades legales independientes. Antes eran solo visuales (collapse/expand). Ahora son seleccionables individualmente para la generación de requisitos.

### 3.2 Cambio en `ArticleRow`

**Antes:** collapse/expand con texto, sin checkbox en PARÁGRAFOS.  
**Ahora:** PARÁGRAFOS siempre visibles bajo el artículo, cada uno con su `Checkbox` propio.

```
[✓] Art. 5                          ← checkbox artículo (nivel completo)
    [✓] ↳ PARÁGRAFO 1               ← checkbox PARÁGRAFO independiente
         El presente artículo...    ← content (máx 120 chars)
    [ ] ↳ PARÁGRAFO 2
```

Nueva prop: `readOnly={bool}` — cuando `true`, todos los checkboxes se ocultan (usado en vista previa durante indexación).

### 3.3 Modelo de selección actualizado

**Antes:** `selectedArticles: { articleId: string, editedContent: string | null }[]`

**Ahora:** `selectedArticles: { articleId: string, paragraphId?: string, editedContent: string | null }[]`

| `paragraphId` | Significado |
|---|---|
| `undefined` / `null` | Selección a nivel artículo completo |
| `"PARÁGRAFO 1"` | Solo ese PARÁGRAFO del artículo |

Las selecciones artículo-nivel y PARÁGRAFO-nivel son **independientes** — ambas pueden coexistir en el array.

### 3.4 Nuevas funciones en `RobotPartnerLegalMatrix`

```js
// Nuevo — toggle individual PARÁGRAFO
handleToggleParagraph(articleId, paragraphId, content)
// content viene del tree (paragraphs[].content) → no requiere API call

// Modificado — toggle artículo completo
handleToggleArticle(articleId)
// Ahora solo afecta entradas con !paragraphId
```

### 3.5 `handleGenerate` — sin API call para PARÁGRAFOS

```js
// PARÁGRAFO: content ya disponible desde el tree
if (a.paragraphId) return a;

// Artículo sin edición local: fetch API
const data = await fetchArticle(a.articleId, pdfName);
```

Los PARÁGRAFOS con `content` vacío `""` (chunk solo con encabezado) se envían tal cual — sin llamada extra.

### 3.6 Display en botón "Generar requisito"

```
Generar requisito (2 art. + 3 par.)
```

Conteo separado: artículos seleccionados a nivel completo vs PARÁGRAFOS individuales.

---

## 4. Prop `readOnly` en árbol de taxonomía

Nueva prop `readOnly={bool}` propagada por toda la jerarquía:

```
TaxonomyPanel → NormativeTree → TitleNode → ChapterNode → SectionNode → ArticleRow
```

Cuando `readOnly={true}`:
- Todos los `Checkbox` se ocultan
- `onOpenArticle` deshabilitado (sin edición)
- Chip "vista previa" visible en header
- Panel de integridad oculto
- Botones de export/import ocultos

Usado por `IndexingState` para mostrar taxonomía en vivo sin permitir selección prematura.

---

## 5. Cambios en `useTaxonomy`

**Antes:** `useTaxonomy(source)` — single fetch.

**Ahora:** `useTaxonomy(source, { allowPartial = false, pollInterval = 0 })`

| Opción | Uso |
|---|---|
| `allowPartial` | Pasa `allow_partial=true` al endpoint — sin `404` en documento parcialmente indexado |
| `pollInterval` | `> 0`: recarga automática cada N ms (para vista en vivo durante indexación) |

---

## 6. Mapping `normative_metadata` → formulario de creación de requisito

Referencia: `analysis_services/specs/endpoints/normative-metadata.md`

| Campo spec | Descripción | Campo form | Notas |
|---|---|---|---|
| `titulo` | Nombre descriptivo corto ≤80 chars ★ | `nombre` | Campo principal según spec |
| `titulo_formal` | "Por la cual…" texto legal ≤300 chars | `descripcion` | **Primario** — más preciso que `descripcion` |
| `descripcion` | Contexto adicional ≤200 chars | `descripcion` | Fallback si `titulo_formal` vacío |
| `numero` | Número del acto | `numero` | — |
| `entidad_emisora` | Institución emisora completa | `emitidopor` | Matching fuzzy vs combobox (ver §6.1) |
| `fecha_expedicion` | Fecha firma en español | `fecha_expedicion` | parseSpanishDate() |
| `fecha_vigencia` | Fecha desde la que rige | `fecha_ejecutoria` | parseSpanishDate() |
| `tipo_requisito` | `"general"` \| `"especifico"` | `type` | `"General"` \| `"Específico"` |
| `tipo_normativa` | `DECRETO` \| `RESOLUCIÓN` \| `LEY`… | — | Sin campo destino por ahora |

### 6.1 Matching `entidad_emisora` → combobox `Autoridad que expide`

El combobox carga opciones de `GET /message_center_api/legal_api/get_dropdown_options`.
`entidad_emisora` llega como texto libre del LLM. El matching usa 5 pasos en orden de precisión (archivo: `LegalMatrizForm.js`):

1. Exact match por `label` o `value`
2. Case-insensitive + sin tildes
3. Opción contiene el texto del backend (substring)
4. Texto del backend contiene la opción (backend más verboso)
5. Token overlap ≥50% (tokens >3 chars)

Si ningún paso resuelve → campo vacío, usuario completa manualmente.

### 6.2 Cambio aplicado (28-06-2026)

```js
// ANTES
descripcion: normativeMeta?.descripcion ?? '',

// AHORA — titulo_formal es el texto legal "Por la cual…", más preciso para descripcion del requisito
descripcion: normativeMeta?.titulo_formal || normativeMeta?.descripcion || '',
```

---

## 7. Checklist de implementación

- [x] `api/robotPartnerApi.js` — `ingestPDFAsync`, `pollIngestStatus`, `allow_partial` en `fetchTaxonomy`
- [x] `api/index.js` — re-export de nuevas funciones
- [x] `hooks/useIngest.js` — reescrito en modo async + polling
- [x] `hooks/useTaxonomy.js` — opciones `allowPartial` + `pollInterval`
- [x] `IndexingState.js` — barra de progreso + taxonomía en vivo read-only
- [x] `ArticleRow.js` — PARÁGRAFOS con checkbox + prop `readOnly`
- [x] `SectionNode.js` — prop drilling `onToggleParagraph` + `readOnly`
- [x] `ChapterNode.js` — prop drilling `onToggleParagraph` + `readOnly`
- [x] `TitleNode.js` — prop drilling `onToggleParagraph` + `readOnly`
- [x] `TaxonomyPanel.js` — modo lista paginado (10/30/50) + `readOnly` + `onToggleParagraph` + `allowPartial`/`pollInterval` → `useTaxonomy`
- [x] `ReadyState.js` — pasar `onToggleParagraph` a `TaxonomyPanel`
- [x] `RobotPartnerLegalMatrix.js` — `handleToggleParagraph`, `handleGenerate` sin fetch para PARÁGRAFOS, display `"X art. + Y par."`
- [x] `MessageCenterLegalMatriz.js` — `descripcion` usa `titulo_formal` con fallback a `descripcion`
- [x] `LegalMatrizForm.js` — matching fuzzy 5 pasos para `emitidopor` vs combobox authorities

---

## 7. Notas de compatibilidad

- Documentos indexados antes del Sprint 3 no tienen `content` en los PARÁGRAFOS — llegarán como `""`. La selección funciona igual; el `editedContent` quedará vacío.
- El modo `async_mode=true` requiere backend ≥ Sprint 2 (job_store implementado).
- `allow_partial=true` requiere el cambio de backend indicado en §1.1.
- Las vistas `tree` y `text` no se ven afectadas por la paginación — solo el modo `list`.
