import { 
  Close, 
  Description, 
  Schedule, 
  CheckCircle, 
  Pending, 
  MarkEmailRead,
  AttachFile,
  Person
} from '@mui/icons-material';
import { 
  AppBar, 
  Drawer, 
  IconButton, 
  Toolbar, 
  Typography, 
  Box, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
  Grid
} from '@mui/material';
import { getGravedadColor, getEstadoIcon, formatDate } from '../utils';

export default function SanctioningProcessesDrawer({
  open = false,
  handleClose = () => {},
  selectedProcess = null
}) {
  if (!selectedProcess) return null;

  const colors = getGravedadColor(selectedProcess.gravedad);

  // Datos mock del historial del proceso
  const processHistory = [
    {
      id: 1,
      type: 'creation',
      title: 'Proceso Creado',
      description: 'Se inicia el proceso sancionatorio por presunta violación de la norma ambiental',
      date: '2024-09-15T10:30:00',
      user: 'Juan Pérez',
      avatar: 'JP',
      status: 'completed'
    },
    {
      id: 2,
      type: 'notification',
      title: 'Notificación Enviada',
      description: 'Se notifica formalmente al responsable del proceso',
      date: '2024-09-16T14:20:00',
      user: 'María González',
      avatar: 'MG',
      status: 'completed'
    },
    {
      id: 3,
      type: 'document',
      title: 'Documentos Adjuntados',
      description: 'Se adjunta evidencia fotográfica y reporte de inspección',
      date: '2024-09-18T09:15:00',
      user: 'Carlos Rodríguez',
      avatar: 'CR',
      status: 'completed'
    },
    {
      id: 4,
      type: 'response',
      title: 'Descargos Recibidos',
      description: 'El responsable presenta descargos y pruebas de cumplimiento',
      date: '2024-09-25T16:45:00',
      user: 'Ana López',
      avatar: 'AL',
      status: 'completed'
    },
    {
      id: 5,
      type: 'evaluation',
      title: 'En Evaluación',
      description: 'El comité evalúa los descargos y evidencia presentada',
      date: '2024-10-05T11:30:00',
      user: 'Roberto Sánchez',
      avatar: 'RS',
      status: 'pending'
    }
  ];

  const getEventIcon = (type) => {
    switch(type) {
      case 'creation': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'notification': return <MarkEmailRead sx={{ color: '#2196f3' }} />;
      case 'document': return <AttachFile sx={{ color: '#ff9800' }} />;
      case 'response': return <Description sx={{ color: '#9c27b0' }} />;
      case 'evaluation': return <Pending sx={{ color: '#ff5722' }} />;
      default: return <Schedule sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? '#4caf50' : '#ff9800';
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: '60vw' }
      }}
    >
      {/* ENCABEZADO DEL DRAWER */}
      <AppBar position="static">
        <Toolbar>
          {/* título */}
          <Typography color="white" variant="h6" sx={{ flexGrow: 1 }}>
            Historial de Proceso
          </Typography>
          
          {/* x */}
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        {/* Header con información básica */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1, fontWeight: 600 }}>
                PROCESO
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#212529' }}>
                {selectedProcess.codigo}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1, fontWeight: 600 }}>
                ESTADO ACTUAL
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getEstadoIcon(selectedProcess.estado)}
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                  {selectedProcess.estado.replace(/_/g, ' ').toUpperCase()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1, fontWeight: 600 }}>
                NORMA ASOCIADA
              </Typography>

              <Typography variant="body1" sx={{ color: '#212529', fontWeight: 500 }}>
                {selectedProcess.norma_asociada}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ color: '#6c757d', mb: 1, fontWeight: 600 }}>
                GRAVEDAD
              </Typography>
              
              <Chip
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.dot }} />
                    {selectedProcess.gravedad.toUpperCase()}
                  </Box>
                }
                sx={{
                  bgcolor: colors.bg,
                  color: colors.color,
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: 24
                }}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Timeline del historial */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#212529', mb: 2 }}>
          Historial de Actividades
        </Typography>

        <List>
          {processHistory.map((event, index) => (
            <ListItem 
              key={event.id}
              sx={{ 
                mb: 2,
                borderLeft: `3px solid ${getStatusColor(event.status)}`,
                pl: 3,
                borderRadius: 1
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ 
                  bgcolor: getStatusColor(event.status),
                  width: 40,
                  height: 40
                }}>
                  {event.avatar}
                </Avatar>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getEventIcon(event.type)}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#212529' }}>
                      {event.title}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                      {event.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 16, color: '#6c757d' }} />
                        <Typography variant="caption" sx={{ color: '#6c757d' }}>
                          {event.user}
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" sx={{ color: '#6c757d' }}>
                        {formatDate(event.date)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
