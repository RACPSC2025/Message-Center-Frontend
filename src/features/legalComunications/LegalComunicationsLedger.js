import {
  Add,
  CallMade,
  CallReceived,
  ChevronRight,
  Description,
  Download,
  ExpandMore,
  Notifications,
  PictureAsPdf,
  Refresh,
  Visibility
} from '@mui/icons-material';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { selectAppliedFilterModel, selectFilterItemValue } from '../../stores/filterSlice';
import { showErrorMsg } from '../../utils/others';
export default function LegalComunicationsLedger({
  refreshKey = 0,
  onFilteredCountChange = () => {},
  onOpenCreateRequest = () => {}
}) {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);
  const [expandedNestedItems, setExpandedNestedItems] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [autoRefreshingUrls, setAutoRefreshingUrls] = useState(false);
  const [lastSignedUrlRefreshAt, setLastSignedUrlRefreshAt] = useState(0);
  const requisitoActual = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'requisito_actual')
  );
  const filterData = useSelector((state) =>
    selectAppliedFilterModel(state, 'legal_comunications')
  );
  const idRequisitoActual = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'id_requisito_actual')
  );

  useEffect(() => {
    if (!idRequisitoActual) {
      setRequests([]);
      setLoading(false);
      return;
    }

    fetchRequests();
  }, [idRequisitoActual, refreshKey]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        '/message_center_api/legal_api/get_request_from_legal',
        {
          id_requisito: idRequisitoActual
        }
      );

      if (response.data.status === 1) {
        const allRequests = (response.data.data || []).flat();
        const sortedRequests = allRequests.sort(
          (a, b) => new Date(b.filing_date) - new Date(a.filing_date)
        );
        setRequests(sortedRequests);
      } else {
        showErrorMsg(response.data.messages || t('error_loading_requests'));
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showErrorMsg(t('error_loading_requests'));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getMainRequests = () =>
    requests.filter(
      (request) =>
        request.request_type === 'request' &&
        (request.id_request_parent === null ||
          request.id_request_parent === undefined ||
          request.id_request_parent === '')
    );

  const getNestedRequests = (parentId) =>
    requests.filter(
      (request) => request.id_request_parent == parentId && parseInt(request.order, 10) > 1
    );

  const getAllDescendants = (parentId, level = 1) => {
    const directChildren = getNestedRequests(parentId);
    const result = [];

    directChildren.forEach((child) => {
      result.push({ ...child, nestingLevel: level });
      result.push(...getAllDescendants(child.id_request, level + 1));
    });

    return result;
  };

  const applyFilters = (requestsList) => {
    let filtered = requestsList;
    const keywordFilter = String(filterData?.filter_keywords || '')
      .trim()
      .toLowerCase();
    const statusFilter = filterData?.filter_status || '';
    const sourceTypeFilter = filterData?.filter_source_type || '';
    const modeFilter = filterData?.filter_mode || '';

    if (statusFilter) {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }
    if (sourceTypeFilter) {
      filtered = filtered.filter((request) => request.source_type === sourceTypeFilter);
    }
    if (modeFilter) {
      filtered = filtered.filter((request) => request.mode === modeFilter);
    }
    if (keywordFilter) {
      filtered = filtered.filter(
        (request) =>
          request.description?.toLowerCase().includes(keywordFilter) ||
          request.source_name?.toLowerCase().includes(keywordFilter) ||
          request.source_reference?.toLowerCase().includes(keywordFilter)
      );
    }

    return filtered;
  };

  const handleExpandRow = (id) => {
    const idAsString = String(id);
    setExpandedRows((currentRows) =>
      currentRows.includes(idAsString)
        ? currentRows.filter((rowId) => rowId !== idAsString)
        : [...currentRows, idAsString]
    );
  };

  const toggleNestedItemExpand = (id) => {
    const idAsString = String(id);
    setExpandedNestedItems((currentItems) =>
      currentItems.includes(idAsString)
        ? currentItems.filter((itemId) => itemId !== idAsString)
        : [...currentItems, idAsString]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'primary',
      in_progress: 'warning',
      expired: 'error',
      resolved: 'success'
    };
    return colors[status] || 'default';
  };

  const getRequestTypeIcon = (type) => {
    if (type === 'request') return <CallReceived fontSize="small" />;
    if (type === 'response') return <CallMade fontSize="small" />;
    if (type === 'reminder') return <Notifications fontSize="small" />;
    return <Description fontSize="small" />;
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getPreviewUrl = (file) => file?.preview_url || file?.url || '';

  const getDownloadUrl = (file) => file?.download_url || file?.preview_url || file?.url || '';

  const parseSignedUrlExpiryDate = (url) => {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      const amzDate = parsed.searchParams.get('X-Amz-Date');
      const amzExpires = parsed.searchParams.get('X-Amz-Expires');

      if (!amzDate || !amzExpires || amzDate.length < 16) {
        return null;
      }

      const year = amzDate.slice(0, 4);
      const month = amzDate.slice(4, 6);
      const day = amzDate.slice(6, 8);
      const hour = amzDate.slice(9, 11);
      const minute = amzDate.slice(11, 13);
      const second = amzDate.slice(13, 15);
      const issuedAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
      const expiresInSeconds = Number(amzExpires);

      if (Number.isNaN(issuedAt.getTime()) || Number.isNaN(expiresInSeconds)) {
        return null;
      }

      return new Date(issuedAt.getTime() + expiresInSeconds * 1000);
    } catch (error) {
      return null;
    }
  };

  const getFileUrlExpiryDate = (file) =>
    parseSignedUrlExpiryDate(file?.download_url) ||
    parseSignedUrlExpiryDate(file?.preview_url) ||
    parseSignedUrlExpiryDate(file?.url);

  const isFileUrlExpired = (file) => {
    const expiryDate = getFileUrlExpiryDate(file);
    return expiryDate ? Date.now() >= expiryDate.getTime() : false;
  };

  const refreshSignedUrls = async () => {
    if (loading || autoRefreshingUrls || !idRequisitoActual) return;

    setAutoRefreshingUrls(true);
    try {
      await fetchRequests();
      setLastSignedUrlRefreshAt(Date.now());
    } finally {
      setAutoRefreshingUrls(false);
    }
  };

  useEffect(() => {
    if (loading || autoRefreshingUrls || requests.length === 0) return;

    const hasExpiredFiles = requests.some((request) =>
      request.archivos?.some((file) => isFileUrlExpired(file))
    );

    if (!hasExpiredFiles) return;

    const now = Date.now();
    const cooldownMs = 60 * 1000;
    if (now - lastSignedUrlRefreshAt < cooldownMs) return;

    refreshSignedUrls();
  }, [requests, loading, autoRefreshingUrls, lastSignedUrlRefreshAt]);

  const handlePreviewFile = (file) => {
    if (isFileUrlExpired(file)) {
      showErrorMsg(t('signed_url_expired'));
      refreshSignedUrls();
      return;
    }

    const previewUrl = getPreviewUrl(file);
    if (!previewUrl) {
      showErrorMsg(t('error_loading_requests'));
      return;
    }

    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadFile = (file, fileName) => {
    try {
      if (isFileUrlExpired(file)) {
        showErrorMsg(t('signed_url_expired'));
        refreshSignedUrls();
        return;
      }

      const downloadUrl = getDownloadUrl(file);
      if (!downloadUrl) {
        showErrorMsg(t('error_downloading_file'));
        return;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'attachment';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      showErrorMsg(t('error_downloading_file'));
    }
  };

  const mainRequests = getMainRequests();
  const filteredRequests = applyFilters(mainRequests);
  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    onFilteredCountChange(filteredRequests.length);
  }, [filteredRequests.length, onFilteredCountChange]);

  useEffect(() => {
    setPage(0);
  }, [
    filterData?.filter_keywords,
    filterData?.filter_status,
    filterData?.filter_source_type,
    filterData?.filter_mode
  ]);

  const handleChangePage = (_, newPage) => {
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

  if (!idRequisitoActual) {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {t('regulatory_communications_ledger')}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}
          >
            {t('high_stakes_compliance_tracking')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {`${t('number')}: ${idRequisitoActual} • ${
              requisitoActual?.requirement_name || requisitoActual?.title || '-'
            }`}
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell width={50} />
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('filing_date')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('control_date')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('due_date')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('deadline')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('status')}
                </Typography>
              </TableCell>
              <TableCell sx={{ minWidth: 280 }}>
                <Typography variant="caption" fontWeight="bold">
                  {t('description')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('entity')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('articles')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('assigned')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight="bold">
                  {t('attachments')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography color="textSecondary" py={4}>
                    {t('no_requests_found')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => {
                const requestId = String(request.id_request);
                const isExpanded = expandedRows.includes(requestId);
                const nestedRequests = getAllDescendants(request.id_request);
                const daysRemaining = getDaysRemaining(request.due_date);

                return (
                  <Fragment key={requestId}>
                    <TableRow
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
                        <Typography
                          variant="body2"
                          fontWeight={request.due_date ? 'bold' : 'normal'}
                          color={request.status === 'expired' ? 'error' : 'inherit'}
                        >
                          {formatDate(request.due_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {daysRemaining !== null && (
                          <Chip
                            label={
                              daysRemaining < 0
                                ? t('expired')
                                : `${daysRemaining} ${t('days_left')}`
                            }
                            color={
                              daysRemaining < 0
                                ? 'error'
                                : daysRemaining < 7
                                  ? 'warning'
                                  : 'default'
                            }
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
                            borderColor:
                              request.status === 'resolved'
                                ? 'success.main'
                                : request.status === 'open' ||
                                    request.status === 'in_progress'
                                  ? 'warning.main'
                                  : request.status === 'expired'
                                    ? 'error.main'
                                    : 'grey.500',
                            color:
                              request.status === 'resolved'
                                ? 'success.main'
                                : request.status === 'open' ||
                                    request.status === 'in_progress'
                                  ? 'warning.main'
                                  : request.status === 'expired'
                                    ? 'error.main'
                                    : 'text.primary'
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
                          {request.source_type === 'GOVT'
                            ? t('govt')
                            : request.source_type === 'USER'
                              ? t('user')
                              : request.source_type === 'INTERNAL'
                                ? t('internal')
                                : request.source_type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {request.articulos?.slice(0, 2).map((article) => (
                            <Chip
                              key={article.id_articulo}
                              label={article.numero_articulo}
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
                            {request.destinatarios.map((recipient) => (
                              <Tooltip key={recipient.id} title={recipient.destinatario_name}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 10 }}>
                                  {recipient.destinatario_name?.substring(0, 2).toUpperCase()}
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

                    <TableRow>
                      <TableCell colSpan={11} sx={{ p: 0, bgcolor: 'grey.50' }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }} elevation={1}>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={2}
                                pb={1}
                                borderBottom={1}
                                borderColor="divider"
                              >
                                <Description color="primary" fontSize="small" />
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  textTransform="uppercase"
                                >
                                  {t('Detalles')}
                                </Typography>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    fontWeight="bold"
                                  >
                                    {t('description')}:
                                  </Typography>
                                  <Typography variant="body2">
                                    {request.description || '-'}
                                  </Typography>
                                </Grid>

                                {request.comment && (
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                      fontWeight="bold"
                                    >
                                      {t('comments')}:
                                    </Typography>
                                    <Typography variant="body2">{request.comment}</Typography>
                                  </Grid>
                                )}

                                {request.observation && (
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                      fontWeight="bold"
                                    >
                                      {t('observation')}:
                                    </Typography>
                                    <Typography variant="body2">{request.observation}</Typography>
                                  </Grid>
                                )}

                                {request.destinatarios?.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                      fontWeight="bold"
                                      gutterBottom
                                    >
                                      {t('Responsables')}:
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                                      {request.destinatarios.map((recipient) => (
                                        <Chip
                                          key={recipient.id}
                                          avatar={
                                            <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                                              {recipient.destinatario_name
                                                ?.substring(0, 2)
                                                .toUpperCase()}
                                            </Avatar>
                                          }
                                          label={recipient.destinatario_name}
                                          size="small"
                                          variant={
                                            recipient.is_read === '1' ? 'filled' : 'outlined'
                                          }
                                          color={
                                            recipient.is_read === '1' ? 'success' : 'default'
                                          }
                                        />
                                      ))}
                                    </Box>
                                  </Grid>
                                )}

                                {request.articulos?.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                      fontWeight="bold"
                                      gutterBottom
                                    >
                                      {t('articles')}:
                                    </Typography>
                                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                                      {request.articulos.map((article) => (
                                        <Chip
                                          key={article.id_articulo}
                                          label={article.numero_articulo}
                                          size="small"
                                          variant="outlined"
                                        />
                                      ))}
                                    </Box>
                                  </Grid>
                                )}

                                {request.archivos?.length > 0 && (
                                  <Grid item xs={12}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        fontWeight="bold"
                                        gutterBottom
                                      >
                                        {t('attachments')}:
                                      </Typography>
                                      <Tooltip title={t('refresh')}>
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={refreshSignedUrls}
                                            disabled={loading || autoRefreshingUrls}
                                          >
                                            {autoRefreshingUrls ? (
                                              <CircularProgress size={14} />
                                            ) : (
                                              <Refresh fontSize="small" />
                                            )}
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap={1} mt={1}>
                                      {request.archivos.map((file) => {
                                        const isPdf = file.file_name
                                          ?.toLowerCase()
                                          .endsWith('.pdf');
                                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                                          file.file_name
                                        );

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
                                            <Box
                                              sx={{
                                                width: 60,
                                                height: 60,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: isPdf
                                                  ? 'error.lighter'
                                                  : isImage
                                                    ? 'info.lighter'
                                                    : 'grey.100',
                                                borderRadius: 1,
                                                overflow: 'hidden'
                                              }}
                                            >
                                              {isImage ? (
                                                <img
                                                  src={getPreviewUrl(file)}
                                                  alt={file.file_name}
                                                  style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                  }}
                                                />
                                              ) : isPdf ? (
                                                <PictureAsPdf
                                                  sx={{ fontSize: 32, color: 'error.main' }}
                                                />
                                              ) : (
                                                <Description
                                                  sx={{ fontSize: 32, color: 'text.secondary' }}
                                                />
                                              )}
                                            </Box>

                                            <Box flex={1}>
                                              <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                  variant="body2"
                                                  fontWeight="bold"
                                                  noWrap
                                                >
                                                  {file.file_name}
                                                </Typography>
                                                {isFileUrlExpired(file) && (
                                                  <Chip
                                                    label={t('link_expired')}
                                                    size="small"
                                                    color="warning"
                                                    sx={{ height: 20 }}
                                                  />
                                                )}
                                              </Box>
                                              <Typography variant="caption" color="textSecondary">
                                                {new Date(file.created_at).toLocaleString()}
                                              </Typography>
                                            </Box>

                                            <Box display="flex" gap={1}>
                                              <Tooltip title={t('preview')}>
                                                <IconButton
                                                  size="small"
                                                  color="primary"
                                                  onClick={() => handlePreviewFile(file)}
                                                >
                                                  <Visibility fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title={t('download')}>
                                                <IconButton
                                                  size="small"
                                                  color="primary"
                                                  onClick={() =>
                                                    handleDownloadFile(file, file.file_name)
                                                  }
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

                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mb={2}
                              pb={1}
                              borderBottom={1}
                              borderColor="divider"
                            >
                              <Notifications color="primary" fontSize="small" />
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                textTransform="uppercase"
                              >
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
                                <Box sx={{ position: 'relative', pl: 3 }}>
                                  {nestedRequests.map((nestedRequest, index) => {
                                    const indentation =
                                      nestedRequest.nestingLevel > 1
                                        ? (nestedRequest.nestingLevel - 1) * 40
                                        : 0;
                                    const isNestedExpanded = expandedNestedItems.includes(
                                      String(nestedRequest.id_request)
                                    );
                                    const nestedDaysRemaining = getDaysRemaining(
                                      nestedRequest.due_date
                                    );

                                    return (
                                      <Box
                                        key={nestedRequest.id_request}
                                        sx={{
                                          position: 'relative',
                                          mb: 3,
                                          ml: `${indentation}px`,
                                          pl: nestedRequest.nestingLevel > 1 ? 2 : 0,
                                          borderLeft:
                                            nestedRequest.nestingLevel > 1
                                              ? '3px solid'
                                              : 'none',
                                          borderColor:
                                            nestedRequest.nestingLevel > 1
                                              ? 'info.main'
                                              : 'transparent',
                                          bgcolor:
                                            nestedRequest.nestingLevel > 1
                                              ? 'grey.50'
                                              : 'transparent',
                                          borderRadius: nestedRequest.nestingLevel > 1 ? 1 : 0,
                                          '&::before':
                                            index < nestedRequests.length - 1
                                              ? {
                                                  content: '""',
                                                  position: 'absolute',
                                                  left: -20,
                                                  top: 36,
                                                  bottom: -16,
                                                  width: 3,
                                                  bgcolor: 'grey.300'
                                                }
                                              : {}
                                        }}
                                      >
                                        <Box display="flex" alignItems="flex-start" gap={1}>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              toggleNestedItemExpand(nestedRequest.id_request)
                                            }
                                            sx={{
                                              mt: 0.5,
                                              bgcolor: isNestedExpanded
                                                ? 'primary.lighter'
                                                : 'grey.100',
                                              '&:hover': {
                                                bgcolor: isNestedExpanded
                                                  ? 'primary.light'
                                                  : 'grey.200'
                                              }
                                            }}
                                          >
                                            {isNestedExpanded ? (
                                              <ExpandMore fontSize="small" />
                                            ) : (
                                              <ChevronRight fontSize="small" />
                                            )}
                                          </IconButton>

                                          <Box
                                            sx={{
                                              width:
                                                nestedRequest.nestingLevel > 1 ? 30 : 36,
                                              height:
                                                nestedRequest.nestingLevel > 1 ? 30 : 36,
                                              borderRadius: '50%',
                                              bgcolor:
                                                nestedRequest.request_type === 'response'
                                                  ? 'success.main'
                                                  : 'warning.main',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: 'white',
                                              boxShadow:
                                                nestedRequest.nestingLevel > 1 ? 2 : 3,
                                              border:
                                                nestedRequest.nestingLevel > 1
                                                  ? '2px solid white'
                                                  : 'none',
                                              mt: 0.5
                                            }}
                                          >
                                            {getRequestTypeIcon(nestedRequest.request_type)}
                                          </Box>

                                          <Box flex={1}>
                                            <Box
                                              display="flex"
                                              alignItems="center"
                                              justifyContent="space-between"
                                              gap={2}
                                              mb={1}
                                            >
                                              <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                                flexWrap="wrap"
                                              >
                                                <Chip
                                                  label={`${formatDate(
                                                    nestedRequest.filing_date
                                                  )} • ${
                                                    nestedRequest.created_at?.substring(11, 16) ||
                                                    ''
                                                  }`}
                                                  size="small"
                                                  variant="outlined"
                                                />
                                                <Chip
                                                  label={t(nestedRequest.request_type)}
                                                  color={
                                                    nestedRequest.request_type === 'response'
                                                      ? 'success'
                                                      : 'warning'
                                                  }
                                                  size="small"
                                                />
                                                {nestedRequest.nestingLevel > 1 && (
                                                  <Chip
                                                    label={`↳ ${t('level')} ${
                                                      nestedRequest.nestingLevel
                                                    }`}
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
                                              <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                gutterBottom
                                              >
                                                {nestedRequest.source_reference ||
                                                  `${t(nestedRequest.request_type)} - ${
                                                    nestedRequest.source_name
                                                  }`}
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{
                                                  display: '-webkit-box',
                                                  WebkitLineClamp: isNestedExpanded
                                                    ? 'unset'
                                                    : 2,
                                                  WebkitBoxOrient: 'vertical',
                                                  overflow: 'hidden'
                                                }}
                                              >
                                                {nestedRequest.description ||
                                                  nestedRequest.comment}
                                              </Typography>

                                              <Collapse in={isNestedExpanded} timeout="auto">
                                                <Box mt={2}>
                                                  <Box
                                                    display="flex"
                                                    flexWrap="wrap"
                                                    gap={2}
                                                    mb={2}
                                                  >
                                                    <Box>
                                                      <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                        fontWeight="bold"
                                                      >
                                                        {t('status')}:
                                                      </Typography>
                                                      <Chip
                                                        label={t(nestedRequest.status)}
                                                        color={getStatusColor(
                                                          nestedRequest.status
                                                        )}
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                      />
                                                    </Box>
                                                    <Box>
                                                      <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                        fontWeight="bold"
                                                      >
                                                        {t('source_type')}:
                                                      </Typography>
                                                      <Typography variant="caption" ml={1}>
                                                        {nestedRequest.source_type === 'GOVT'
                                                          ? t('govt')
                                                          : nestedRequest.source_type === 'USER'
                                                            ? t('user')
                                                            : nestedRequest.source_type ===
                                                                'INTERNAL'
                                                              ? t('internal')
                                                              : nestedRequest.source_type}
                                                      </Typography>
                                                    </Box>
                                                    <Box>
                                                      <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                        fontWeight="bold"
                                                      >
                                                        {t('communication_mode')}:
                                                      </Typography>
                                                      <Typography variant="caption" ml={1}>
                                                        {nestedRequest.mode === 'LETTER'
                                                          ? t('letter')
                                                          : nestedRequest.mode === 'EMAIL'
                                                            ? t('email')
                                                            : nestedRequest.mode === 'PORTAL'
                                                              ? t('portal')
                                                              : nestedRequest.mode ===
                                                                  'IN_PERSON'
                                                                ? t('in_person')
                                                                : nestedRequest.mode === 'PHONE'
                                                                  ? t('phone')
                                                                  : nestedRequest.mode}
                                                      </Typography>
                                                    </Box>
                                                    {nestedDaysRemaining !== null && (
                                                      <Box>
                                                        <Typography
                                                          variant="caption"
                                                          color="textSecondary"
                                                          fontWeight="bold"
                                                        >
                                                          {t('deadline')}:
                                                        </Typography>
                                                        <Chip
                                                          label={
                                                            nestedDaysRemaining < 0
                                                              ? t('expired')
                                                              : `${nestedDaysRemaining} ${t(
                                                                  'days_left'
                                                                )}`
                                                          }
                                                          color={
                                                            nestedDaysRemaining < 0
                                                              ? 'error'
                                                              : nestedDaysRemaining < 7
                                                                ? 'warning'
                                                                : 'default'
                                                          }
                                                          size="small"
                                                          sx={{ ml: 1 }}
                                                        />
                                                      </Box>
                                                    )}
                                                  </Box>

                                                  {nestedRequest.destinatarios?.length > 0 && (
                                                    <Box mb={2}>
                                                      <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                        fontWeight="bold"
                                                        gutterBottom
                                                      >
                                                        {t('assigned')}:
                                                      </Typography>
                                                      <Box
                                                        display="flex"
                                                        gap={1}
                                                        flexWrap="wrap"
                                                        mt={0.5}
                                                      >
                                                        {nestedRequest.destinatarios.map(
                                                          (recipient) => (
                                                            <Chip
                                                              key={recipient.id}
                                                              label={
                                                                recipient.destinatario_name
                                                              }
                                                              size="small"
                                                              avatar={
                                                                <Avatar
                                                                  sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    fontSize: 10
                                                                  }}
                                                                >
                                                                  {recipient.destinatario_name
                                                                    ?.substring(0, 2)
                                                                    .toUpperCase()}
                                                                </Avatar>
                                                              }
                                                            />
                                                          )
                                                        )}
                                                      </Box>
                                                    </Box>
                                                  )}

                                                  {nestedRequest.articulos?.length > 0 && (
                                                    <Box mb={2}>
                                                      <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                        fontWeight="bold"
                                                        gutterBottom
                                                      >
                                                        {t('articles')}:
                                                      </Typography>
                                                      <Box
                                                        display="flex"
                                                        gap={0.5}
                                                        flexWrap="wrap"
                                                        mt={0.5}
                                                      >
                                                        {nestedRequest.articulos.map(
                                                          (article) => (
                                                            <Chip
                                                              key={article.id_articulo}
                                                              label={article.numero_articulo}
                                                              size="small"
                                                              variant="outlined"
                                                            />
                                                          )
                                                        )}
                                                      </Box>
                                                    </Box>
                                                  )}

                                                  {nestedRequest.archivos?.length > 0 && (
                                                    <Box mb={2}>
                                                      <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={1}
                                                      >
                                                        <Typography
                                                          variant="caption"
                                                          color="textSecondary"
                                                          fontWeight="bold"
                                                          gutterBottom
                                                        >
                                                          {t('attachments')}:
                                                        </Typography>
                                                        <Tooltip title={t('refresh')}>
                                                          <span>
                                                            <IconButton
                                                              size="small"
                                                              color="primary"
                                                              onClick={refreshSignedUrls}
                                                              disabled={
                                                                loading ||
                                                                autoRefreshingUrls
                                                              }
                                                            >
                                                              {autoRefreshingUrls ? (
                                                                <CircularProgress size={14} />
                                                              ) : (
                                                                <Refresh fontSize="small" />
                                                              )}
                                                            </IconButton>
                                                          </span>
                                                        </Tooltip>
                                                      </Box>
                                                      <Box
                                                        display="flex"
                                                        flexDirection="column"
                                                        gap={1}
                                                        mt={1}
                                                      >
                                                        {nestedRequest.archivos.map((file) => {
                                                          const isPdf = file.file_name
                                                            ?.toLowerCase()
                                                            .endsWith('.pdf');
                                                          const isImage =
                                                            /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                                                              file.file_name
                                                            );

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
                                                              <Box
                                                                sx={{
                                                                  width: 60,
                                                                  height: 60,
                                                                  display: 'flex',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  bgcolor: isPdf
                                                                    ? 'error.lighter'
                                                                    : isImage
                                                                      ? 'info.lighter'
                                                                      : 'grey.100',
                                                                  borderRadius: 1,
                                                                  overflow: 'hidden'
                                                                }}
                                                              >
                                                                {isImage ? (
                                                                  <img
                                                                    src={getPreviewUrl(file)}
                                                                    alt={file.file_name}
                                                                    style={{
                                                                      width: '100%',
                                                                      height: '100%',
                                                                      objectFit: 'cover'
                                                                    }}
                                                                  />
                                                                ) : isPdf ? (
                                                                  <PictureAsPdf
                                                                    sx={{
                                                                      fontSize: 32,
                                                                      color: 'error.main'
                                                                    }}
                                                                  />
                                                                ) : (
                                                                  <Description
                                                                    sx={{
                                                                      fontSize: 32,
                                                                      color:
                                                                        'text.secondary'
                                                                    }}
                                                                  />
                                                                )}
                                                              </Box>

                                                              <Box flex={1}>
                                                                <Box
                                                                  display="flex"
                                                                  alignItems="center"
                                                                  gap={1}
                                                                >
                                                                  <Typography
                                                                    variant="body2"
                                                                    fontWeight="bold"
                                                                    noWrap
                                                                  >
                                                                    {file.file_name}
                                                                  </Typography>
                                                                  {isFileUrlExpired(file) && (
                                                                    <Chip
                                                                      label={t(
                                                                        'link_expired'
                                                                      )}
                                                                      size="small"
                                                                      color="warning"
                                                                      sx={{ height: 20 }}
                                                                    />
                                                                  )}
                                                                </Box>
                                                                <Typography
                                                                  variant="caption"
                                                                  color="textSecondary"
                                                                >
                                                                  {new Date(
                                                                    file.created_at
                                                                  ).toLocaleString()}
                                                                </Typography>
                                                              </Box>

                                                              <Box display="flex" gap={1}>
                                                                <Tooltip title={t('preview')}>
                                                                  <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() =>
                                                                      handlePreviewFile(file)
                                                                    }
                                                                  >
                                                                    <Visibility fontSize="small" />
                                                                  </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={t('download')}>
                                                                  <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() =>
                                                                      handleDownloadFile(
                                                                        file,
                                                                        file.file_name
                                                                      )
                                                                    }
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

                                                  <Box display="flex" gap={1} mt={2}>
                                                    <Button
                                                      size="small"
                                                      startIcon={<CallMade />}
                                                      variant="outlined"
                                                      color="success"
                                                      sx={{ textTransform: 'none' }}
                                                      onClick={() => {
                                                        onOpenCreateRequest({
                                                          id: nestedRequest.id_request,
                                                          type: 'response',
                                                          order:
                                                            parseInt(
                                                              nestedRequest.order,
                                                              10
                                                            ) + 1
                                                        });
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
                                                        onOpenCreateRequest({
                                                          id: nestedRequest.id_request,
                                                          type: 'reminder',
                                                          order:
                                                            parseInt(
                                                              nestedRequest.order,
                                                              10
                                                            ) + 1
                                                        });
                                                      }}
                                                    >
                                                      {t('add_reminder')}
                                                    </Button>
                                                  </Box>
                                                </Box>
                                              </Collapse>
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
                  </Fragment>
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

    </Box>
  );
}
