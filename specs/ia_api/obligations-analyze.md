# Endpoint: GET /v1/documents/obligations/analyze

## Propósito

Identifica y analiza todas las obligaciones legales de un documento.

**Dos fases en una sola llamada:**
1. **Determinista** — ChromaDB filtra artículos con verbos de obligación (`deberá`, `debe`, `exigir`, `garantizar`, etc.)
2. **LLM** — Para cada artículo, extrae semánticamente: descripción, sujeto, plazo, prioridad y probabilidad

> Tiempo de respuesta: ~2–10 segundos según cantidad de artículos y modelo elegido.  
> No hay streaming — espera a que el servidor complete todos los artículos antes de responder.

---

## Request

```http
GET /v1/documents/obligations/analyze?source=2022EE234175%20-%20Resolución%20Colsubsidio.pdf
Authorization: Bearer <token>
```

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `source` | `string` | Sí | Nombre exacto del archivo en la colección |
| `model` | `string` | No | Model ID de Bedrock. Default: `AWS_MODEL_SIMPLE_TEXT` del entorno |

---

## Response

```json
{
  "source": "2022EE234175 - Resolución Colsubsidio.pdf",
  "total_obligations": 12,
  "model_used": "arn:aws:bedrock:us-east-2:...:inference-profile/us.amazon.nova-lite-v1:0",
  "items": [
    {
      "event": "obligation_detected",
      "section_index": 0,
      "section_id": "Artículo SEGUNDO",
      "analysis": {
        "article_number": "Artículo SEGUNDO",
        "description": "Autorizar tratamiento silvicultural bajo condiciones específicas",
        "subject": "COLSUBSIDIO",
        "deadline": "Permanente",
        "priority": "Alta",
        "prob_task": 0.92,
        "segment_id": 0,
        "page_start": "12",
        "page_end": "12",
        "original_content": "ARTÍCULO SEGUNDO. Establecer las siguientes condiciones...",
        "tables_count": 0,
        "processed_at": "2026-05-21 14:35:02",
        "is_valid": true,
        "validation_errors": []
      }
    }
  ]
}
```

### Campos de `analysis`

| Campo | Origen | Descripción |
|---|---|---|
| `article_number` | Determinista | `"Artículo " + identificador` |
| `description` | LLM | Resumen breve de la obligación (≤120 chars) |
| `subject` | LLM | Quién porta la obligación |
| `deadline` | LLM | Plazo explícito o `"Permanente"` |
| `priority` | LLM | `"Alta"` / `"Media"` / `"Baja"` |
| `prob_task` | LLM | Probabilidad de ser accionable (0.0–1.0) |
| `segment_id` | Determinista | Posición secuencial en los resultados |
| `page_start` | Determinista | Página de inicio del artículo |
| `page_end` | Determinista | Página del último chunk del artículo |
| `original_content` | Determinista | Texto completo del artículo |
| `tables_count` | Determinista | Número de tablas detectadas en el contenido |
| `processed_at` | Determinista | Timestamp ISO del procesamiento |
| `is_valid` | Sistema | `false` si el LLM falló en ese artículo |
| `validation_errors` | Sistema | Lista de errores si `is_valid` es `false` |

### Criterios de prioridad (LLM)

| Prioridad | Criterio |
|---|---|
| `Alta` | Verbos imperativos (`deberá`, `está obligado`) con consecuencias legales graves |
| `Media` | Obligaciones condicionadas o procedimentales |
| `Baja` | Recomendaciones o potestades discrecionales |

---

## Errores

| Status | Caso |
|---|---|
| `404` | Documento no encontrado o sin artículos con obligaciones |
| `401` | Token ausente o expirado |

```json
{
  "detail": "No se encontraron obligaciones para '2022EE234175 - Resolución Colsubsidio.pdf'. Verifique el nombre exacto del archivo o que el documento haya sido ingresado."
}
```

---

## Código React

### Hook con loading/error

```jsx
import { useState, useCallback } from 'react'

function useObligationAnalysis(token) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const analyze = useCallback(async (source, model = null) => {
    setLoading(true)
    setError(null)
    setData(null)

    const params = new URLSearchParams({ source })
    if (model) params.set('model', model)

    try {
      const res = await fetch(
        `http://localhost:8000/v1/documents/obligations/analyze?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || `Error ${res.status}`)
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  return { data, loading, error, analyze }
}
```

### Componente de tabla de obligaciones

```jsx
const PRIORITY_COLORS = {
  Alta:  'bg-red-100 text-red-800',
  Media: 'bg-yellow-100 text-yellow-800',
  Baja:  'bg-green-100 text-green-800',
}

