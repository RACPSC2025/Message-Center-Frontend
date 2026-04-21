---
documento: Documentación de datos para IA
fuente: Permisos_Ambientales_1.xlsx
hoja: PERMISOS EN TRÁMITE
total_registros: 134
fecha_generacion: 2026-04-21
idioma: es-CO
dominio: gestión ambiental / permisos ante autoridades ambientales (Colombia)
---

# Documentación — Hoja `PERMISOS EN TRÁMITE`

## 1. Propósito del dataset

Esta hoja contiene el inventario operativo de **trámites de permisos ambientales** que lleva la organización (Colsubsidio) ante autoridades ambientales nacionales y regionales de Colombia. Cada fila representa **un trámite** (una solicitud, renovación, prórroga, recurso o desistimiento) asociado a una sede/unidad de negocio y a un permiso específico.

El dataset permite responder preguntas del tipo:
- ¿Qué trámites hay abiertos y ante qué autoridad?
- ¿En qué estado va cada solicitud?
- ¿Cuáles presentan desviaciones según el semáforo ambiental?
- ¿Cuánto se ha pagado por evaluación ambiental por unidad/sede?
- ¿Qué radicados/actos administrativos se han emitido?

## 2. Estructura del archivo

| Propiedad | Valor |
|---|---|
| Archivo fuente | `Permisos_Ambientales_1.xlsx` |
| Hoja | `PERMISOS EN TRÁMITE` |
| Encabezados | Fila 6 de la hoja |
| Datos | Desde la fila 7 en adelante |
| Filas con datos | 134 |
| Columnas útiles | 27 (se descartan columnas `Unnamed` y vacías residuales) |
| Encima del encabezado | Leyenda de `Semáforo ambiental` (filas 2–5) |

### 2.1 Leyenda del Semáforo ambiental (filas 2–5 de la hoja)

| Color | Significado |
|---|---|
| Verde (sin marca) | No se presentan desviaciones |
| Amarillo | Se presentan desviaciones por requerimientos que **pueden ser atendidos sin modificar** el tiempo proyectado para el otorgamiento del permiso |
| Rojo | Se presentan desviaciones por requerimientos que **aumentan** el tiempo proyectado, o porque la Autoridad Ambiental **superó** el tiempo proyectado para el otorgamiento |

## 3. Diccionario de columnas

A continuación se describe cada columna: nombre literal en la hoja, descripción semántica, tipo de dato inferido, obligatoriedad (según % de nulos observados) y ejemplos.

### 3.1 Identificación del trámite

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 1 | `UNIDAD` | Unidad de negocio de la organización dueña del trámite. | Categórica | 0 / 134 | `MERCADOS`, `SALUD`, `MEDICAMENTOS`, `HOTELERÍA`, `RECREACIÓN`, `EDUCACIÓN`, `VIVIENDA`, `ADMINISTRACIÓN` |
| 2 | `SEDE` | Establecimiento físico o agrupación de establecimientos afectados por el permiso. | Texto libre | 0 / 134 | `Hotel Lanceros`, `Club Nautico`, `Hotel Alcaraván` |
| 3 | `TIPO DE PERMISO` | Categoría del permiso ambiental solicitado. | Categórica | 0 / 134 | `Registro de Publicidad Exterior Visual`, `Aprovechamiento Forestal`, `Permiso de vertimientos`, `Concesión de aguas superficiales`, `Ocupación de cauce` |
| 4 | `TIPO DE TRÁMITE` | Naturaleza jurídica de la gestión. | Categórica | 0 / 134 | `Nueva solicitud`, `Renovación`, `Prórroga`, `Prórroga y modificación`, `Recurso de reposición`, `Desistimiento`, `Desistimiento en curso`, `Cambio de marca`, `Cambio de texto por ARA` |
| 7 | `AUTORIDAD ` | Autoridad ambiental competente. ⚠️ El nombre de la columna contiene un **espacio final** en el archivo original. | Categórica | 0 / 134 | `SDA`, `CAR`, `CORPOBOYACÁ`, `CORMACARENA`, `Subsecretaría de Espacio Público`, `ALCALDIA MUNICIPAL`, `Secretaría de Planeación` |

