# Modulo: Procesos Sancionatorios

## Estado de Implementacion Frontend (2026-04)

Implementado actualmente:
- Tabla dinamica construida desde configuracion de headers del API.
- Visibilidad inicial de columnas gobernada por `display_in_table` (columnas ocultas quedan disponibles para seleccion manual).
- Drawer de detalle por registro con tabs fijas por fase legal: `FASE I`, `FASE II`, `FASE III`, `CIERRE`.
- Acordeones del drawer colapsados por defecto para priorizar lectura progresiva.
- Seccion de informacion completa con render profesional para textos largos (`white-space: pre-line`, tarjetas de lectura, scroll interno).
- Bitacora por fase legal con timeline visual y nodos por tipo de evento.
- Cada evento de bitacora incluye ejemplos de:
	- ejecutor (usuario),
	- fecha de ejecucion,
	- adjuntos (pdf, excel, word e imagen).
- Compatibilidad de esquema para campo de respuesta:
	- nuevo: `CASE_NUMBER_AND_CONTENT_OF_RESPONSE`
	- legacy: `colsubsidio_response`

Documentacion tecnica de ajustes: ver `./ajustes-implementados-2026-04.md`.

## 1. Proposito
El modulo Procesos Sancionatorios centraliza la gestion de casos de incumplimiento normativo y su tratamiento legal/administrativo.

Permite:
- Registrar procesos sancionatorios y su contexto normativo.
- Clasificar gravedad y estado procesal.
- Dar seguimiento a hitos y fechas limite.
- Controlar evidencias, descargos y apelaciones.

## 2. Alcance Funcional
Incluye:
- Tablero de indicadores del modulo.
- Listado de procesos con filtros por gravedad y estado.
- Seguimiento por fases del proceso.
- Gestion de acciones y anexos asociados.

Fuera de alcance (fase actual):
- Definicion de APIs y contratos tecnicos.
- Automatizacion judicial/administrativa externa.
- Integracion con firma avanzada y radicacion oficial.

## 3. Usuarios Objetivo
- Equipo juridico.
- Cumplimiento normativo.
- Lideres de riesgo y control interno.
- Gerencia para seguimiento ejecutivo.

## 4. Conceptos de Dominio
- Proceso sancionatorio: caso formal por posible incumplimiento.
- Gravedad: nivel de impacto legal o reputacional.
- Estado procesal: fase actual del caso.
- Fecha limite: hito critico para respuesta o accion.
- Evidencia: soporte documental del caso.

## 5. Estados Base Sugeridos
Estado procesal:
- Notificado.
- En descargos.
- En evaluacion.
- En apelacion.
- Cerrado con sancion.
- Cerrado sin sancion.

Niveles de gravedad:
- Alta.
- Media.
- Baja.

## 6. Flujos Principales
1. Apertura de proceso:
- Registro del caso y norma asociada.
- Definicion de gravedad inicial.
- Asignacion de responsable.

2. Gestion de descargos:
- Recoleccion de evidencia.
- Elaboracion de respuesta tecnica/legal.
- Registro de decisiones intermedias.

3. Resolucion y cierre:
- Resultado final del proceso.
- Registro de sancion o archivo.
- Lecciones aprendidas y acciones preventivas.

## 7. Reglas de Negocio Iniciales
- Todo proceso debe iniciar con codigo unico.
- Cada proceso debe tener una norma o requisito legal asociado.
- Fechas limite vencidas sin accion deben disparar bandera de riesgo.
- El cierre debe dejar trazabilidad de resultado final.

## 8. Datos Minimos Requeridos (Conceptual)
Proceso:
- Codigo de proceso.
- Norma/requisito asociado.
- Gravedad.
- Estado procesal.
- Responsable interno.
- Fecha de notificacion.
- Fecha limite vigente.

Gestion:
- Registro de acciones.
- Anexos/evidencias.
- Comentarios de seguimiento.
- Resultado final.

## 9. KPI Iniciales
- Procesos activos por gravedad.
- Procesos en apelacion.
- Procesos cerrados en periodo.
- Procesos fuera de tiempo de respuesta.
- Tasa de cierre sin sancion.

## 10. Pendientes para Fase API
- Definir contratos de creacion y actualizacion de procesos.
- Definir endpoint de timeline/hitos del proceso.
- Definir contrato de evidencias y adjuntos.
- Definir alertas por SLA legal.

## 11. Archivos Relacionados
- UI referencia: ../../procesos_sancionatorios.html
- Lineamientos visuales: ../../DESIGN_template_procesos_sanncionatorios.md
