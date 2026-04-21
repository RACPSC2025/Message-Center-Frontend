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

| Archivo | Descripción |
|---|---|
| `Permisos_En_Tramite_Documentacion.md` | Diccionario de columnas y calidad de datos del dataset fuente (`Permisos_Ambientales_1.xlsx`) |
| `permisos-en-tramite-implementacion.md` | **Implementación actual del módulo `ambientalPermit`:** vistas, filtros, kanban, drawer, mock data y pendientes de API |
| `configuracion-modulo.md` | Parámetros funcionales del módulo gestor de permisos (fase conceptual) |
| `api-contract.md` | Contrato de API (pendiente de definición completa) |

## 12. Estado de Implementación (2026-04-21)

El módulo `ambientalPermit` (`/view/ambiental_permit`) pasó de placeholder a funcional con:

- **Vista Tabla:** MUI Table sticky headers, semáforo visual, chips de estado coloreados.
- **Vista Kanban:** @dnd-kit, 5 columnas por estado de trámite, drag-and-drop entre columnas, ordenamiento por fecha proyectada ascendente.
- **Drawer de detalle:** 3 tabs — Detalles, Actividades (checklist), Comentarios (chat-style con adjuntos).
- **Filtros:** Unidad → Sede (cascading), Tipo de permiso, limpiar filtros.
- **Datos:** JSON mock de 27 registros representativos. Pendiente integración API.
