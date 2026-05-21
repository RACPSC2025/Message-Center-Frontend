# Endpoint: GET /v1/documents/taxonomy/export

## Propósito

Exporta la taxonomía jerárquica del documento como una **matriz plana** — una fila por artículo, con sus columnas de contexto (sección mayor, capítulo, sección).

Sin LLM — resultado 100% determinista desde ChromaDB.  
Descarga directa de archivo: CSV o XLSX.

---

## Request

```http
GET /v1/documents/taxonomy/export?source=2022EE234175%20-%20Resolución%20Colsubsidio.pdf&format=xlsx
Authorization: Bearer <token>
```

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `source` | `string` | Sí | Nombre exacto del archivo tal como fue ingresado |
| `format` | `string` | No | `csv` (default) o `xlsx` |

---

## Response

No devuelve JSON — devuelve el archivo directamente como descarga.

### CSV (`format=csv`)
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="2022EE234175_-_Resolución_Colsubsidio_taxonomy.csv"
```

```csv
source,major_section,chapter,section,article,page
2022EE234175 - Resolución Colsubsidio.pdf,COMPETENCIAS,,,7,10
2022EE234175 - Resolución Colsubsidio.pdf,RESUELVE,,,PRIMERO,12
2022EE234175 - Resolución Colsubsidio.pdf,RESUELVE,,,SEGUNDO,12
2022EE234175 - Resolución Colsubsidio.pdf,RESUELVE,,,TERCERO,12
...
```

### XLSX (`format=xlsx`)
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="..._taxonomy.xlsx"
```

Mismo contenido que CSV pero formateado:
- Header azul navy (#1F4E79), texto blanco, bold
- Columnas auto-ajustadas al contenido

### Columnas

| Columna | Descripción |
|---|---|
| `source` | Nombre del archivo |
| `major_section` | Sección mayor: `ENCABEZADO`, `COMPETENCIAS`, `CONSIDERANDO`, `RESUELVE`, `DECRETA` |
| `chapter` | Título del capítulo (vacío si no aplica) |
| `section` | Título de la sección (vacío si no aplica) |
| `article` | Identificador del artículo: `PRIMERO`, `2.2.4.1.5`, `7`, etc. |
| `page` | Página del PDF donde inicia el artículo |

> Documentos con capítulos jerárquicos (ej. Decreto 1072) tienen `chapter` y `section` poblados.  
> Resoluciones simples (ej. Colsubsidio) tienen `chapter` y `section` vacíos.

---

## Errores

| Status | Caso |
|---|---|
| `404` | Documento no encontrado o sin taxonomía |
| `400` | `format` no es `csv` ni `xlsx` |
| `401` | Token ausente o expirado |

---

## Código React

### Descarga directa (trigger por botón)

```jsx
async function downloadTaxonomy(source, token, format = 'csv') {
  const params = new URLSearchParams({ source, format })
  const res = await fetch(`http://localhost:8000/v1/documents/taxonomy/export?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error al exportar')
  }

  // Construir URL de descarga desde el blob
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const filename = res.headers.get('Content-Disposition')
    ?.match(/filename="?([^"]+)"?/)?.[1]
    ?? `taxonomy.${format}`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

### Botones de exportación

```jsx
function TaxonomyExportButtons({ source, token }) {
  const [loading, setLoading] = React.useState(null) // 'csv' | 'xlsx' | null
  const [error, setError]     = React.useState(null)

  const handleExport = async (format) => {
    setLoading(format)
    setError(null)
    try {
      await downloadTaxonomy(source, token, format)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={!!loading}
        className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === 'csv' ? 'Generando...' : '↓ CSV'}
      </button>

      <button
        onClick={() => handleExport('xlsx')}
        disabled={!!loading}
        className="px-3 py-1.5 text-sm bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
      >
        {loading === 'xlsx' ? 'Generando...' : '↓ Excel'}
      </button>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  )
}
```

### Uso combinado con el panel de taxonomía

```jsx
function TaxonomyPanel({ source, token }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Taxonomía del documento</h2>
        <TaxonomyExportButtons source={source} token={token} />
      </div>
      {/* árbol de taxonomía existente */}
      <TaxonomyTree source={source} token={token} />
    </div>
  )
}
```

---

## Notas de integración

- La respuesta **no es JSON** — usar `res.blob()`, no `res.json()`.
- El nombre de archivo viene en el header `Content-Disposition` — extraerlo con regex para nombrar la descarga.
- Para documentos grandes (Decreto 1072: ~700 artículos), el XLSX puede tardar 1–2 segundos en generarse en el servidor.
- El parámetro `source` debe ser el nombre **exacto** tal como aparece en ChromaDB. Obtenerlo del campo `source` en la respuesta de `/v1/documents/taxonomy`.

---

## Source

`src/levytar_api/legal_rag/router.py` — `export_taxonomy_matrix()`  
`src/levytar_api/legal_rag/retrieval/specialized_retrieval.py` — `build_taxonomy_matrix()`
