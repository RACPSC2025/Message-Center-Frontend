# Endpoints Catalog

## Purpose
Documentar endpoints disponibles, propósito, contratos y rutas de código.

## Scope
Incluye endpoints funcionales de análisis, documentos, resultados, salud y autenticación.
Actualizado con todos los cambios introducidos en los sprints 1–4 del módulo Legal RAG.

---

## Response Standard

### Legacy routes (sin prefijo)
Envelope JSON estándar:
```json
{
  "status": 200,
  "error_description": "",
  "api_response": {}
}
```
Estados lógicos: `200` éxito, `303` redirección reservada, `404` no encontrado, `500` error interno.

**Excepciones al envelope:**
- Endpoints `stream` → `text/event-stream`
- Endpoints de descarga binaria → `application/zip`, `application/x-ndjson`, `RedirectResponse`

### Legal RAG routes (`/v1`)
Respuestas directas (sin envelope). Errores retornan HTTP 4xx/5xx con `{"detail": "..."}`.

---

## Source of Truth

| Router | Archivo |
|---|---|
| Legacy — Health | `src/levytar_api/api/routes/health.py` |
| Legacy — Auth | `src/levytar_api/api/routes/auth.py` |
| Legacy — Analysis | `src/levytar_api/api/routes/analysis.py` |
| Legacy — Documents | `src/levytar_api/api/routes/documents.py` |
| Legacy — Results | `src/levytar_api/api/routes/results.py` |
| Legal RAG | `src/levytar_api/legal_rag/router.py` |
| Schemas RAG | `src/levytar_api/legal_rag/api_schemas.py` |

---

## Endpoint Groups

---

### Health (legacy)

#### `GET /health`
Estado del servicio legacy.

#### `GET /`
Endpoint raíz.

---

### Auth

#### `POST /token`
Emite JWT de acceso.

#### `POST /dev-token`
Token de desarrollo (sin credenciales de producción).

---

### Analysis — Core

#### `POST /analyze/text/stream`
Análisis de texto en streaming (`text/event-stream`).

#### `POST /analyze/pdf/stream`
Análisis de PDF en streaming (`text/event-stream`).

#### `POST /analyze/text/async`
Análisis de texto asíncrono. Retorna `job_id`.

#### `POST /analyze/pdf/async`
Análisis de PDF asíncrono. Retorna `job_id`.

#### `POST /analyze/image/stream`
Análisis de imagen en streaming (`text/event-stream`).

---

### Analysis — Fase 2 / IA estructurada

#### `POST /analyze/text/simple`
Análisis simple de texto (resumen + corrección ortográfica).

#### `POST /analyze/pdf/textract`
Extracción de texto y tablas de PDF vía AWS Textract OCR.

#### `POST /analyze/image/textract`
Extracción de texto de imágenes vía AWS Textract OCR.

#### `POST /analyze/actions`
Generación de pasos para resolver incidentes.

#### `POST /get_summary_notes`
Genera acta/resumen estructurado de transcripción de reunión.

**Request:**
```json
{
  "text": "Transcripcion completa de la reunion",
  "user_prompt": "Opcional — modo libre si no está vacío",
  "model": "Opcional — ARN o model_id",
  "max_chunk_chars": 12000
}
```

**Reglas:**
- `user_prompt` vacío → flujo estructurado (`SummaryNotesResult`)
- `user_prompt` con contenido → modo libre, salida JSON sin schema forzado

---

### Documents (legacy)

#### `POST /extract/pdf`
Extrae texto de PDF (sin análisis).

#### `POST /chunk/pdf`
Fragmenta PDF en chunks.

---

### Results (legacy)

#### `GET /results/{job_id}`
Consulta resultado de job asíncrono.

#### `GET /results/{job_id}/download`
Descarga resultado de job (binario/stream).

---

### Model Registry

#### `GET /models/categories`
Catálogo de modelos Bedrock disponibles por categoría y recomendados.

#### `POST /models/refresh`
Refresca el catálogo manualmente.

#### `POST /models/diagnose`
Diagnóstico de modelos (`usable`/`unusable`) por endpoint/categoría.

---

## Legal RAG — `/v1`

Prefijo: `/v1` · Auth: `Authorization: Bearer <token>` en todos los endpoints.

---

### `GET /v1/health`
Estado del módulo Legal RAG + ChromaDB.

**Response `200`:**
```json
{ "status": "ok", "chromadb": "ok", "version": "1.0.0" }
```

---

### `POST /v1/query/library`
Consulta semántica RAG sobre la colección de documentos indexados con LangGraph + Bedrock.

**Request body (JSON):**
```json
{
  "question": "¿Qué obligaciones tiene el contratista?",
  "top_k": 10,
  "model": null,
  "user_prompt": null,
  "source_filter": "Decreto_1072.pdf",
  "prompt_type": "general"
}
```
`source_filter`: limita la búsqueda a un solo documento. `null` = toda la colección.
`prompt_type`: `"general"` | `"legal"` (antepone contexto de analista jurídico).

