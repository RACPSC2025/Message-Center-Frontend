# Endpoint: GET /v1/documents/article

## Propósito

Retorna el contenido completo de un artículo específico desde ChromaDB.  
Complemento del endpoint de taxonomía: la taxonomía da la jerarquía y los números, este endpoint da el texto íntegro de cada artículo.

Sin LLM — resultado determinista desde ChromaDB.

---

## Request

```http
GET /v1/documents/article?article=PRIMERO&source=2022EE234175%20-%20Resolución%20Colsubsidio.pdf
Authorization: Bearer <token>
```

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `article` | `string` | Sí | Número o identificador del artículo. Ej: `PRIMERO`, `2.2.4.1.5`, `7`, `DÉCIMO SÉPTIMO` |
| `source` | `string` | No | Nombre exacto del archivo para acotar la búsqueda. Si se omite, busca en toda la colección |

> El valor de `article` debe coincidir exactamente con el campo `article` de los metadatos de ChromaDB, que es el mismo valor que aparece en el campo `articles[]` de la taxonomía.

---

## Response

```json
{
  "status": 200,
  "error_description": "",
  "api_response": {
    "source": "2022EE234175 - Resolución Colsubsidio.pdf",
    "article": "PRIMERO",
    "major_section": "RESUELVE",
    "page": "12",
    "content": "ARTÍCULO PRIMERO. Autorizar a la CAJA COLOMBIANA DE SUBSIDIO FAMILIAR – COLSUBSIDIO, con NIT. 860.007.336-1, a través de su representante legal o quien haga sus veces, para llevar a cabo el tratamiento silvicultural...",
    "chunks": [
      {
        "chunk_index": 25,
        "page": "12",
        "content": "ARTÍCULO PRIMERO. Autorizar a la CAJA COLOMBIANA DE SUBSIDIO FAMILIAR..."
      }
    ]
  }
}
```

| Campo | Descripción |
|---|---|
| `source` | Nombre del archivo tal como está en ChromaDB |
| `article` | Identificador del artículo (mismo valor enviado en el request) |
| `major_section` | Sección mayor del documento (`RESUELVE`, `DECRETA`, `COMPETENCIAS`, `CONSIDERANDO`) |
| `page` | Página del PDF donde comienza el artículo |
| `content` | Texto completo del artículo (todos sus chunks concatenados) |
| `chunks[]` | Fragmentos individuales del artículo en orden de lectura |
| `chunks[].chunk_index` | Posición del fragmento en el documento completo |
| `chunks[].page` | Página del fragmento |
| `chunks[].content` | Texto del fragmento |

> Artículos largos tienen múltiples chunks. `content` los concatena con doble salto de línea.

---

## Errores

| Status | Caso |
|---|---|
| `404` | Artículo no encontrado con ese identificador (y source si se proporcionó) |
| `401` | Token ausente o expirado |

```json
{
  "status": 404,
  "error_description": "Artículo 'VIGÉSIMO' no encontrado en '2022EE234175 - Resolución Colsubsidio.pdf'",
  "api_response": null
}
```

---

## Código React

### Función básica

```js
async function fetchArticle(article, token, source = null) {
  const params = new URLSearchParams({ article })
  if (source) params.set('source', source)

  const res = await fetch(`http://localhost:8000/v1/documents/article?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  if (data.status === 404) return null
  if (data.status !== 200) throw new Error(data.error_description)
  return data.api_response
}
```

### Hook con loading/error

```jsx
import { useState, useEffect } from 'react'

function useArticleDetail(article, source, token) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!article || !token) return
    setLoading(true)
    setError(null)
    setDetail(null)

    const params = new URLSearchParams({ article })
    if (source) params.set('source', source)

    fetch(`http://localhost:8000/v1/documents/article?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === 404) { setDetail(null); return }
        if (data.status !== 200) throw new Error(data.error_description)
        setDetail(data.api_response)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [article, source, token])

  return { detail, loading, error }
}
```

### Componente de detalle

```jsx
function ArticleDetail({ article, source, token }) {
  const { detail, loading, error } = useArticleDetail(article, source, token)

  if (loading) return <p className="text-gray-500 text-sm">Cargando artículo...</p>
  if (error)   return <p className="text-red-500 text-sm">Error: {error}</p>
  if (!detail) return <p className="text-gray-400 text-sm">Artículo no encontrado</p>

  return (
    <div className="article-detail border rounded p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="font-bold text-sm uppercase text-blue-700">
          ARTÍCULO {detail.article}
        </span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {detail.major_section}
        </span>
        <span className="text-xs text-gray-400">pág. {detail.page}</span>
      </div>
      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
        {detail.content}
      </p>
      {detail.chunks.length > 1 && (
        <p className="text-xs text-gray-400 mt-2">
          {detail.chunks.length} fragmentos
        </p>
      )}
    </div>
  )
}
```

---

## Flujo completo: Taxonomía → Detalle de artículo

Uso combinado típico: la taxonomía provee la lista de artículos, al hacer clic en uno se muestra el detalle.

```jsx
function TaxonomyWithDetail({ source, token }) {
  const [selectedArticle, setSelectedArticle] = useState(null)
  const { taxonomy } = useDocumentTaxonomy(source, token, true)  // include_articles=true

  if (!taxonomy) return null

  return (
    <div className="flex gap-4">
      {/* Panel izquierdo: árbol */}
      <div className="w-64 border-r pr-4 overflow-y-auto max-h-screen">
        {taxonomy.tree.major_sections.map(ms => (
          <div key={ms.name}>
            <p className="font-bold text-sm mt-3 mb-1">{ms.name}</p>
            {ms.chapters.map((ch, ci) => (
              <div key={ci} className="ml-2">
                {ch.title && (
                  <p className="text-xs text-gray-500 mb-0.5">{ch.title}</p>
                )}
                {ch.sections.map((sec, si) => (
                  <div key={si} className="ml-2 mb-1">
                    <p className="text-xs text-gray-400 italic">{sec.title}</p>
                    {sec.articles.map(art => (
                      <button
                        key={art}
                        onClick={() => setSelectedArticle(art)}
                        className={`block text-left text-xs w-full px-1 py-0.5 rounded hover:bg-blue-50 ${
                          selectedArticle === art ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        Art. {art}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Panel derecho: contenido del artículo */}
      <div className="flex-1 overflow-y-auto max-h-screen">
        {selectedArticle ? (
          <ArticleDetail article={selectedArticle} source={source} token={token} />
        ) : (
          <p className="text-gray-400 text-sm mt-4">
            Selecciona un artículo del índice para ver su contenido.
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## Importante: identificador de artículo (`article`)

El campo `article` almacena el número tal como aparece en el documento:

| Tipo de documento | Ejemplos de `article` |
|---|---|
| Resoluciones (ordinales) | `PRIMERO`, `SEGUNDO`, `DÉCIMO SÉPTIMO` |
| Decretos DUR (jerárquicos) | `2.2.4.1.5`, `2.2.1.1.1` |
| Actos simples | `7`, `12`, `25` |

Los valores exactos están en el campo `articles[]` de la respuesta de taxonomía (`GET /v1/documents/taxonomy?include_articles=true`). Usar esos valores directamente como parámetro `article`.

---

## Source

`src/levytar_api/legal_rag/router.py` — `document_article()`  
`src/levytar_api/legal_rag/retrieval/specialized_retrieval.py` — `get_article_content()`