function ObligationsTable({ source, token }) {
  const { data, loading, error, analyze } = useObligationAnalysis(token)

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold">Análisis de obligaciones</h2>
        <button
          onClick={() => analyze(source)}
          disabled={loading}
          className="px-4 py-1.5 bg-blue-700 text-white text-sm rounded hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? 'Analizando...' : 'Analizar'}
        </button>
        {data && (
          <span className="text-sm text-gray-500">
            {data.total_obligations} obligaciones encontradas
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-8 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Procesando artículos con LLM...
        </div>
      )}

      {data && !loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-3 py-2 font-medium text-gray-600">Artículo</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Descripción</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Sujeto</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Plazo</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Prioridad</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600 w-20">Prob.</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600 w-16">Pág.</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => {
                const a = item.analysis
                return (
                  <tr
                    key={item.section_id}
                    className={`border-b hover:bg-gray-50 ${!a.is_valid ? 'opacity-50' : ''}`}
                  >
                    <td className="px-3 py-2 font-medium text-blue-700 whitespace-nowrap">
                      {item.section_id}
                    </td>
                    <td className="px-3 py-2 text-gray-800 max-w-xs">
                      {a.description}
                      {!a.is_valid && (
                        <span className="ml-1 text-xs text-red-500">(extracción fallida)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{a.subject}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{a.deadline}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[a.priority] ?? ''}`}>
                        {a.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {(a.prob_task * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-2 text-gray-400 text-xs">
                      {a.page_start === a.page_end ? a.page_start : `${a.page_start}–${a.page_end}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

### Panel de detalle expandible por artículo

```jsx
function ObligationRow({ item, source, token }) {
  const [expanded, setExpanded] = React.useState(false)
  const a = item.analysis

  return (
    <>
      <tr
        className="border-b hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <td className="px-3 py-2 font-medium text-blue-700">{item.section_id}</td>
        <td className="px-3 py-2">{a.description}</td>
        <td className="px-3 py-2 text-gray-600">{a.subject}</td>
        <td className="px-3 py-2 text-gray-600">{a.deadline}</td>
        <td className="px-3 py-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[a.priority]}`}>
            {a.priority}
          </span>
        </td>
        <td className="px-3 py-2 text-gray-500">{(a.prob_task * 100).toFixed(0)}%</td>
        <td className="px-3 py-2 text-gray-400 text-xs">{a.page_start}</td>
      </tr>

      {expanded && (
        <tr className="bg-blue-50">
          <td colSpan={7} className="px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Texto original (pág. {a.page_start}–{a.page_end})
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {a.original_content}
            </p>
          </td>
        </tr>
      )}
    </>
  )
}
```

---

## Consideraciones de rendimiento

| Artículos detectados | Tiempo estimado (Nova Lite) | Tiempo estimado (Nova Pro) |
|---|---|---|
| 5–10 | 3–5 seg | 6–10 seg |
| 10–20 | 5–10 seg | 12–20 seg |
| 50+ | 15–30 seg | 30–60 seg |

El backend procesa **3 artículos en paralelo** (`asyncio.Semaphore(3)`) para no saturar Bedrock.

**Recomendaciones para el frontend:**
- Mostrar spinner con texto "Procesando artículos con LLM..." durante la espera
- No hacer la llamada automáticamente al cargar — requiere acción explícita del usuario (botón "Analizar")
- Considerar timeout en el cliente de 60+ segundos para documentos grandes

---

## Comparación con `obligation_search` del RAG

| | `/v1/documents/obligations/analyze` | `query_library` con intent "obligation" |
|---|---|---|
| Resultado | JSON estructurado por artículo | Texto libre generado por LLM |
| Extracción | Campo por campo (description, subject, etc.) | Respuesta narrativa |
| Uso ideal | Tabla, exportación, integración con otras apps | Chat, resumen en lenguaje natural |

---

## Source

`src/levytar_api/legal_rag/router.py` — `analyze_document_obligations()`  
`src/levytar_api/legal_rag/services/obligation_analyzer.py` — `analyze_obligations()`  
`src/levytar_api/legal_rag/retrieval/specialized_retrieval.py` — `obligation_search()`, `get_article_content()`
