import React, { useState } from 'react';
import { Box, Typography, Chip, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FaComment } from 'react-icons/fa';
import FileUploadDialog from '../../components/FileUploadDialog';

const TaskCycleRow = ({ task, index, statuses, onSelect, isSelected }) => {
  
  // ✅ ESTADO PARA DIALOG DE ARCHIVOS
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // ✅ MANEJAR DATOS REALES
  const displayTitle = task.logtask_title || `Ciclo ${task.id}`;
  const startDate = task.start_date ? new Date(task.start_date).toLocaleDateString() : '-';
  const endDate = task.end_date ? new Date(task.end_date).toLocaleDateString() : '-';
  const realClosingDate = task.real_closing_date ? new Date(task.real_closing_date).toLocaleDateString() : '-';
  const opportunityDays = task.opportunity_days || 0;
  const progress = parseFloat(task.progress) || 0;
  
  // ✅ OBTENER COLOR Y LABEL DE ESTADO
  const statusColor = task.status_color || '#90a4ae';
  const statusLabel = task.status_label || 'Desconocido';
  
  // ✅ DETERMINAR COLOR DE OPORTUNIDAD
  const getOpportunityColor = (days) => {
    if (days > 5) return '#00f57a'; // Verde - Muy bueno
    if (days > 0) return '#fbc02d'; // Amarillo - Aceptable
    if (days === 0) return '#ff9800'; // Naranja - Justo a tiempo
    return '#fb3d61'; // Rojo - Retrasado
  };

  // ✅ DETERMINAR COLOR DE PROGRESO
  const getProgressColor = (progress) => {
    if (progress === 100) return '#00f57a';
    if (progress >= 75) return '#4caf50';
    if (progress >= 50) return '#ff9800';
    if (progress >= 25) return '#fbc02d';
    return '#fb3d61';
  };

  // ✅ MANEJAR CLIC EN ATTACH FILE
  const handleAttachFileClick = (e) => {
    e.stopPropagation(); // Evitar que se seleccione la fila
    setUploadDialogOpen(true);
  };

  // ✅ MANEJAR SUBIDA DE ARCHIVOS
  const handleFileUpload = (results) => {
    console.log('📎 Archivos subidos para ciclo:', task.id, results);
    // Aquí puedes agregar lógica adicional como refrescar la lista de archivos
  };

  // ✅ MANEJAR ELIMINAR CICLO
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Evitar que se seleccione la fila
    if (window.confirm(`¿Estás seguro de que deseas eliminar el ciclo "${displayTitle}"?`)) {
      // Aquí iría la lógica para eliminar el ciclo
      console.log('🗑️ Eliminando ciclo:', task.id);
      // dispatch(deleteLogtask({ id: task.id })) - ejemplo de cómo sería
    }
  };

  // ✅ OBTENER EL COLOR DEL ESTADO DEL CICLO (basado en lógica de dashboard)
  const getCycleStatusColor = (statusValue) => {
    // Asegurarse de que el statusValue es un número o una cadena convertible
    const numericStatusValue = Number(statusValue);
    switch (numericStatusValue) {
      case 1: // Completado
        return '#00f57a';
      case 2: // En Progreso
        return '#1a90ff';
      case 3: // Abierto
        return '#fbc02d';
      case 4: // Vencido
        return '#fb3d61';
      default:
        return '#90a4ae'; // Gris por defecto
    }
  };

  // Usar el estado del logtask directamente, con fallback a task_status
  const cycleStatusColor = getCycleStatusColor(task.logtask_status || task.task_status || task.status);

  return (
    <>
      <Box
        onClick={onSelect}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: '12px 16px',
          borderBottom: '1px solid #f5f7f9',
          cursor: 'pointer',
          bgcolor: isSelected ? '#f5f9ff' : 'transparent',
          borderLeft: `4px solid ${cycleStatusColor}`, // ✅ COLOR DEL ESTADO DEL CICLO
          '&:hover': {
            bgcolor: '#f8fbfc',
            '& .action-button': { opacity: 1 }
          },
          transition: 'all 0.2s ease'
        }}
      >
        {/* ✅ FECHA DE INICIO */}
        <Box flex="0 0 150px" textAlign="center">
          <Typography sx={{ fontSize: '0.8rem', color: '#263238', fontWeight: 600 }}>
            {startDate}
          </Typography>
        </Box>

        {/* ✅ FECHA DE CIERRE PROGRAMADO */}
        <Box flex="0 0 140px" textAlign="center">
          <Typography sx={{ fontSize: '0.8rem', color: '#263238', fontWeight: 600 }}>
            {endDate}
          </Typography>
        </Box>

        {/* ✅ FECHA DE CIERRE REAL */}
        <Box flex="0 0 100px" textAlign="center">
          <Typography sx={{
            fontSize: '0.8rem',
            color: realClosingDate === '-' ? '#90a4ae' : '#263238',
            fontWeight: 600,
            fontStyle: realClosingDate === '-' ? 'italic' : 'normal'
          }}>
            {realClosingDate === '-' ? 'Pendiente' : realClosingDate}
          </Typography>
        </Box>

        {/* ✅ DÍAS DE OPORTUNIDAD */}
        <Box flex="0 0 80px" textAlign="center">
          <Chip
            label={`${opportunityDays > 0 ? '+' : ''}${opportunityDays}`}
            size="small"
            sx={{
              bgcolor: `${getOpportunityColor(opportunityDays)}20`,
              color: getOpportunityColor(opportunityDays),
              border: `1px solid ${getOpportunityColor(opportunityDays)}40`,
              fontWeight: 700,
              fontSize: '0.65rem',
              height: '20px',
              '& .MuiChip-label': {
                px: 0.5
              }
            }}
          />
        </Box>

        {/* ✅ ACCIONES */}
        <Box flex="1 1 80px" textAlign="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            {/* ✅ BOTÓN DE ADJUNTAR ARCHIVO */}
            <Tooltip title="Adjuntar archivo">
              <IconButton
                size="small"
                onClick={handleAttachFileClick}
                sx={{
                  color: '#838383',
                  '&:hover': { bgcolor: '#e3f2fd' }
                }}
              >
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* ✅ BOTÓN DE COMENTAR */}
            <Tooltip title="Comentar">
              <IconButton
                size="small"
                sx={{
                  color: '#838383',
                  '&:hover': { bgcolor: '#e3f2fd' }
                }}
              >
                <FaComment style={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>

            {/* ✅ BOTÓN DE ELIMINAR */}
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                sx={{
                  color: '#838383',
                  '&:hover': { bgcolor: '#ffebee' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ✅ PROGRESO */}
        {/* <Box flex="0 0 120px" textAlign="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <Box sx={{ flex: 1, maxWidth: '60px' }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#f0f2f5',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getProgressColor(progress),
                    borderRadius: 3
                  }
                }}
              />
            </Box>
            <Typography sx={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#263238',
              minWidth: '30px'
            }}>
              {progress}%
            </Typography>
          </Box>
        </Box> */}
      </Box>

      {/* ✅ DIALOG DE SUBIDA DE ARCHIVOS */}
      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleFileUpload}
        title={`Adjuntar archivos - ${displayTitle}`}
        taskId={task.task_id}
        logtaskId={task.id}
        acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        maxFileSize={10 * 1024 * 1024} // 10MB
        maxFiles={5}
      />
    </>
  );
};

export default TaskCycleRow;