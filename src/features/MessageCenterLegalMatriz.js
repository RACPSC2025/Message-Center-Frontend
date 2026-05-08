import {
  AddBoxOutlined,
  AddCircleOutline,
  AddShoppingCart,
  Apps,
  AttachFile,
  AutoAwesome,
  CalendarMonth,
  Chat,
  ImportExport,
  ListAlt,
  Tune,
  MoreVertOutlined,
  VisibilityOutlined
} from '@mui/icons-material';
import {
  Box,
  FormControl,
  Button,
  IconButton,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Checkbox,
  Tooltip,
  Typography
} from '@mui/material';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SpeedDialComponent from '../components/SpeedDialComponent';
import TableComponent from '../components/TableComponent';
import { useCascadingFilters } from '../hooks/useCascadingFilters';
import { useHasPermission, useModuleFeature } from '../hooks/usePlatformConfig';
import { fetchListLegals, fetchListLegalsComplete } from '../stores/legal/fetchListLegalsSlice';
import DetallesDrawer from './MessageCenterLegalMatriz/DetallesDrawer';
import LegalMatrizDrawer from './MessageCenterLegalMatriz/LegalMatrizDrawer';
import ListView from './MessageCenterLegalMatriz/ListView';
import OptionsDrawer from './MessageCenterLegalMatriz/OptionsDrawer';
import { DEFAULT_LEGAL_MATRIX_TAB_ID, LEGAL_MATRIX_TAB_IDS } from './MessageCenterLegalMatriz/tabIds';
import BaseFeaturePageLayout from '../components/BaseFeaturePageLayout';
import ReactFlagsSelect from 'react-flags-select';
import {
  fetchAutocompleteOptions,
  removeAllFilters,
  removeFilter,
  selectFilterItemValue,
  selectListOptions,
  selectAppliedFilterModel,
  setFilter
} from '../stores/filterSlice';
import { fetchTaskListLevel } from '../stores/tasks/fetchtaskListLevelSlice';

import { fetchActionList } from '../stores/actions/fetchActionSlice';
import { clone, isEmpty, isObject } from 'radash';

// Custom hook to get list options
const useListOptions = (module, fieldName) =>
  useSelector((state) => selectListOptions(state, module, fieldName));

const EMPTY_ARRAY = [];

const useListOptionsGlobal = (fieldName) =>
  useSelector((state) => state.globalData?.[fieldName] ?? EMPTY_ARRAY);

const useFilterItemValue = (module, fieldName) =>
  useSelector((state) => selectFilterItemValue(state, module, fieldName));

