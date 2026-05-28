# Sprint 2 — Cambios de contrato API que afectan al frontend

**Fecha:** 2026-05-22  
**Contexto:** Sprint 2 — Cobertura de nuevos tipos de documento (normativo, contractual, judicial).

---

## 1. Qué cambió en la API

### `GET /v1/documents/taxonomy`

Misma URL, mismo parámetro `source`. Pero **`tree` ahora es polimórfico** — su forma depende del tipo de documento detectado al momento de la ingestión.

| `tree.doc_type` | Quién lo produce | Forma del `tree` |
|---|---|---|
| `undefined` / `"normativo"` | Ley, Decreto, Resolución | `major_sections → titles → chapters → sections → articles` |
| `"contractual"` | Contrato, Escritura, Convenio | `clauses[]` |
| `"judicial"` | Sentencia, Auto, Providencia | `sections[] + falla[]` |

**`total_articles`** en el wrapper también cambia de semántica:
- Normativo → cantidad de artículos
- Contractual → cantidad de cláusulas
- Judicial → cantidad de secciones macro

---

## 2. Shapes completos por tipo

### 2.1 Normativo (sin cambios desde Sprint 1)

```typescript
interface NormativeTaxonomyTree {
  source: string;
  total_articles: number;
  major_sections: MajorSection[];
}
// MajorSection, TaxonomyTitle, etc. — ver 01-frontend-integration-changes.md
```

### 2.2 Contractual (nuevo)

```typescript
interface ClauseEntry {
  identifier: string;       // "PRIMERA", "II", "ÚNICA", "3"
  title: string;            // primera línea completa, máx 120 chars
  content_preview: string;  // primeros 200 chars del cuerpo
}

interface ContractualTaxonomyTree {
  source: string;
  doc_type: "contractual";
  total_clauses: number;
  clauses: ClauseEntry[];
}
```

### 2.3 Judicial (nuevo)

```typescript
interface JudicialSection {
  name: string;             // "ANTECEDENTES", "CONSIDERACIONES", "FALLA"
  content_preview: string;  // primeros 300 chars
}

interface FallaItem {
  numeral: string;  // "PRIMERO", "SEGUNDO", "1"
  text: string;     // texto del numeral, máx 300 chars
}

interface JudicialTaxonomyTree {
  source: string;
  doc_type: "judicial";
  radicacion: string;
  magistrado_ponente: string;
  total_sections: number;
  sections: JudicialSection[];
  falla: FallaItem[];
}
```

### 2.4 Tipo unión (para typing del componente raíz)

```typescript
type TaxonomyTree =
  | NormativeTaxonomyTree
  | ContractualTaxonomyTree
  | JudicialTaxonomyTree;

interface DocumentTaxonomyResponse {
  source: string;
  total_articles: number;   // artículos / cláusulas / secciones según doc_type
  include_articles: boolean;
  text: string;
  tree: TaxonomyTree;
}
```

---

## 3. Cambios en componentes React (CRA)

### 3.1 Router de tipo — componente raíz

```jsx
// src/components/taxonomy/TaxonomyTree.jsx
import NormativeTree from './NormativeTree';
import ContractTree  from './ContractTree';
import JudicialTree  from './JudicialTree';

function TaxonomyTree({ tree }) {
  const docType = tree.doc_type ?? 'normativo';

  if (docType === 'contractual') return <ContractTree data={tree} />;
  if (docType === 'judicial')    return <JudicialTree data={tree} />;
  return <NormativeTree data={tree} />;
}

export default TaxonomyTree;
```

### 3.2 Label dinámico de `total_articles`

```jsx
// src/components/taxonomy/TaxonomyHeader.jsx
function TaxonomyHeader({ response }) {
  const { total_articles, tree } = response;
  const docType = tree.doc_type ?? 'normativo';

  const label = {
    normativo:   `${total_articles} artículos`,
    contractual: `${total_articles} cláusulas`,
    judicial:    `${total_articles} secciones`,
  }[docType] ?? `${total_articles} elementos`;

  return (
    <div className="taxonomy-header">
      <h2>{response.source}</h2>
      <span className="badge">{label}</span>
    </div>
  );
}
```