**Response `200`:**
```json
{
  "answer": "El contratista debe...",
  "source_docs": ["Decreto_1072.pdf"],
  "grade": "relevant",
  "hallucination_detected": false,
  "hallucination_score": 0.02,
  "attempts": 1,
  "mode": "rag",
  "cache_hit": false,
  "cache_layer": null,
  "model_used": "us.anthropic.claude-haiku..."
}
```

---

### `POST /v1/query/direct-pdf`
Análisis directo de PDF sin indexación previa (carga + pregunta en un solo paso).

**Request:** `multipart/form-data` — `files` (PDF) + `question` (texto).

**Response `200`:**
```json
{
  "answer": "...",
  "source_docs": ["archivo.pdf"],
  "mode": "direct_pdf",
  "model_used": "..."
}
```

---

### `POST /v1/query/specialized`
Análisis especializado (obligaciones, contratos, etc.) sobre PDF cargado directamente.

**Request:** `multipart/form-data` — `files` (PDF) + `question` (texto).

**Response `200`:**
```json
{
  "answer": {},
  "source_docs": ["archivo.pdf"],
  "mode": "specialized",
  "model_used": "..."
}
```

---

### `POST /v1/query/image`
Análisis visual de imágenes vía LLM multimodal Bedrock.

**Request:** `multipart/form-data` — `files` (imágenes) + `question` + `model` (opcional).

**Response `200`:**
```json
{
  "mode": "image_direct",
  "results": [
    { "filename": "img.png", "analysis": "..." }
  ],
  "model_used": "..."
}
```

---

### `POST /v1/documents/ingest`
Ingesta documentos PDF en ChromaDB (Titan v2 embeddings).

**Modos:**
- **Síncrono** (default): procesa y retorna resultado. Recomendado para PDFs < 50 páginas.
- **Asíncrono** (`?async_mode=true`): encola job, retorna `job_id`. Recomendado para PDFs > 100 páginas.

**Request:** `multipart/form-data`

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `files` | File[] | requerido | Archivos PDF |
| `force_reconvert` | bool | `false` | Fuerza re-indexación aunque el hash ya exista |
| `doc_type` | string | `null` | Override tipo: `normativo` \| `judicial` \| `contractual`. `null` = auto-detect |
| `async_mode` | bool (query) | `false` | `true` → HTTP 202 + job_id |

**Response síncrono `200`:**
```json
{
  "status": "success",
  "processed_files": ["Decreto_1072.pdf"],
  "total_chunks": 312,
  "indexed_chunks": 312,
  "errors": []
}
```

**Response asíncrono `202`:**
```json
{
  "job_id": "abc123",
  "status": "queued",
  "poll_url": "/v1/documents/ingest/status/abc123"
}
```

**Notas:**
- IDs de chunks son deterministas `sha256(source::chunk_index)[:32]` → re-ingestión es idempotente (upsert).
- Sin `force_reconvert`, el hash del archivo evita re-procesar si ya está indexado.
- `doc_type` override invalida la detección automática; los chunks quedan con `doc_type` en metadata.
- Para documentos `normativo`, el pipeline extrae automáticamente metadata estructurada (`nm_*`) en todos los chunks.

---

### `GET /v1/documents/ingest/status/{job_id}`
Consulta estado de job de ingestión asíncrono.

**Response `200`:**
```json
{
  "job_id": "abc123",
  "status": "completed",
  "progress": 1.0,
  "total_chunks": 312,
  "indexed_chunks": 312,
  "processed_files": ["Decreto_1072.pdf"],
  "errors": [],
  "created_at": "2026-05-22T10:00:00Z",
  "started_at": "2026-05-22T10:00:01Z",
  "completed_at": "2026-05-22T10:00:45Z"
}
```
`status`: `queued` | `processing` | `completed` | `failed`

---

### `GET /v1/documents/count`
Número total de chunks indexados en la colección.

**Response `200`:**
```json
{ "count": 1842 }
```

---

### `GET /v1/documents/taxonomy`
Árbol jerárquico del documento adaptado al tipo detectado.

**Query params:** `source` (requerido) · `include_articles` (bool, default `false`)

**Tipos de árbol según `doc_type`:**
- `normativo` → `major_sections → titles → chapters → sections → articles` (con párrafos)
- `contractual` → cláusulas con `identifier`, `title`, `content_preview`
- `judicial` → secciones macro (ANTECEDENTES, FALLA) + numerales del FALLA

**Response `200` (normativo):**
```json
{
  "source": "Decreto_1072_de_2015.pdf",
  "total_articles": 45,
  "include_articles": false,
  "text": "Taxonomía de «Decreto_1072...»",
  "tree": { "major_sections": [...] },
  "normative_metadata": {
    "tipo_normativa": "Decreto",
    "numero": "1072",
    "titulo": "Por medio del cual se expide el Decreto Único Reglamentario...",
    "fecha_expedicion": "26 de mayo de 2015",
    "fecha_vigencia": "26 de mayo de 2015",
    "pais": "Colombia",
    "entidad_emisora": "Ministerio de Trabajo",
    "descripcion": "Decreto Único Reglamentario del Sector Trabajo.",
    "tipo_requisito": "general"
  }
}
```

