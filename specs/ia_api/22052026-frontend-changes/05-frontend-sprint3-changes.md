# Sprint 3 — Cambios de contrato API que afectan al frontend

**Fecha:** 2026-05-22  
**Contexto:** Sprint 3 — Granularidad sub-artículo.

---

## 1. Único breaking change: `article.paragraphs`

Solo aplica a documentos **normativos** con parágrafos.

### Antes (Sprint 1)

```json
{
  "number": "5",
  "paragraphs": ["PARÁGRAFO ÚNICO", "PARÁGRAFO 1"]
}
```

### Ahora (Sprint 3)

```json
{
  "number": "5",
  "paragraphs": [
    { "identifier": "PARÁGRAFO ÚNICO", "content": "El presente artículo no aplica a..." },
    { "identifier": "PARÁGRAFO 1",     "content": "Para los efectos de esta disposición..." }
  ]
}
```

**`content`** es el texto completo del parágrafo (máx 500 chars guardados).  
Puede quedar vacío `""` si el chunk de parágrafo solo tenía el encabezado y nada más.

---

## 2. Tipos actualizados (React CRA)

### PropTypes (JS plano)

```jsx
// src/types/taxonomy.js — actualizar ParagraphShape

// ANTES
export const ParagraphShape = PropTypes.string;

// AHORA
export const ParagraphShape = PropTypes.shape({
  identifier: PropTypes.string.isRequired,
  content: PropTypes.string,
});

// ArticleEntryShape también cambia
export const ArticleEntryShape = PropTypes.shape({
  number: PropTypes.string.isRequired,
  paragraphs: PropTypes.arrayOf(ParagraphShape),
});
```

### TypeScript (si se usa CRA + TS)

```typescript
// ANTES
interface ArticleEntry {
  number: string;
  paragraphs?: string[];
}

// AHORA
interface ParagraphDetail {
  identifier: string;
  content?: string;
}

interface ArticleEntry {
  number: string;
  paragraphs?: ParagraphDetail[];
}
```

---

## 3. Cambios en componentes React

### 3.1 Componente `ArticleEntry` — render de parágrafos

```jsx
// src/components/taxonomy/ArticleEntry.jsx

// ANTES
function ArticleEntry({ art }) {
  return (
    <div>
      <span>Art. {art.number}</span>
      {art.paragraphs?.map((p) => (
        <span key={p} className="paragraph-tag">{p}</span>
      ))}
    </div>
  );
}

// AHORA
function ArticleEntry({ art }) {
  return (
    <div className="article-entry">
      <span className="article-number">Art. {art.number}</span>
      {art.paragraphs?.length > 0 && (
        <div className="paragraphs">
          {art.paragraphs.map((p) => (
            <div key={p.identifier} className="paragraph-item">
              <strong className="paragraph-id">↳ {p.identifier}</strong>
              {p.content && (
                <p className="paragraph-content">{p.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3.2 Componente de tooltip / preview (opcional)

Si se muestra solo el identificador con expand al hacer click:

```jsx
function ParagraphTag({ paragraph }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="paragraph-tag">
      <button onClick={() => setExpanded(!expanded)}>
        ↳ {paragraph.identifier}
      </button>
      {expanded && paragraph.content && (
        <p className="paragraph-content">{paragraph.content}</p>
      )}
    </div>
  );
}

ParagraphTag.propTypes = {
  paragraph: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    content: PropTypes.string,
  }).isRequired,
};
```

---

## 4. Metadata nueva en ChromaDB (no expuesta en API, solo interna)

Sprint 3 agrega metadata a los chunks de artículo en ChromaDB.
**No afectan ningún endpoint existente**, pero pueden usarse en búsquedas futuras:

| Campo | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `inciso_count` | `int` | `3` | Cantidad de párrafos `\n\n` dentro del artículo |
| `numerals` | `List[str]` | `["1", "2", "3"]` | Numerales detectados (`1. texto`) |
| `literals` | `List[str]` | `["a", "b"]` | Literales detectados (`a) texto`) |

Estos campos solo se populan en documentos **re-ingresados** después del Sprint 3.
No hay cambios en endpoints para exponerlos — son para uso interno y Sprint 4.

---

## 5. Checklist de corrección frontend

- [ ] Actualizar `ParagraphShape` / `ParagraphDetail` — de `string` a `{identifier, content}`
- [ ] Actualizar `ArticleEntry` — render de `paragraph.identifier` en vez del string directo
- [ ] Agregar render opcional de `paragraph.content` (texto expandible)
- [ ] Probar con documentos que tengan parágrafos (Colsubsidio, Decreto 1072)
- [ ] Verificar que documentos sin parágrafos (`paragraphs` ausente o `[]`) no rompan el render
