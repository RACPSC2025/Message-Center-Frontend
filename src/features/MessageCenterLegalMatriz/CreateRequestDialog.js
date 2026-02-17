import {
  Add,
  AttachFile,
  Cancel,
  Close,
  Description,
  Gavel,
  HelpOutline,
  Info,
  PictureAsPdf,
  Search,
  UploadFile,
  Group,
  CheckCircle,
  Circle
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  Divider,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilterItemValue } from '../../stores/filterSlice';
import { fetchAdministratorsList } from '../../stores/tasks/fetchAdministratorsListSlice';
import axiosInstance from '../../lib/axios';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';

export default function CreateRequestDialog({ open, onClose, onSuccess, parentContext = null }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Obtener ID del requisito actual desde Redux
  const id_requisito_actual = useSelector((state) => 
    selectFilterItemValue(state, 'LegalMatriz', 'id_requisito_actual')
  ) || null;

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Campos requeridos
    request_type: 'request',
    status: 'open',
    order: 1,
    source_type: 'GOVT',
    source_name: '',
    filing_date: new Date().toISOString().split('T')[0],
    expected_response_date: '',
    mode: 'EMAIL',
    
    // Campos opcionales
    comment: '',
    observation: '',
    source_reference: '',
    description: '',
    current_status: 'RECEIVED',
    due_date: '',
    repeated: 0,
    id_request_parent: null
  });

  // Estados adicionales
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]); // Array de IDs
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableArticles, setAvailableArticles] = useState([]);
  const [availableRecipients, setAvailableRecipients] = useState([]); // Array de {value, label}
  const [recipientsMenuOpen, setRecipientsMenuOpen] = useState(false);

  // Cargar artículos y destinatarios disponibles
  useEffect(() => {
    if (open && id_requisito_actual) {
      fetchAvailableData();
      
      // Si hay contexto de padre, actualizar formData
      if (parentContext) {
        setFormData(prev => ({
          ...prev,
          request_type: parentContext.type || 'response',
          id_request_parent: parentContext.id,
          order: parentContext.order || prev.order + 1
        }));
      } else {
        // Reset para solicitud principal
        setFormData(prev => ({
          ...prev,
          request_type: 'request',
          id_request_parent: null,
          order: 1
        }));
      }
    }
  }, [open, id_requisito_actual, parentContext]);

  const fetchAvailableData = async () => {
    try {
      // Obtener artículos del requisito actual
      const articlesResponse = await axiosInstance.post(
        '/message_center_api/legal_api/get_child_requisito_amatia_express',
        {
          requisito: id_requisito_actual,
          node: '',
          page: 1,
          rows: 100,
          sidx: 'id_articulo',
          sord: 'asc'
        }
      );
      
      if (articlesResponse.data?.rows) {
        setAvailableArticles(articlesResponse.data.rows);
      }

      // Obtener lista de usuarios/administradores disponibles
      const usersResult = await dispatch(fetchAdministratorsList()).unwrap();
      if (usersResult?.status === 200 && usersResult?.data) {
        // Mantener formato {value, label} compatible con Select múltiple
        setAvailableRecipients(usersResult.data);
      }
    } catch (error) {
      console.error('Error fetching available data:', error);
    }
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar selección/deselección de artículos
  const toggleArticle = (article) => {
    setSelectedArticles(prev => {
      const exists = prev.find(a => a.id_articulo === article.id_articulo);
      if (exists) {
        return prev.filter(a => a.id_articulo !== article.id_articulo);
      }
      return [...prev, article];
    });
  };

  // Manejar cambio de destinatarios (dropdown múltiple)
  const handleRecipientsChange = (event) => {
    const value = event.target.value;
    setSelectedRecipients(typeof value === 'string' ? value.split(',') : value);
    // Cerrar el menú después de seleccionar
    setRecipientsMenuOpen(false);
  };

  // Remover un destinatario específico
  const handleRemoveRecipient = (recipientId, event) => {
    event.stopPropagation(); // Evitar que se abra el Select
    setSelectedRecipients(prev => prev.filter(id => id !== recipientId));
  };

  // Manejar carga de archivos
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  // Remover archivo adjunto
  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Validar formulario
  const validateForm = () => {
    const errors = [];
    
    if (!formData.source_name) errors.push(t('source_name_required'));
    if (!formData.filing_date) errors.push(t('filing_date_required'));
    if (!formData.expected_response_date) errors.push(t('expected_response_date_required'));
    if (!formData.description) errors.push(t('description_required'));
    
    if (errors.length > 0) {
      showErrorMsg(errors.join(', '));
      return false;
    }
    return true;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Campos requeridos
      formDataToSend.append('id_requisito', id_requisito_actual);
      formDataToSend.append('request_type', formData.request_type);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('source_type', formData.source_type);
      formDataToSend.append('source_name', formData.source_name);
      formDataToSend.append('filing_date', formData.filing_date);
      formDataToSend.append('expected_response_date', formData.expected_response_date);
      formDataToSend.append('mode', formData.mode);
      formDataToSend.append('created_by', 1);

      // Campos opcionales
      formDataToSend.append('comment', formData.comment || '');
      formDataToSend.append('observation', formData.observation || '');
      formDataToSend.append('source_reference', formData.source_reference || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('current_status', formData.current_status);
      if (formData.due_date) {
        formDataToSend.append('due_date', formData.due_date);
      }
      formDataToSend.append('repeated', formData.repeated);

      // Artículos seleccionados
      if (selectedArticles.length > 0) {
        formDataToSend.append('articulos', JSON.stringify(selectedArticles.map(a => a.id_articulo)));
      }

      // Destinatarios seleccionados (array de IDs)
      if (selectedRecipients.length > 0) {
        formDataToSend.append('destinatarios', JSON.stringify(selectedRecipients));
      }

      // Archivos adjuntos
      attachedFiles.forEach(file => {
        formDataToSend.append('archivos_adjuntos[]', file);
      });

      const response = await axiosInstance.post(
        '/message_center_api/legal_api/save_request',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 1) {
        showSuccessMsg(response.data.messages || t('request_created_successfully'));
        onSuccess?.();
        handleClose();
      } else {
        showErrorMsg(response.data.messages || t('error_creating_request'));
      }
    } catch (error) {
      console.error('Error creating request:', error);
      showErrorMsg(t('error_creating_request'));
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario y cerrar
  const handleClose = () => {
    setFormData({
      request_type: 'request',
      status: 'open',
      order: 1,
      source_type: 'GOVT',
      source_name: '',
      filing_date: new Date().toISOString().split('T')[0],
      expected_response_date: '',
      mode: 'EMAIL',
      comment: '',
      observation: '',
      source_reference: '',
      description: '',
      current_status: 'RECEIVED',
      due_date: '',
      repeated: 0,
      id_request_parent: null
    });
    setSelectedArticles([]);
    setSelectedRecipients([]);
    setAttachedFiles([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '95vh', maxHeight: '95vh' }
      }}
    >
      {/* Header personalizado */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Gavel fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('legal_compliance_manager')}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('regulatory_portal')}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />}
            label={t('system_online')}
            size="small"
            sx={{ mr: 2 }}
          />
          <IconButton edge="end" onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent sx={{ p: 3, bgcolor: 'grey.50' }}>
        {/* Page Heading */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {parentContext 
                ? (parentContext.type === 'response' ? t('new_response') : t('new_reminder'))
                : t('new_legal_request')
              }
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {t('draft_id')}: REQ-{new Date().getFullYear()}-{String(Date.now()).slice(-4)}-D
              {parentContext && ` • ${t('parent')}: #${parentContext.id}`}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip label={t('creation_phase')} color="primary" size="small" />
            {parentContext && (
              <Chip 
                label={`${t('type')}: ${t(parentContext.type)}`} 
                color={parentContext.type === 'response' ? 'success' : 'warning'}
                size="small" 
              />
            )}
            <Chip label={t('auto_save_2m_ago')} variant="outlined" size="small" />
          </Box>
        </Box>

        {/* 3-Column Grid */}
        <Grid container spacing={2} sx={{ height: 'calc(95vh - 280px)' }}>
          {/* Column 1: General Info */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" gap={1} pb={2} borderBottom={1} borderColor="divider">
                <Info color="primary" fontSize="small" />
                <Typography variant="caption" fontWeight="bold" textTransform="uppercase" color="textSecondary">
                  {t('general_info')}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2, flex: 1, overflowY: 'auto', pr: 1 }} className="custom-scrollbar">
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">{t('source_type')}</InputLabel>
                  <Select
                    size="small"
                    value={formData.source_type}
                    label={t('source_type')}
                    onChange={(e) => handleFormChange('source_type', e.target.value)}
                  >
                    <MenuItem value="GOVT">{t('government')}</MenuItem>
                    <MenuItem value="USER">{t('user_community')}</MenuItem>
                    <MenuItem value="INTERNAL">{t('internal')}</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label={t('source_name')}
                  value={formData.source_name}
                  onChange={(e) => handleFormChange('source_name', e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  label={t('source_reference')}
                  value={formData.source_reference}
                  onChange={(e) => handleFormChange('source_reference', e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="RAD-2026-001"
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">{t('status')}</InputLabel>
                  <Select
                    size="small"
                    value={formData.status}
                    label={t('status')}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <MenuItem value="open">{t('open_status')}</MenuItem>
                    <MenuItem value="in_progress">{t('in_progress_status')}</MenuItem>
                    <MenuItem value="resolved">{t('resolved_status')}</MenuItem>
                    <MenuItem value="expired">{t('expired_status')}</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('filing_date')}
                  value={formData.filing_date}
                  onChange={(e) => handleFormChange('filing_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('expected_response_date')}
                  value={formData.expected_response_date}
                  onChange={(e) => handleFormChange('expected_response_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('due_date')}
                  value={formData.due_date}
                  onChange={(e) => handleFormChange('due_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel size="small">{t('communication_mode')}</InputLabel>
                  <Select
                    size="small"
                    value={formData.mode}
                    label={t('communication_mode')}
                    onChange={(e) => handleFormChange('mode', e.target.value)}
                  >
                    <MenuItem value="LETTER">{t('letter')}</MenuItem>
                    <MenuItem value="EMAIL">{t('email')}</MenuItem>
                    <MenuItem value="PORTAL">{t('portal')}</MenuItem>
                    <MenuItem value="IN_PERSON">{t('in_person')}</MenuItem>
                    <MenuItem value="PHONE">{t('phone')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Grid>

          {/* Column 2: Narrative & Context */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" gap={1} pb={2} borderBottom={1} borderColor="divider">
                <Description color="primary" fontSize="small" />
                <Typography variant="caption" fontWeight="bold" textTransform="uppercase" color="textSecondary">
                  {t('narrative_and_context')}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box flex={1} display="flex" flexDirection="column">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight="600">
                      {t('legal_observation')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formData.description.length} / 2000
                    </Typography>
                  </Box>
                  <TextField
                    multiline
                    rows={10}
                    fullWidth
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder={t('provide_detailed_background')}
                    required
                    sx={{ flex: 1 }}
                  />
                </Box>

                <Box flex={1} display="flex" flexDirection="column">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight="600">
                      {t('internal_comments')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formData.comment.length} / 1000
                    </Typography>
                  </Box>
                  <TextField
                    multiline
                    rows={8}
                    fullWidth
                    value={formData.comment}
                    onChange={(e) => handleFormChange('comment', e.target.value)}
                    placeholder={t('notes_for_internal_review')}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Column 3: Compliance Entities */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" gap={1} pb={2} borderBottom={1} borderColor="divider">
                <Group color="primary" fontSize="small" />
                <Typography variant="caption" fontWeight="bold" textTransform="uppercase" color="textSecondary">
                  {t('compliance_entities')}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 2, flex: 1, overflowY: 'auto', pr: 1 }} className="custom-scrollbar">
                {/* Articles Selection */}
                <Box mb={3}>
                  <Typography variant="caption" fontWeight="600" display="block" mb={1}>
                    {t('regulatory_articles')}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedArticles.map((art) => (
                      <Chip
                        key={art.id_articulo}
                        label={art.numero_articulo}
                        onDelete={() => toggleArticle(art)}
                        color="primary"
                        size="small"
                      />
                    ))}
                    <Chip
                      icon={<Add />}
                      label={t('add_article')}
                      onClick={() => {/* Abrir selector de artículos */}}
                      variant="outlined"
                      size="small"
                      sx={{ borderStyle: 'dashed' }}
                    />
                  </Box>
                  
                  {/* Lista de artículos disponibles */}
                  {availableArticles.length > 0 && (
                    <Box mt={2} maxHeight={150} overflow="auto">
                      {availableArticles.slice(0, 5).map((art) => {
                        const isSelected = selectedArticles.find(a => a.id_articulo === art.id_articulo);
                        return (
                          <Box
                            key={art.id_articulo}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            p={1}
                            borderRadius={1}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                            onClick={() => toggleArticle(art)}
                          >
                            <Typography variant="caption">{art.numero_articulo}</Typography>
                            {isSelected ? (
                              <CheckCircle color="primary" fontSize="small" />
                            ) : (
                              <Circle color="disabled" fontSize="small" />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Recipients Selection - Dropdown Múltiple */}
                <Box>
                  <Typography variant="caption" fontWeight="600" display="block" mb={1}>
                    {t('recipients_and_stakeholders')}
                  </Typography>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('select_recipients')}</InputLabel>
                    <Select
                      multiple
                      open={recipientsMenuOpen}
                      onOpen={() => setRecipientsMenuOpen(true)}
                      onClose={() => setRecipientsMenuOpen(false)}
                      value={selectedRecipients}
                      onChange={handleRecipientsChange}
                      label={t('select_recipients')}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const user = availableRecipients.find(r => r.value === value);
                            return (
                              <Chip 
                                key={value} 
                                label={user?.label || value} 
                                size="small"
                                onDelete={(e) => handleRemoveRecipient(value, e)}
                                onMouseDown={(e) => e.stopPropagation()} // Evitar que se abra el Select al hacer clic en el chip
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {availableRecipients.map((recipient) => (
                        <MenuItem key={recipient.value} value={recipient.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                              {recipient.label.substring(0, 2).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">{recipient.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* File Upload Area */}
        <Paper
          sx={{
            mt: 2,
            p: 3,
            border: 2,
            borderStyle: 'dashed',
            borderColor: 'primary.light',
            bgcolor: 'primary.lighter',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main' }
          }}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input
            id="file-upload-input"
            type="file"
            multiple
            hidden
            onChange={handleFileUpload}
          />
          <Box display="flex" alignItems="center" gap={3}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main'
              }}
            >
              <UploadFile />
            </Box>
            <Box flex={1}>
              <Typography variant="body2" fontWeight="bold">
                {t('supporting_documentation')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('drag_files_or_browse')}
              </Typography>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap" maxWidth={400} overflow="auto">
              {attachedFiles.map((file, index) => (
                <Chip
                  key={index}
                  icon={file.name.endsWith('.pdf') ? <PictureAsPdf /> : <Description />}
                  label={file.name}
                  onDelete={() => removeFile(index)}
                  size="small"
                  sx={{ maxWidth: 120 }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </DialogContent>

      {/* Fixed Bottom Action Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <HelpOutline fontSize="small" color="action" />
          <Typography variant="caption" color="textSecondary">
            {t('need_help')} <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}>{t('view_guidelines')}</Button>
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 100, textTransform: 'none' }}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ minWidth: 140, textTransform: 'none' }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? t('saving') : t('save_request')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
