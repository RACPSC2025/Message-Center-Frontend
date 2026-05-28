# Sprint 1 — Cambios de contrato API que afectan al frontend

**Fecha:** 2026-05-22  
**Contexto:** Sprint 1 de mejoras al sistema de análisis legal.  
Los cambios en `specialized_retrieval.py` y `adaptive_chunker.py` modificaron la forma
del JSON devuelto por los endpoints de taxonomía. Este documento describe qué cambió,
por qué rompe, y cómo corregirlo en el frontend.

---

## 1. `GET /v1/documents/taxonomy` — campo `tree`

### 1.1 `articles` y `orphan_articles` — de `string[]` a `object[]`

**Antes (Sprint 0):**
```json
{
  "major_sections": [
    {
      "name": "RESUELVE",
      "orphan_articles": ["1", "2"],
      "chapters": [
        {
          "title": "CAPÍTULO I",
          "orphan_articles": ["3"],
          "sections": [
            {
              "title": "SECCIÓN 1",
              "articles": ["4", "5"],
              "article_count": 2
            }
          ]
        }
      ]
    }
  ]
}
```

**Ahora (Sprint 1):**
```json
{
  "major_sections": [
    {
      "name": "RESUELVE",
      "orphan_articles": [
        { "number": "1" },
        { "number": "2", "paragraphs": ["PARÁGRAFO ÚNICO"] }
      ],
      "titles": [
        {
          "title": "TÍTULO I — FUNDAMENTOS",
          "chapters": [...],
          "orphan_articles": [{ "number": "3" }]
        }
      ],
      "chapters": [
        {
          "title": "CAPÍTULO I",
          "orphan_articles": [{ "number": "4" }],
          "sections": [
            {
              "title": "SECCIÓN 1",
              "articles": [
                { "number": "5" },
                { "number": "6", "paragraphs": ["PARÁGRAFO 1", "PARÁGRAFO 2"] }
              ],
              "article_count": 2
            }
          ]
        }
      ]
    }
  ]
}
```

**Por qué rompe:** cualquier código que trate `articles` o `orphan_articles` como array de strings fallará al intentar renderizar el número.

**Corrección en React (CRA):**

```jsx
// ANTES
{section.articles.map((art) => (
  <li key={art}>{art}</li>
))}

// AHORA
{section.articles.map((art) => (
  <li key={art.number}>
    Art. {art.number}
    {art.paragraphs?.length > 0 && (
      <ul>
        {art.paragraphs.map((p) => (
          <li key={p} style={{ color: '#666', fontSize: '0.9em' }}>↳ {p}</li>
        ))}
      </ul>
    )}
  </li>
))}
```

---

### 1.2 Nuevo nivel `titles` en `major_sections` (aditivo)

Cada `major_section` ahora puede tener un array `titles` (opcional — solo aparece cuando el documento tiene `TÍTULO I`, `TÍTULO II`, etc.).

Estructura de `TaxonomyTitle`:
```typescript
interface TaxonomyTitle {
  title: string;
  chapters: TaxonomyChapter[];
  orphan_articles?: ArticleEntry[];
}
```

**No rompe** si el frontend ignora `titles`, pero el árbol quedará incompleto para leyes nacionales (Ley 99, Código Civil). Recomendación: renderizarlo como nivel intermedio entre `major_section` y `chapter`.

**Ejemplo de render en React (CRA):**
```jsx
function MajorSection({ ms }) {
  return (
    <div>
      <h2>{ms.name}</h2>

      {/* Títulos normativos (Ley 99, Código Civil, etc.) */}
      {ms.titles?.map((titulo) => (
        <div key={titulo.title}>
          <h3>{titulo.title}</h3>
          {titulo.orphan_articles?.map((art) => (
            <ArticleEntry key={art.number} art={art} />
          ))}
          {titulo.chapters?.map((ch) => (
            <Chapter key={ch.title} chapter={ch} />
          ))}
        </div>
      ))}

      {/* Capítulos directos (resoluciones/decretos sin nivel TÍTULO) */}
      {ms.chapters?.map((ch) => (
        <Chapter key={ch.title} chapter={ch} />
      ))}

      {ms.orphan_articles?.map((art) => (
        <ArticleEntry key={art.number} art={art} />
      ))}
    </div>
  );
}
```

---

## 2. `GET /v1/documents/taxonomy/export` — CSV / XLSX

### 2.1 Nueva columna `title`

**Antes — columnas:**
```
source | major_section | chapter | section | article | page
```

**Ahora — columnas:**
```
source | major_section | title | chapter | section | article | page
```

La columna `title` es el `TÍTULO` normativo (vacío `""` si el documento no tiene nivel TÍTULO).

**Dónde rompe:**
- Acceso por índice numérico: `row[2]` era `chapter`, ahora es `title`
- Mapeo fijo de columnas esperando 6 campos
- Tablas/grids con columnas hardcodeadas

**Corrección en React (CRA):**

Si se descarga el archivo y se parsea en el frontend (ej. con `papaparse` para CSV o `xlsx` para Excel):

