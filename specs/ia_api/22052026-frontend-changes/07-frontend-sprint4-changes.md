# Sprint 4 — Endpoint nuevo: `GET /v1/documents/integrity`

**Fecha:** 2026-05-22  
**Contexto:** Sprint 4 — Validación de integridad. Endpoint completamente nuevo.  
**Sin breaking changes** en endpoints existentes.

---

## 1. Endpoint

```
GET /v1/documents/integrity?source=<filename>
Authorization: Bearer <token>
```

### Response (200)

```json
{
  "source": "Decreto_1072_de_2015_Sector_Trabajo.pdf",
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

### Response (404)

```json
{ "detail": "Documento 'archivo.pdf' no encontrado o sin artículos indexados." }
```

### Campos clave

| Campo | Tipo | Descripción |
|---|---|---|
| `missing_articles` | `string[]` | Números de artículos con gap en la secuencia |
| `duplicate_articles` | `string[]` | Números repetidos en dos o más posiciones |
| `total_gaps` | `number` | Cantidad total de brechas |
| `vigencia_date` | `string` | Fecha extraída del texto (vacío si no detectada) |
| `has_signature_block` | `boolean` | Documento cierra con bloque de firmas |
| `signatories` | `string[]` | Nombres de firmantes (máx 5) |
| `is_complete` | `boolean` | `true` si `total_gaps === 0` y sin duplicados |

---

## 2. Tipos React (CRA)

### PropTypes (JS plano)

```jsx
// src/types/integrity.js
import PropTypes from 'prop-types';

export const IntegrityReportShape = PropTypes.shape({
  source: PropTypes.string.isRequired,
  total_articles: PropTypes.number.isRequired,
  missing_articles: PropTypes.arrayOf(PropTypes.string).isRequired,
  duplicate_articles: PropTypes.arrayOf(PropTypes.string).isRequired,
  total_gaps: PropTypes.number.isRequired,
  vigencia_date: PropTypes.string,
  has_signature_block: PropTypes.bool.isRequired,
  signatories: PropTypes.arrayOf(PropTypes.string).isRequired,
  is_complete: PropTypes.bool.isRequired,
});
```

### TypeScript

```typescript
// src/types/integrity.ts
export interface IntegrityReport {
  source: string;
  total_articles: number;
  missing_articles: string[];
  duplicate_articles: string[];
  total_gaps: number;
  vigencia_date: string;
  has_signature_block: boolean;
  signatories: string[];
  is_complete: boolean;
}
```

---

## 3. Hook de fetch

```jsx
// src/hooks/useIntegrityReport.js
import { useState, useEffect } from 'react';

export function useIntegrityReport(source) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!source) return;
    setLoading(true);
    fetch(`/v1/documents/integrity?source=${encodeURIComponent(source)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => {
        if (r.status === 404) throw new Error('Documento no encontrado o sin artículos');
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [source]);

  return { data, loading, error };
}
```

---

## 4. Componente de reporte

```jsx
// src/components/integrity/IntegrityReport.jsx
import { useIntegrityReport } from '../../hooks/useIntegrityReport';
import { IntegrityReportShape } from '../../types/integrity';

function IntegrityBadge({ isComplete }) {
  return (
    <span className={`integrity-badge ${isComplete ? 'complete' : 'incomplete'}`}>
      {isComplete ? '✓ Completo' : '⚠ Incompleto'}
    </span>
  );
}

function IntegrityReport({ source }) {
  const { data, loading, error } = useIntegrityReport(source);

  if (loading) return <p>Verificando integridad…</p>;
  if (error)   return <p className="error">{error.message}</p>;
  if (!data)   return null;

  return (
    <div className="integrity-report">
      <h3>
        Reporte de Integridad
        <IntegrityBadge isComplete={data.is_complete} />
      </h3>

      <dl>
        <dt>Total artículos</dt>
        <dd>{data.total_articles}</dd>

        {data.total_gaps > 0 && (
          <>
            <dt>Artículos faltantes ({data.total_gaps} gaps)</dt>
            <dd>{data.missing_articles.join(', ')}</dd>
          </>
        )}

        {data.duplicate_articles.length > 0 && (
          <>
            <dt>Artículos duplicados</dt>
            <dd>{data.duplicate_articles.join(', ')}</dd>
          </>
        )}

        <dt>Fecha de vigencia</dt>
        <dd>{data.vigencia_date || 'No detectada'}</dd>

        <dt>Bloque de firmas</dt>
        <dd>{data.has_signature_block ? 'Detectado' : 'No detectado'}</dd>

        {data.signatories.length > 0 && (
          <>
            <dt>Firmantes</dt>
            <dd>
              <ul>
                {data.signatories.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}

IntegrityReport.propTypes = {
  source: PropTypes.string.isRequired,
};

export default IntegrityReport;
```

---

## 5. Limitaciones conocidas

| Limitación | Detalle |
|---|---|
| Solo documentos normativos | Judicial y contractual no tienen artículos numéricos — `total_articles: 0` |
| Gaps solo en secuencias numéricas | Artículos ordinales (PRIMERO, SEGUNDO...) no generan gaps, solo detectan duplicados |
| `vigencia_date` puede quedar vacío | Si el patrón de fecha no coincide con los últimos artículos |
| `signatories` máx 5 | Solo nombres en mayúscula detectados cerca del bloque `Dado en...` |
| Requiere re-ingestión | Documentos indexados antes del Sprint 3 pueden no tener `inciso_count` / `numerals` en metadata |

---

## 6. Checklist de implementación

- [ ] Crear `src/hooks/useIntegrityReport.js`
- [ ] Crear `src/types/integrity.js` (PropTypes) o `integrity.ts` (TypeScript)
- [ ] Crear `src/components/integrity/IntegrityReport.jsx`
- [ ] Agregar botón/pestaña "Integridad" en la vista de detalle de documento
- [ ] Estilo para `integrity-badge` (verde = completo, naranja = incompleto)
- [ ] Manejar `404` — documento sin artículos indexados (mostrar mensaje apropiado)
- [ ] Ocultar sección de integridad para `doc_type !== 'normativo'`
