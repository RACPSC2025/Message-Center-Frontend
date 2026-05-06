# IA Backend — API Reference

Base URL configurada en `window.__APP_CONFIG__.api_url_ia` (default: `http://localhost:8000/`).
Ver [public/config.js](../../public/config.js).

Swagger interactivo: `http://localhost:8000/docs`

---

## Autenticación

Todos los endpoints excepto `/health` y `/v1/health` requieren Bearer token en el header `Authorization`.

### Cómo obtener el token

**Producción / integración con login-amatia** — leer directo de `localStorage`:

```js
const token = localStorage.getItem('Auth-Token')
if (!token) throw new Error('No autenticado — redirigir a login')
```

`login-amatia-express` guarda el token en `localStorage['Auth-Token']` tras el login exitoso. Esta es la fuente canónica en la app.

> **Bug frecuente:** Si `token` es `null`, el header queda `Bearer undefined` y el servidor responde `401`. Siempre validar antes del fetch.

**Desarrollo local** — llamar a `/auth/dev-token` (solo disponible con `ENVIRONMENT=DEV`):

```js
const res = await fetch('http://localhost:8000/auth/dev-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'username=devuser&password=devpass123',
})
const data = await res.json()
const token = data.api_response.access_token  // extraer de api_response
localStorage.setItem('Auth-Token', token)
```

### `POST /auth/dev-token`

Solo disponible con `ENVIRONMENT=DEV`.

**Request** — `application/x-www-form-urlencoded`
```
username=devuser&password=devpass123
```

**Response `200`**
```json
{
  "status": 200,
  "error_description": "",
  "api_response": {
    "access_token": "eyJ...",
    "token_type": "bearer"
  }
}
```

Token expira en 30 minutos. Al recibir `401`: sesión expirada — redirigir a login.

---

## Envelope de respuesta

Solo el endpoint de **autenticación** (`/auth/dev-token`) sigue el envelope:

```json
{
  "status": 200,
  "error_description": "",
  "api_response": { ... }
}
```

**Todos los demás endpoints** (`ingest`, `query/library`, `query/direct-pdf`, `query/image`, `get_summary_notes`) retornan respuesta **flat** — sin envelope. Leer `data` directamente.

---

## Documentos

### `POST /v1/documents/ingest`

Indexa uno o más PDFs en ChromaDB. Los chunks quedan persistentes hasta limpiar la colección.

**Request** — `multipart/form-data` (NO setear `Content-Type` manualmente)

| Campo | Tipo | Req | Default | Descripción |
|---|---|---|---|---|
| `files` | `File[]` | ✅ | — | Uno o más archivos `.pdf` |
| `force_reconvert` | boolean | — | `false` | Re-procesa archivos ya indexados |

**Response `200`** — flat, sin envelope

```json
{
  "status": "success",
  "processed_files": ["norma.pdf"],
  "total_chunks": 42,
  "indexed_chunks": 42,
  "errors": []
}
```

> `status` puede ser `"partial"` si hubo errores en algún archivo. Validar `data.status === "success"`.

### `GET /v1/documents/count`

Devuelve total de chunks actualmente indexados en ChromaDB.

**Response `200`** — `{ "count": 42 }`

---

## Consultas

### `POST /v1/query/library`

Consulta el contenido indexado en ChromaDB. No requiere subir archivos.
Usar **después** de `/v1/documents/ingest`.

**Request** — `application/json`

```json
{
  "question": "¿Cuáles son las obligaciones del contratista?",
  "top_k": 10,
  "model": null,
  "user_prompt": null,
  "source_filter": "contrato_2024.pdf",
  "prompt_type": "legal"
}
```

| Campo | Tipo | Req | Default | Descripción |
|---|---|---|---|---|
| `question` | string | ✅ | — | Pregunta en lenguaje natural |
| `top_k` | int | — | `10` | Chunks relevantes a recuperar (1–50) |
| `model` | string | — | `null` | ARN o model ID; si se omite, selección automática |
| `user_prompt` | string | — | `null` | Prompt adicional (pasa validación de seguridad) |
| `source_filter` | string | — | `null` | Nombre exacto del archivo (igual a `processed_files` del ingest). Si es `null`, busca en toda la colección. **Siempre pasar** para evitar mezclar contenido de documentos distintos. |
| `prompt_type` | enum | — | `"general"` | `"general"` \| `"legal"`. `legal` antepone contexto de analista legal senior antes del `user_prompt` |

**Prompt types**