### 3.3 Componente contractual

```jsx
// src/components/taxonomy/ContractTree.jsx
import PropTypes from 'prop-types';

function ContractTree({ data }) {
  return (
    <div className="contract-tree">
      {data.clauses.map((clause) => (
        <div key={clause.identifier} className="clause-item">
          <h4>{clause.title}</h4>
          {clause.content_preview && (
            <p className="clause-preview">{clause.content_preview}…</p>
          )}
        </div>
      ))}
    </div>
  );
}

ContractTree.propTypes = {
  data: PropTypes.shape({
    total_clauses: PropTypes.number.isRequired,
    clauses: PropTypes.arrayOf(PropTypes.shape({
      identifier: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content_preview: PropTypes.string,
    })).isRequired,
  }).isRequired,
};

export default ContractTree;
```

### 3.4 Componente judicial

```jsx
// src/components/taxonomy/JudicialTree.jsx
import PropTypes from 'prop-types';

function JudicialTree({ data }) {
  return (
    <div className="judicial-tree">

      {/* Encabezado */}
      <div className="judicial-header">
        {data.radicacion && <p><strong>Radicación:</strong> {data.radicacion}</p>}
        {data.magistrado_ponente && (
          <p><strong>Magistrado Ponente:</strong> {data.magistrado_ponente}</p>
        )}
      </div>

      {/* Secciones macro */}
      <div className="judicial-sections">
        {data.sections.map((sec) => (
          <div key={sec.name} className="judicial-section">
            <h4>{sec.name}</h4>
            {sec.content_preview && (
              <p className="section-preview">{sec.content_preview}…</p>
            )}
          </div>
        ))}
      </div>

      {/* Numerales del FALLA */}
      {data.falla.length > 0 && (
        <div className="judicial-falla">
          <h3>FALLA</h3>
          <ol>
            {data.falla.map((item) => (
              <li key={item.numeral}>
                <strong>{item.numeral}:</strong> {item.text}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

JudicialTree.propTypes = {
  data: PropTypes.shape({
    radicacion: PropTypes.string,
    magistrado_ponente: PropTypes.string,
    sections: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      content_preview: PropTypes.string,
    })).isRequired,
    falla: PropTypes.arrayOf(PropTypes.shape({
      numeral: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
};

export default JudicialTree;
```

### 3.5 Hook de fetch (sin cambios en llamada)

```jsx
// src/hooks/useTaxonomy.js
import { useState, useEffect } from 'react';

export function useTaxonomy(source, includeArticles = false) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!source) return;
    setLoading(true);
    fetch(`/v1/documents/taxonomy?source=${encodeURIComponent(source)}&include_articles=${includeArticles}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [source, includeArticles]);

  return { data, loading, error };
}
```

---

## 4. Export CSV/XLSX — limitación conocida

`GET /v1/documents/taxonomy/export` **solo funciona para documentos normativos**.  
Para contractual y judicial devuelve filas vacías (no hay artículos en ChromaDB para esos tipos).

**No rompe** — devuelve 200 con CSV/XLSX vacío. Pero mostrar el botón de export es confuso.

**Solución recomendada:**

```jsx
// Ocultar botón export para tipos no normativos
const docType = taxonomyData?.tree?.doc_type ?? 'normativo';
const showExport = docType === 'normativo';

{showExport && (
  <button onClick={handleExport}>Exportar CSV/XLSX</button>
)}
```

---

## 5. Checklist de implementación

- [ ] Crear `src/components/taxonomy/TaxonomyTree.jsx` — router por `doc_type`
- [ ] Crear `src/components/taxonomy/ContractTree.jsx`
- [ ] Crear `src/components/taxonomy/JudicialTree.jsx`
- [ ] Actualizar `TaxonomyHeader` — label dinámico artículos/cláusulas/secciones
- [ ] Agregar tipos/PropTypes para `ClauseEntry`, `JudicialSection`, `FallaItem`
- [ ] Ocultar botón export para `doc_type !== 'normativo'`
- [ ] Probar con: Colsubsidio (normativo), un contrato (contractual), una sentencia (judicial)
