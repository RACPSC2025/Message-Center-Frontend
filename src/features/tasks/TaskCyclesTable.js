import React, { useMemo, useState, useEffect } from 'react';
import { resolveStatusColor, resolveOpportunityColor, STATUS_COLORS } from '../../config/statusColors';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  AttachFile as AttachFileIcon, 
  Forum as CommentIcon,
  Person as ResponsableIcon,
  Lock as CloseCycleIcon, 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TableComponent from '../../components/TableComponent';
import FileUploadDialog from '../../components/FileUploadDialog';
import EditResponsablesDrawer from '../MessageCenterEventsList/EditResponsablesDrawer';

const TaskCyclesTable = ({
  logtasks = [],
  isLoading = false,
  taskStatusCatalog = [],
  onSelectCycle,
  onOpenFollowup,
  onCloseCycle,
  selectedLogtaskId = null,
  onAttachmentUploaded,
  paginationLegendElement = null
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState(null);

  // Drawe de responsables y revisores
  const [responsablesDrawerOpen, setResponsablesDrawerOpen] = useState(false);
  const [selectedTaskForResponsables, setSelectedTaskForResponsables] = useState(null);

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

  const getOpportunityColor = resolveOpportunityColor;

  const statusMetaByCode = useMemo(() => {
    const fallback = {
      '1': { label: 'Cerrado',    color: STATUS_COLORS['1'] },
      '2': { label: 'Permanente', color: STATUS_COLORS['2'] },
      '3': { label: 'Abierto',    color: STATUS_COLORS['3'] },
      '4': { label: 'Vencido',    color: STATUS_COLORS['4'] },
    };

    const mapped = Array.isArray(taskStatusCatalog)
      ? taskStatusCatalog.reduce((acc, status) => {
          const code = String(status?.numericCode || status?.numeric_code || '').trim();
          if (!code) return acc;

          acc[code] = {
            label: String(status?.label || fallback[code]?.label || '').trim() || fallback[code]?.label,
            color: String(status?.color || fallback[code]?.color || '').trim() || fallback[code]?.color
          };
          return acc;
        }, {})
      : {};

    return { ...fallback, ...mapped };
  }, [taskStatusCatalog]);

  const getCycleStatusColor = (statusValue) =>
    resolveStatusColor(statusValue, statusMetaByCode[String(statusValue)]?.color || '#90a4ae');

  const getCycleStatusLabel = (statusValue) =>
    statusMetaByCode[String(statusValue)]?.label || '-';

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

  // ✅ MANEJAR CLIC EN RESPONSABLES
  const handleResponsiblesClick = (task) => {
    setSelectedTaskForResponsables(task);
    setResponsablesDrawerOpen(true);
  };

  // ✅ MANEJAR CIERRE DE DRAWER DE RESPONSABLES
  const handleCloseResponsablesDrawer = () => {
    setResponsablesDrawerOpen(false);
    setSelectedTaskForResponsables(null);
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFollowup && onOpenFollowup(task);
              }}
              sx={{
                display: 'flex',
                color: theme.palette.primary.main,
                minHeight: 'auto',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
              }}
            >
              <CommentIcon style={{ fontSize: '1.1rem' }} />
            </IconButton>
            <Typography variant="body2" color={theme.palette.primary.main} sx={{ fontWeight: 500, fontSize: '0.9rem', ml: -0.2 }}>
              {commentCount}
            </Typography>
          </Box>
        </Tooltip>

        {/* ✅ BOTÓN DE REVISORES Y RESPONSABLES */}
        <Tooltip title={t('responsibles')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleResponsiblesClick(task);
            }}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
            }}
          >
            <ResponsableIcon fontSize="small" />
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
            <CloseCycleIcon fontSize="small" />
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
  // Estado para mostrar/ocultar el statusLabel
  const [showStatusLabel, setShowStatusLabel] = useState(false);

  const columnDefs = useMemo(() => [
    {
      field: 'actions',
      headerName: 'ACCIONES',
      flex: 1,
      minWidth: 180,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
      field: 'progress',
      headerName: t('progress'),
      filter: 'agTextColumnFilter',
      width: 100,
      filterParams: {
        values: null
      },
      cellRenderer: (params) => {
        // El valor puede venir como número o string, o como objeto { percentage }
        let percentage = 0;
        if (typeof params.value === 'object' && params.value !== null && 'percentage' in params.value) {
          percentage = params.value.percentage;
        } else if (typeof params.value === 'number' || typeof params.value === 'string') {
          percentage = params.value;
        }
        // Mostrar solo enteros
        const percentageInt = Math.round(Number(percentage) || 0);
        const badgeData = `${percentageInt}%`;
        // Color según logtask_status
        const badgeColor = getCycleStatusColor(params.data.logtask_status);
        const statusLabel = getCycleStatusLabel(params.data.logtask_status);
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.3
            }}
          >
            <Typography
              sx={{
                border: `4px solid ${badgeColor}`,
                px: 1,
                borderRadius: '4px',
                color: 'black !important',
                backgroundColor: '#fff'
              }}
              className="badge"
            >
              {badgeData}
            </Typography>
            {showStatusLabel && (
              <Typography sx={{ fontSize: '0.62rem', color: '#607d8b', fontWeight: 600 }}>
                {statusLabel}
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      field: 'opportunity_days',
      headerName: 'OPORTUNIDAD',
      flex: 0.8,
      minWidth: 130,
      cellRenderer: OpportunityCellRenderer,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    },
    {
      field: 'start_date',
      headerName: 'INICIO',
      flex: 1,
      minWidth: 120,
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
    }
  ], [theme, t, statusMetaByCode]);

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
        progress: typeof logtask.percentage !== 'undefined' ? logtask.percentage : 0,
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
          paginationLegendElement={paginationLegendElement}
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

      {/* ✅ DRAWER DE RESPONSABLES */}
      {selectedTaskForResponsables && (
        <EditResponsablesDrawer
          openEditResponsablesDrawer={responsablesDrawerOpen}
          onCloseEditResponsablesDrawer={handleCloseResponsablesDrawer}
          taskDetails={selectedTaskForResponsables}
          formModel={{ logtask_id: selectedTaskForResponsables.id }}
        />
      )}
    </>
  );
};

export default TaskCyclesTable;
