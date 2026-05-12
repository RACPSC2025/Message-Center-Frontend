# Migración: campo type_comunication en amatia_requisitos_solicitudes

**Fecha:** 2026-05-12  
**Tabla:** `amatia_requisitos_solicitudes`  
**Base de datos:** `dev_ocensa_amb`

## Pasos — ejecutar en orden

### 1. Agregar columna

```sql
ALTER TABLE `amatia_requisitos_solicitudes`
ADD COLUMN `type_comunication` TINYINT UNSIGNED NOT NULL DEFAULT 0
  COMMENT 'Tipo de comunicación: 0=default, 1, 2, 3'
  AFTER `legal_enforce`;
```

### 2. Migrar datos existentes a valor 3

```sql
UPDATE `amatia_requisitos_solicitudes`
SET `type_comunication` = 3;
```

### 3. Verificar

```sql
SELECT id_request, type_comunication
FROM `amatia_requisitos_solicitudes`
LIMIT 10;
```

## Notas
- Valores válidos: `0`, `1`, `2`, `3`
- Registros históricos quedan con valor `3`
- Campo incluido en respuesta de `get_request_from_legal` desde esta fecha