### 3.2 Documentos y justificación

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 5 | `ACTO ADMINISTRATIVO INICIAL` | Resolución o acto del permiso vigente previo (solo aplica si el trámite es sobre un permiso existente: renovación, prórroga, recurso, etc.). | Texto libre | 96 / 134 | `Resolución 3641 del 30/12/2014`, `Resolución 3608 del 26/12/2023` |
| 6 | `EXPEDIENTE` | Número de expediente administrativo del permiso ante la autoridad. | Texto libre | 112 / 134 | `OOCA-0102/12`, `OPOC-00031-23`, `97-2889` |
| 8 | `JUSTIFICACION DE LA SOLICITUD` | Motivo por el cual se radica el trámite. | Texto libre | 0 / 134 | `Pérdida de vigencia`, `Aumento de consumo de agua`, `Caída de árboles por daños mecánicos` |
| 9 | `FECHA PROYECTADA PARA LA EJECUCIÓN DE LA OBRA  o APERTURAS` | Fecha tentativa en que se ejecutará la obra o apertura que depende del permiso. ⚠️ Contiene **doble espacio** y mezcla valores de fecha con texto libre. | Mixto (fecha o texto) | 70 / 134 | `Establecimiento abierto`, `Febrero de 2026`, `Diciembre de 2025` |

### 3.3 Pago por evaluación ambiental

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 10 | `VALOR DEL PAGO POR EVALUACIÓN AMBIENTAL` | Monto pagado a la autoridad por el servicio de evaluación. ⚠️ Formato heterogéneo: unos con `$` y puntos de mil, otros como número plano. | Moneda (texto/num.) | 95 / 134 | `$6.971.794`, `2033249`, `1775911` |
| 11 | `FECHA DEL REPORTE DE PAGO POR EVALUACIÓN AMBIENTAL` | Fecha en que se reportó el pago a la autoridad. | Fecha (mixto dd/mm/yyyy y datetime) | 96 / 134 | `19/05/2025`, `2024-07-09` |
| 12 | `NÚMERO DE RADICADO DEL REPORTE DE PAGO` | Radicado emitido por la autoridad al recibir el soporte de pago. | Texto libre | 92 / 134 | `0000013683 del 19/05/2025`, `20241068953` |

### 3.4 Radicación del permiso

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 13 | `FECHA DE RADICACIÓN DEL PERMISO` | Fecha en que la solicitud del permiso fue radicada ante la autoridad. | Fecha (mixto) | 33 / 134 | `24/12/2024`, `2023-09-29` |
| 14 | `NÚMERO DE RADICADO DE LA SOLICITUD A LA AUTORIDAD AMBIENTAL` | Número de radicado asignado por la autoridad al recibir la solicitud. | Texto libre | 33 / 134 | `35619 del 27/12/2024`, `30432 del 17/10/2025` |

### 3.5 Otorgamiento y tiempos

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 15 | `FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO` | Fecha estimada en que se espera recibir el permiso otorgado. | Fecha (mixto) | 114 / 134 | `30/12/2025`, `2026-03-30` |
| 16 | `FECHA REAL DE OTORGAMIENTO` | Fecha en que efectivamente se otorgó el permiso. | Fecha o texto `Pendiente` | 86 / 134 | `31/12/2025`, `Pendiente` |
| 17 | `DURACIÓN DEL TRÁMITE (MESES)` | Meses transcurridos entre radicación y otorgamiento. | Numérica / texto | 133 / 134 | `Pendiente` |
| 18 | `SEMAFORO AMBIENTAL` | Celda con color de fondo (verde/amarillo/rojo) según la leyenda. El **valor textual de la celda está vacío** en casi todos los casos; la información está codificada en el **formato/color** de la celda, no en el texto. | Formato visual | 129 / 134 (texto) | — |

