# IA Backend — API Reference

Base URL configurada en `window.__APP_CONFIG__.api_url_ia` (default: `http://localhost:8000/`).
Ver [public/config.js](../../public/config.js).

Swagger interactivo: `http://localhost:8000/docs`

---

## Autenticación

Todos los endpoints excepto `/health` y `/v1/health` requieren Bearer token.

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

Token expira en 30 minutos. Al recibir `401`: descartar token y re-autenticar una vez.

---

## Envelope de respuesta

Los endpoints de **autenticación e ingest** siguen este envelope:

```json
{
  "status": 200,
  "error_description": "",
  "api_response": { ... }
}
```

Leer `data.api_response`. Un `status: 200` con `error_description` poblado indica fallback controlado.

> **Excepción:** los endpoints de **consulta** (`query/library`, `query/direct-pdf`, `query/image`) retornan la respuesta **flat** — sin envelope. Leer `data` directamente, no `data.api_response`.

---

## Documentos

### `POST /v1/documents/ingest`

Indexa uno o más PDFs en ChromaDB. Los chunks quedan persistentes hasta limpiar la colección.

**Request** — `multipart/form-data` (NO setear `Content-Type` manualmente)

| Campo | Tipo | Req | Default | Descripción |
|---|---|---|---|---|
| `files` | `File[]` | ✅ | — | Uno o más archivos `.pdf` |
| `force_reconvert` | boolean | — | `false` | Re-procesa archivos ya indexados |

**Response `200`**
```json
{
  "status": 200,
  "error_description": "",
  "api_response": {
    "status": "success",
    "processed_files": ["norma.pdf"],
    "total_chunks": 42,
    "indexed_chunks": 42,
    "errors": []
  }
}
```

> `status` puede ser `"partial"` si hubo errores en algún archivo.

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
  "source_filter": "contrato_2024.pdf"
}
```

| Campo | Tipo | Req | Default | Descripción |
|---|---|---|---|---|
| `question` | string | ✅ | — | Pregunta en lenguaje natural |
| `top_k` | int | — | `10` | Chunks relevantes a recuperar (1–50) |
| `model` | string | — | `null` | ARN o model ID; si se omite, selección automática |
| `user_prompt` | string | — | `null` | Prompt adicional (pasa validación de seguridad) |
| `source_filter` | string | — | `null` | Nombre exacto del archivo (igual a `processed_files` del ingest). Si es `null`, busca en toda la colección. **Siempre pasar** para evitar mezclar contenido de documentos distintos. |

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
| `source_docs` | Fragmentos usados como contexto; puede ser `["unknown"]` cuando el backend no retorna metadata de fuente |
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
| `ingestPDF(file)` | `POST /v1/documents/ingest` — multipart; retorna `api_response` (envelope) |
| `queryLibrary(question, topK?, sourceFilter?)` | `POST /v1/query/library` — JSON; retorna `data` directo (flat, sin envelope) |

Token cache a nivel de módulo. Auto-refresh en 401 (re-autentica una vez y reintenta).
Lanza `Error` con texto `HTTP <status>: <body>` si el servidor responde `text/plain` (ej. 500).

`sourceFilter` debe ser el nombre del archivo tal como fue ingresado (`file.name`). Pasar `null` para buscar en toda la colección.

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
| [ViewModeSwitcher.js](../../src/features/analysisRegulation/components/ViewModeSwitcher.js) | Ingest al cargar PDF; muestra chip con chunks indexados |
| [ChatNormaTab.js](../../src/features/analysisRegulation/components/ChatNormaTab.js) | Input de consulta (LexicalInput + botón send); presentacional puro |
| [AnalysisRegulation.js](../../src/features/analysisRegulation/AnalysisRegulation.js) | `handleCustomQuery`: llama `queryLibrary`, escribe en `historicTextIA`, activa `viewMode='chat'` |
| [ChatInterface](../../src/components/Input/lexicalWYSWYG/ChatInterface.js) | Renderiza `historicTextIA` en la columna izquierda |

### Comportamiento de `handleCustomQuery`

1. `setViewMode('chat')` — fuerza vista chat para que `ChatInterface` sea visible
2. Push mensaje `user` a `historicTextIA`
3. Push placeholder `assistant` "🔍 Consultando norma..."
4. `await queryLibrary(question, 10, currentPdfName || null)` — `currentPdfName` = `file.name` del PDF cargado; acota la búsqueda al documento activo
5. Reemplaza el placeholder con `result.answer` + `source_docs`, `grade`, `hallucination_detected`, `cache_hit`
6. Scroll al final del chat

### Nota de persistencia ChromaDB

`ingestPDF` indexa el documento de forma **persistente**. Un nuevo ingest del mismo archivo con `force_reconvert=false` es idempotente. Para limpiar la colección: borrar `data/legal_rag/storage/` en el backend y reiniciar.