export function Component() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState(DEFAULT_LEGAL_MATRIX_TAB_ID);
  const [tabValue, setTabValue] = useState(0);
  const [idRequisito, setIdRequisito] = useState(0);
  const [optinDrawerData, setOptinDrawerData] = useState();
  const [optinDrawerTitle, setOptinDrawerTitle] = useState('');
  const [openOptionsDrawer, setOpenOptionsDrawer] = useState(false);
  const [openDetallesDrawer, setOpenDetallesDrawer] = useState(false);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const selectedView = useSelector((state) => selectFilterItemValue(state, 'LegalMatriz', 'selectedLegalView') ?? 'requirements');
  const [country, setCountry] = useState('CO');
  const [legals, setLegals] = useState([]);
  let [legalsFilters, setLegalsFilters] = useState([]);
  const [loadLegals, setLoadLegals] = useState(true);
  const [list_type_of_rule, setList_type_of_rule] = useState([]);
  const [level1, setLevel1] = useState('');
  const [test, setTest] = useState([]);
  const canCreateRequirement = useHasPermission('legal_matrix', 'create_requirement');
  const canViewAnalysisIa = Boolean(useModuleFeature('legal_matrix', 'analysis_ia'));
  const [showOptionsMenuButton, setShowOptionsMenuButton] = useState(false);
  const [newlyCreatedLegalId, setNewlyCreatedLegalId] = useState(null);
  const [editInitialData, setEditInitialData] = useState(null);

  const actionStatusItem = useFilterItemValue('LegalMatriz', 'filter_business');
  const actionKeyWords = useFilterItemValue('LegalMatriz', 'filter_keywords');
  const actionCategory = useFilterItemValue('LegalMatriz', 'filter_category');
  const actionNameDateField = useFilterItemValue('LegalMatriz', 'filter_nameDateField');
  const actionStartDate = useFilterItemValue('LegalMatriz', 'filter_start_date');
  const actionEndDate = useFilterItemValue('LegalMatriz', 'filter_end_date');
  const actionStatusTypeOfRule = useFilterItemValue('LegalMatriz', 'filter_type_rule');
  const actionTipo = useFilterItemValue('LegalMatriz', 'filter_tipo');

  const selected_requisito_id = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'selected_requisito_id')
  );
  const isSelected_requisito_id = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'isSelected_requisito_id')
  );

  const selected_articulo_id = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'selected_articulo_id')
  );
  const isSelected_articulo_id = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'isSelected_articulo_id')
  );

  const newActionFormModel = useRef(null);
  const [actionFormModel, setActionFormModel] = useState({});
  const [selectedAction, setSelectedAction] = useState(null);
  const [level1Selected, setLevel1Selected] = useState('');
  const [level2Selected, setLevel2Selected] = useState('');
  const [level3Selected, setLevel3Selected] = useState('');
  const [level4Selected, setLevel4Selected] = useState('');
  const [level5Selected, setLevel5Selected] = useState('');
  const enableLevel5 = Boolean(useFilterItemValue('LegalMatriz', 'enable_level5'));
  const [organizationFilterState, setOrganizationFilterState] = useState({});

  const shouldCreateNewAction = useSelector((state) => state?.globalData?.shouldCreateNewAction);
  const actionDetailsLoading = useSelector((state) => state?.getActionDetails?.loading ?? false);
  const { loading: actionListLoading = false, data: actionListData = {} } = useSelector(
    (state) => state?.actionData?.actionList || {}
  );
  const actionList = actionListData?.data || [];

  const actionStatusList = useListOptions('actions', 'filter_status');
  const actionStatus = actionStatusList.reduce((acc, cur) => {
    const { value, ...rest } = cur;
    acc[value] = { value, ...rest };
    return acc;
  }, {});

  const useAppliedFilterModel = (module) =>
    useSelector((state) => selectAppliedFilterModel(state, module));

  const filterData = useAppliedFilterModel('actions');
  const legalFilterData = useAppliedFilterModel('LegalMatriz');

  const handleCountryChange = (event) => {
    setLegals([]);
    setCountry(event.target.value);
  };

  const [countrySelected, setCountrySelected] = useState('CO');

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    setLegals([]);
  };

  const handleOpenSpeedDial = () => {
    setOpenSpeedDial(true);
  };

  const handleCloseSpeedDial = () => {
    setOpenSpeedDial(false);
  };

  const handleOpenDetallesDrawer = (logtask) => {
    setIdRequisito(logtask.id_requisito);
    setOpenDetallesDrawer(true);
  };

  const handleCloseDetallesDrawer = () => {
    setOpenSpeedDial(false);
    setOpenDetallesDrawer(false);
  };

  const handleOpenOptionsDrawer = (logtask) => {
    setOpenOptionsDrawer(true);
  };

  const handleCloseOptionsDrawer = () => {
    setOpenSpeedDial(false);
    setOpenOptionsDrawer(false);
    setEditInitialData(null);
  };

  const handleCreateSuccess = (legalId) => {
    handleCloseOptionsDrawer();
    setLoadLegals(true);
    setNewlyCreatedLegalId(legalId);
  };

  const handleOpenLegalFormDrawer = () => {
    setOpenCreateTask(true);
  };

  const handleCloseLegalFormDrawer = () => {
    setOpenCreateTask(false);
  };

  const prepareAPIParams = () => {
    const formData = new FormData();

    if (Object.keys(filterData).length > 0) {
      Object.keys(filterData).forEach((filterKey) => {
        formData.append(filterKey, filterData[filterKey]);
      });
    }

    return formData;
  };

  function fixEncoding(str) {
    let bytes = new Uint8Array(str.split('').map((c) => c.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  }

  function getPercentage(legalPercentage) {
    let percentage = isFinite(Number(legalPercentage)) ? Number(legalPercentage) : 0;
    return percentage;
  }

  function getLegalState(state, legalPercentage) {
    let legalState = '';
    let percentage = isFinite(Number(legalPercentage)) ? Number(legalPercentage) : 0;
    if (state === 'cerrado') {
      if (percentage === 100) {
        legalState = 'completed';
      } else {
        legalState = 'not_apply';
      }
    }
    if (state === 'continuo') {
      if (percentage === 0) {
        legalState = 'open';
      } else {
        legalState = 'under_progress';
      }
    }
    if (state === '0') {
      legalState = 'not_apply';
    }
    return legalState;
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const getCorrectText = (text) => {
    const bytes = new Uint8Array([...text].map((c) => c.charCodeAt(0)));
    const correctText = new TextDecoder('utf-8').decode(bytes);
    return correctText;
  };

  const handleFetchLegals = () => {
    dispatch(fetchListLegals()).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const mappedLegals = data?.payload?.data.map((item) => {
          const normalizedTaskList = Array.isArray(item.task_list) ? item.task_list : [];
          return {
            id: item.id_requisito,
            type: item.requisito_general_tipo,
            articles: item.total_articulos,
            tasks:
              item.total_tareas != null && item.total_tareas !== ''
                ? Number(item.total_tareas)
                : normalizedTaskList.length,
            task_list: normalizedTaskList,
            type_of_rule: item.tipo_de_norma,
            number: item.id_tipo_de_norma,
            requirement_name: item.nombre,
            date_of_issue_notification: item.fecha_expedicion,
            effective_date: item.fecha_ejecutoria,
            renovation_date: item.fecha_renovation,
            modified_date: item.modified,
            requirement_description: item.descripcion,
            progress: {
              progress: getLegalState(item.estado, item.percentage),
              percentage: getPercentage(parseFloat(item.percentage).toFixed(2))
            },
            status: item.estado,
            comunications_files: item.comunications_files || 0,
            comunications_count: item.comunications_count || 0,
            comunications_flag: item.comunications_flag || 'in_progress',
            // raw fields preserved for edit form
            numero: item.numero,
            categoria_norma: item.categoria_norma,
            emitidopor: item.emitidopor,
            id_tipo_requisito: item.id_tipo_requisito,
            id_tema_requisito: item.id_tema_requisito,
            normas_relacionadas: item.normas_relacionadas,
            observaciones: item.observaciones,
            gap: item.gap,
            url: item.url,
            apply_lto: item.apply_lto,
            requisito_general: item.requisito_general
          };
        });
        setLegals(mappedLegals);
        setLegalsFilters(mappedLegals);
        console.log('legals', data?.payload);

        const uniqueTypeOfRules = [...new Set(mappedLegals.map((item) => item.type_of_rule))];
        setList_type_of_rule(uniqueTypeOfRules);
      }
    });
  };

  const handleNavigateToRelatedTasks = (taskList = [], requirementMeta = {}) => {
    const relatedTaskIds = Array.from(
      new Set(
        (Array.isArray(taskList) ? taskList : [])
          .map((taskItem) => String(taskItem?.id_task || '').trim())
          .filter(Boolean)
      )
    );

    const requirementId = requirementMeta?.id ?? null;
    const requirementTitle = requirementMeta?.title ?? '';

    handleSetFilterItemValue('task', 'selectedTaskView', 'list');
    handleSetFilterItemValue('task', 'selected_legal_task_ids', relatedTaskIds);
    handleSetFilterItemValue('task', 'selected_legal_requirement_id', requirementId);
    handleSetFilterItemValue('task', 'selected_legal_requirement_title', requirementTitle);
    navigate('/view/events');
  };

  const customHeaderStyle = {
    fontFamily: `'Roboto', 'Arial', sans-serif`
  };

  const dateFilterParams = {
    comparator: (filterDate, cellValue) => {
      if (!cellValue) return -1;

      const [year, month, day] = cellValue.split('-');
      const cellDate = new Date(+year, +month - 1, +day);

      if (cellDate < filterDate) return -1;
      if (cellDate > filterDate) return 1;
      return 0;
    },
    browserDatePicker: true
  };

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 150,
      filter: 'agTextColumnFilter',
      suppressHeaderMenuButton: true,
      suppressHeaderContextMenu: true
    };
  }, []);

  const filterParams = {
    comparator: (filterLocalDateAtMidnight, cellValue) => {
      if (!cellValue) return -1;

      const cellDateParts = cellValue.split('-');

      const cellDate = new Date(
        Number(cellDateParts[0]),
        Number(cellDateParts[1]) - 1,
        Number(cellDateParts[2])
      );

      if (cellDate < filterLocalDateAtMidnight) return -1;
      if (cellDate > filterLocalDateAtMidnight) return 1;
      return 0;
    },
    browserDatePicker: true
  };

  //const listLegalStatus = useFilterItemValue('LegalMatriz', 'legal_list_status');
  const listLegalStatus = useFilterItemValue('LegalMatriz', 'legal_list_status') || [];

  // 🔹 AGREGAR ESTE useEffect para cargar los estados legales
  /*
  useEffect(() => {
    // Cargar opciones de estado legal si aún no están cargadas
    if (!listLegalStatus || listLegalStatus.length === 0) {
      dispatch(fetchAutocompleteOptions({
        module: 'LegalMatriz',
        fieldName: 'legal_list_status'
      }));
    }
  }, []);
  */

  const handleSetFilterItemValue = (module, id, value) => {
    if (!module) {
      console.error("El módulo es undefined o inválido");
      console.log("El módulo es undefined o inválido");
      return;
    }
    const payload = { 
      module, 
      updatedFilter: { [id]: value }
    };
    dispatch(setFilter(payload));
  };
  
  /*
  const getSquareIcon = (params) => {
    const tempStatus = String(params.data.status).toLowerCase();

    const matchedStatus = listLegalStatus.find((status) => {
      const statusNumber = String(status.value_number).toLowerCase();
      const statusLabel = String(status.label).toLowerCase();
      return statusNumber === tempStatus || statusLabel === tempStatus;
    });

    return (
      <Box sx={{ pl: 3 }}>
        {matchedStatus && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: '5px',
              bgcolor: matchedStatus.color_code
            }}
          />
        )}
        {params.data.id}
      </Box>
    );
  };
  */
 const getSquareIcon = (params) => {
  const tempStatus = String(params.data.status).toLowerCase();

  // 🔹 Asegurar que listLegalStatus sea un array
  const statusList = Array.isArray(listLegalStatus) ? listLegalStatus : [];

  const matchedStatus = statusList.find((status) => {
    const statusNumber = String(status.value_number).toLowerCase();
    const statusLabel = String(status.label).toLowerCase();
    return statusNumber === tempStatus || statusLabel === tempStatus;
  });

  return (
    <Box sx={{ pl: 1 }}>
      {matchedStatus && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '5px',
            bgcolor: matchedStatus.color_code
          }}
        />
      )}
      {params.data.id}
    </Box>
  );
};

  const [columnDefs, setColumnDefs] = useState([
    {
      field: 'options',
      headerName: t('options'),
      width: 100,
      cellRenderer: (params) => {
        return (
          <div>
            {showOptionsMenuButton && (
              <Tooltip title={t('options')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    handleOpenOptionsDrawer();
                    setActiveTabId(LEGAL_MATRIX_TAB_IDS.CREATE_LEGAL_REQUIREMENT);
                    setOptinDrawerData(params?.data);
                    setOptinDrawerTitle(`Requisito: ${params?.data.requirement_name} ID: ${params?.data.id}`);
                  }}
                >
                  <MoreVertOutlined />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title={t('edit_requirement')}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  handleOpenOptionsDrawer();
                  setActiveTabId(LEGAL_MATRIX_TAB_IDS.CREATE_LEGAL_REQUIREMENT);
                  setOptinDrawerData(params?.data);
                  setOptinDrawerTitle('Editar requisito');
                  setEditInitialData(params?.data);
                }}
              >
                <VisibilityOutlined />
              </IconButton>
            </Tooltip>

            {canViewAnalysisIa && (
              <Tooltip title={t('analysis_with_amatia')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    handleOpenOptionsDrawer();
                    setActiveTabId(LEGAL_MATRIX_TAB_IDS.ANALYSIS_OF_REGULATION);
                    handleSetFilterItemValue('LegalMatriz', 'requisito_actual', params?.data);
                    handleSetFilterItemValue('LegalMatriz', 'id_requisito_actual', params?.data.id);
                    handleSetFilterItemValue('LegalMatriz', 'selected_requisito_id', params?.data.id);
                    handleSetFilterItemValue('LegalMatriz', 'isSelected_requisito_id', true);
                    //console.log('params data:', params?.data);
                    //console.log('params data ID:', params?.data.id);
                    
                    setOptinDrawerData(params?.data);
                    //setOptinDrawerTitle(`Id: ${params?.data.id} - ${params?.data.requirement_name}`);
                    setOptinDrawerTitle(`Requisito: ${params?.data.requirement_name} ID: ${params?.data.id}`);
                  }}
                >
                  <AutoAwesome />
                </IconButton>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      field: 'ID',
      headerName: 'ID',
      type: 'string',
      width: 60,
      cellRenderer: (params) => {
        return getSquareIcon(params);
      },
    },
    {
      field: 'number',
      headerName: t('number'),
      filter: 'agNumberColumnFilter',
      width: 100,
      //maxWidth: 10000
    },
    {
      field: 'comunications',
      headerName: t('communications'),
      width: 130,
      cellRenderer: (params) => {
        const filesCount = params?.data?.comunications_files || 0;
        const communicationsCount = params?.data?.comunications_count || 0;
        const flag = params?.data?.comunications_flag || 'in_progress';
        
        // Determinar color según el flag
        const getColor = () => {
          switch(flag) {
            case 'resolved': return 'success.main';
            case 'expired': return 'error.main';
            case 'in_progress': return 'warning.main';
            default: return 'action.active';
          }
        };
        
        // Handler para abrir el drawer de comunicaciones
        const handleOpenCommunications = () => {
          // Guardar el registro actual en Redux
          handleSetFilterItemValue('LegalMatriz', 'requisito_actual', params?.data);
          handleSetFilterItemValue('LegalMatriz', 'id_requisito_actual', params?.data.id);
          handleSetFilterItemValue('LegalMatriz', 'selected_requisito_id', params?.data.id);
          handleSetFilterItemValue('LegalMatriz', 'isSelected_requisito_id', true);

          navigate('/view/legal_comunications');
        };
        
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              height: '100%'
            }}
          >
            {/* Ícono y contador de comunicaciones con color según flag - CLICKEABLE */}
            <Tooltip title={t('view_communications')}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.7
                  }
                }}
                onClick={handleOpenCommunications}
              >
                <Chat fontSize="small" sx={{ color: getColor() }} />
                <Typography variant="body2" fontWeight="bold">
                  {communicationsCount}
                </Typography>
              </Box>
            </Tooltip>
            
            {/* Ícono y contador de archivos adjuntos */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachFile fontSize="small" sx={{ color: 'action.active' }} />
              <Typography variant="body2" fontWeight="bold">
                {filesCount}
              </Typography>
            </Box>
          </Box>
        );
      }
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
        const badgeData = params?.value?.percentage ? `${params?.value?.percentage}%` : '0%';

        const tempStatus = String(params.data.status).toLowerCase();

        // 🔹 Asegurar que listLegalStatus sea un array
        const statusList = Array.isArray(listLegalStatus) ? listLegalStatus : [];

        const matchedStatus = statusList.find((status) => {
          const statusNumber = String(status.value_number).toLowerCase();
          const statusValue = String(status.value).toLowerCase();
          const statusLabel = String(status.label).toLowerCase();

          return (
            statusNumber === tempStatus ||
            statusValue === tempStatus ||
            statusLabel === tempStatus
          );
        });

        const badgeColor = matchedStatus?.color_code || '#1976d2';

        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
          </Box>
        );
      } 
    },
    {
      field: 'type',
      headerName: t('type'),
      filter: 'agSeColumnFilter',
      width: 90,
      filterParams: {
        values: null
      }
    },
    {
      field: 'articles',
      headerName: t('articles'),
      filter: 'agSeColumnFilter',
      width: 100,
      filterParams: {
        values: null
      },

      cellRenderer: (params) => {
        return (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Typography>{params?.value}</Typography>
            <IconButton
              size="small"
              color="primary"
              title={t('Add_articles')}
              onClick={() => {
                handleSetFilterItemValue('LegalMatriz', 'requisito_actual', params?.data);
                handleSetFilterItemValue('LegalMatriz', 'id_requisito_actual', params?.data.id);
                handleSetFilterItemValue('LegalMatriz', 'selected_requisito_id', params?.data.id);
                handleSetFilterItemValue('LegalMatriz', 'isSelected_requisito_id', true);
                handleOpenOptionsDrawer();
                setActiveTabId(LEGAL_MATRIX_TAB_IDS.ARTICLES);
                setOptinDrawerData(params?.data);
                //setOptinDrawerTitle(`Id: ${params?.data.id} - ${params?.data.requirement_name}`);
                setOptinDrawerTitle(`Requisito: ${params?.data.requirement_name} ID: ${params?.data.id}`);
              }}
            >
              <AddBoxOutlined />
            </IconButton>
          </Box>
        );
      }
    },
    {
      field: 'tasks',
      headerName: t('tasks'),
      filter: 'agTextColumnFilter',
      width: 90,
      filterParams: {
        values: null
      },
      cellRenderer: (params) => {
        const rowTaskList = Array.isArray(params?.data?.task_list) ? params.data.task_list : [];
        const hasRelatedTasks = rowTaskList.length > 0;
        const tasksCount = rowTaskList.length;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography variant="body2">{tasksCount}</Typography>
            {hasRelatedTasks && (
              <Tooltip title={`${t('show_element')} ${t('tasks')}`}>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSetFilterItemValue('LegalMatriz', 'selected_requisito_id', params?.data.id);
                    handleSetFilterItemValue('LegalMatriz', 'isSelected_requisito_id', true);
                    handleNavigateToRelatedTasks(rowTaskList, {
                      id: params?.data?.id,
                      title: params?.data?.requirement_name
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
      field: 'requirement_name',
      headerName: t('requirement_name'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        return (
          <Tooltip
            title={
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                {params?.value || ''}
              </span>
            }
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'rgba(97, 97, 97, 1)',
                  borderRadius: 4,
                  color: '#fff',
                  fontFamily: 'Roboto, sans-serif',
                  padding: '4px 8px',
                  fontSize: '0.5rem',
                  maxWidth: 300,
                  margin: 2,
                  wordWrap: 'break-word',
                  fontWeight: 500
                }
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'default',
              }}
            >
              {params?.value}
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'requirement_description',
      headerName: t('requirement_description'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        return (
          <Tooltip 
            title={
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                {params?.value || ''}
              </span>
            }
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'rgba(97, 97, 97, 1)',
                  borderRadius: 4,
                  color: '#fff',
                  fontFamily: 'Roboto, sans-serif',
                  padding: '4px 8px',
                  fontSize: '0.5rem',
                  maxWidth: 300,
                  margin: 2,
                  wordWrap: 'break-word',
                  fontWeight: 500
                }
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'default'
              }}
            >
              {params?.value}
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'type_of_rule',
      headerName: t('type_of_rule'),
      filter: 'agTextColumnFilter',
      filterParams: {
        values: null
      }
    },
    {
      field: 'date_of_issue_notification',
      headerName: t('date_of_issue_notification'),
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams
    },
    {
      field: 'effective_date',
      headerName: t('effective_date'),
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams
    },
    {
      field: 'renovation_date',
      headerName: t('renovation_date'),
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams
    },
    {
      field: 'modified_date',
      headerName: t('modified_date'),
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams
    }
  ]);

  useEffect(() => {
    setColumnDefs((prev) =>
      prev.map((column) =>
        column.field === 'analysis_with_amatia'
          ? {
              ...column,
              hide: !canViewAnalysisIa
            }
          : column
      )
    );
  }, [canViewAnalysisIa]);

  const speedDialActions = canCreateRequirement
    ? [{ icon: <AddCircleOutline />, name: t('create_legal_requirement') }]
    : [];

  const getTypeFilterLegalsByTypeOfRule = (
    legalsFiltersTemp,
    actionStatusTypeOfRule,
    actionStartDate,
    actionEndDate,
    actionNameDateField,
    actionCategory
  ) => {
    if (actionStatusTypeOfRule !== null && actionStatusTypeOfRule !== '') {
      legalsFiltersTemp = legalsFiltersTemp.filter(
        (item) => item.type_of_rule === actionStatusTypeOfRule
      );
      getTypeFilterLegalsByDate(legalsFiltersTemp, actionStartDate, actionEndDate);
    } else {
      getTypeFilterLegalsByDate(legalsFiltersTemp, actionStartDate, actionEndDate);
    }
  };

  const getTypeFilterLegalsByDate = (legalsFiltersTemp, actionStartDate, actionEndDate) => {
    if (
      actionNameDateField !== null &&
      actionNameDateField !== '' &&
      actionNameDateField != undefined
    ) {
      if (actionStartDate !== null && actionStartDate !== '' && actionStartDate != undefined) {
        const selectedStartDate = new Date(actionStartDate);
        legalsFiltersTemp = legalsFiltersTemp.filter(
          (item) => new Date(item[actionNameDateField]) >= selectedStartDate
        );
        if (actionEndDate !== null && actionEndDate !== '' && actionEndDate != undefined) {
          const selectedEndDate = new Date(actionEndDate);
          legalsFiltersTemp = legalsFiltersTemp.filter(
            (item) => new Date(item[actionNameDateField]) <= selectedEndDate
          );
        }
      }
    }
    setLegalsFilters(legalsFiltersTemp);
  };

  useEffect(() => {
    if (loadLegals) {
      setLoadLegals(false);
      handleFetchLegals();
    }
  }, [loadLegals]);

  // useEffect(() => {
  //   if (legals.length > 0) {
  //     setLegalsFilters(legals);
  //   }
  // }, [legals]);

  useEffect(() => {
    let legalsFiltersTemp = legals;
    console.log("isSelected_requisito_id: ", isSelected_requisito_id);
    console.log("selected_requisito_id: ", selected_requisito_id);
    console.log("isSelected_articulo_id: ", isSelected_articulo_id);
    console.log("selected_articulo_id: ", selected_articulo_id);

    if (isSelected_requisito_id && selected_requisito_id) {
      legalsFiltersTemp = legalsFiltersTemp.filter(
        (item) => item.id.toString() === selected_requisito_id.toString()
      );
      setLegalsFilters(legalsFiltersTemp);
      return;
    }

    if (actionTipo && actionTipo.trim() !== '') {
      legalsFiltersTemp = legalsFiltersTemp.filter(
        (item) => item.type === actionTipo
      );
    }

    if (actionKeyWords && actionKeyWords.trim() !== '' && legals.length > 0) {
      legalsFiltersTemp = legalsFiltersTemp.filter(
        (item) =>
          item.requirement_description.match(new RegExp(actionKeyWords, 'i')) ||
          item.requirement_name.match(new RegExp(actionKeyWords, 'i'))
      );
      getTypeFilterLegalsByTypeOfRule(
        legalsFiltersTemp,
        actionStatusTypeOfRule,
        actionStartDate,
        actionEndDate,
        actionNameDateField,
        actionCategory
      );
    } else {
      getTypeFilterLegalsByTypeOfRule(
        legalsFiltersTemp,
        actionStatusTypeOfRule,
        actionStartDate,
        actionEndDate
      );
    }
  }, [
    actionKeyWords,
    actionTipo,
    legals,
    actionStatusTypeOfRule,
    actionStartDate,
    actionEndDate,
    actionNameDateField,
    actionCategory,
    isSelected_requisito_id,
    selected_requisito_id
  ]);

  useEffect(() => {
    if (isSelected_articulo_id && selected_articulo_id && selected_requisito_id) {
      setOptinDrawerData({ id: selected_requisito_id });
      setActiveTabId(LEGAL_MATRIX_TAB_IDS.ARTICLES);
      handleOpenOptionsDrawer();
    }
  }, [isSelected_articulo_id, selected_articulo_id, selected_requisito_id]);

  const getFormDataFromSelectedValues = (selectedValues) => {
    const formData = new FormData();
    Object.entries(selectedValues).forEach(([key, value]) => {
      if (value) {
        formData.append(`id_${key}`, value);
      }
    });
    return formData;
  };

  const fetchLevelData = (level, formData = null) => {
    return new Promise((resolve, reject) => {
      const payload = formData ? { level, formData } : { level };

      dispatch(fetchTaskListLevel(payload))
        .then((response) => {
          const apiResponse = response?.payload?.data;

          if (apiResponse?.messages === 'Success' && Array.isArray(apiResponse?.data)) {
            const levelOptions = apiResponse.data.map((item) => ({
              value: item.value,
              label: item.label
            }));
            resolve(levelOptions);
          } else {
            reject(new Error(`Failed to fetch level ${level} data`));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const filterDefinitions = useMemo(() => {
    const definitions = [
      {
        id: 'level1',
        label: 'Business',
        fetchOptions: async () => fetchLevelData(1)
      },
      {
        id: 'level2',
        label: 'Company',
        fetchOptions: async (parentValues) => {
          const formData = getFormDataFromSelectedValues(parentValues);
          return fetchLevelData(2, formData);
        }
      },
      {
        id: 'level3',
        label: 'Region',
        fetchOptions: async (parentValues) => {
          const formData = getFormDataFromSelectedValues(parentValues);
          return fetchLevelData(3, formData);
        }
      },
      {
        id: 'level4',
        label: 'Location',
        fetchOptions: async (parentValues) => {
          const formData = getFormDataFromSelectedValues(parentValues);
          return fetchLevelData(4, formData);
        }
      }
    ];

    if (enableLevel5) {
      definitions.push({
        id: 'level5',
        label: 'Level 5',
        fetchOptions: async (parentValues) => {
          const formData = getFormDataFromSelectedValues(parentValues);
          return fetchLevelData(5, formData);
        }
      });
    }

    return definitions;
  }, [enableLevel5]);

  const getInitialOrganizationValues = useMemo(() => {
    const initialValues = {
      level1: legalFilterData?.level1 || '',
      level2: legalFilterData?.level2 || '',
      level3: legalFilterData?.level3 || '',
      level4: legalFilterData?.level4 || ''
    };

    if (enableLevel5) {
      initialValues.level5 = legalFilterData?.level5 || '';
    }

    return initialValues;
  }, [enableLevel5, legalFilterData]);

  const handleOrganizationFilterChange = (values) => {
    const previousValues = { ...organizationFilterState };
    setOrganizationFilterState(values);

    setLevel1Selected(values.level1 || '');
    setLevel2Selected(values.level2 || '');
    setLevel3Selected(values.level3 || '');
    setLevel4Selected(values.level4 || '');
    setLevel5Selected(values.level5 || '');

    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== previousValues[key]) {
        dispatch(
          setFilter({
            module: 'LegalMatriz',
            updatedFilter: { [key]: value }
          })
        );
      }
    });

    Object.entries(previousValues).forEach(([key, prevValue]) => {
      if (prevValue && (!values[key] || values[key] === '')) {
        dispatch(
          removeFilter({
            module: 'LegalMatriz',
            fieldID: key
          })
        );
      }
    });
  };

  const {
    filters: cascadingFilters,
    handleFilterChange: handleCascadingFilterChange,
    resetFilters: resetCascadingFilters
  } = useCascadingFilters({
    filterDefinitions,
    initialValues: getInitialOrganizationValues,
    onFilterChange: handleOrganizationFilterChange
  });

  function handleClearFilters() {
    resetCascadingFilters();
    ['level1', 'level2', 'level3', 'level4', 'level5'].forEach((key) => {
      dispatch(
        removeFilter({
          module: 'LegalMatriz',
          fieldID: key
        })
      );
    });
    setOrganizationFilterState({});
    setLevel1Selected('');
    setLevel2Selected('');
    setLevel3Selected('');
    setLevel4Selected('');
    setLevel5Selected('');
  }

  const handleResetFilters = () => {
    // Primero desactivamos las banderas de selección para evitar que el useEffect filtre de nuevo
    handleSetFilterItemValue('LegalMatriz', 'isSelected_requisito_id', false);
    handleSetFilterItemValue('LegalMatriz', 'isSelected_articulo_id', false);

    const filtersToClear = [
      'filter_business',
      'filter_keywords',
      'filter_category',
      'filter_nameDateField',
      'filter_start_date',
      'filter_end_date',
      'filter_type_rule',
      'filter_tipo',
      'selected_requisito_id',
      'selected_articulo_id',
      'id_requisito_actual',
      'requisito_actual'
    ];
    
    filtersToClear.forEach(filter => {
       handleSetFilterItemValue('LegalMatriz', filter, null);
    });

    // Forzamos la actualización de la tabla con todos los registros originales
    if (legals && legals.length > 0) {
      setLegalsFilters(legals);
    }
  };

  const handleFetchActionList = () => {
    const formData = prepareAPIParams();
    dispatch(fetchActionList(formData));
  };

  const handleActionForm = (formData) => {
    dispatch(submitActionForm(formData)).then((data) => {
      if (data?.payload?.status === 1) {
        showSuccessMsg(data?.payload?.messages);
        setTimeout(() => {
          handleFetchActionList();
          handleCloseDrawer();
        }, 3000);
      } else {
        showErrorMsg(data?.payload ?? data?.payload?.messages);
      }
    });
  };

  const handleSubmitActionData = () => {
    if (isObject(selectedAction) || shouldCreateNewAction) {
      const { action_id = '', action_table: module_string_id = 'hs_action' } = selectedAction || {};
      const formData = { ...actionFormModel, action_id, module_string_id };
      handleActionForm(formData);
    }
  };

  const filterArray = cascadingFilters.map((filter) => ({
    id: filter.id,
    label: filter.label,
    value: filter.value,
    options: filter.options,
    isDisabled: filter.isDisabled || filter.isLoading
  }));

  useEffect(() => {
    handleFetchActionList();
  }, [filterData]);

  useEffect(() => {
    if (isObject(selectedAction) && !isEmpty(selectedAction)) {
      const { id: dashboard_action_id, action_table, action_id } = selectedAction;
      const formData = { dashboard_action_id, action_table, action_id };
      handleGetActionDetails(formData);
    }
  }, [selectedAction]);

  useEffect(() => {
    if (shouldCreateNewAction) {
      setViewType('view_action');
      setDrawerOpen(true);
    }
    setActionFormModel(clone(newActionFormModel.value));
  }, [shouldCreateNewAction]);

  const selectedColumns = useSelector((state) =>
    selectFilterItemValue(state, 'task', 'selectedColumns')
  );

  const adjustmentOptions = [{ label: 'Select columns', value: 'selectedColumnsOption' }];

  const [selectedAdjustments, setSelectedAdjustments] = useState([]);
  const [showTopActionButtons, setShowTopActionButtons] = useState(false);

  const [adjustmentAnchorEl, setAdjustmentAnchorEl] = useState(null);
  const [selectedAdjustmentOption, setSelectedAdjustmentOption] = useState(null);

  const handleOpenAdjustments = (e) => {
    setAdjustmentAnchorEl(e.currentTarget);
  };

  const handleCloseAdjustments = () => {
    setAdjustmentAnchorEl(null);
  };

  const handleSelectAdjustment = (option) => {
    setSelectedAdjustmentOption(option);
    handleCloseAdjustments();
  };

  const handleToggleAdjustment = () => {
    const newValue = !selectedColumns;
    handleSetFilterItemValue('task', 'selectedColumns', newValue);
    handleCloseAdjustments();
  };

  return (
    <BaseFeaturePageLayout>
      <Box
        className="px-5"
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white'
        }}
      >
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {selectedView === 'requirements' ? (
            <TableComponent
              rowData={legalsFilters}
              columnDefs={columnDefs}
              onRefresh={() => setLoadLegals(true)}
              onResetFilters={handleResetFilters}
              getRowStyle={(params) => {
                if (newlyCreatedLegalId && String(params.data?.id) === String(newlyCreatedLegalId)) {
                  return { outline: '2px solid #1976d2', outlineOffset: '-1px', backgroundColor: '#e3f2fd' };
                }
                return null;
              }}
            />
          ) : selectedView === 'list' ? (
            <ListView legals={legalsFilters} />
          ) : null}
        </Box>

        {canCreateRequirement && (
          <SpeedDialComponent
            openSpeedDial={openSpeedDial}
            handleCloseSpeedDial={() => setOpenSpeedDial(false)}
            handleOpenSpeedDial={() => setOpenSpeedDial(true)}
            speedDialActions={speedDialActions}
            handleClick={() => {
              handleOpenOptionsDrawer();
              setActiveTabId(LEGAL_MATRIX_TAB_IDS.CREATE_LEGAL_REQUIREMENT);
              setOptinDrawerData(null);
              setOptinDrawerTitle(t('create_legal_requirement'));
            }}
          />
        )}

        <OptionsDrawer
          openOptionsDrawer={openOptionsDrawer}
          onCloseOptionsDrawer={handleCloseOptionsDrawer}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
          optinDrawerData={optinDrawerData}
          Title={optinDrawerTitle}
          onlyShowCreateRequirementTab={activeTabId === LEGAL_MATRIX_TAB_IDS.CREATE_LEGAL_REQUIREMENT && optinDrawerTitle === t('create_legal_requirement')}
          onCreateSuccess={handleCreateSuccess}
          editInitialData={editInitialData}
        />

        <DetallesDrawer
          openDetallesDrawer={openDetallesDrawer}
          onCloseDetallesDrawer={handleCloseDetallesDrawer}
          idRequisito={idRequisito}
        />

        <LegalMatrizDrawer
          openCreateTask={openCreateTask}
          setOpenCreateTask={handleCloseLegalFormDrawer}
        />
      </Box>
    </BaseFeaturePageLayout>
  );
}

Component.displayName = 'MessageCenterLegalMatriz';
export default Component;
