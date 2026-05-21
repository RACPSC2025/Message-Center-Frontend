# Endpoint: GET /v1/documents/taxonomy

## Propósito

Genera el árbol jerárquico de un documento legal indexado en ChromaDB: **secciones mayores → capítulos → secciones → artículos**.

Sin embeddings ni LLM — resultado determinista desde metadatos de ChromaDB.  
Disponible también vía chat RAG (`POST /v1/query/library` con intención de taxonomía).

---

## Request

```http
GET /v1/documents/taxonomy?source=<filename>&include_articles=false
Authorization: Bearer <token>
```

| Parámetro | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `source` | `string` | Sí | — | Nombre exacto del archivo (igual al `processed_files[n]` del ingest) |
| `include_articles` | `boolean` | No | `false` | Si `true`, incluye todos los artículos dentro de cada sección en el árbol |

---

## Response

```json
{
  "status": 200,
  "error_description": "",
  "api_response": {
    "source": "Decreto_1072_de_2015_Sector_Trabajo.pdf",
    "total_articles": 1357,
    "include_articles": false,
    "text": "Taxonomía de «Decreto_1072_de_2015_Sector_Trabajo.pdf» — 1357 artículos totales\n\n────────────────────────────────────────────────────────────\nDECRETA\n  CAPÍTULO 6 — NORMAS LABORALES ESPECIALES...\n    SECCIÓN 1 — CONDUCTORES DEL SERVICIO PÚBLICO...\n    SECCIÓN 2 — MANO DE OBRA LOCAL...",
    "tree": {
      "source": "Decreto_1072_de_2015_Sector_Trabajo.pdf",
      "total_articles": 1357,
      "major_sections": [
        {
          "name": "DECRETA",
          "orphan_articles": ["2.2.1.1.1", "2.2.1.1.2"],
          "chapters": [
            {
              "title": "CAPÍTULO 6 — NORMAS LABORALES ESPECIALES RELACIONADAS CON DETERMINADOS TRABAJADORES",
              "orphan_articles": [],
              "sections": [
                {
                  "title": "SECCIÓN 1 — CONDUCTORES DEL SERVICIO PÚBLICO DE TRANSPORTE TERRESTRE",
                  "articles": ["2.2.4.2.1", "2.2.4.2.2", "2.2.4.2.3"],
                  "article_count": 6
                },
                {
                  "title": "SECCIÓN 2 — MANO DE OBRA LOCAL A PROYECTOS DE EXPLORACIÓN Y PRODUCCIÓN",
                  "articles": ["2.2.4.3.1", "2.2.4.3.2"],
                  "article_count": 9
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### Campos del response

| Campo | Tipo | Descripción |
|---|---|---|
| `source` | `string` | Nombre del archivo tal como está en ChromaDB |
| `total_articles` | `int` | Total de artículos únicos en el documento |
| `include_articles` | `bool` | Refleja el parámetro enviado |
| `text` | `string` | Taxonomía pre-formateada, lista para mostrar en un `<pre>` o chat |
| `tree` | `object` | Árbol jerárquico JSON completo (ver estructura abajo) |

### Estructura del árbol (`tree`)

```
tree
└── major_sections[]
    ├── name: string               — "DECRETA" | "RESUELVE" | "CONSIDERANDO"
    ├── orphan_articles: string[]  — artículos sin capítulo padre
    └── chapters[]
        ├── title: string          — "CAPÍTULO N — Título"
        ├── orphan_articles: string[] — artículos sin sección padre
        └── sections[]
            ├── title: string      — "SECCIÓN N — Título"
            ├── articles: string[] — números de artículos (vacío si include_articles=false)
            └── article_count: int — total de artículos en esta sección (siempre presente)
