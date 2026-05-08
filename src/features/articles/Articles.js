// ─── External libraries ───────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Tooltip, Typography, TextField } from '@mui/material';
import { Add, Edit, Check, Cancel, ListAlt } from '@mui/icons-material';

// ─── Own components ───────────────────────────────────────────────────────────
import TableComponent from '../../components/TableComponent';
import SpeedDialComponent from '../../components/SpeedDialComponent';
import ArticleFormModal from './ArticleFormModal';

// ─── Redux ────────────────────────────────────────────────────────────────────
import { fetchArticles } from '../../stores/legal/fetchArticlesSlice';
import {
  selectFilterItemValue,
  setFilter
} from '../../stores/filterSlice';

// ─── Hooks & Services ─────────────────────────────────────────────────────────
import { useHasPermission } from '../../hooks/usePlatformConfig';
import legalService from '../../services/legalService';

// ─── Local selector hook ──────────────────────────────────────────────────────
const useFilterItemValue = (module, fieldName) =>
  useSelector((state) => selectFilterItemValue(state, module, fieldName));

// ─── Translation maps (defined outside to avoid recreation on each render) ────
const CRITICITY_KEYS = { Alta: 'high', Media: 'medium', Baja: 'low', Ninguna: 'none' };
const STATUS_KEYS = { Continuo: 'Continuo', Abierto: 'Abierto', Cerrado: 'Cerrado', Vencido: 'Vencido' };
const GAP_KEYS = { csin: 'csin', '1gap': '1gap', '2gap': '2gap', '3gap': '3gap' };
const AUTHORITY_KEYS = { attended: 'attended', compliment: 'compliment' };

// ─── Editable fields configuration ─────────────────────────────────
const EDITABLE_FIELDS = {
  nombre: {
    type: 'text',
    component: 'TextField',
    props: { size: 'small', fullWidth: true }
  },
  descripcion: {
    type: 'text',
    component: 'TextField',
    props: { size: 'small', fullWidth: true }
  }
};

// Helper function to check if field is editable
const isFieldEditable = (field) => Object.keys(EDITABLE_FIELDS).includes(field);

// ─── Initial dropdown state ───────────────────────────────────────────────────
const INITIAL_DROPDOWN_DATA = {
  categories: [],
  articleTypes: [],
  temas: [],
  parentArticles: []
};

