# Changelog — dev-codelatin-frontend-robot
**Fecha:** 2026-05-21  
**Rama base:** dev-codelatin-frontend  

---

## Resumen

Integración de múltiples endpoints del backend IA (`http://localhost:8000`) en la interfaz de análisis de documentos PDF, más soporte de renderizado Markdown en los chats de respuesta RAG.

---

## 1. Renderizado Markdown en chats RAG

### Problema
Las respuestas del endpoint `POST /v1/query/library` llegaban en formato Markdown (`**bold**`, listas, encabezados) pero se mostraban como texto plano en la interfaz.

### Cambios
- **`package.json`** — Instalación de `react-markdown@^10.1.0` y `remark-gfm@^4.0.1`
- **`src/index.css`** — Estilos `.markdown-body` para renderizado enriquecido (bold, listas, tablas, código, blockquotes, headers)
- **`src/components/Input/lexicalWYSWYG/ChatInterface.js`** — Mensajes `role: assistant` renderizan con `ReactMarkdown + remarkGfm`. Mensajes `role: user` mantienen `contentEditable`
- **`src/features/analysisRegulation/components/ChatNormaTab.js`** — Misma corrección aplicada al chat principal de "Chat norma" (tab 2)

---

## 2. Tab Taxonomía — `GET /v1/documents/taxonomy`

### Endpoint
```
GET /v1/documents/taxonomy?source=<filename>&include_articles=false
Authorization: Bearer <token>
```

### Nuevo componente
**`src/features/analysisRegulation/components/TaxonomyTab.js`**

Funcionalidades:
- Árbol colapsable jerárquico: **sección mayor → capítulos → secciones**
- Conteo de artículos por nodo en todo momento
- Toggle **"Con artículos"** → re-fetcha con `include_articles=true`, habilita artículos clickeables
- Click en artículo → panel derecho con detalle completo (via `GET /v1/documents/article`)
- Auto-carga al activar el tab si hay PDF cargado
- Botón refresh manual
- **Botones de exportación CSV y XLSX** (`GET /v1/documents/taxonomy/export`)
- Tolerancia a respuesta flat o envelope en la misma función fetch

### Integración
- Tab **4** en la columna derecha de `AnalysisRegulation.js`
- `source` = `currentPdfName` (nombre exacto del archivo ingresado)

---

## 3. Detalle de artículo — `GET /v1/documents/article`

### Endpoint
```
GET /v1/documents/article?article=<id>&source=<filename>
Authorization: Bearer <token>
```

### Implementación
Dentro de `TaxonomyTab.js` — componente interno `ArticleDetail`:
- Se activa al hacer click en un número de artículo (requiere `include_articles=true`)
- Panel derecho dividido (árbol 45% / detalle 55%)
- Muestra: texto completo (`content`), sección mayor (`major_section`), página (`page`), número de fragmentos si > 1
- Botón cerrar (×) o click en el mismo artículo para colapsar

---

## 4. Exportación taxonomía — `GET /v1/documents/taxonomy/export`

### Endpoint
```
GET /v1/documents/taxonomy/export?source=<filename>&format=csv|xlsx
Authorization: Bearer <token>
```

Respuesta: **archivo binario** (no JSON) — descarga directa.

### Implementación
En `TaxonomyTab.js` — función `downloadTaxonomyExport`:
- Descarga via `res.blob()` + `URL.createObjectURL`
- Nombre de archivo extraído del header `Content-Disposition`
- Dos botones: **CSV** (outlined) y **Excel** (contained, verde)
- Estado de carga independiente por formato

---

## 5. Tab Obligaciones — `GET /v1/documents/obligations/analyze`

### Endpoint
```
GET /v1/documents/obligations/analyze?source=<filename>
Authorization: Bearer <token>
```

Tiempo de respuesta: 3–30 seg según cantidad de artículos (LLM + ChromaDB).  
**No se dispara automáticamente** — requiere acción del usuario.

### Nuevo componente
**`src/features/analysisRegulation/components/ObligacionesTab.js`**

Funcionalidades:
- Botón "Analizar" con spinner y texto "Procesando artículos con LLM..."
- Tabla de obligaciones con columnas: artículo / descripción / sujeto / plazo / prioridad / prob. / pág.
- **Filas colapsables** → muestra `original_content` completo al expandir
- Chips de prioridad con colores: Alta (rojo) / Media (naranja) / Baja (verde)
- Filas con `is_valid: false` en opacidad reducida con etiqueta "(extracción fallida)"
- Modelo usado al pie de tabla
- Header de columnas fijo (sticky) al hacer scroll

### Integración
- Tab **5** en la columna derecha de `AnalysisRegulation.js`

---

## Archivos modificados

| Archivo | Tipo | Descripción |
|---|---|---|
| `package.json` | modificado | Dependencias `react-markdown`, `remark-gfm` |
| `src/index.css` | modificado | Estilos `.markdown-body` |
| `src/components/Input/lexicalWYSWYG/ChatInterface.js` | modificado | Markdown en mensajes assistant |
| `src/features/analysisRegulation/components/ChatNormaTab.js` | modificado | Markdown en chat norma |
| `src/features/analysisRegulation/components/TaxonomyTab.js` | **nuevo** | Tab taxonomía + detalle artículo + exportación |
| `src/features/analysisRegulation/components/ObligacionesTab.js` | **nuevo** | Tab análisis de obligaciones |
| `src/features/analysisRegulation/components/index.js` | modificado | Exporta nuevos componentes |
| `src/features/analysisRegulation/AnalysisRegulation.js` | modificado | Tabs 4 y 5 + imports |

---

## Endpoints cubiertos en esta sesión

| Endpoint | Método | Tab/Componente |
|---|---|---|
| `/v1/query/library` | POST | ChatNormaTab (existente, ahora con MD) |
| `/v1/documents/taxonomy` | GET | TaxonomyTab (nuevo) |
| `/v1/documents/article` | GET | TaxonomyTab → ArticleDetail |
| `/v1/documents/taxonomy/export` | GET | TaxonomyTab → botones CSV/Excel |
| `/v1/documents/obligations/analyze` | GET | ObligacionesTab (nuevo) |

---

## Endpoints documentados — pendientes de integración

| Endpoint | Spec |
|---|---|
| `POST /analyze/image/stream` | `endpoints.md` (SSE — ya existe en legacy) |
| `POST /analyze/pdf/stream` | `endpoints.md` (SSE — ya existe en legacy) |
| `POST /get_summary_notes` | `endpoints.md` |
| `/api/v1/query/stream` | `apiConstants.js` — sin documentación en spec |
| `/api/v1/query/batch` | `apiConstants.js` — sin documentación en spec |