```jsx
// CSV con papaparse
import Papa from 'papaparse';

Papa.parse(file, {
  header: true,      // <-- leer cabecera como keys — no rompe con columna nueva
  skipEmptyLines: true,
  complete: (results) => {
    results.data.forEach((row) => {
      console.log(row.title);    // nuevo campo — antes no existía
      console.log(row.chapter);  // sin cambio
      console.log(row.article);  // sin cambio
    });
  },
});
```

```jsx
// XLSX con SheetJS
import * as XLSX from 'xlsx';

const wb = XLSX.read(buffer, { type: 'array' });
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws); // usa cabecera como keys — sin cambios
// data[0].title   → nuevo campo
// data[0].chapter → sin cambio
```

**Solo rompe** si el código accede por índice numérico (`row[2]` era `chapter`, ahora es `title`). Usar siempre `header: true` / `sheet_to_json` por nombre.

---

## 3. PropTypes / tipos para React (CRA)

CRA soporta TypeScript (`npx create-react-app --template typescript`) o JS plano con PropTypes.

**Opción A — PropTypes (JS plano):**
```jsx
// src/types/taxonomy.js
import PropTypes from 'prop-types';

export const ArticleEntryShape = PropTypes.shape({
  number: PropTypes.string.isRequired,
  paragraphs: PropTypes.arrayOf(PropTypes.string),
});

export const SectionShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  articles: PropTypes.arrayOf(ArticleEntryShape).isRequired,
  article_count: PropTypes.number.isRequired,
});

export const ChapterShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  sections: PropTypes.arrayOf(SectionShape).isRequired,
  orphan_articles: PropTypes.arrayOf(ArticleEntryShape),
});

export const TitleShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  chapters: PropTypes.arrayOf(ChapterShape).isRequired,
  orphan_articles: PropTypes.arrayOf(ArticleEntryShape),
});

export const MajorSectionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  titles: PropTypes.arrayOf(TitleShape),          // nuevo
  chapters: PropTypes.arrayOf(ChapterShape),
  orphan_articles: PropTypes.arrayOf(ArticleEntryShape),
});
```

**Opción B — TypeScript (si el proyecto usa CRA + TS template):**
```typescript
// src/types/taxonomy.ts

export interface ArticleEntry {
  number: string;
  paragraphs?: string[];
}

export interface TaxonomySection {
  title: string;
  articles: ArticleEntry[];
  article_count: number;
}

export interface TaxonomyChapter {
  title: string;
  sections: TaxonomySection[];
  orphan_articles?: ArticleEntry[];
}

export interface TaxonomyTitle {
  title: string;
  chapters: TaxonomyChapter[];
  orphan_articles?: ArticleEntry[];
}

export interface TaxonomyMajorSection {
  name: string;
  titles?: TaxonomyTitle[];       // nuevo — nivel TÍTULO
  chapters?: TaxonomyChapter[];
  orphan_articles?: ArticleEntry[];
}

export interface DocumentTaxonomyTree {
  source: string;
  total_articles: number;
  major_sections: TaxonomyMajorSection[];
}
```

**Componente `ArticleEntry` reutilizable (JS):**
```jsx
// src/components/ArticleEntry.jsx
import { ArticleEntryShape } from '../types/taxonomy';

function ArticleEntry({ art }) {
  return (
    <div className="article-entry">
      <span>Art. {art.number}</span>
      {art.paragraphs?.map((p) => (
        <span key={p} className="paragraph-tag">{p}</span>
      ))}
    </div>
  );
}

ArticleEntry.propTypes = {
  art: ArticleEntryShape.isRequired,
};

export default ArticleEntry;
```

---

## 4. Resumen de impacto

| Endpoint | Campo | Tipo cambio | Rompe |
|---|---|---|---|
| `GET /taxonomy` → `tree.**.articles` | `string[]` → `ArticleEntry[]` | Breaking | ✅ Sí |
| `GET /taxonomy` → `tree.**.orphan_articles` | `string[]` → `ArticleEntry[]` | Breaking | ✅ Sí |
| `GET /taxonomy` → `tree.major_sections[].titles` | Campo nuevo | Aditivo | ⚠️ Parcial |
| `GET /taxonomy/export` (CSV/XLSX) | Columna `title` nueva en pos. 3 | Breaking por índice | ✅ Sí |

---

## 5. Checklist de corrección frontend

- [ ] Actualizar tipos/interfaces `ArticleEntry`, `TaxonomySection`, `TaxonomyChapter`, `TaxonomyMajorSection`
- [ ] Cambiar render de `articles[]` y `orphan_articles[]` para usar `.number`
- [ ] Agregar render de `.paragraphs[]` por artículo (si aplica)
- [ ] Agregar nivel `titles` al componente de árbol jerárquico
- [ ] Actualizar parser de CSV/XLSX para leer columnas por nombre, no por índice
- [ ] Si hay tabla hardcodeada con 6 columnas, agregar columna `Título`
