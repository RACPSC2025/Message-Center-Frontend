# Configuracion Funcional - Procesos Sancionatorios

## 1. Objetivo de Configuracion
Establecer parametros funcionales y reglas operativas del modulo para homogeneizar su uso antes de la integracion API.

## 2. Parametros Recomendados
- paginacion_default: 10
- paginacion_opciones: [10, 25, 50, 100]
- ventana_alerta_hitos_dias: 15
- habilitar_alertas_gravedad_alta: true
- habilitar_exportacion: true
- habilitar_historial_cambios: true

## 3. Catalogos Iniciales
Estados procesales:
- notificado
- en_descargos
- en_evaluacion
- en_apelacion
- cerrado_con_sancion
- cerrado_sin_sancion

Gravedad:
- alta
- media
- baja

Tipos de accion:
- requerimiento
- respuesta
- audiencia
- apelacion
- cierre

## 4. Validaciones Funcionales
- codigo_proceso: obligatorio y unico.
- norma_asociada: obligatoria.
- fecha_limite: obligatoria en estados activos.
- cierre: requiere resultado final y observacion de cierre.

## 5. Reglas de Escalamiento (Referencia)
- Gravedad alta vencida: escalamiento inmediato a coordinacion legal.
- Tres hitos vencidos consecutivos: marcar como riesgo critico.
- Apelacion abierta > 30 dias: alerta para comite de seguimiento.

## 6. Permisos por Rol (Conceptual)
- admin_legal: control total del proceso y cierre.
- abogado: gestion de hitos, evidencias y estados intermedios.
- auditor: lectura completa, sin edicion.

## 7. Observabilidad y Auditoria
- Registrar cada cambio de estado con usuario y timestamp.
- Mantener bitacora de acciones del proceso.
- Asociar documentos a cada hito relevante.

## 8. Dependencias Futuras
- API de procesos sancionatorios (CRUD + timeline).
- API de evidencias y repositorio documental.
- Servicio de alertas por fechas limite y gravedad.