### 3.6 Gestión del trámite

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 19 | `AUTO INICIO DE TRAMITE` | Acto administrativo mediante el cual la autoridad admite y da inicio al trámite. | Texto libre | 127 / 134 | `Auto No.0553 del 12/08/2024`, `Auto PS-GJ-1.2.64.25.2864 de 2025` |
| 20 | `FECHA EJECUCIÓN VISITA TÉCNICA` | Fecha en que la autoridad realizó visita técnica al predio. | Fecha (mixto) | 127 / 134 | `2025-11-06`, `2025-08-21` |
| 21 | `DATOS DE CONTACTO DEL FUNCION/ARIO DE LA AUTORIDAD AMBIENTAL` | Nombre o teléfono del funcionario asignado. ⚠️ El nombre del campo contiene la barra `/` por una macro de Excel que corta la palabra "FUNCIONARIO". | Texto libre | 127 / 134 | `3143454423`, `Juan Pablo Diaz Venegas` |

### 3.7 Requerimientos adicionales

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 22 | `ACTO ADMINISTRATIVO DE REQUERIMIENTOS ADICION/ALES` | Oficio/auto con el que la autoridad solicita ajustes o información adicional. | Texto libre | 119 / 134 | `160-3576 del 27/02/2025`, `2025EE139421` |
| 23 | `DESCRIPCION DE REQUERIMIENTOS ADICION/ALES DEL ACTO ADMINISTRATIVO` | Texto largo (bitácora) que relata el historial de requerimientos, respuestas, actos y comunicaciones. **Es el campo más informativo por registro**. | Texto libre largo | 120 / 134 | Bitácoras narrativas de varios párrafos |
| 24 | `FECHA DE RESPUESTA A LOS REQUERIMIENTOS ADICION/ALES` | Fecha en que se respondió al requerimiento. | Fecha (mixto) | 124 / 134 | `28/03/2025`, `13/03/2025` |
| 25 | `No RADICADO DE LA RESPUESTA A LA AUTORIDAD AMBIENTAL` | Radicado con el que se envió la respuesta. | Texto libre | 122 / 134 | `9134 del 31/03/2025`, `PS-GJ. 1.2.6.25.1530 de 26/12/2025` |

### 3.8 Estado y control

| # | Columna | Descripción | Tipo | Nulos | Ejemplos |
|---|---|---|---|---|---|
| 26 | `ESTADO DEL TRÁMITE` | Estado actual del trámite. Ver sección 5. | Categórica | 0 / 134 | `En proceso`, `Desistido`, `Otorgado`, `Pendiente Trámitar`, `Cerrado` |
| 28 | `FECHA DE ACTUALIZACIÓN DE LA MATRIZ` | Fecha en que se actualizó por última vez la fila. En el archivo está **vacía en todas las filas**. | Fecha | 134 / 134 | — |

## 4. Observaciones de calidad de datos

Aspectos que cualquier consumidor (humano o IA) debe tener en cuenta al procesar este dataset:

1. **Encabezados no están en la fila 1.** Los encabezados reales viven en la fila 6 de la hoja; las filas 1–5 contienen la leyenda del semáforo ambiental. Al leer con pandas use `header=5`.
2. **Columnas residuales vacías** (`Unnamed: 26`, `Unnamed: 28..31`) deben descartarse.
3. **Nombres de columnas con inconsistencias**: `AUTORIDAD ` tiene un espacio final; varias columnas incluyen `/` dentro de palabras (`ADICION/ALES`, `FUNCION/ARIO`) por efecto de una macro de Excel; existe un doble espacio en `OBRA  o APERTURAS`. Al comparar o hacer joins, conviene normalizar nombres.
4. **Fechas heterogéneas.** Mezclan cadenas `dd/mm/yyyy`, `datetime` nativos de Excel y texto libre como `Pendiente`, `Febrero de 2026`, `Establecimiento abierto`. Un parser robusto debe contemplar fallback a texto.
5. **Valores monetarios heterogéneos.** Algunos con símbolo `$` y separador de miles `.`, otros como entero plano.
6. **Valores categóricos con variaciones tipográficas.** En `ESTADO DEL TRÁMITE` y `TIPO DE TRÁMITE` aparecen errores ortográficos (`Desisitido` en vez de `Desistido`) y espacios trailing. Recomendado aplicar `.strip()` y corrección de alias antes de agrupar.
7. **Un registro en `ESTADO DEL TRÁMITE` contiene la cadena `Cambio de texto ya que solo quedo drogueria`**, que no es un estado sino una anotación libre; tratar como dato anómalo.
8. **`SEMAFORO AMBIENTAL` es visual**: el color de la celda comunica la información, no el texto. Una lectura solo de valores pierde ese atributo. Para recuperarlo hay que leer el `fill.start_color` de cada celda con `openpyxl`.
9. **`FECHA DE ACTUALIZACIÓN DE LA MATRIZ` está totalmente vacía**; no es confiable como timestamp.

