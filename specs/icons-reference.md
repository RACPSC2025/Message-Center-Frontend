# Iconos por módulo

Referencia de íconos MUI usados en la navegación. Todos importados desde `@mui/icons-material`.

## Módulos

| configKey              | Ruta (`key`)           | Ícono MUI             | Componente importado      |
|------------------------|------------------------|-----------------------|---------------------------|
| `legal_matrix`         | `LegalMatriz`          | `Apps`                | `Apps`                    |
| `task`                 | `events`               | `CalendarToday`       | `CalendarToday`           |
| `findings`             | `findings`             | `Search`              | `Search`                  |
| `actions`              | `actions`              | `CheckCircleOutline`  | `CheckCircleOutline`      |
| `permit_manager`       | `permit_manager`       | `AssignmentTurnedIn`  | `AssignmentTurnedIn`      |
| `ambiental_permit`     | `ambiental_permit`     | `Nature`              | `import NatureIcon from '@mui/icons-material/Nature'` |
| `sanctioning_processes`| `sanctioning_processes`| `Gavel`               | `Gavel`                   |

## Sistema (no configurables por API)

| Módulo          | Ícono MUI         | Componente importado  | Uso                                   |
|-----------------|-------------------|-----------------------|---------------------------------------|
| `notifications` | `NotificationsNone` | `NotificationsNone` | Campana de mensajes no leídos en header |
| `notifications` | `MailOutline`     | `MailOutline`         | Tab de módulo en sidebar (generalConfig) |

## Dónde se definen

- `src/config/generalConfig.js` — `MODULE_DEFINITIONS`: íconos usados en `moduleGroups` (menús desplegables del header) y en `modulePermissions`.
- `src/components/TheLayoutNavbar.js` — `MODULE_CONFIG`: íconos usados en el sidebar izquierdo (charts/stats por módulo).

Los íconos en `MODULE_DEFINITIONS` y `MODULE_CONFIG` deben mantenerse sincronizados al agregar nuevos módulos.