| Valor | Comportamiento |
|---|---|
| `general` (default backend) | `user_prompt` aplicado tal cual. Sin contexto adicional |
| `legal` | Antepone bloque "analista legal senior" desde `config/prompt_contexts.yaml` antes del `user_prompt`. Refuerza citación normativa, distinción técnica obligaciones/facultades, cadena de razonamiento jurídico, lenguaje formal |

> **Esta app pasa `prompt_type: "legal"` por default** — `iaApi.queryLibrary` lo hardcodea ya que el caso de uso es "Análisis de la norma". Para overridear: pasar 4to arg.

Composición del prompt final en modo `legal`:
```
[base system: Legal Agent + reglas estrictas]
---
CONTEXTO ESPECIALIZADO (legal):
[bloque desde config/prompt_contexts.yaml → legal.system]
---
INSTRUCCIÓN ADICIONAL DEL USUARIO:
[user_prompt]   ← solo si user_prompt != null
```

`config/prompt_contexts.yaml` es **hot-reload** en el backend — añadir nuevos tipos no requiere reinicio (sí requiere registrarlos en `Literal[...]` y `_VALID_TYPES`).

**Response `200`** — flat, sin envelope

```json
{
  "answer": "El contratista debe entregar informes mensualmente...",
  "source_docs": ["Cláusula 3.2: El contratista se obliga a...", "Artículo 8..."],
  "grade": "útil",
  "hallucination_detected": false,
  "hallucination_score": 0.0,
  "attempts": 1,
  "mode": "library",
  "cache_hit": false,
  "cache_layer": null,
  "model_used": "arn:aws:bedrock:us-east-2:762233737662:inference-profile/..."
}
```

| Campo | Descripción |
|---|---|
| `answer` | Respuesta generada por el modelo |
| `source_docs` | Array de strings con nombres de archivo fuente (ej. `["contrato.pdf"]`). Puede ser `["unknown"]` cuando el backend no retorna metadata. Cuando hay `source_filter` activo, contiene el nombre del archivo filtrado. |
| `grade` | Evaluación de relevancia en español — ej: `"útil"` / `"no útil"` |
| `hallucination_detected` | `true` si el modelo detectó alucinación |
| `hallucination_score` | Confianza (0.0–1.0); `0.0` = sin alucinación detectada |
| `mode` | `"library"` para consultas sobre ChromaDB |
| `cache_hit` | `true` si la respuesta vino de caché semántica |

> **Scope:** `query/library` busca en **toda la colección ChromaDB** si `source_filter` es `null`. Pasar `source_filter` con el nombre exacto del archivo para aislar la búsqueda a un solo documento. El filtro aplica a todos los pasos del pipeline: vector search, HyDE, Multi-Query y BM25.

### `POST /v1/query/direct-pdf`

Consulta un PDF sin indexación persistente. El archivo se procesa en memoria y se descarta.
Útil para documentos temporales o consultas únicas.

**Request** — `multipart/form-data`

| Campo | Tipo | Req | Descripción |
|---|---|---|---|
| `files` | `File[]` | ✅ | Uno o más PDFs |
| `question` | string | ✅ | Pregunta en lenguaje natural |

**Response** — misma estructura flat que `query/library` (sin envelope).

> Para múltiples preguntas sobre el mismo PDF usar **ingest + query/library** — `direct-pdf` re-procesa el archivo en cada llamada.

### `POST /analyze/image/stream`

Extrae elementos legales estructurados (artículos, parágrafos, numerales, literales) de una o más imágenes vía **SSE**. Múltiples imágenes se tratan como páginas secuenciales del mismo documento.

Usado por: `AnalysisRegulation.js` → `handleImageAnalysis` (botón "Recorte IA" de `PDFViewerComponent`).

**Request** — `multipart/form-data`

| Campo | Tipo | Req | Descripción |
|---|---|---|---|
| `files` | `File[]` | ✅ | Imágenes PNG/JPEG/JPG/GIF/WEBP. Máx. 5 MB c/u |
| `model` | string | — | ARN o model ID AWS Bedrock. Default: `us.anthropic.claude-3-5-sonnet-20241022-v2:0` |
| `note_reference` | string | — | Referencia que se añade a todos los elementos extraídos |

> No enviar `Content-Type` — el browser lo setea con boundary.

**Response** — `text/event-stream` (SSE)

Cada evento: `data: { ...JSON... }\n\n`

