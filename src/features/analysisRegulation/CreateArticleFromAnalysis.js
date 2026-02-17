import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip,
  OutlinedInput,
  Paper,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { NoteAltRounded, VisibilityRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import legalService from '../../services/legalService';
import { selectFilterItemValue } from '../../stores/filterSlice';

export default function CreateArticleFromAnalysis({ 
  selectedArticles = [], 
  requisitoId,
  onSuccess,
  containerId
}) {
  const { t } = useTranslation();
  
  // Obtener id_requisito_actual de Redux como fallback
  const id_requisito_actual = useSelector((state) => 
    selectFilterItemValue(state, 'LegalMatriz', 'id_requisito_actual')
  ) || null;
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [articleTypes, setArticleTypes] = useState([]);
  const [parentArticles, setParentArticles] = useState([]);
  const [temas, setTemas] = useState([]);
  
  const [formData, setFormData] = useState({
    numeracion: '',
    nombre: '',
    descripcion: '',
    criticity: '',
    risk_level: '',
    category: '',
    estado: 'Abierto',
    estado_autoridad: '',
    gap: '',
    comments: '',
    item_type: '',
    parent_article_id: '',
    id_tema_requisito: [],
    id_requisito: requisitoId,
    note_reference: '' // Referencia a la nota del PDF
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (requisitoId) {
      setFormData(prev => ({ ...prev, id_requisito: requisitoId }));
    }
    loadDropdownData();
  }, [requisitoId]);

  // Pre-fill form when a single article is selected
  useEffect(() => {
    if (selectedArticles.length === 1) {
      const art = selectedArticles[0];
      setFormData(prev => ({
        ...prev,
        numeracion: art.article_number || '',
        nombre: art.article_number ? `${art.article_number}` : '',
        descripcion: art.complete_description || art.description || '',
        criticity: art.priority || '',
        comments: art.subject || '',
        note_reference: art.note_reference || '', // Pre-llenar referencia a nota
        // Map other fields if possible
      }));
    }
  }, [selectedArticles]);

  const loadDropdownData = async () => {
    try {
      const [categoriesRes, typesRes, articlesRes, temasRes] = await Promise.all([
        legalService.getLegalCategories(),
        legalService.getArticleTypes(),
        legalService.getIdArticulo(requisitoId),
        legalService.getTemas()
      ]);

      if (categoriesRes.status === 1) setCategories(categoriesRes.data);
      if (typesRes.status === 1) setArticleTypes(typesRes.data);
      if (articlesRes.status === 1) setParentArticles(articlesRes.data);
      if (temasRes.status === 1) setTemas(temasRes.data);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateRequiredFields = () => {
    const errors = {};
    if (!formData.numeracion?.trim()) errors.numeracion = true;
    if (!formData.nombre?.trim()) errors.nombre = true;
    if (!formData.descripcion?.trim()) errors.descripcion = true;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Check if loading or if article is already saved
    if (loading) return;

    // Check if the article (from selection) is already saved for THIS requirement
    const isSavedForCurrentRequisito = selectedArticles.length > 0 && 
      selectedArticles[0].savedRequisitoIds && 
      selectedArticles[0].savedRequisitoIds.includes(requisitoId);

    if (isSavedForCurrentRequisito) {
      toast.info('El artículo ya fue creado previamente', { position: 'top-right', containerId });
      return;
    }

    if (!validateRequiredFields()) {
      toast.warning(t('complete_required_fields'), { position: 'top-right', containerId });
      return;
    }

    // Validar que id_requisito no sea null, si lo es usar id_requisito_actual de Redux
    //let finalRequisitoId = formData.id_requisito || requisitoId || id_requisito_actual;
    let finalRequisitoId = id_requisito_actual;
    
    if (!finalRequisitoId) {
      toast.error('No se puede guardar el artículo: falta el ID del requisito', { 
        position: 'top-right', 
        containerId 
      });
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        id_requisito: finalRequisitoId,
        // Default values for dashboard message as seen in PHP logic
        create_dashboard_message: '1',
        module_table: 'amatia_articulos_actos'
      };

      // Convert empty strings to null
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '') dataToSend[key] = null;
      });

      const response = await legalService.createArticle(dataToSend);
      setLoading(false);

      if (response.status === 1) {
        toast.success(response.messages, { position: 'top-right', containerId });
        
        // Clear form but keep some defaults
        setFormData(prev => ({
          ...prev,
          numeracion: '',
          nombre: '',
          descripcion: '',
          comments: ''
        }));
        
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.messages || t('error_creating'), { position: 'top-right', containerId });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error creating article:', error);
      toast.error(t('error_creating'), { position: 'top-right', containerId });
    }
  };

  const isSavedForCurrentRequisito = selectedArticles.length > 0 && 
    selectedArticles[0].savedRequisitoIds && 
    selectedArticles[0].savedRequisitoIds.includes(requisitoId);

  const showRiskLevel = formData.criticity === 'Alta';
  const showEstadoAutoridad = formData.estado === 'Cerrado';
  const showParentArticle = formData.item_type && formData.item_type !== 'Artículo' && formData.item_type !== 'Article';
  
  // Handler para navegar a la nota en el PDF
  const handleViewNote = () => {
    if (formData.note_reference) {
      // Obtener pageIndex del artículo o de highlightAreas
      const pageIndex = selectedArticles[0]?.pageIndex ?? 
                       selectedArticles[0]?.highlightAreas?.[0]?.pageIndex ?? 0;
      
      window.dispatchEvent(new CustomEvent('navigate-to-note', {
        detail: {
          noteId: parseFloat(formData.note_reference), // Usar parseFloat para mantener precisión
          pageIndex: pageIndex
        }
      }));
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {t('create_article_from_analysis')}
      </Typography>
      
      {selectedArticles.length > 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('multiple_articles_selected_info')}
        </Alert>
      )}
      
      {formData.note_reference && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          action={
            <Tooltip title="Ver nota en PDF">
              <IconButton
                color="inherit"
                size="small"
                onClick={handleViewNote}
              >
                <VisibilityRounded />
              </IconButton>
            </Tooltip>
          }
          icon={<NoteAltRounded />}
        >
          Este artículo tiene una nota asociada del PDF (ID: {formData.note_reference})
        </Alert>
      )}

      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
        <TextField
          label={t('article_number')}
          value={formData.numeracion}
          onChange={(e) => handleChange('numeracion', e.target.value)}
          error={!!validationErrors.numeracion}
          helperText={validationErrors.numeracion ? t('required_field') : ''}
          required
          fullWidth
          InputProps={{
            sx: { borderBottom: validationErrors.numeracion ? '2px solid red' : undefined }
          }}
        />

        <TextField
          label={t('article_name')}
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          error={!!validationErrors.nombre}
          helperText={validationErrors.nombre ? t('required_field') : ''}
          required
          fullWidth
        />

        <TextField
          label={t('requirement_of_the_article')}
          value={formData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          error={!!validationErrors.descripcion}
          helperText={validationErrors.descripcion ? t('required_field') : ''}
          required
          fullWidth
          multiline
          rows={8}
          sx={{ gridColumn: 'span 2' }}
        />

        <FormControl fullWidth>
          <InputLabel>{t('Criticity')}</InputLabel>
          <Select
            value={formData.criticity}
            label={t('Criticity')}
            onChange={(e) => handleChange('criticity', e.target.value)}
          >
            <MenuItem value="Alta">{t('high')}</MenuItem>
            <MenuItem value="Media">{t('medium')}</MenuItem>
            <MenuItem value="Baja">{t('low')}</MenuItem>
            <MenuItem value="Ninguna">{t('none')}</MenuItem>
          </Select>
        </FormControl>

        {showRiskLevel && (
          <FormControl fullWidth>
            <InputLabel>{t('evidence_level')}</InputLabel>
            <Select
              value={formData.risk_level}
              label={t('evidence_level')}
              onChange={(e) => handleChange('risk_level', e.target.value)}
            >
              <MenuItem value="Alto">{t('high')}</MenuItem>
              <MenuItem value="Medio">{t('medium')}</MenuItem>
              <MenuItem value="Bajo">{t('low')}</MenuItem>
            </Select>
          </FormControl>
        )}

        <FormControl fullWidth>
          <InputLabel>{t('category')}</InputLabel>
          <Select
            value={formData.category}
            label={t('category')}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.key} value={cat.key}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>{t('status')}</InputLabel>
          <Select
            value={formData.estado}
            label={t('status')}
            onChange={(e) => handleChange('estado', e.target.value)}
          >
            <MenuItem value="Continuo">{t('Continuo')}</MenuItem>
            <MenuItem value="Abierto">{t('Abierto')}</MenuItem>
            <MenuItem value="Cerrado">{t('Cerrado')}</MenuItem>
            <MenuItem value="Vencido">{t('Vencido')}</MenuItem>
          </Select>
        </FormControl>

        {showEstadoAutoridad && (
          <FormControl fullWidth>
            <InputLabel>{t('authority_status')}</InputLabel>
            <Select
              value={formData.estado_autoridad}
              label={t('authority_status')}
              onChange={(e) => handleChange('estado_autoridad', e.target.value)}
            >
              <MenuItem value="attended">{t('attended')}</MenuItem>
              <MenuItem value="compliment">{t('compliment')}</MenuItem>
            </Select>
          </FormControl>
        )}

        <FormControl fullWidth>
          <InputLabel>GAP</InputLabel>
          <Select
            value={formData.gap}
            label="GAP"
            onChange={(e) => handleChange('gap', e.target.value)}
          >
            <MenuItem value="csin">{t('csin')}</MenuItem>
            <MenuItem value="1gap">{t('1gap')}</MenuItem>
            <MenuItem value="2gap">{t('2gap')}</MenuItem>
            <MenuItem value="3gap">{t('3gap')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>{t('item_type')}</InputLabel>
          <Select
            value={formData.item_type}
            label={t('item_type')}
            onChange={(e) => handleChange('item_type', e.target.value)}
          >
            {articleTypes.map((type, idx) => (
              <MenuItem key={idx} value={type.item_type}>
                {type.item_type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {showParentArticle && (
          <FormControl fullWidth>
            <InputLabel>{t('dependency_id')}</InputLabel>
            <Select
              value={formData.parent_article_id}
              label={t('dependency_id')}
              onChange={(e) => handleChange('parent_article_id', e.target.value)}
            >
              {parentArticles.map((art) => (
                <MenuItem key={art.key} value={art.key}>
                  {art.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl fullWidth sx={{ gridColumn: 'span 2' }}>
          <InputLabel>{t('thematic_group_multiple_option')}</InputLabel>
          <Select
            multiple
            value={formData.id_tema_requisito}
            onChange={(e) => handleChange('id_tema_requisito', e.target.value)}
            input={<OutlinedInput label={t('temático')} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const tema = temas.find((t) => t.key === value);
                  return <Chip key={value} label={tema?.label || value} />;
                })}
              </Box>
            )}
          >
            {temas.map((tema) => (
              <MenuItem key={tema.key} value={tema.key}>
                {tema.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={2}
          label={t('comments')}
          value={formData.comments}
          onChange={(e) => handleChange('comments', e.target.value)}
          sx={{ gridColumn: 'span 2' }}
        />

        <Button
          variant="contained"
          color={isSavedForCurrentRequisito ? "inherit" : "primary"}
          onClick={handleSubmit}
          disabled={loading}
          sx={{ gridColumn: 'span 2', mt: 2 }}
        >
          {loading ? t('saving') : (isSavedForCurrentRequisito ? t('Saved') : t('Save'))}
        </Button>
      </Box>
    </Paper>
  );
}