import { MarkEmailRead, PendingActions, Gavel } from '@mui/icons-material';

// Obtener colores según la gravedad
export const getGravedadColor = (gravedad) => {
  switch(gravedad) {
    case 'alta': return { bg: '#ffebee', color: '#c62828', dot: '#c62828' };
    case 'media': return { bg: '#fff8e1', color: '#f57c00', dot: '#f57c00' };
    case 'baja': return { bg: '#e3f2fd', color: '#1976d2', dot: '#1976d2' };
    default: return { bg: '#f5f5f5', color: '#757575', dot: '#757575' };
  }
};

// Obtener iconos de estado basado en el estado del API
export const getEstadoIcon = (estado) => {
  switch(estado) {
    case 'notificado':
      return <MarkEmailRead sx={{ fontSize: 20, color: '#006971' }} />;
    case 'en_descargos':
      return <PendingActions sx={{ fontSize: 20, color: '#eab308' }} />;
    case 'en_evaluacion':
      return <PendingActions sx={{ fontSize: 20, color: '#2196f3' }} />;
    case 'en_apelacion':
      return <Gavel sx={{ fontSize: 20, color: '#ff9800' }} />;
    case 'cerrado_con_sancion':
      return <Gavel sx={{ fontSize: 20, color: '#d32f2f' }} />;
    case 'cerrado_sin_sancion':
      return <MarkEmailRead sx={{ fontSize: 20, color: '#4caf50' }} />;
    default:
      return <PendingActions sx={{ fontSize: 20, color: '#6c757d' }} />;
  }
};

// Formatear fechas
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Calcular propiedades del anillo de progreso
export const calculateProgressRing = (size, strokeWidth, percentage) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const progressLen = ((percentage || 0) / 100) * circumference;
  const transitionStyle = { transition: 'stroke-dasharray 2s ease-out, stroke-dashoffset 2s ease-out' };
  
  return { radius, circumference, center, progressLen, transitionStyle };
};