```

> **Nota:** `articles[]` solo se puebla cuando `include_articles=true`.  
> `article_count` siempre está disponible para mostrar el conteo sin listar los artículos.

---

## Errores

| Status | Caso |
|---|---|
| `404` | El `source` no existe en ChromaDB. Verificar nombre exacto del archivo |
| `401` | Token ausente o expirado |

```json
{
  "status": 404,
  "error_description": "Documento 'archivo.pdf' no encontrado en la colección. Verifique el nombre exacto del archivo tal como fue ingresado.",
  "api_response": null
}
```

---

## Código React

### Hook básico

```jsx
async function fetchTaxonomy(source, token, includeArticles = false) {
  const params = new URLSearchParams({ source, include_articles: includeArticles })
  const res = await fetch(`http://localhost:8000/v1/documents/taxonomy?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  if (data.status !== 200) throw new Error(data.error_description)
  return data.api_response
}
```

### Hook con estado

```jsx
import { useState, useEffect } from 'react'

function useDocumentTaxonomy(source, token, includeArticles = false) {
  const [taxonomy, setTaxonomy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!source || !token) return
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ source, include_articles: includeArticles })
    fetch(`http://localhost:8000/v1/documents/taxonomy?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.status !== 200) throw new Error(data.error_description)
        setTaxonomy(data.api_response)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [source, token, includeArticles])

  return { taxonomy, loading, error }
}
```

---

## Componentes de renderizado

### Opción A — Texto pre-formateado (más simple)

El campo `text` ya viene listo. Ideal para un panel de vista previa o respuesta de chat.

```jsx
function TaxonomyText({ source, token }) {
  const { taxonomy, loading, error } = useDocumentTaxonomy(source, token)

  if (loading) return <p>Generando taxonomía...</p>
  if (error)   return <p>Error: {error}</p>
  if (!taxonomy) return null

  return (
    <pre style={{ fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
      {taxonomy.text}
    </pre>
  )
}
```

### Opción B — Árbol interactivo (expandible por capítulo)

Usa el campo `tree` para construir un árbol colapsable.

```jsx
function TaxonomyTree({ source, token }) {
  const { taxonomy, loading, error } = useDocumentTaxonomy(source, token)
  const [openChapters, setOpenChapters] = useState({})

  if (loading) return <p>Cargando...</p>
  if (error)   return <p className="text-red-500">{error}</p>
  if (!taxonomy) return null

  const toggleChapter = (key) =>
    setOpenChapters(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="taxonomy-tree font-mono text-sm">
      <p className="font-bold mb-2">
        {taxonomy.source} — {taxonomy.total_articles} artículos
      </p>

      {taxonomy.tree.major_sections.map(ms => (
        <div key={ms.name} className="mb-4">
          <p className="font-semibold uppercase">{ms.name}</p>

          {ms.chapters.map((ch, ci) => {
            const key = `${ms.name}-${ci}`
            const isOpen = openChapters[key]
            const sectionCount = ch.sections.length
            const artCount = ch.orphan_articles.length +
              ch.sections.reduce((s, sec) => s + sec.article_count, 0)

            return (
              <div key={key} className="ml-4 my-1">
                <button
                  onClick={() => toggleChapter(key)}
                  className="text-left w-full hover:underline"
                >
                  {isOpen ? '▾' : '▸'} {ch.title || '(sin título)'}
                  <span className="text-gray-400 ml-2 text-xs">
                    {sectionCount} secciones · {artCount} arts.
                  </span>
                </button>

                {isOpen && (
                  <div className="ml-4 mt-1">
                    {ch.sections.map((sec, si) => (
                      <div key={si} className="ml-4 my-0.5 text-gray-700">
                        <span>{sec.title}</span>
                        <span className="text-gray-400 ml-2 text-xs">
                          ({sec.article_count} arts.)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
```

### Opción C — Árbol completo con artículos (requiere `include_articles=true`)

```jsx
function TaxonomyFullTree({ source, token }) {
  const { taxonomy } = useDocumentTaxonomy(source, token, true) // include_articles=true

  if (!taxonomy) return null

  return (
    <div>
      {taxonomy.tree.major_sections.map(ms => (
        <details key={ms.name} open>
          <summary className="font-bold cursor-pointer">{ms.name}</summary>
          {ms.chapters.map((ch, ci) => (
            <details key={ci} className="ml-4">
              <summary className="cursor-pointer">{ch.title}</summary>
              {ch.sections.map((sec, si) => (
                <details key={si} className="ml-4">
                  <summary className="cursor-pointer text-gray-700">{sec.title}</summary>
                  <ul className="ml-6 list-disc text-xs text-gray-500">
                    {sec.articles.map(art => (
                      <li key={art}>ARTÍCULO {art}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </details>
          ))}
        </details>
      ))}
    </div>
  )
}
```

---

## Vía chat RAG (`POST /v1/query/library`)

La taxonomía también se puede obtener con lenguaje natural. El backend detecta la intención automáticamente.

**Queries que activan taxonomía:**

```json
{ "question": "dame la taxonomía del documento", "source_filter": "Decreto_1072.pdf" }
{ "question": "tabla de contenidos", "source_filter": "Decreto_1072.pdf" }
{ "question": "árbol de contenidos", "source_filter": "Decreto_1072.pdf" }
{ "question": "estructura del decreto", "source_filter": "Decreto_1072.pdf" }
{ "question": "capítulos y secciones del documento", "source_filter": "Decreto_1072.pdf" }
```

Con artículos incluidos:
```json
{ "question": "dame la taxonomía completa con artículos", "source_filter": "Decreto_1072.pdf" }
```

La respuesta llega en `api_response.answer` (igual que cualquier query de library).  
No pasa por el LLM — es el mismo texto pre-formateado del campo `text` del endpoint REST.

---

## Diferencias entre los dos accesos

| | REST `GET /taxonomy` | Chat `POST /query/library` |
|---|---|---|
| Respuesta | `text` + `tree` (JSON completo) | Solo `text` en `answer` |
| Árbol interactivo | Sí (campo `tree`) | No |
| Caché RAG | No | Sí (L1/L2/L3) |
| Costo | Sin LLM, sin embeddings | Sin LLM, sin embeddings |
| Uso recomendado | Renderizar árbol UI | Chat conversacional |

---

## Importante: nombre del archivo (`source`)

El `source` debe ser el nombre exacto del archivo tal como fue ingresado la primera vez.

- Usar el nombre que aparece en `processed_files` del response del ingest
- Si dos PDFs tienen el mismo contenido (mismo hash SHA-256), el segundo queda bajo el nombre del primero
- Verificar nombres disponibles: `GET /v1/documents/count` no los lista, pero el campo `source_docs` de cualquier `query/library` muestra el nombre real

```js
// Verificar que el source es correcto
const verify = await fetch('/v1/query/library', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'hola', source_filter: 'mi_archivo.pdf', top_k: 1 })
})
const d = await verify.json()
console.log(d.api_response.source_docs) // muestra el source real si hay match
```

---

## Source

`src/levytar_api/legal_rag/router.py` — `document_taxonomy()`  
`src/levytar_api/legal_rag/retrieval/specialized_retrieval.py` — `build_taxonomy()`, `format_taxonomy_text()`, `taxonomy_to_dict()`
