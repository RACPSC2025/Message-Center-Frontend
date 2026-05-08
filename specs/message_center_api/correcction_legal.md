# Corrección: create_legal_amatia_express — campos requeridos en el frontend

Endpoint: `POST /message_center_api/legal_api/create_legal_amatia_express`

---

## Campo faltante: `requisito_general_tipo`

El frontend no está enviando `requisito_general_tipo` en el payload. El API lo asigna incondicionalmente al objeto de inserción/actualización:

```php
$amatia_requisitos_insert_data['requisito_general_tipo'] = @$data['requisito_general_tipo'];
```

En modo **edición** (`legal_id` presente), esto ejecuta un `UPDATE` que **sobreescribe el valor existente con null o vacío**, aunque el registro ya tuviera un valor correcto.

Este campo es crítico: `list_legals_amatia_express` lo usa en `CASE WHEN requisito_general_tipo = '1'` para clasificar el requisito como General (`'1'`) o Específico (`'0'`).

**El frontend debe incluir siempre:**

```json
{
  "requisito_general_tipo": "1"
}
```

Valores válidos:

| Valor | Significado |
|-------|-------------|
| `"1"` | General |
| `"0"` | Específico |

---

## Campos obligatorios confirmados (ya presentes en el payload)

Estos campos están en el request y tienen mapeo correcto en el API:

| Campo | Tipo | Notas |
|-------|------|-------|
| `id_tipo_requisito` | string/int | Tipo de norma. Ejemplo: `"12"` |
| `categoria_norma` | string | |
| `nombre` | string | |
| `numero` | string | |
| `descripcion` | string | |
| `fecha_expedicion` | string `YYYY-MM-DD` | |
| `fecha_ejecutoria` | string `YYYY-MM-DD` | |
| `emitidopor` | string | |
| `estado` | string | `"abierto"` \| `"cerrado"` \| `"Continuo"` |
| `requisito_general` | string | `"0"` o `"1"` |
| `id_tema_requisito` | array de strings | Ejemplo: `["10", "7"]` |
| `concept` | string | Solo cuando `requisito_general_tipo = "0"` |
| `gap` | string | Solo cuando `requisito_general_tipo = "1"` |
| `apply_lto` | string \| null | |
| `new_or_renewal` | int | `0` o `1` |

Para edición, agregar:

| Campo | Tipo | Notas |
|-------|------|-------|
| `legal_id` | string/int | ID del registro a actualizar |

---

## Filtros por nivel (asociación de estructuras)

Los filtros `region`, `country`, `business`, `plant` que el API lee internamente **no son columnas de `amatia_requisitos`**. Se almacenan en la tabla `requisitos_structure` a través del campo `selected_structure`.

El frontend debe enviar los niveles así:

### `selected_levels` (JSON string)

Array de objetos con la cadena de niveles seleccionados:

```json
"selected_levels": "[{\"id\":\"5\",\"parents\":[\"1\",\"3\"]},{\"id\":\"9\",\"parents\":[\"1\",\"3\",\"5\"]}]"
```

- `id`: número entero del nivel (ID numérico de la tabla de niveles)
- `parents`: array de IDs numéricos de niveles padre

### `selected_structure` (string delimitado)

Cadena que codifica los niveles por tipo, formato `tipo_ID@tipo_ID,...`:

```
"region_2@country_5@business_11@plant_23"
```

- Todos los valores son **IDs numéricos** de la tabla de niveles
- El separador entre pares del mismo nivel es `@`
- El separador entre estructuras distintas es `,`
- No usar nombres de texto, solo IDs numéricos

Ejemplo completo de estructura multi-nivel:

```
"region_2@country_5@business_11@plant_23,region_2@country_5@business_12@plant_24"
```

Esto es requerido solo cuando `requisito_general = "0"` (requisito específico, no general).

---

## Resumen de campos a corregir/agregar en el frontend

| Campo | Estado actual | Acción |
|-------|--------------|--------|
| `requisito_general_tipo` | ❌ ausente | **Agregar siempre** (`"0"` o `"1"`) |
| `selected_levels` | ❌ ausente | Agregar si el requisito tiene niveles asignados |
| `selected_structure` | ❌ ausente | Agregar si el requisito tiene niveles asignados |