## 5. Estados del trámite (`ESTADO DEL TRÁMITE`)

Tras normalizar espacios en blanco y agrupar variantes con errores ortográficos, los estados presentes en la hoja son **6** (más 1 anotación anómala):

| # | Estado canónico | Conteo | Variantes observadas en la hoja | Interpretación |
|---|---|---|---|---|
| 1 | **En proceso** | 60 | `En proceso` | El trámite está radicado y siendo atendido por la autoridad ambiental; a la espera de actos, visitas o respuestas. |
| 2 | **Desistido** | 60 | `Desistido` (58), `Desisitido` (2, error ortográfico) | La organización o la autoridad dio por terminado el trámite sin otorgamiento del permiso. |
| 3 | **Otorgado** | 7 | `Otorgado` (6), `Otorgado ` (1, con espacio final) | La autoridad ambiental ya emitió el acto administrativo que concede el permiso. |
| 4 | **Pendiente Trámitar** | 5 | `Pendiente Trámitar` | El trámite aún no ha sido radicado; está en la fila interna por preparar y presentar. |
| 5 | **Cerrado** | 1 | `Cerrado` | El trámite se terminó administrativamente (distinto a desistido: implica cierre formal del expediente). |
| 6 | *(Anotación, no un estado real)* | 1 | `Cambio de texto ya que solo quedo drogueria` | Nota libre que quedó en la columna por error de captura. Debe reclasificarse. |

**Totales:** 60 + 60 + 7 + 5 + 1 + 1 = **134 registros**, que coincide con el total de filas con datos en la hoja.

### 5.1 Resumen gráfico (distribución)

```
En proceso             ██████████████████████████████  60  (44.8%)
Desistido              ██████████████████████████████  60  (44.8%)
Otorgado               ███                              7  (5.2%)
Pendiente Trámitar     ██                               5  (3.7%)
Cerrado                █                                1  (0.7%)
(Anotación anómala)    █                                1  (0.7%)
```

### 5.2 Recomendación de normalización

Para análisis futuros, se sugiere aplicar este mapeo de alias → canónico:

```python
ALIAS_ESTADO = {
    "En proceso": "En proceso",
    "Desistido": "Desistido",
    "Pendiente Trámitar": "Pendiente Trámitar",
    "Otorgado": "Otorgado",
    "Cerrado": "Cerrado"
}

df["ESTADO DEL TRÁMITE"] = (
    df["ESTADO DEL TRÁMITE"]
      .astype(str).str.strip()
      .map(ALIAS_ESTADO)
)
```

## 6. Cómo leer esta hoja con Python

```python
import pandas as pd

df = pd.read_excel(
    "Permisos_Ambientales_1.xlsx",
    sheet_name="PERMISOS EN TRÁMITE",
    header=5,                      # los encabezados están en la fila 6
)
df = df.loc[:, ~df.columns.str.contains("^Unnamed")]  # descarta columnas residuales
df = df.dropna(how="all")          # descarta filas totalmente vacías
df.columns = df.columns.str.strip()  # limpia espacios en nombres (p. ej. 'AUTORIDAD ')
```

---

*Documento generado automáticamente a partir de la hoja `PERMISOS EN TRÁMITE` del archivo `Permisos_Ambientales_1.xlsx`. Pensado como contexto base para agentes de IA que deban razonar, consultar o resumir los trámites ambientales de la organización.*
