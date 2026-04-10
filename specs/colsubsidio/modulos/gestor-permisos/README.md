# Modulo: Gestor de Permisos

## 1. Proposito
El modulo Gestor de Permisos administra el ciclo de vida de tramites y autorizaciones regulatorias requeridas por la operacion.

Permite:
- Registrar permisos y su informacion base.
- Gestionar requisitos asociados por permiso.
- Monitorear estados, vencimientos y riesgo de incumplimiento.
- Priorizar seguimiento operativo y legal.

## 2. Alcance Funcional
Incluye:
- Listado de permisos con filtros avanzados.
- Vista de detalle de permiso.
- Control de requisitos y estado de completitud.
- Semaforizacion por estado y fecha de vencimiento.
- Reporteria operativa basica (resumen, exportables).

Fuera de alcance (fase actual):
- Definicion tecnica de APIs.
- Motor de notificaciones automatizadas por backend.
- Integraciones con sistemas externos de firma o radicacion.

## 3. Usuarios Objetivo
- Analista de cumplimiento.
- Coordinador legal/regulatorio.
- Supervisor de operaciones.
- Auditor interno.

## 4. Conceptos de Dominio
- Permiso: expediente o tramite principal.
- Requisito: documento, evidencia o condicion exigida para el permiso.
- Estado de tramite: situacion vigente del permiso.
- Vencimiento: fecha limite legal/operativa.
- Prioridad: urgencia para gestion interna.

## 5. Estados Base Sugeridos
Estado de permiso:
- En borrador.
- En revision.
- Aprobado.
- Rechazado.
- Vencido.
- Cerrado.

Estado de requisito:
- Pendiente.
- En gestion.
- Cumplido.
- No aplica.
- Vencido.

## 6. Flujos Principales
1. Creacion de permiso:
- Registro de metadatos principales.
- Asociacion de solicitante y contexto.
- Inicializacion de requisitos.

2. Gestion de requisitos:
- Alta/edicion de requisitos.
- Carga y validacion de evidencias.
- Actualizacion de estado por requisito.

3. Seguimiento y cierre:
- Monitoreo de cumplimiento y fechas.
- Escalamiento de alertas internas.
- Cierre cuando el ciclo legal finaliza.

## 7. Reglas de Negocio Iniciales
- Un permiso debe tener identificador unico de expediente.
- Un permiso puede contener multiples requisitos.
- No se debe cerrar un permiso con requisitos criticos pendientes.
- Si la fecha de vencimiento se supera, el estado debe reflejar riesgo o vencimiento.

## 8. Datos Minimos Requeridos (Conceptual)
Permiso:
- Codigo interno.
- Numero de tramite/expediente.
- Solicitante o razon social.
- Estado.
- Fecha de creacion.
- Fecha de vencimiento.
- Responsable interno.

Requisito:
- Tipo de requisito.
- Estado del requisito.
- Fecha limite.
- Evidencia asociada (referencia).
- Observaciones.

## 9. KPI Iniciales
- Total de permisos activos.
- Permisos por estado.
- Requisitos pendientes vs cumplidos.
- Permisos proximos a vencer.
- Permisos vencidos.

## 10. Pendientes para Fase API
- Definir endpoints CRUD de permisos y requisitos.
- Definir contratos de filtros y paginacion.
- Definir eventos para notificacion y trazabilidad.
- Definir estrategia de auditoria (quien, cuando, que cambio).

## 11. Archivos Relacionados
- UI referencia: ../../gestion_permisos.html
- Lineamientos visuales: ../../DESIGN_template_gestion_permisos.md
