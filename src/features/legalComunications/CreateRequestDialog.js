import {
  Add,
  Close,
  Description,
  PictureAsPdf,
  UploadFile,
  CheckCircle,
  Circle
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  AppBar,
  Toolbar,
  Drawer
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BaseTab from '../../components/BaseTab';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilterItemValue } from '../../stores/filterSlice';
import { fetchAdministratorsList } from '../../stores/tasks/fetchAdministratorsListSlice';
import axiosInstance from '../../lib/axios';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';

export default function CreateRequestDialog({
  open,
  onClose,
  onSuccess,
  parentContext = null,
  variant = 'dialog'
}) {
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
  const [activeTab, setActiveTab] = useState(0);
  const isFirstTab = activeTab === 0;
  const isLastTab = activeTab === 2;

  // Cargar artículos y destinatarios disponibles
  useEffect(() => {
    if (open) {
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
      if (id_requisito_actual) {
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
      } else {
        setAvailableArticles([]);
      }

      const usersResult = await dispatch(fetchAdministratorsList()).unwrap();
      if (usersResult?.status === 200 && usersResult?.data) {
        setAvailableRecipients(usersResult.data);
      } else {
        setAvailableRecipients([]);
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
    setActiveTab(0);
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

  const handlePreviousTab = () => {
    setActiveTab((currentTab) => Math.max(currentTab - 1, 0));
  };

  const handleNextTab = () => {
    setActiveTab((currentTab) => Math.min(currentTab + 1, 2));
  };

  const generalInfoContent = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        gap: 2
      }}
    >
      <FormControl fullWidth>
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
        label={t('status')}
        value={formData.status}
        select
        onChange={(e) => handleFormChange('status', e.target.value)}
      >
        <MenuItem value="open">{t('open_status')}</MenuItem>
        <MenuItem value="in_progress">{t('in_progress_status')}</MenuItem>
        <MenuItem value="resolved">{t('resolved_status')}</MenuItem>
        <MenuItem value="expired">{t('expired_status')}</MenuItem>
      </TextField>

      <TextField
        fullWidth
        size="small"
        label={t('source_name')}
        value={formData.source_name}
        onChange={(e) => handleFormChange('source_name', e.target.value)}
        required
      />

      <TextField
        fullWidth
        size="small"
        label={t('source_reference')}
        value={formData.source_reference}
        onChange={(e) => handleFormChange('source_reference', e.target.value)}
      />

      <TextField
        fullWidth
        size="small"
        type="date"
        label={t('filing_date')}
        value={formData.filing_date}
        onChange={(e) => handleFormChange('filing_date', e.target.value)}
        InputLabelProps={{ shrink: true }}
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
      />

      <FormControl fullWidth>
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
  );

  const narrativeContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        multiline
        rows={8}
        fullWidth
        size="small"
        label={t('legal_observation')}
        value={formData.description}
        onChange={(e) => handleFormChange('description', e.target.value)}
        required
      />

      <TextField
        multiline
        rows={6}
        fullWidth
        size="small"
        label={t('internal_comments')}
        value={formData.comment}
        onChange={(e) => handleFormChange('comment', e.target.value)}
      />
    </Box>
  );

  const complianceEntitiesContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="caption" fontWeight={600} display="block" mb={1}>
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
            onClick={() => {}}
            variant="outlined"
            size="small"
            sx={{ borderStyle: 'dashed' }}
          />
        </Box>

        {availableArticles.length > 0 && (
          <Box mt={1} maxHeight={132} overflow="auto" className="custom-scrollbar">
            {availableArticles.slice(0, 5).map((art) => {
              const isSelected = selectedArticles.find((a) => a.id_articulo === art.id_articulo);
              return (
                <Box
                  key={art.id_articulo}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  px={1}
                  py={0.75}
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
                const user = availableRecipients.find((r) => r.value === value);
                return (
                  <Chip
                    key={value}
                    label={user?.label || value}
                    size="small"
                    onDelete={(e) => handleRemoveRecipient(value, e)}
                    onMouseDown={(e) => e.stopPropagation()}
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

      <Box
        sx={{
          p: 2,
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'primary.light',
          borderRadius: 1,
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
        <Box display="flex" alignItems="center" gap={1.5}>
          <UploadFile color="primary" fontSize="small" />
          <Typography variant="body2">{t('supporting_documentation')}</Typography>
        </Box>
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap">
        {attachedFiles.map((file, index) => (
          <Chip
            key={index}
            icon={file.name.endsWith('.pdf') ? <PictureAsPdf /> : <Description />}
            label={file.name}
            onDelete={() => removeFile(index)}
            size="small"
            sx={{ maxWidth: 220 }}
          />
        ))}
      </Box>
    </Box>
  );

  const tabItems = [
    { label: 'Información General', skipTranslation: true, component: generalInfoContent },
    { label: 'Narrativa', skipTranslation: true, component: narrativeContent },
    { label: 'Entidades', skipTranslation: true, component: complianceEntitiesContent }
  ];

  const drawerTitle = parentContext
    ? (parentContext.type === 'response' ? t('new_response') : t('new_reminder'))
    : t('new_legal_request');

  const content = (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography color="white" variant="h6" sx={{ flexGrow: 1 }}>
            {drawerTitle}
          </Typography>
          <IconButton edge="end" onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 2, py: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <BaseTab
            items={tabItems}
            activeTab={activeTab}
            tabContainerProps={{
              onChange: (_, newValue) => setActiveTab(newValue),
              sx: {
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'space-between'
                }
              }
            }}
            tabItemProps={{
              sx: {
                flex: 1,
                minWidth: 0,
                px: 1,
                fontSize: '0.85rem'
              }
            }}
          />
          <Box>
            {tabItems[activeTab]?.component}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          px: 2,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        {!isFirstTab && (
          <Button onClick={handlePreviousTab} color="inherit" disabled={loading}>
            {t('back')}
          </Button>
        )}
        {isFirstTab && (
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            {t('cancel')}
          </Button>
        )}
        {isLastTab ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? t('saving') : t('save_request')}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNextTab} disabled={loading}>
            {t('next')}
          </Button>
        )}
      </Box>
    </>
  );

  if (variant === 'drawer') {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            height: '100vh',
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            width: {
              xs: '100vw',
              sm: '80vw',
              md: '60vw',
              lg: '35vw'
            }
          }
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '95vh',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {content}
    </Dialog>
  );
}
