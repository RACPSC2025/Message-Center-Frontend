# IA Backend — Resumen de Endpoints (para verificación)

> Estado: **pendiente verificación** — generado desde lectura de `endpoints.md`, no desde pruebas reales.

---

## Tabla resumen

| Endpoint | Método | Auth | Content-Type | Qué hace |
|---|---|---|---|---|
| `/auth/dev-token` | POST | No | `form-urlencoded` | Token JWT para dev local. Solo con `ENVIRONMENT=DEV`. Expira 30 min. Retorna **envelope**. |
| `/v1/documents/ingest` | POST | Sí | `multipart/form-data` | Indexa PDFs en ChromaDB (persistente). `force_reconvert=false` → idempotente. Retorna flat. |
| `/v1/documents/count` | GET | Sí | — | Total de chunks indexados en ChromaDB. Retorna `{ "count": N }`. |
| `/v1/query/library` | POST | Sí | `application/json` | RAG sobre ChromaDB. Requiere ingest previo. Soporta `source_filter`, `prompt_type`. Retorna flat. |
| `/v1/query/direct-pdf` | POST | Sí | `multipart/form-data` | Consulta PDF sin indexar (en memoria, efímero). Re-procesa en cada llamada. Retorna flat. |
| `/analyze/image/stream` | POST | Sí | `multipart/form-data` | Extrae artículos/obligaciones de imágenes vía **SSE**. Jerarquía completa (`parent`, `type`, `id_process`). |
| `/analyze/pdf/stream` | POST | Sí | `multipart/form-data` | Extrae artículos/obligaciones de PDF completo vía **SSE**. Segmentos planos por regex. |
| `/v1/query/image` | POST | Sí | `multipart/form-data` | Análisis visual con modelo multimodal. Pregunta + imagen(es). Retorna texto por archivo. |
| `/get_summary_notes` | POST | Sí | `application/json` | Resume transcripciones/texto largo. Retorna temas, decisiones, próximos pasos. |
| `/health` | GET | No | — | Estado general del backend. |
| `/v1/health` | GET | No | — | Estado de `legal_rag` + ChromaDB. |
| `/models/categories` | GET | No | — | Catálogo de modelos activos por categoría (AWS Bedrock). |

---

## Comportamiento a verificar

### Autenticación
- [ ] `/auth/dev-token` solo funciona con `ENVIRONMENT=DEV`
- [ ] Token expira en 30 min — verificar que `401` llega puntual
- [ ] Todos los demás endpoints retornan `401` si token ausente o inválido
- [ ] `/health` y `/v1/health` responden sin token

### Respuesta flat vs envelope
- [ ] Solo `/auth/dev-token` retorna `{ status, error_description, api_response }`
- [ ] Todos los demás retornan JSON plano sin wrapper

### `/v1/documents/ingest`
- [ ] Acepta múltiples archivos en un solo request
- [ ] `force_reconvert=false` → segundo ingest del mismo archivo no duplica chunks
- [ ] `status` puede ser `"success"` o `"partial"` (nunca otro valor)
- [ ] `indexed_chunks` == `total_chunks` cuando `status: "success"`

### `/v1/query/library`
- [ ] Sin `source_filter` busca en toda la colección (riesgo de mezclar documentos)
- [ ] `source_filter` con nombre exacto del archivo aisla la búsqueda
- [ ] `prompt_type: "legal"` añade contexto de analista legal senior
- [ ] `prompt_type: "general"` aplica `user_prompt` sin contexto adicional
- [ ] `grade` siempre en español (`"útil"` / `"no útil"`)
- [ ] `cache_hit: true` cuando respuesta viene de caché semántica

### `/v1/query/direct-pdf`
- [ ] Re-procesa el archivo completo en cada llamada (no persiste)
- [ ] Misma estructura de respuesta que `query/library`

### `/analyze/image/stream` (SSE)
- [ ] Primer evento siempre `start` con `total_images`
- [ ] Cada elemento extraído emite `obligation_detected` con campo `analysis`
- [ ] `analysis.id_process` tiene prefijo `art`/`par`/`lit`/`num` + timestamp
- [ ] `analysis.parent` es `""` para elementos raíz
- [ ] Último evento es `complete` con `stats`
- [ ] Error global emite `fatal_error` (no `complete`)
- [ ] Imágenes > 5 MB retornan `400`

### `/analyze/pdf/stream` (SSE)
- [ ] Primer evento `start` con `total_sections`
- [ ] Error en sección individual emite `section_error` — stream **no se corta**
- [ ] Último evento `complete` sin campos extra
- [ ] `article_number` + `segment_id` llegan separados (no hay `id_process`)
- [ ] Normalización necesaria antes de pasar a `ArticlesList` (ver `endpoints.md`)

### `/v1/query/image`
- [ ] Retorna envelope (`api_response.results`) — diferente a los demás
- [ ] Keys del objeto `results` son los nombres de archivo enviados

### `/get_summary_notes`
- [ ] Retorna envelope con `api_response.main_topics`, `decisions`, `next_steps`
- [ ] Acepta texto largo — divide en chunks de `max_chunk_chars` (default 4000)

---

## Diferencias clave entre endpoints similares

| | `query/library` | `query/direct-pdf` |
|---|---|---|
| Requiere ingest previo | Sí | No |
| Persiste en ChromaDB | Sí | No |
| Múltiples preguntas mismo doc | Eficiente | Re-procesa cada vez |

| | `analyze/image/stream` | `analyze/pdf/stream` |
|---|---|---|
| Input | Imágenes PNG/JPEG/etc | PDF |
| Jerarquía de elementos | Sí (`parent`) | No (todos raíz) |
| `id_process` en respuesta | Sí | No — hay `segment_id` |
| Error parcial | `fatal_error` (corta stream) | `section_error` (stream continúa) |