export default function Articles({ optinDrawerData }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Local state ─────────────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [dropdownData, setDropdownData] = useState(INITIAL_DROPDOWN_DATA);

  // Estado para el modo de edición global
  const [globalEditMode, setGlobalEditMode] = useState({
    enabled: false,
    articleId: null,
    editableFields: Object.keys(EDITABLE_FIELDS)
  });

  // Estado para guardar los datos originales antes de entrar en modo edición
  const [originalData, setOriginalData] = useState({});

  // Estado para manejar los valores editables
  const [editableValues, setEditableValues] = useState({});

  // ── Permissions ─────────────────────────────────────────────────────────────
  const canCreateArticle = useHasPermission('legal_matrix', 'create_article');

  // ── Redux state ─────────────────────────────────────────────────────────────
  const { loading, data: articles, error } = useSelector((state) => state.fetchArticles);

  const level1Selected = useFilterItemValue('LegalMatriz', 'level1');
  const level2Selected = useFilterItemValue('LegalMatriz', 'level2');
  const level3Selected = useFilterItemValue('LegalMatriz', 'level3');
  const level4Selected = useFilterItemValue('LegalMatriz', 'level4');
  const listLegalStatus = useFilterItemValue('LegalMatriz', 'legal_list_status');
  const id_requisito_actual = useFilterItemValue('LegalMatriz', 'id_requisito_actual');
  const selected_articulo_id = useFilterItemValue('LegalMatriz', 'selected_articulo_id');
  const isSelected_articulo_id = useFilterItemValue('LegalMatriz', 'isSelected_articulo_id');

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [categoriesRes, typesRes, temasRes] = await Promise.all([
          legalService.getLegalCategories(),
          legalService.getArticleTypes(),
          legalService.getTemas()
        ]);

        setDropdownData((prev) => ({
          ...prev,
          categories: categoriesRes.status === 1 ? categoriesRes.data : [],
          articleTypes: typesRes.status === 1 ? typesRes.data : [],
          temas: temasRes.status === 1 ? temasRes.data : []
        }));
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      }
    };

    loadDropdownData();
  }, []);

  const refreshQuery = useCallback(() => {
    if (!optinDrawerData?.id) return;

    const loadParentData = async () => {
      try {
        const response = await legalService.getIdArticulo(optinDrawerData.id, '');
        if (response.status === 1 && response.data) {
          setDropdownData((prev) => ({ ...prev, parentArticles: response.data }));
        }
      } catch (error) {
        console.error('Error loading parent articles:', error);
      }
    };

    loadParentData();

    const node = level4Selected || level3Selected || level2Selected || level1Selected || '';
    const params = {
      node,
      requisito: optinDrawerData.id,
      page: 1,
      rows: 100,
      sidx: 'id_articulo',
      sord: 'asc'
    };

    dispatch(fetchArticles(params));
  }, [optinDrawerData, level1Selected, level2Selected, level3Selected, level4Selected, dispatch]);

  useEffect(() => {
    refreshQuery();
  }, [refreshQuery]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      if (isSelected_articulo_id && selected_articulo_id) {
        const filtered = articles.filter(
          (a) => a.id_articulo.toString() === selected_articulo_id.toString()
        );
        // Hacer una copia mutable para AG-Grid
        setRowData(filtered.map(article => ({ ...article })));
      } else {
        // Hacer una copia mutable para AG-Grid
        setRowData(articles.map(article => ({ ...article })));
      }
    } else {
      setRowData([]);
    }
  }, [articles, dropdownData.parentArticles, isSelected_articulo_id, selected_articulo_id]);

  // ── Edit mode functions ───────────────────────────────────────────────────────────

  const toggleGlobalEditMode = (articleId) => {
    console.log('[DEBUG] toggleGlobalEditMode llamado con articleId:', articleId);
    
    const wasEditing = globalEditMode.enabled && globalEditMode.articleId === articleId;
    console.log('[DEBUG] Estado anterior de edición:', wasEditing);
    
    if (wasEditing) {
      // Si estaba editando, limpiar datos originales y valores editables
      console.log('[DEBUG] Saliendo del modo edición - limpiando datos');
      console.log('[DEBUG] Datos editables antes de limpiar:', editableValues[articleId]);
      
      // MOSTRAR DATOS QUE SE ENVIARÍAN A LA API
      if (Object.keys(editableValues[articleId] || {}).length > 0) {
        console.log('[DEBUG] === DATOS PARA ENVIAR A LA API ===');
        console.log('[DEBUG] Article ID:', articleId);
        console.log('[DEBUG] Datos originales:', originalData[articleId]);
        console.log('[DEBUG] Campos modificados:', editableValues[articleId]);
        
        // Construir payload para API
        const apiPayload = {
          id_articulo: articleId,
          ...editableValues[articleId]
        };
        console.log('[DEBUG] Payload completo para API:', JSON.stringify(apiPayload, null, 2));
        console.log('[DEBUG] ======================================');
        
        // AQUÍ SE DEBERÍA HACER LA LLAMADA A LA API
        // Ejemplo: legalService.updateArticle(articleId, apiPayload)
      } else {
        console.log('[DEBUG] No hay cambios para guardar');
      }
      
      setOriginalData(prev => {
        const newOriginal = { ...prev };
        delete newOriginal[articleId];
        return newOriginal;
      });
      setEditableValues(prev => {
        const newEditable = { ...prev };
        delete newEditable[articleId];
        return newEditable;
      });
    } 
    else {
      // Si va a entrar en modo edición, guardar los datos originales
      console.log('[DEBUG] Entrando al modo edición - guardando datos originales');
      const currentArticle = rowData.find(article => article.id_articulo === articleId);
      if (currentArticle) {
        console.log('[DEBUG] Artículo encontrado para editar:', currentArticle);
        setOriginalData(prev => ({
          ...prev,
          [articleId]: { ...currentArticle }
        }));
        // Inicializar valores editables con los valores actuales
        setEditableValues(prev => ({
          ...prev,
          [articleId]: {}
        }));
        console.log('[DEBUG] Datos originales guardados, valores editables inicializados');
      } else {
        console.log('[DEBUG] No se encontró el artículo con ID:', articleId);
      }
    }
    
    setGlobalEditMode(prev => ({
      enabled: !prev.enabled,
      articleId: prev.enabled ? null : articleId,
      editableFields: prev.editableFields
    }));
    
    console.log('[DEBUG] Nuevo estado de globalEditMode:', {
      enabled: !globalEditMode.enabled,
      articleId: globalEditMode.enabled ? null : articleId
    });
  };

  // Función para manejar cambios en campos editables
  const handleEditableChange = (articleId, field, value) => {
    console.log('[DEBUG] handleEditableChange llamado con articleId:', articleId, 'field:', field, 'value:', value);
    console.log('[DEBUG] Valor anterior:', editableValues[articleId]?.[field]);
    
    setEditableValues(prev => {
      const newState = {
        ...prev,
        [articleId]: {
          ...prev[articleId],
          [field]: value
        }
      };
      console.log('[DEBUG] Nuevo estado de editableValues:', newState[articleId]);
      return newState;
    });
  };

  // Función para obtener el valor actual de un campo (editable u original)
  const getFieldValue = (articleId, field, originalValue) => {
    if (globalEditMode.enabled && globalEditMode.articleId === articleId && isFieldEditable(field)) {
      return editableValues[articleId]?.[field] ?? originalValue;
    }
    return originalValue;
  };

  // Función para renderizar campo editable
  const renderEditableField = (params) => {
    const { data, value, colDef } = params;
    const field = colDef.field;
    const articleId = data.id_articulo;
    
    const isCurrentlyEditing = globalEditMode.enabled && 
                             globalEditMode.articleId === articleId && 
                             isFieldEditable(field);
    
    if (!isCurrentlyEditing) {
      // Mostrar valor original cuando no está en modo edición
      return value || '-';
    }
    
    const fieldConfig = EDITABLE_FIELDS[field];
    const currentValue = getFieldValue(articleId, field, value);
    
    return (
      <Box sx={{ width: '100%', px: 1 }}>
        <TextField
          {...fieldConfig.props}
          value={currentValue || ''}
          onChange={(e) => handleEditableChange(articleId, field, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </Box>
    );
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    const savedRequisitoId = id_requisito_actual;

    dispatch(setFilter({
      module: 'LegalMatriz',
      updatedFilter: { level1: null, level2: null, level3: null, level4: null }
    }));

    if (savedRequisitoId) {
      dispatch(setFilter({
        module: 'LegalMatriz',
        updatedFilter: { id_requisito_actual: savedRequisitoId }
      }));
    }
  };

  const handleNavigateToRelatedTasks = (taskList = [], articleMeta = {}) => {
    dispatch({
      type: 'filter/setFilter',
      payload: {
        module: 'task',
        updatedFilter: {
          selectedTaskView: null,
          selected_legal_task_ids: [],
          selected_legal_requirement_id: null,
          selected_legal_requirement_title: '',
          isLegalTaskFilterActive: false
        }
      }
    });

    const relatedTaskIds = Array.from(
      new Set(
        (Array.isArray(taskList) ? taskList : [])
          .map((taskItem) => String(taskItem?.id_task || '').trim())
          .filter(Boolean)
      )
    );

    dispatch({
      type: 'filter/setFilter',
      payload: {
        module: 'task',
        updatedFilter: {
          selectedTaskView: 'list',
          selected_legal_task_ids: relatedTaskIds,
          selected_legal_requirement_id: articleMeta?.id ?? null,
          selected_legal_requirement_title: articleMeta?.title ?? '',
          isLegalTaskFilterActive: true
        }
      }
    });

    navigate('/view/events');
  };

  const handleArticleCreated = () => {
    if (!optinDrawerData?.id) return;

    const node = level4Selected || level3Selected || level2Selected || level1Selected || '';
    const params = {
      node,
      requisito: optinDrawerData.id,
      page: 1,
      rows: 100,
      sidx: 'id_articulo',
      sord: 'asc'
    };

    dispatch(fetchArticles(params));
  };

  const getCategoryName = (categoryKey) => {
    const category = dropdownData.categories.find((cat) => cat.key === categoryKey);
    return category ? category.label : categoryKey;
  };

  const getItemTypeName = (itemType) => {
    const type = dropdownData.articleTypes.find((type) => type.item_type === itemType);
    return type ? type.item_type : itemType;
  };

  const getTemasNames = (temasIds) => {
    if (!temasIds) return '';
    return temasIds
      .split(',')
      .map((id) => {
        const tema = dropdownData.temas.find((t) => t.key === id.trim());
        return tema ? tema.label : id;
      })
      .join(', ');
  };

  const getCriticityName = (criticity) => t(CRITICITY_KEYS[criticity] ?? criticity);
  const getStatusName = (status) => t(STATUS_KEYS[status] ?? status);
  const getGapName = (gap) => t(GAP_KEYS[gap] ?? gap);
  const getAuthorityStatusName = (status) => t(AUTHORITY_KEYS[status] ?? status);

  const getParentArticleName = (parentId) => {
    if (!parentId) return '';
    const parent = dropdownData.parentArticles.find(
      (article) => String(article.key) === String(parentId)
    );
    return parent ? parent.label : parentId;
  };

  // ── Column definitions ────────────────────────────────────────────────────────
  const columnDefs = [
    {
      field: 'options',
      headerName: t('options'),
      width: 100,
      cellRenderer: (params) => {
        const isCurrentlyEditing = globalEditMode.enabled && globalEditMode.articleId === params.data.id_articulo;
        
        const tempStatus = String(params.data.estado || '').toLowerCase();
        const matchedStatus = listLegalStatus?.find((status) => {
          const statusNumber = String(status.value_number || '').toLowerCase();
          const statusValue = String(status.value || '').toLowerCase();
          const statusLabel = String(status.label || '').toLowerCase();
          return statusNumber === tempStatus || statusValue === tempStatus || statusLabel === tempStatus;
        });

        return (
          <Box sx={{ pl: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, width: '100%', height: '100%' }}>
            {matchedStatus && (
              <Box
                sx={{
                  position: 'absolute', left: 0, top: 0,
                  height: '100%', width: '5px',
                  bgcolor: matchedStatus.color_code
                }}
              />
            )}
            {!matchedStatus && tempStatus && (
              <Box
                sx={{
                  position: 'absolute', left: 0, top: 0,
                  height: '100%', width: '5px',
                  bgcolor: '#1976d2'
                }}
              />
            )}
            
            {isCurrentlyEditing ? (
              <>
                {/* ✅ */}
                <IconButton
                  size="small"
                  onClick={() => toggleGlobalEditMode(params.data.id_articulo)}
                  sx={{ color: 'success.main' }}
                  title={t('save_changes')}
                >
                  <Check fontSize="small" />
                </IconButton>

                {/* ❌ */}
                <IconButton
                  size="small"
                  onClick={() => toggleGlobalEditMode(params.data.id_articulo)}
                  sx={{ color: 'error.main' }}
                  title={t('Cancel_edit')}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                {/* ✏️ */}
                <IconButton
                  size="small"
                  onClick={() => toggleGlobalEditMode(params.data.id_articulo)}
                  sx={{ color: 'default' }}
                  title={t('edit_row')}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        );
      }
    },
    {
      field: 'id_articulo',
      headerName: t('ID'),
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'right' }
    },
    {
      field: 'numeracion',
      headerName: t('code'),
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'right' }
    },
    {
      field: 'item_type',
      headerName: t('item_type'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => getItemTypeName(params.value)
    },
    {
      field: 'percentage',
      headerName: t('compliance_percentage'),
      filter: 'agNumberColumnFilter',
      cellRenderer: (params) => {
        const cleanValue = String(params.value || '0').replace('%', '');
        const numValue   = parseFloat(cleanValue);
        const badgeData  = isNaN(numValue) ? '0%' : `${numValue}%`;

        const tempStatus = String(params.data.estado).toLowerCase();
        const matchedStatus = listLegalStatus?.find((status) => {
          const statusNumber = String(status.value_number).toLowerCase();
          const statusValue  = String(status.value).toLowerCase();
          const statusLabel  = String(status.label).toLowerCase();
          return statusNumber === tempStatus || statusValue === tempStatus || statusLabel === tempStatus;
        });

        const badgeColor = matchedStatus?.color_code || '#1976d2';

        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              sx={{
                border: `4px solid ${badgeColor}`,
                px: 1,
                borderRadius: '4px',
                color: 'black !important',
                backgroundColor: '#fff',
                maxWidth: '60px',
                textAlign: 'center'
              }}
              className="badge"
            >
              {badgeData}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'tasks',
      headerName: t('tasks'),
      filter: 'agTextColumnFilter',
      filterParams: { values: null },
      cellRenderer: (params) => {
        const rowTaskList    = Array.isArray(params?.data?.task_list) ? params.data.task_list : [];
        const hasRelatedTasks = rowTaskList.length > 0;
        const tasksCount     = rowTaskList.length;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography variant="body2">{tasksCount}</Typography>
            {hasRelatedTasks && (
              <Tooltip title={`${t('show_element')} ${t('tasks')}`}>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNavigateToRelatedTasks(rowTaskList, {
                      id:    params?.data?.id_articulo,
                      title: params?.data?.nombre
                    });
                  }}
                >
                  <ListAlt fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      }
    },
    {
      field: 'nombre',
      headerName: t('name'),
      filter: 'agTextColumnFilter',
      editable: false,
      cellRenderer: (params) => renderEditableField(params),
    },
    {
      field: 'descripcion',
      headerName: t('description'),
      editable: false,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => renderEditableField(params),
    },
    {
      field: 'parent_article_id',
      headerName: t('Artículo padre'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => getParentArticleName(params.value)
    },
    {
      field: 'compensation',
      headerName: t('compensation'),
      filter: 'agTextColumnFilter'
    },
    {
      field: 'numero_actividades',
      headerName: t('number_activities'),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'id_tema_requisito',
      headerName: t('thematic_group'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => getTemasNames(params.value)
    },
    {
      field: 'criticity',
      headerName: t('criticality'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => getCriticityName(params.value)
    },
    {
      field: 'estado',
      headerName: t('status'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => getStatusName(params.value)
    },
    {
      field: 'gap',
      headerName: 'GAP',
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => getGapName(params.value)
    },
    {
      field: 'comments',
      headerName: t('comments'),
      largeText: true,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'estado_autoridad',
      headerName: t('authority_status'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => getAuthorityStatusName(params.value)
    }
  ];

  // ── Speed dial actions ────────────────────────────────────────────────────────
  const speedDialActions = canCreateArticle
    ? [{ icon: <Add />, name: 'Add_articles' }]
    : [];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabla */}
      <TableComponent
        rowData={rowData}
        columnDefs={columnDefs}
        editable={false}
        onRefresh={refreshQuery}
        onResetFilters={handleResetFilters}
      />
      
      {/* Botón + */}
      {canCreateArticle && (
        <SpeedDialComponent
          openSpeedDial={openSpeedDial}
          handleCloseSpeedDial={() => setOpenSpeedDial(false)}
          handleOpenSpeedDial={() => setOpenSpeedDial(true)}
          speedDialActions={speedDialActions}
          handleClick={() => setOpenSpeedDial(false)}
          handleActionClick={() => setIsDrawerOpen(true)}
        />
      )}

      {/* Modal para artículos */}
      <ArticleFormModal
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
        requisitoId={optinDrawerData?.id}
        onSuccess={handleArticleCreated}
      />
    </Box>
  );
}