| Evento | Cuándo | Campos clave |
|---|---|---|
| `start` | Primer evento | `total_images`, `processing_mode` |
| `obligation_detected` | Por cada elemento extraído (N veces) | `analysis` — ver tabla abajo |
| `complete` | Último evento (éxito) | `stats.total_elements`, `stats.image_quality`, `stats.confidence` |
| `fatal_error` | Error o timeout (300 s) | `error` |

**Campos de `analysis` en `obligation_detected`:**

| Campo | Tipo | Descripción |
|---|---|---|
| `id_process` | string | ID único — prefijo (`art`/`par`/`lit`/`num`) + timestamp + índice |
| `type` | string | `"artículo"` / `"parágrafo"` / `"numeral"` / `"literal"` |
| `parent` | string | `id_process` del padre; `""` si es raíz |
| `number` | string | Ej. `"Artículo 68"`, `"Parágrafo 1"` |
| `description` | string | Descripción breve |
| `complete_description` | string | Texto literal completo |
| `subject` | string | Sujeto obligado |
| `deadline` | string | Plazo: `"Inmediato"` / `"Permanente"` / `"30 días"` |
| `priority` | string | `"Alta"` / `"Media"` / `"Baja"` |
| `prob_task` | float | Probabilidad 0.0–1.0 de que genere tarea |
| `note_reference` | string\|null | Referencia enviada en request |

**Token:** leer de `localStorage.getItem('Auth-Token')`. Validar antes del fetch — si es `null`, error 401.

**Errores:** `400` si formato no soportado o imagen > 5 MB. `401` si token inválido o expirado (sesión caducó — redirigir a login).

---

### `POST /v1/query/image`

Analiza imágenes (JPEG, PNG, WEBP, GIF) con modelos multimodales.

**Request** — `multipart/form-data`

| Campo | Tipo | Req | Descripción |
|---|---|---|---|
| `files` | `File[]` | ✅ | Imágenes (máx recomendado: 5 MB c/u) |
| `question` | string | ✅ | Pregunta o instrucción sobre las imágenes |

**Response `200`**
```json
{
  "status": 200,
  "error_description": "",
  "api_response": {
    "results": {
      "grafico.png": "El gráfico muestra una tendencia descendente en emisiones..."
    }
  }
}
```

---

## Resúmenes

### `POST /get_summary_notes`

Genera resumen estructurado desde transcripciones o texto largo.

**Request** — `application/json`

```json
{
  "text": "Transcripción de reunión...",
  "user_prompt": null,
  "model": null,
  "max_chunk_chars": 4000
}
```

**Response `200`**
```json
{
  "status": 200,
  "error_description": "",
  "api_response": {
    "main_topics": ["Revisión de requisitos ambientales", "Plan de acción Q2"],
    "meeting_context": "Reunión de seguimiento HSEQ",
    "decisions": ["Contratar auditoría externa"],
    "next_steps": ["Entregar informe antes del 15 de marzo"],
    "processing_stats": { "chunks": 3, "tokens_used": 1240 }
  }
}
```

---

## Health

| Endpoint | Descripción |
|---|---|
| `GET /health` | Estado general del backend |
| `GET /v1/health` | Estado de legal_rag + ChromaDB |
| `GET /models/categories` | Catálogo de modelos activos por categoría |

---

## Flujo por caso de uso

| Caso | Endpoints |
|---|---|
| PDF seleccionado + múltiples preguntas (Chat norma) | `ingest` → `query/library` × N |
| Consulta única sobre PDF temporal | `query/direct-pdf` |
| Análisis de imagen / gráfico | `query/image` |
| Resumen de transcripción | `get_summary_notes` |
| Consulta a biblioteca ya indexada | `query/library` |

---

## Content-Type por endpoint

| Tipo | Content-Type |
|---|---|
| JSON body (`query/library`, `get_summary_notes`) | `application/json` |
| Upload de archivos (`ingest`, `direct-pdf`, `query/image`) | **No setear** — el browser lo genera con boundary |
| Auth (`/auth/dev-token`) | `application/x-www-form-urlencoded` |

> Setear `Content-Type: application/json` manualmente en un upload multipart **rompe la request**.

---

## Cliente React — helper

[src/lib/iaApi.js](../../src/lib/iaApi.js) — módulo independiente del cliente axios principal.

| Export | Descripción |
|---|---|
| `ingestPDF(file)` | `POST /v1/documents/ingest` — multipart; retorna data flat. `result.indexed_chunks`, `result.processed_files`, `result.status` (`"success"` \| `"partial"`) |
| `queryLibrary(question, topK?, sourceFilter?, promptType?)` | `POST /v1/query/library` — JSON; retorna data flat. `result.answer`, `result.source_docs`, `result.grade`, `result.hallucination_detected`, `result.cache_hit` |

