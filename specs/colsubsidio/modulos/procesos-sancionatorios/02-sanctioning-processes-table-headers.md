# sanctioning_processes_table_headers_amatia_expres

Fuente: `application/modules/message_center_api/controllers/Sanctioning_Processes_api.php`

## Propósito

Retorna la definición de columnas/headers para la tabla de Procesos Sancionatorios en el frontend de Amatia Express. El frontend consume este endpoint para construir dinámicamente la grilla sin hardcodear columnas.

## Endpoint

```
GET /message_center_api/Sanctioning_Processes_api/sanctioning_processes_table_headers_amatia_expres
```

> Nota: el nombre del método omite la 's' final de "express" — respetar al consumir.

## Parámetros de entrada

Ninguno. No requiere body ni query params.

## Headers requeridos

| Header              | Valor esperado        |
|--------------------|-----------------------|
| `Auth-Token`        | JWT del usuario       |
| `Selected-Language` | `es` \| `en`          |

## Respuesta exitosa

```json
{
  "status": 1,
  "messages": "Success",
  "data": {
    "headers": {
      "id": { ... },
      "process_id": { ... },
      ...
    }
  }
}
```

Los headers vienen ordenados por el campo `order` (ascendente).

## Estructura de cada header

| Campo            | Tipo    | Descripción                                                            |
|-----------------|---------|------------------------------------------------------------------------|
| `column`        | string  | Nombre de la columna/campo en BD                                       |
| `title`         | string  | Título genérico                                                        |
| `title_es`      | string  | Título en español                                                      |
| `title_en`      | string  | Título en inglés                                                       |
| `display_in_table` | bool | Si se muestra en la tabla principal (`FALSE` = columna oculta)        |
| `column_type`   | string  | Tipo de dato para renderizado: `number`, `text`, `long_text`, `status` |
| `column_width`  | string  | Ancho sugerido en px (vacío = auto)                                    |
| `order`         | int     | Posición de la columna (1 = primera)                                   |
| `edit`          | bool    | Si la columna es editable                                              |
| `type_edit`     | string  | Tipo de control de edición: `list`, `''` (texto libre)                 |

## Columnas definidas

| order | column                    | title_es                                            | display | column_type | type_edit |
|-------|--------------------------|-----------------------------------------------------|---------|-------------|-----------|
| 1     | `id`                     | id                                                  | FALSE   | number      |           |
| 2     | `process_id`             | ID Proceso                                          | TRUE    | number      |           |
| 3     | `ues`                    | UES                                                 | TRUE    | text        | list      |
| 4     | `sede`                   | Sede                                                | TRUE    | text        | list      |
| 5     | `expediente`             | Expediente                                          | TRUE    | text        |           |
| 6     | `autoridad`              | Autoridad                                           | TRUE    | text        | list      |
| 7     | `current_legal_phase`    | Fase Legal Actual                                   | TRUE    | status      | list      |
| 8     | `legal_phases_actions`   | Fases Legales - Actuaciones                         | TRUE    | long_text   |           |
| 9     | `process_stage`          | Etapa del Proceso                                   | TRUE    | text        | list      |
| 10    | `cargo_description`      | Cargo                                               | TRUE    | long_text   |           |
| 11    | `tema`                   | Tema                                                | TRUE    | text        | list      |
| 12    | `colsubsidio_response`   | Radicado y Contenido de Respuesta Colsubsidio       | TRUE    | long_text   |           |
| 13    | `estrategia`             | Estrategia                                          | TRUE    | long_text   |           |
| 14    | `estimated_sanction_amount` | Monto de la posible sanción (Tasación estimada)  | TRUE    | number      |           |

## Tipos de columna (`column_type`)

| Valor       | Descripción para el frontend                          |
|------------|-------------------------------------------------------|
| `number`    | Valor numérico (int o decimal)                        |
| `text`      | Texto corto, renderizar en una línea                  |
| `long_text` | Texto largo, renderizar con wrap o modal              |
| `status`    | Indicador de estado con color (ver catálogo de estados del módulo) |

## Tipos de edición (`type_edit`)

| Valor  | Descripción                                              |
|--------|----------------------------------------------------------|
| `list` | Dropdown/select — el frontend debe pedir opciones aparte |
| `""`   | Input de texto libre o número                            |

## Notas de implementación

- La columna `id` tiene `display_in_table: FALSE` — se incluye en la respuesta pero no se muestra en la grilla; se usa como referencia interna para operaciones CRUD.
- Las columnas `type_edit: 'list'` requieren un endpoint separado para obtener las opciones de cada lista (a definir en fases posteriores).
- El ordenamiento de headers se hace en servidor con `uasort` por campo `order`; el frontend puede confiar en el orden recibido.