`normative_metadata` es `null` si:
- El documento no es `normativo`
- Fue indexado antes de que el extractor estuviera activo (re-ingestar con `force_reconvert=true`)

**Response `200` (contractual):**
```json
{
  "source": "contrato.pdf",
  "total_articles": 12,
  "include_articles": false,
  "text": "Contrato «contrato.pdf» — 12 cláusulas",
  "tree": { "clauses": [...] },
  "normative_metadata": null
}
```

**Response `404`:**
```json
{ "detail": "Documento 'archivo.pdf' no encontrado en la colección." }
```

---

### `GET /v1/documents/article`
Contenido completo de un artículo específico desde ChromaDB.

**Query params:** `article` (requerido, ej. `"PRIMERO"`, `"2.2.4.1.5"`) · `source` (opcional)

**Response `200`:**
```json
{
  "source": "Decreto_1072.pdf",
  "article": "PRIMERO",
  "major_section": "RESUELVE",
  "page": "5",
  "content": "ARTÍCULO PRIMERO. Texto completo concatenado...",
  "chunks": [
    { "chunk_index": 26, "page": "5", "content": "..." }
  ]
}
```

---

### `GET /v1/documents/taxonomy/export`
Exporta taxonomía como matriz CSV o XLSX.

**Query params:** `source` (requerido) · `format` (`csv` | `xlsx`, default `csv`)

**Response:** archivo `text/csv` o `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Columnas: `source`, `major_section`, `title`, `chapter`, `section`, `article`, `page`

---

### `GET /v1/documents/obligations/analyze`
Análisis de obligaciones del documento con LLM Bedrock. Detecta artículos con obligaciones, sujeto, plazo y prioridad.

**Query params:** `source` (requerido) · `model` (opcional)

**Response `200`:**
```json
{
  "source": "Decreto_1072.pdf",
  "total_obligations": 8,
  "model_used": "...",
  "items": [
    {
      "event": "obligation_detected",
      "section_index": 0,
      "section_id": "art_PRIMERO_0",
      "analysis": {
        "article_number": "PRIMERO",
        "description": "Autorizar tratamiento silvicultural",
        "subject": "COLSUBSIDIO",
        "deadline": "90 días hábiles",
        "priority": "Alta",
        "prob_task": 0.95,
        "segment_id": 0,
        "page_start": "5",
        "page_end": "5",
        "original_content": "...",
        "tables_count": 0,
        "processed_at": "2026-05-22T10:00:00Z",
        "is_valid": true,
        "validation_errors": []
      }
    }
  ]
}
```

---

### `GET /v1/documents/integrity`
Valida integridad estructural de un documento normativo. Detecta gaps en numeración, duplicados, fecha de vigencia y bloque de firmas. Determinista — sin LLM.

**Query params:** `source` (requerido)

**Response `200`:**
```json
{
  "source": "Decreto_1072_de_2015.pdf",
  "total_articles": 45,
  "missing_articles": ["33", "34"],
  "duplicate_articles": ["12"],
  "total_gaps": 2,
  "vigencia_date": "26 de mayo de 2015",
  "has_signature_block": true,
  "signatories": ["JUAN MANUEL SANTOS CALDERÓN"],
  "is_complete": false
}
```

**Response `404`:**
```json
{ "detail": "Documento 'archivo.pdf' no encontrado o sin artículos indexados." }
```

**Notas:**
- Solo útil para documentos `normativo`. Judicial y contractual no tienen artículos numéricos → `total_articles: 0`.
- Artículos ordinales (PRIMERO, SEGUNDO…) no generan gaps, solo detectan duplicados.
- `signatories` máx 5 nombres detectados cerca del bloque `Dado en…`.

---

## Operational Rules

1. Legal RAG usa ChromaDB (persistente) + AWS Bedrock Titan v2 para embeddings.
2. IDs de chunks en ChromaDB son deterministas (`sha256(source::chunk_index)`); re-ingestión hace `upsert`, nunca duplica.
3. El hash del archivo (`_is_already_indexed`) actúa como optimización de performance; la idempotencia real la garantiza el upsert.
4. Detección de tipo de documento (`normativo`/`judicial`/`contractual`) es automática en ingestión; puede sobreescribirse con el campo `doc_type` en el form.
5. `normative_metadata` en la respuesta de taxonomy solo aparece para `normativo` indexados con el extractor activo (sprint 4+).
6. En endpoints legacy, el modelo puede resolverse automáticamente por selector de endpoint con fallback configurable.
7. En `get_summary_notes` con `user_prompt` no vacío, no se fuerza schema default; se devuelve salida libre de IA.

## Change Procedure

1. Agregar/modificar ruta en el router correspondiente.
2. Actualizar schemas en `api_schemas.py` (RAG) o `domain/schemas.py` (legacy) si aplica.
3. Actualizar tests relevantes y este catálogo.
