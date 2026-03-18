import {
  AccountBalance,
  Add,
  AttachFile,
  CallMade,
  CallReceived,
  ChevronRight,
  Description,
  Download,
  ExpandMore,
  Image,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Notifications,
  PictureAsPdf,
  Visibility
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Avatar,
  AvatarGroup,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { selectFilterItemValue } from '../../stores/filterSlice';
import axiosInstance from '../../lib/axios';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';
import CreateRequestDialog from './CreateRequestDialog';

export default function ComunicationsLedger() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados principales
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);
  const [expandedNestedItems, setExpandedNestedItems] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedParentForNew, setSelectedParentForNew] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    source_type: '',
    mode: '',
    searchText: ''
  });

  // Obtener ID del requisito actual desde Redux
  const id_requisito_actual = useSelector((state) => 
    selectFilterItemValue(state, 'LegalMatriz', 'id_requisito_actual')
  ) || null;

  // Cargar solicitudes al montar o cuando cambie el requisito
  useEffect(() => {
    if (id_requisito_actual) {
      fetchRequests();
    }
  }, [id_requisito_actual]);

  // Función para obtener solicitudes de la API
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/message_center_api/legal_api/get_request_from_legal', {
        id_requisito: id_requisito_actual
      });

      if (response.data.status === 1) {
        // Aplanar y procesar las solicitudes
        const allRequests = response.data.data.flat();
        // Ordenar por fecha de radicación (más reciente primero)
        const sortedRequests = allRequests.sort((a, b) => 
          new Date(b.filing_date) - new Date(a.filing_date)
        );
        setRequests(sortedRequests);
      } else {
        showErrorMsg(response.data.messages || t('error_loading_requests'));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showErrorMsg(t('error_loading_requests'));
    } finally {
      setLoading(false);
    }
  };

  // Obtener solo solicitudes principales (request_type = "request")
  const getMainRequests = () => {
    return requests.filter(req => 
      req.request_type === 'request' && 
      (req.id_request_parent === null || req.id_request_parent === undefined || req.id_request_parent === '')
    );
  };

  // Obtener solicitudes anidadas de una solicitud principal
  const getNestedRequests = (parentId) => {
    return requests.filter(req => 
      req.id_request_parent == parentId && // usar == para comparar string vs number
      parseInt(req.order) > 1
    );
  };

  // Obtener recursivamente todos los descendientes con su nivel de anidación
  const getAllDescendants = (parentId, level = 1) => {
    const directChildren = getNestedRequests(parentId);
    const result = [];
    
    directChildren.forEach(child => {
      result.push({ ...child, nestingLevel: level });
      // Obtener recursivamente nietos y bisnietos
      const grandchildren = getAllDescendants(child.id_request, level + 1);
      result.push(...grandchildren);
    });
    
    return result;
  };

  // Aplicar filtros frontend
  const applyFilters = (requestsList) => {
    let filtered = requestsList;

    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    if (filters.source_type) {
      filtered = filtered.filter(req => req.source_type === filters.source_type);
    }
    if (filters.mode) {
      filtered = filtered.filter(req => req.mode === filters.mode);
    }
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(req => 
        req.description?.toLowerCase().includes(searchLower) ||
        req.source_name?.toLowerCase().includes(searchLower) ||
        req.source_reference?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Toggle expansión de fila
  const handleExpandRow = (id) => {
    // Convertir a string para comparación consistente
    const idString = String(id);
    setExpandedRows(prev => 
      prev.includes(idString) ? prev.filter(rowId => rowId !== idString) : [...prev, idString]
    );
  };

  // Toggle expansión de elemento anidado
  const toggleNestedItemExpand = (id) => {
    const idString = String(id);
    setExpandedNestedItems(prev => 
      prev.includes(idString) ? prev.filter(itemId => itemId !== idString) : [...prev, idString]
    );
  };

  // Obtener color del chip según el estado
  const getStatusColor = (status) => {
    const colors = {
      open: 'primary',
      in_progress: 'warning',
      expired: 'error',
      resolved: 'success'
    };
    return colors[status] || 'default';
  };

  // Obtener icono según el tipo de solicitud
  const getRequestTypeIcon = (type) => {
    if (type === 'request') {
      return <CallReceived fontSize="small" />;
    } else if (type === 'response') {
      return <CallMade fontSize="small" />;
    } else if (type === 'reminder') {
      return <Notifications fontSize="small" />;
    }
    return <Description fontSize="small" />;
  };

  // Calcular días restantes
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      showErrorMsg(t('error_downloading_file'));
    }
  };

  // Aplicar filtros y paginación
  const mainRequests = getMainRequests();
  const filteredRequests = applyFilters(mainRequests);
  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!id_requisito_actual) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="textSecondary">
          {t('select_legal_requirement_first')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {t('regulatory_communications_ledger')}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('high_stakes_compliance_tracking')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ textTransform: 'none' }}
          onClick={() => setOpenCreateDialog(true)}
        >
          {t('new_filing_request')}
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label={t('search')}
            size="small"
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('status')}</InputLabel>
            <Select
              value={filters.status}
              label={t('status')}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">{t('Todos')}</MenuItem>
              <MenuItem value="open">{t('open')}</MenuItem>
              <MenuItem value="in_progress">{t('in_progress')}</MenuItem>
              <MenuItem value="expired">{t('expired')}</MenuItem>
              <MenuItem value="resolved">{t('resolved')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('source_type')}</InputLabel>
            <Select
              value={filters.source_type}
              label={t('source_type')}
              onChange={(e) => setFilters({ ...filters, source_type: e.target.value })}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="GOVT">{t('government')}</MenuItem>
              <MenuItem value="USER">{t('user_community')}</MenuItem>
              <MenuItem value="INTERNAL">{t('internal')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('communication_mode')}</InputLabel>
            <Select
              value={filters.mode}
              label={t('communication_mode')}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="LETTER">{t('letter')}</MenuItem>
              <MenuItem value="EMAIL">{t('email')}</MenuItem>
              <MenuItem value="PORTAL">{t('portal')}</MenuItem>
              <MenuItem value="IN_PERSON">{t('in_person')}</MenuItem>
              <MenuItem value="PHONE">{t('phone')}</MenuItem>
            </Select>
          </FormControl>
          {(filters.status || filters.source_type || filters.mode || filters.searchText) && (
            <Button
              size="small"
              onClick={() => setFilters({ status: '', source_type: '', mode: '', searchText: '' })}
            >
              {t('clear_filters')}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Tabla de solicitudes */}
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell><Typography variant="caption" fontWeight="bold">{t('filing_date')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('control_date')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('due_date')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('deadline')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('status')}</Typography></TableCell>
              <TableCell sx={{ minWidth: 280 }}><Typography variant="caption" fontWeight="bold">{t('description')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('entity')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('articles')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('assigned')}</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold">{t('attachments')}</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="textSecondary" py={4}>
                    {t('no_requests_found')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => {
                const isExpanded = expandedRows.includes(String(request.id_request));
                const nestedRequests = getAllDescendants(request.id_request);
                const daysRemaining = getDaysRemaining(request.due_date);

                return (
                  <>
                    <TableRow
                      key={request.id_request}
                      hover
                      sx={{
                        cursor: 'pointer',
                        bgcolor: request.status === 'expired' ? 'error.lighter' : 'inherit'
                      }}
                      onClick={() => handleExpandRow(request.id_request)}
                    >
                      <TableCell>
                        {nestedRequests.length > 0 ? (
                          <IconButton size="small">
                            {isExpanded ? <ExpandMore /> : <ChevronRight />}
                          </IconButton>
                        ) : (
                          <Box width={40} /> 
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(request.filing_date)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(request.filing_date)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={request.due_date ? 'bold' : 'normal'} color={request.status === 'expired' ? 'error' : 'inherit'}>
                          {formatDate(request.due_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {daysRemaining !== null && (
                          <Chip
                            label={daysRemaining < 0 ? t('expired') : `${daysRemaining} ${t('days_left')}`}
                            color={daysRemaining < 0 ? 'error' : daysRemaining < 7 ? 'warning' : 'default'}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(request.status)}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: 'white',
                            borderColor: request.status === 'resolved' ? 'success.main' : 
                                        (request.status === 'open' || request.status === 'in_progress') ? 'warning.main' : 
                                        request.status === 'expired' ? 'error.main' : 'grey.500',
                            color: request.status === 'resolved' ? 'success.main' : 
                                   (request.status === 'open' || request.status === 'in_progress') ? 'warning.main' : 
                                   request.status === 'expired' ? 'error.main' : 'text.primary'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 350 }}>
                        <Typography variant="body2" fontWeight="600" noWrap>
                          {request.description || '-'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" noWrap>
                          {request.source_reference}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {request.source_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {request.source_type === 'GOVT' ? t('govt') : 
                           request.source_type === 'USER' ? t('user') : 
                           request.source_type === 'INTERNAL' ? t('internal') : request.source_type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {request.articulos?.slice(0, 2).map((art) => (
                            <Chip
                              key={art.id_articulo}
                              label={art.numero_articulo}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {request.articulos?.length > 2 && (
                            <Chip label={`+${request.articulos.length - 2}`} size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {request.destinatarios?.length > 0 && (
                          <AvatarGroup max={3}>
                            {request.destinatarios.map((dest) => (
                              <Tooltip key={dest.id} title={dest.destinatario_name}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 10 }}>
                                  {dest.destinatario_name?.substring(0, 2).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.archivos?.length > 0 && (
                          <Tooltip title={`${request.archivos.length} ${t('files')}`}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 1,
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                position: 'relative',
                                bgcolor: 'primary.lighter'
                              }}
                            >
                              <Description color="primary" />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -4,
                                  right: -4,
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: 16,
                                  height: 16,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 8,
                                  fontWeight: 'bold'
                                }}
                              >
                                {request.archivos.length}
                              </Box>
                            </Box>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {/* Fila expandida con timeline de solicitudes anidadas */}
                    <TableRow>
                      <TableCell colSpan={11} sx={{ p: 0, bgcolor: 'grey.50' }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                            {/* Detalles de la solicitud principal */}
                            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }} elevation={1}>
                              <Box display="flex" alignItems="center" gap={1} mb={2} pb={1} borderBottom={1} borderColor="divider">
                                <Description color="primary" fontSize="small" />
                                <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase">
                                  {t('Detalles')}
                                </Typography>
                              </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography variant="caption" color="textSecondary" fontWeight="bold">
                                    {t('description')}:
                                  </Typography>
                                  <Typography variant="body2">
                                    {request.description || '-'}
                                  </Typography>
                                </Grid>
                                
                                {request.comment && (
                                  <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">
                                      {t('comments')}:
                                    </Typography>
                                    <Typography variant="body2">
                                      {request.comment}
                                    </Typography>
                                  </Grid>
                                )}
                                
                                {request.observation && (
                                  <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">
                                      {t('observation')}:
                                    </Typography>
                                    <Typography variant="body2">
                                      {request.observation}
                                    </Typography>
                                  </Grid>
                                )}
                                
                                {/* Destinatarios */}
                                {request.destinatarios?.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold" gutterBottom>
                                      {t('Responsables')}:
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                      {request.destinatarios.map((dest) => (
                                        <Chip
                                          key={dest.id}
                                          avatar={
                                            <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                                              {dest.destinatario_name?.substring(0, 2).toUpperCase()}
                                            </Avatar>
                                          }
                                          label={dest.destinatario_name}
                                          size="small"
                                          variant={dest.is_read === "1" ? "filled" : "outlined"}
                                          color={dest.is_read === "1" ? "success" : "default"}
                                        />
                                      ))}
                                    </Box>
                                  </Grid>
                                )}
                                
                                {/* Artículos */}
                                {request.articulos?.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold" gutterBottom>
                                      {t('articles')}:
                                    </Typography>
                                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                      {request.articulos.map((art) => (
                                        <Chip
                                          key={art.id_articulo}
                                          label={art.numero_articulo}
                                          size="small"
                                          variant="outlined"
                                        />
                                      ))}
                                    </Box>
                                  </Grid>
                                )}
                                
                                {/* Archivos Adjuntos de la solicitud principal */}
                                {request.archivos?.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold" gutterBottom>
                                      {t('attachments')}:
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={1} mt={1}>
                                      {request.archivos.map((file) => {
                                        const isPDF = file.file_name?.toLowerCase().endsWith('.pdf');
                                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.file_name);
                                        
                                        return (
                                          <Paper 
                                            key={file.id_file} 
                                            sx={{ 
                                              p: 1.5, 
                                              border: 1, 
                                              borderColor: 'divider',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 2
                                            }}
                                          >
                                            {/* Vista previa o ícono */}
                                            <Box
                                              sx={{
                                                width: 60,
                                                height: 60,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: isPDF ? 'error.lighter' : isImage ? 'info.lighter' : 'grey.100',
                                                borderRadius: 1,
                                                overflow: 'hidden'
                                              }}
                                            >
                                              {isImage ? (
                                                <img 
                                                  src={file.url} 
                                                  alt={file.file_name}
                                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                              ) : isPDF ? (
                                                <PictureAsPdf sx={{ fontSize: 32, color: 'error.main' }} />
                                              ) : (
                                                <Description sx={{ fontSize: 32, color: 'text.secondary' }} />
                                              )}
                                            </Box>
                                            
                                            {/* Información del archivo */}
                                            <Box flex={1}>
                                              <Typography variant="body2" fontWeight="bold" noWrap>
                                                {file.file_name}
                                              </Typography>
                                              <Typography variant="caption" color="textSecondary">
                                                {new Date(file.created_at).toLocaleString()}
                                              </Typography>
                                            </Box>
                                            
                                            {/* Botones de acción */}
                                            <Box display="flex" gap={1}>
                                              <Tooltip title={t('preview')}>
                                                <IconButton 
                                                  size="small" 
                                                  color="primary"
                                                  onClick={() => window.open(file.url, '_blank')}
                                                >
                                                  <Visibility fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title={t('download')}>
                                                <IconButton 
                                                  size="small" 
                                                  color="primary"
                                                  onClick={() => handleDownloadFile(file.url, file.file_name)}
                                                >
                                                  <Download fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            </Box>
                                          </Paper>
                                        );
                                      })}
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                            </Paper>
                            
                            {/* Timeline de solicitudes anidadas */}
                            <Box display="flex" alignItems="center" gap={1} mb={2} pb={1} borderBottom={1} borderColor="divider">
                              <Notifications color="primary" fontSize="small" />
                              <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase">
                                {t('request_history_timeline')}
                              </Typography>
                            </Box>
                            
                            {nestedRequests.length === 0 ? (
                              <Box textAlign="center" py={3}>
                                <Typography variant="body2" color="textSecondary">
                                  {t('no_nested_events_yet')}
                                </Typography>
                                <Button
                                  size="small"
                                  startIcon={<Add />}
                                  sx={{ textTransform: 'none', mt: 2 }}
                                >
                                  {t('add_response_or_reminder')}
                                </Button>
                              </Box>
                            ) : (
                              <>
                                {/* Timeline */}
                                <Box sx={{ position: 'relative', pl: 3 }}>
                                {nestedRequests.map((nested, index) => {
                                  const indentation = nested.nestingLevel > 1 ? (nested.nestingLevel - 1) * 40 : 0;
                                  const isNestedExpanded = expandedNestedItems.includes(String(nested.id_request));
                                  const nestedDaysRemaining = getDaysRemaining(nested.due_date);
                                  
                                  return (
                                  <Box
                                    key={nested.id_request}
                                    sx={{
                                      position: 'relative',
                                      mb: 3,
                                      ml: `${indentation}px`,
                                      pl: nested.nestingLevel > 1 ? 2 : 0,
                                      borderLeft: nested.nestingLevel > 1 ? '3px solid' : 'none',
                                      borderColor: nested.nestingLevel > 1 ? 'info.main' : 'transparent',
                                      bgcolor: nested.nestingLevel > 1 ? 'grey.50' : 'transparent',
                                      borderRadius: nested.nestingLevel > 1 ? 1 : 0,
                                      '&::before': index < nestedRequests.length - 1 ? {
                                        content: '""',
                                        position: 'absolute',
                                        left: -20,
                                        top: 36,
                                        bottom: -16,
                                        width: 3,
                                        bgcolor: 'grey.300'
                                      } : {}
                                    }}
                                  >
                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                      {/* Botón de expand/collapse a la izquierda */}
                                      <IconButton
                                        size="small"
                                        onClick={() => toggleNestedItemExpand(nested.id_request)}
                                        sx={{ 
                                          mt: 0.5,
                                          bgcolor: isNestedExpanded ? 'primary.lighter' : 'grey.100',
                                          '&:hover': { bgcolor: isNestedExpanded ? 'primary.light' : 'grey.200' }
                                        }}
                                      >
                                        {isNestedExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                                      </IconButton>
                                      
                                      {/* Ícono de tipo de solicitud */}
                                      <Box
                                        sx={{
                                          width: nested.nestingLevel > 1 ? 30 : 36,
                                          height: nested.nestingLevel > 1 ? 30 : 36,
                                          borderRadius: '50%',
                                          bgcolor: nested.request_type === 'response' ? 'success.main' : 'warning.main',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          boxShadow: nested.nestingLevel > 1 ? 2 : 3,
                                          border: nested.nestingLevel > 1 ? '2px solid white' : 'none',
                                          mt: 0.5
                                        }}
                                      >
                                        {getRequestTypeIcon(nested.request_type)}
                                      </Box>
                                      
                                      <Box flex={1}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={1}>
                                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                            <Chip
                                              label={`${formatDate(nested.filing_date)} • ${nested.created_at?.substring(11, 16) || ''}`}
                                              size="small"
                                              variant="outlined"
                                            />
                                            <Chip
                                              label={t(nested.request_type)}
                                              color={nested.request_type === 'response' ? 'success' : 'warning'}
                                              size="small"
                                            />
                                            {nested.nestingLevel > 1 && (
                                              <Chip
                                                label={`↳ ${t('level')} ${nested.nestingLevel}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ 
                                                  height: 20, 
                                                  fontSize: '0.7rem',
                                                  bgcolor: 'info.lighter',
                                                  borderColor: 'info.main',
                                                  color: 'info.main'
                                                }}
                                              />
                                            )}
                                          </Box>
                                        </Box>
                                        
                                        <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            {nested.source_reference || `${t(nested.request_type)} - ${nested.source_name}`}
                                          </Typography>
                                          <Typography variant="body2" color="textSecondary" sx={{ 
                                            display: '-webkit-box',
                                            WebkitLineClamp: isNestedExpanded ? 'unset' : 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                          }}>
                                            {nested.description || nested.comment}
                                          </Typography>
                                          
                                          <Collapse in={isNestedExpanded} timeout="auto">
                                            <Box mt={2}>
                                              {/* Detalles completos */}
                                              <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                                                <Box>
                                                  <Typography variant="caption" color="textSecondary" fontWeight="bold">{t('status')}:</Typography>
                                                  <Chip 
                                                    label={t(nested.status)} 
                                                    color={getStatusColor(nested.status)}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                  />
                                                </Box>
                                                <Box>
                                                  <Typography variant="caption" color="textSecondary" fontWeight="bold">{t('source_type')}:</Typography>
                                                  <Typography variant="caption" ml={1}>
                                                    {nested.source_type === 'GOVT' ? t('govt') : 
                                                     nested.source_type === 'USER' ? t('user') : 
                                                     nested.source_type === 'INTERNAL' ? t('internal') : nested.source_type}
                                                  </Typography>
                                                </Box>
                                                <Box>
                                                  <Typography variant="caption" color="textSecondary" fontWeight="bold">{t('communication_mode')}:</Typography>
                                                  <Typography variant="caption" ml={1}>
                                                    {nested.mode === 'LETTER' ? t('letter') :
                                                     nested.mode === 'EMAIL' ? t('email') :
                                                     nested.mode === 'PORTAL' ? t('portal') :
                                                     nested.mode === 'IN_PERSON' ? t('in_person') :
                                                     nested.mode === 'PHONE' ? t('phone') : nested.mode}
                                                  </Typography>
                                                </Box>
                                                {nestedDaysRemaining !== null && (
                                                  <Box>
                                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">{t('deadline')}:</Typography>
                                                    <Chip
                                                      label={nestedDaysRemaining < 0 ? t('expired') : `${nestedDaysRemaining} ${t('days_left')}`}
                                                      color={nestedDaysRemaining < 0 ? 'error' : nestedDaysRemaining < 7 ? 'warning' : 'default'}
                                                      size="small"
                                                      sx={{ ml: 1 }}
                                                    />
                                                  </Box>
                                                )}
                                              </Box>

                                              {/* Destinatarios */}
                                              {nested.destinatarios?.length > 0 && (
                                                <Box mb={2}>
                                                  <Typography variant="caption" color="textSecondary" fontWeight="bold" gutterBottom>
                                                    {t('assigned')}:
                                                  </Typography>
                                                  <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                                    {nested.destinatarios.map((dest) => (
                                                      <Chip
                                                        key={dest.id}
                                                        label={dest.destinatario_name}
                                                        size="small"
                                                        avatar={
                                                          <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                                                            {dest.destinatario_name?.substring(0, 2).toUpperCase()}
                                                          </Avatar>
                                                        }
                                                      />
                                                    ))}
                                                  </Box>
                                                </Box>
                                              )}

                                              {/* Artículos */}
                                              {nested.articulos?.length > 0 && (
                                                <Box mb={2}>
                                                  <Typography variant="caption" color="textSecondary" fontWeight="bold" gutterBottom>
                                                    {t('articles')}:
                                                  </Typography>
                                                  <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                                    {nested.articulos.map((art) => (
                                                      <Chip
                                                        key={art.id_articulo}
                                                        label={art.numero_articulo}
                                                        size="small"
                                                        variant="outlined"
                                                      />
                                                    ))}
                                                  </Box>
                                                </Box>
                                              )}

                                              {/* Archivos Adjuntos */}
                                              {nested.archivos?.length > 0 && (
                                                <Box mb={2}>
                                                  <Typography variant="caption" color="textSecondary" fontWeight="bold" gutterBottom>
                                                    {t('attachments')}:
                                                  </Typography>
                                                  <Box display="flex" flexDirection="column" gap={1} mt={1}>
                                                    {nested.archivos.map((file) => {
                                                      const isPDF = file.file_name?.toLowerCase().endsWith('.pdf');
                                                      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.file_name);
                                                      
                                                      return (
                                                        <Paper 
                                                          key={file.id_file} 
                                                          sx={{ 
                                                            p: 1.5, 
                                                            border: 1, 
                                                            borderColor: 'divider',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2
                                                          }}
                                                        >
                                                          {/* Vista previa o ícono */}
                                                          <Box
                                                            sx={{
                                                              width: 60,
                                                              height: 60,
                                                              display: 'flex',
                                                              alignItems: 'center',
                                                              justifyContent: 'center',
                                                              bgcolor: isPDF ? 'error.lighter' : isImage ? 'info.lighter' : 'grey.100',
                                                              borderRadius: 1,
                                                              overflow: 'hidden'
                                                            }}
                                                          >
                                                            {isImage ? (
                                                              <img 
                                                                src={file.url} 
                                                                alt={file.file_name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                              />
                                                            ) : isPDF ? (
                                                              <PictureAsPdf sx={{ fontSize: 32, color: 'error.main' }} />
                                                            ) : (
                                                              <Description sx={{ fontSize: 32, color: 'text.secondary' }} />
                                                            )}
                                                          </Box>
                                                          
                                                          {/* Información del archivo */}
                                                          <Box flex={1}>
                                                            <Typography variant="body2" fontWeight="bold" noWrap>
                                                              {file.file_name}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                              {new Date(file.created_at).toLocaleString()}
                                                            </Typography>
                                                          </Box>
                                                          
                                                          {/* Botones de acción */}
                                                          <Box display="flex" gap={1}>
                                                            <Tooltip title={t('preview')}>
                                                              <IconButton 
                                                                size="small" 
                                                                color="primary"
                                                                onClick={() => window.open(file.url, '_blank')}
                                                              >
                                                                <Visibility fontSize="small" />
                                                              </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('download')}>
                                                              <IconButton 
                                                                size="small" 
                                                                color="primary"
                                                                component="a"
                                                                href={file.url}
                                                                download={file.file_name}
                                                                target="_blank"
                                                              >
                                                                <Download fontSize="small" />
                                                              </IconButton>
                                                            </Tooltip>
                                                          </Box>
                                                        </Paper>
                                                      );
                                                    })}
                                                  </Box>
                                                </Box>
                                              )}

                                              {/* Botones de acción */}
                                              <Box display="flex" gap={1} mt={2}>
                                                <Button
                                                  size="small"
                                                  startIcon={<CallMade />}
                                                  variant="outlined"
                                                  color="success"
                                                  sx={{ textTransform: 'none' }}
                                                  onClick={() => {
                                                    setSelectedParentForNew({
                                                      id: nested.id_request,
                                                      type: 'response',
                                                      order: parseInt(nested.order) + 1
                                                    });
                                                    setOpenCreateDialog(true);
                                                  }}
                                                >
                                                  {t('add_response')}
                                                </Button>
                                                <Button
                                                  size="small"
                                                  startIcon={<Notifications />}
                                                  variant="outlined"
                                                  color="warning"
                                                  sx={{ textTransform: 'none' }}
                                                  onClick={() => {
                                                    setSelectedParentForNew({
                                                      id: nested.id_request,
                                                      type: 'reminder',
                                                      order: parseInt(nested.order) + 1
                                                    });
                                                    setOpenCreateDialog(true);
                                                  }}
                                                >
                                                  {t('add_reminder')}
                                                </Button>
                                              </Box>
                                            </Box>
                                          </Collapse>
                                          
                                          {nested.archivos?.length > 0 && (
                                            <Box display="flex" gap={1} mt={2}>
                                              {nested.archivos.map((file) => (
                                                <Tooltip key={file.id_file} title={file.file_name}>
                                                  <Paper
                                                    sx={{
                                                      width: 48,
                                                      height: 48,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      cursor: 'pointer',
                                                      border: 2,
                                                      borderColor: 'primary.main',
                                                      '&:hover': { bgcolor: 'grey.100' }
                                                    }}
                                                    onClick={() => window.open(file.url, '_blank')}
                                                  >
                                                    <PictureAsPdf color="error" />
                                                  </Paper>
                                                </Tooltip>
                                              ))}
                                            </Box>
                                          )}
                                        </Paper>
                                      </Box>
                                    </Box>
                                  </Box>
                                );
                                })}
                                </Box>
                              <Box display="flex" justifyContent="center" mt={2}>
                                <Button
                                  size="small"
                                  startIcon={<Add />}
                                  sx={{ textTransform: 'none' }}
                                >
                                  {t('add_event')}
                                </Button>
                              </Box>
                            </>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredRequests.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('rows_per_page')}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('of')} ${count}`}
        />
      </TableContainer>

      {/* Dialog de creación de solicitud */}
      <CreateRequestDialog
        open={openCreateDialog}
        parentContext={selectedParentForNew}
        onClose={() => {
          setOpenCreateDialog(false);
          setSelectedParentForNew(null);
        }}
        onSuccess={() => {
          fetchRequests();
          setOpenCreateDialog(false);
          setSelectedParentForNew(null);
        }}
      />
    </Box>
  );
}