**Obtención del token** (en orden):
1. `localStorage.getItem('Auth-Token')` — token de login-amatia (producción)
2. `/auth/dev-token` con `devuser/devpass123` — solo si localStorage vacío (dev local); resultado cacheado en `_devToken`

**401 handling:**
- Token de localStorage → throw `"Sesión expirada — vuelve a iniciar sesión"` (no se puede auto-renovar)
- Token de dev-token → limpiar `_devToken` y reintentar una vez

Lanza `Error` con texto `HTTP <status>: <body>` si el servidor responde `text/plain` (ej. 500).

**Manejo de respuesta flat vs envelope:**
- Backend de IA retorna **flat** (sin `{status, error_description, api_response}`).
- El helper desempaqueta con `data.api_response ?? data` — si llega envelope (raro, solo `/auth/dev-token`), se extrae; si llega flat, se usa directo.
- `ingestPDF` valida `payload.status === "success"` o `"partial"`. Otro valor → throw.
- `queryLibrary` valida `payload.answer` truthy. Si falta → throw.

**Defaults de `queryLibrary`:**
- `topK = 10`
- `sourceFilter = null` → sin filtro, busca toda la colección
- `promptType = 'legal'` → contexto de analista legal senior (caso de uso "Análisis de la Norma")

`sourceFilter` debe ser el nombre exacto del archivo tal como fue ingresado (`file.name`).

---

## Implementación en la app — Análisis de la Norma

### Flujo completo

```
Usuario carga PDF (ViewModeSwitcher "Cargar PDF")
      ↓
ingestPDF(file)  →  POST /v1/documents/ingest
      ↓  (indexado en ChromaDB)
Usuario escribe pregunta (tab "Chat norma" → ChatNormaTab)
      ↓
handleCustomQuery()  →  queryLibrary(question)  →  POST /v1/query/library
      ↓
Respuesta → historicTextIA → ChatInterface (columna izquierda, viewMode='chat')
```

### Componentes involucrados

| Archivo | Responsabilidad |
|---|---|
| [ViewModeSwitcher.js](../../src/features/analysisRegulation/components/ViewModeSwitcher.js) | Ingest al cargar PDF; chips con chunks indexados y tiempo de respuesta del endpoint |
| [ChatNormaTab.js](../../src/features/analysisRegulation/components/ChatNormaTab.js) | Input de consulta (LexicalInput + botón send); presentacional puro |
| [AnalysisRegulation.js](../../src/features/analysisRegulation/AnalysisRegulation.js) | `handleCustomQuery`: llama `queryLibrary`, escribe en `historicTextIA`, activa `viewMode='chat'` |
| [ChatInterface](../../src/components/Input/lexicalWYSWYG/ChatInterface.js) | Renderiza `historicTextIA` en la columna izquierda |

### Comportamiento de `handleCustomQuery`

1. `setViewMode('chat')` — fuerza vista chat para que `ChatInterface` sea visible
2. Push mensaje `user` a `historicTextIA`
3. Push placeholder `assistant` "🔍 Consultando norma..."
4. `await queryLibrary(question, 10, currentPdfName || null)` — `currentPdfName` = `file.name` del PDF cargado; acota búsqueda al documento activo. `prompt_type='legal'` se aplica por default dentro de `queryLibrary`
5. Reemplaza el placeholder con `result.answer` + `source_docs`, `grade`, `hallucination_detected`, `cache_hit`
6. Scroll al final del chat

### Nota de persistencia ChromaDB

`ingestPDF` indexa el documento de forma **persistente**. Un nuevo ingest del mismo archivo con `force_reconvert=false` es idempotente. Para limpiar la colección: borrar `data/legal_rag/storage/` en el backend y reiniciar.

### Telemetría visible — tiempo de ingest

`ViewModeSwitcher` mide el tiempo de respuesta de `ingestPDF` con `performance.now()` y lo muestra en un chip al lado del chip de chunks. Se mide en éxito y en error.

| State | Default | Propósito |
|---|---|---|
| `showIngestTime` | `true` | Toggle visibilidad del chip de tiempo |
| `ingestSeconds` | `null` | Segundos transcurridos (float, 2 decimales) |

Para ocultar permanentemente: cambiar default a `false` o exponer como prop.
