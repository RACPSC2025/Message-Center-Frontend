# NormativeDocMetadata — Referencia de campos

Objeto retornado en `normative_metadata` dentro de la respuesta de
`GET /v1/documents/taxonomy` cuando el documento es de tipo `normativo`
(Decreto, Resolución, Ley, Acuerdo, etc.).

`normative_metadata` es `null` cuando:
- El documento no es `normativo` (contractual o judicial).
- Fue indexado antes de que el extractor estuviera activo → re-ingestar con `force_reconvert=true`.

---

## Contrato de la respuesta

```ts
interface NormativeDocMetadata {
  tipo_normativa:   string   // "RESOLUCIÓN" | "DECRETO" | "LEY" | "ACUERDO" | ...
  numero:           string   // número del acto, solo dígitos/puntos
  titulo:           string   // nombre descriptivo corto ≤80 chars → usar como título UI
  titulo_formal:    string   // texto legal "Por la cual…" ≤300 chars
  fecha_expedicion: string   // fecha en texto libre, ej. "6 de octubre de 2021"
  fecha_vigencia:   string   // fecha desde la que rige; "" si no aplica o no detectada
  pais:             string   // siempre "Colombia"
  entidad_emisora:  string   // institución completa que expide la norma
  descripcion:      string   // contexto adicional o alcance ≤200 chars
  tipo_requisito:   string   // "general" | "especifico" | ""
}
```

---

## Detalle de cada campo

### `tipo_normativa`
Tipo del acto normativo. Extraído por LLM del encabezado.

| Valor posible | Descripción |
|---|---|
| `RESOLUCIÓN` | Acto administrativo de entidades públicas |
| `DECRETO` | Decreto presidencial o ministerial |
| `LEY` | Ley expedida por el Congreso |
| `ACUERDO` | Acuerdos de concejos municipales o distritales |
| `CIRCULAR` | Instrucciones internas/externas de entidades |
| `ORDENANZA` | Normas de asambleas departamentales |

---

### `numero`
Número oficial del acto. Solo dígitos y puntos. Sin prefijos.

```
"03874"     ← Resolución No. 03874
"1072"      ← Decreto 1072
"2208"      ← Resolución 2208
```

---

### `titulo` ★ campo principal para UI
Nombre descriptivo corto generado por LLM. Máximo 80 caracteres.
**Usar este campo como título de display en el frontend.**

```
"Autorización de tratamientos silviculturales en espacio privado"
"Decreto Único Reglamentario del Sector Trabajo"
"Régimen de seguridad y salud en el trabajo"
```

---

### `titulo_formal`
Texto legal completo "Por la cual…" o "Por el cual…". Máximo 300 caracteres.
Usar como subtítulo, tooltip o detalle expandible.

```
"POR LA CUAL SE AUTORIZAN TRATAMIENTOS SILVICULTURALES EN ESPACIO PRIVADO
 Y SE ADOPTAN OTRAS DISPOSICIONES"
```

---

### `fecha_expedicion`
Fecha de firma/expedición en texto libre tal como aparece en el documento.

```
"6 de octubre de 2021"
"26 de mayo de 2015"
"15 de marzo de 2024"
```

> Puede estar vacío si el documento no incluye fecha explícita en el encabezado.

---

### `fecha_vigencia`
Fecha desde la que rige el acto. Vacío `""` si no se menciona explícitamente
(la mayoría de normas rigen desde su publicación, sin fecha diferida).

```
"26 de mayo de 2015"    ← cuando se menciona explícitamente
""                      ← cuando no aplica o no se detecta
```

---

### `pais`
Siempre `"Colombia"`. Fijo por configuración del extractor.

---

### `entidad_emisora`
Nombre completo de la institución que expide la norma. Máximo 120 caracteres.

```
"LA SUBDIRECCIÓN DE SILVICULTURA FLORA Y FAUNA SILVESTRE DE LA SECRETARÍA DISTRITAL DE AMBIENTE"
"MINISTERIO DE TRABAJO"
"PRESIDENCIA DE LA REPÚBLICA"
"SECRETARÍA DISTRITAL DE SALUD"
```

---

### `descripcion`
Contexto adicional o alcance de la norma. Diferente al `titulo`.
Generado por LLM. Máximo 200 caracteres.

```
"Autoriza tala, traslado y tratamiento integral de 170 individuos arbóreos
 en predio de Colsubsidio para construcción de edificio multipropósito."
```

---

### `tipo_requisito`
Clasificación del alcance de la norma.

| Valor | Criterio |
|---|---|
| `"general"` | Aplica a todo un sector o la nación. Ej: Decreto 1072, Ley 1562. |
| `"especifico"` | Aplica a una entidad, obra o proceso particular. Ej: Resolución de tala para Colsubsidio. |
| `""` | No determinado por el LLM. |

---

## Ejemplo completo

```json
{
  "tipo_normativa": "RESOLUCIÓN",
  "numero": "03874",
  "titulo": "Autorización de tratamientos silviculturales en espacio privado",
  "titulo_formal": "POR LA CUAL SE AUTORIZAN TRATAMIENTOS SILVICULTURALES EN ESPACIO PRIVADO Y SE ADOPTAN OTRAS DISPOSICIONES",
  "fecha_expedicion": "6 de octubre de 2021",
  "fecha_vigencia": "",
  "pais": "Colombia",
  "entidad_emisora": "LA SUBDIRECCIÓN DE SILVICULTURA FLORA Y FAUNA SILVESTRE DE LA SECRETARÍA DISTRITAL DE AMBIENTE",
  "descripcion": "Autoriza intervención de 170 individuos arbóreos en predio de Colsubsidio para construcción de edificio multipropósito.",
  "tipo_requisito": "especifico"
}
```

---

## Campos adicionales disponibles bajo demanda

Los siguientes campos **no se extraen actualmente** pero el LLM puede
obtenerlos sin cambio de arquitectura — solo requieren agregarse al prompt.
Solicitar al equipo de backend si se necesitan:

| Campo | Ejemplo | Disponibilidad |
|---|---|---|
| `dependencia_emisora` | `"Subdirección de Silvicultura, Flora y Fauna"` | Alta |
| `firmante` | `"DIANA ALEJANDRA VARGAS MORA"` | Alta |
| `cargo_firmante` | `"Subdirectora de Silvicultura"` | Alta |
| `ciudad` | `"Bogotá D.C."` | Alta |
| `ambito_territorial` | `"distrital"` / `"nacional"` / `"municipal"` | Media |
| `normas_base` | `["Ley 99/1993", "Decreto 1076/2015"]` | Media |
| `radicado` | `"2022EE234175"` | Media |
| `vigencia_hasta` | fecha de vencimiento si aplica | Baja |

---

## Notas de integración

- Todos los campos son `string`. Nunca `null` — campo ausente = `""`.
- `titulo` es el único campo garantizado ≤80 chars. Los demás pueden llegar al límite indicado.
- El extractor usa LLM (Bedrock Nova Lite) + regex fallback. El LLM es primario para todos los campos excepto `pais`.
- Si `normative_metadata` llega como `null` para un documento normativo, re-ingestar con `force_reconvert=true`.
- Los datos se almacenan en los chunks de ChromaDB en el momento de la ingestión. No se recalculan en cada query.
