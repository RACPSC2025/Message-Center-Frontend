import React, { useMemo, useState, useEffect } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AttachFile as AttachFileIcon, CheckCircle as CheckCircleIcon, VisibilityOutlined as FollowUpIcon } from '@mui/icons-material';
import { FaComment } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import TableComponent from '../../components/TableComponent';
import FileUploadDialog from '../../components/FileUploadDialog';

const TaskCyclesTable = ({ 
  logtasks = [], 
  isLoading = false,
  onSelectCycle,
  onOpenFollowup,
  onCloseCycle,
  selectedLogtaskId = null,
  onAttachmentUploaded
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState(null);

  // ✅ FORMATEAR FECHA PARA ORDENAMIENTO (YYYY-MM-DD)
  const parseDate = (dateString) => {
    if (!dateString || dateString === '-') return null;
    // Si viene en formato DD/MM/YYYY, convertir a Date
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(dateString);
  };

  // ✅ DETERMINAR COLOR DE OPORTUNIDAD
  const getOpportunityColor = (days) => {
    if (days > 5) return '#00f57a'; // Verde - Muy bueno
    if (days > 0) return '#fbc02d'; // Amarillo - Aceptable
    if (days === 0) return '#ff9800'; // Naranja - Justo a tiempo
    return '#fb3d61'; // Rojo - Retrasado
  };

  // ✅ OBTENER COLOR DEL ESTADO DEL CICLO
  const getCycleStatusColor = (statusValue) => {
    const numericStatusValue = Number(statusValue);
    switch (numericStatusValue) {
      case 1: return '#00f57a'; // Completado
      case 2: return '#1a90ff'; // En Progreso
      case 3: return '#fbc02d'; // Abierto
      case 4: return '#fb3d61'; // Vencido
      default: return '#90a4ae'; // Gris por defecto
    }
  };

  // ✅ MANEJAR CLIC EN ATTACH FILE
  const handleAttachFileClick = (task) => {
    setSelectedTaskForUpload(task);
    setUploadDialogOpen(true);
  };

  // ✅ MANEJAR SUBIDA DE ARCHIVOS
  const handleFileUpload = (results) => {
    console.log('📎 Archivos subidos para ciclo:', selectedTaskForUpload?.id, results);
    if (onAttachmentUploaded && selectedTaskForUpload) {
      onAttachmentUploaded(selectedTaskForUpload.id);
    }
    setUploadDialogOpen(false);
    setSelectedTaskForUpload(null);
  };

  // ✅ CELL RENDERER PARA FECHAS
  const DateCellRenderer = (params) => {
    const date = params.value;
    if (!date || date === '-' || date === 'Pendiente') {
      return (
        <span style={{ color: '#90a4ae', fontStyle: 'italic', fontSize: '0.8rem', fontWeight: 600 }}>
          {date === 'Pendiente' ? 'Pendiente' : '-'}
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.8rem', color: '#263238', fontWeight: 600 }}>
        {date}
      </span>
    );
  };

  // ✅ CELL RENDERER PARA OPORTUNIDAD
  const OpportunityCellRenderer = (params) => {
    const days = params.value || 0;
    const color = getOpportunityColor(days);
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Chip
          label={`${days > 0 ? '+' : ''}${days}`}
          size="small"
          sx={{
            bgcolor: `${color}20`,
            color: color,
            border: `1px solid ${color}40`,
            fontWeight: 700,
            fontSize: '0.65rem',
            height: '20px',
            '& .MuiChip-label': {
              px: 0.5
            }
          }}
        />
      </Box>
    );
  };

  // ✅ CELL RENDERER PARA ACCIONES
  const ActionsCellRenderer = (params) => {
    const task = params.data;
    const attachmentCount = parseInt(task?.attachments_logtask_count, 10) || 0;
    const commentCount = parseInt(task?.comments_logtask_count, 10) || 0;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: '100%' }}>
        {/* ✅ BOTÓN DE VER SEGUIMIENTO */}
        <Tooltip title={t('followup_activities')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFollowup && onOpenFollowup(task);
            }}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
            }}
          >
            <FollowUpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        {/* ✅ BOTÓN DE ADJUNTAR ARCHIVO */}
        <Tooltip title={t('attachment_file')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleAttachFileClick(task);
            }}
            sx={{
              color: '#838383',
              '&:hover': { bgcolor: '#e3f2fd' }
            }}
          >
            <AttachFileIcon fontSize="small" /> {attachmentCount}
          </IconButton>
        </Tooltip>

        {/* ✅ BOTÓN DE COMENTAR */}
        <Tooltip title={t('comments')}>
          <IconButton
            size="small"
            sx={{
              display: 'flex',
              gap: 0.5,
              color: '#838383',
              '&:hover': { bgcolor: '#e3f2fd' },
            }}
          >
            <FaComment style={{ fontSize: '1rem' }} /> {commentCount}
          </IconButton>
        </Tooltip>

        {/* ✅ BOTÓN DE CERRAR CICLO */}
        <Tooltip title={t('close_cycle')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCloseCycle && onCloseCycle(task);
            }}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  // ✅ COMPARADOR PERSONALIZADO PARA FECHAS
  const dateComparator = (date1, date2) => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    
    if (!d1 && !d2) return 0;
    if (!d1) return 1;
    if (!d2) return -1;
    
    return d1.getTime() - d2.getTime();
  };

  // ✅ DEFINIR COLUMNAS PARA AG GRID
  const columnDefs = useMemo(() => [
    {
      field: 'start_date',
      headerName: 'INICIO',
      flex: 1,
      minWidth: 180,
      cellRenderer: DateCellRenderer,
      comparator: dateComparator,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterDate, cellValue) => {
          const cellDate = parseDate(cellValue);
          if (!cellDate) return -1;
          
          const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
          const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          
          if (cellDateOnly < filterDateOnly) return -1;
          if (cellDateOnly > filterDateOnly) return 1;
          return 0;
        },
        browserDatePicker: true,
      },
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
      field: 'end_date',
      headerName: 'CIERRE PROG.',
      flex: 1,
      minWidth: 180,
      cellRenderer: DateCellRenderer,
      comparator: dateComparator,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterDate, cellValue) => {
          const cellDate = parseDate(cellValue);
          if (!cellDate) return -1;
          
          const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
          const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          
          if (cellDateOnly < filterDateOnly) return -1;
          if (cellDateOnly > filterDateOnly) return 1;
          return 0;
        },
        browserDatePicker: true,
      },
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
      field: 'real_closing_date',
      headerName: 'CIERRE REAL',
      flex: 1,
      minWidth: 180,
      cellRenderer: DateCellRenderer,
      comparator: dateComparator,
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterDate, cellValue) => {
          const cellDate = parseDate(cellValue);
          if (!cellDate) return -1;
          
          const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
          const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          
          if (cellDateOnly < filterDateOnly) return -1;
          if (cellDateOnly > filterDateOnly) return 1;
          return 0;
        },
        browserDatePicker: true,
      },
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
      field: 'opportunity_days',
      headerName: 'OPORT.',
      flex: 0.8,
      minWidth: 130,
      cellRenderer: OpportunityCellRenderer,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
      field: 'actions',
      headerName: 'ACCIONES',
      flex: 1,
      minWidth: 180,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }
  ], [theme, t]);

  // ✅ TRANSFORMAR DATOS PARA AG GRID
  const rowData = useMemo(() => {
    return logtasks.map(logtask => {
      const startDate = logtask.start_date ? new Date(logtask.start_date).toLocaleDateString() : '-';
      const endDate = (logtask.end_date || logtask.finish_date) 
        ? new Date(logtask.end_date || logtask.finish_date).toLocaleDateString() 
        : '-';
      const realClosingDate = logtask.real_closing_date 
        ? new Date(logtask.real_closing_date).toLocaleDateString() 
        : 'Pendiente';
      
      return {
        id: logtask.id,
        task_id: logtask.task_id,
        logtask_title: logtask.logtask_title,
        start_date: startDate,
        end_date: endDate,
        real_closing_date: realClosingDate,
        opportunity_days: logtask.opportunity_days || 0,
        logtask_status: logtask.logtask_status,
        comments: logtask.comments || [],
        // Mantener datos originales para otras operaciones
        ...logtask
      };
    });
  }, [logtasks]);

  // ✅ ESTILO DE FILA (borde izquierdo con color de estado)
  const getRowStyle = (params) => {
    const statusColor = getCycleStatusColor(params.data.logtask_status);
    const isSelected = params.data.id === selectedLogtaskId;
    
    return {
      borderLeft: `4px solid ${statusColor}`,
      backgroundColor: isSelected ? '#f5f9ff' : 'transparent',
      cursor: 'pointer'
    };
  };

  // ✅ MANEJAR CLIC EN FILA
  const onRowClicked = (event) => {
    if (onSelectCycle) {
      onSelectCycle(event.data);
    }
  };

  return (
    <>
      <Box sx={{ 
        border: '1px solid #edf2f4', 
        borderRadius: 3, 
        overflow: 'hidden', 
        bgcolor: 'white', 
        mt: 0.5,
        height: '100%',
        px: 1,
        pb: 2,
        pt: 1
      }}>
        <TableComponent
          rowData={rowData}
          columnDefs={columnDefs}
          isLoading={isLoading}
          pagination={true}
          perPage={10}
          pageOption={[10, 20, 50]}
          sortable={true}
          filterable={true}
          resizable={true}
          autoHeight={false}
          onRefresh={null}
          onResetFilters={null}
          // AG Grid specific props
          getRowStyle={getRowStyle}
          onRowClicked={onRowClicked}
        />
      </Box>

      {/* ✅ DIALOG DE SUBIDA DE ARCHIVOS */}
      {selectedTaskForUpload && (
        <FileUploadDialog
          open={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false);
            setSelectedTaskForUpload(null);
          }}
          onUpload={handleFileUpload}
          title={`Adjuntar archivos - ${selectedTaskForUpload.logtask_title || `Ciclo ${selectedTaskForUpload.id}`}`}
          taskId={selectedTaskForUpload.task_id}
          logtaskId={selectedTaskForUpload.id}
          acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          maxFileSize={10 * 1024 * 1024} // 10MB
          maxFiles={5}
        />
      )}
    </>
  );
};

export default TaskCyclesTable;
