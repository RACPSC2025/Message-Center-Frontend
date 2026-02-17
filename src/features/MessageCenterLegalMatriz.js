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
  MoreVertOutlined
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
import SpeedDialComponent from '../components/SpeedDialComponent';
import TableComponent from '../components/TableComponent';
import { fetchListLegals, fetchListLegalsComplete } from '../stores/legal/fetchListLegalsSlice';
import DetallesDrawer from './MessageCenterLegalMatriz/DetallesDrawer';
import LegalMatrizDrawer from './MessageCenterLegalMatriz/LegalMatrizDrawer';
import ListView from './MessageCenterLegalMatriz/ListView';
import OptionsDrawer from './MessageCenterLegalMatriz/OptionsDrawer';
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

import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';

const myClient = new ApolloClient({
  uri: 'https://api.spacex.land/graphql',
  cache: new InMemoryCache()
});

// Custom hook to get list options
const useListOptions = (module, fieldName) =>
  useSelector((state) => selectListOptions(state, module, fieldName));

const useListOptionsGlobal = (fieldName) =>
  useSelector((state) => state.globalData?.[fieldName] ?? []);

const useFilterItemValue = (module, fieldName) =>
  useSelector((state) => selectFilterItemValue(state, module, fieldName));

export function Component() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [idRequisito, setIdRequisito] = useState(0);
  const [optinDrawerData, setOptinDrawerData] = useState();
  const [optinDrawerTitle, setOptinDrawerTitle] = useState('');
  const [openOptionsDrawer, setOpenOptionsDrawer] = useState(false);
  const [openDetallesDrawer, setOpenDetallesDrawer] = useState(false);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [selectedView, setSelectedView] = useState('requirements');
  const [requirementIconColor, setRequirementIconColor] = useState('warning');
  const [listaIconColor, setListaIconColor] = useState('action');
  const [country, setCountry] = useState('CO');
  const [legals, setLegals] = useState([]);
  let [legalsFilters, setLegalsFilters] = useState([]);
  const [loadLegals, setLoadLegals] = useState(true);
  const [list_type_of_rule, setList_type_of_rule] = useState([]);
  const [level1, setLevel1] = useState('');
  const [test, setTest] = useState([]);

  const actionStatusItem = useFilterItemValue('LegalMatriz', 'filter_business');
  const actionKeyWords = useFilterItemValue('LegalMatriz', 'filter_keywords');
  const actionCategory = useFilterItemValue('LegalMatriz', 'filter_category');
  const actionNameDateField = useFilterItemValue('LegalMatriz', 'filter_nameDateField');
  const actionStartDate = useFilterItemValue('LegalMatriz', 'filter_start_date');
  const actionEndDate = useFilterItemValue('LegalMatriz', 'filter_end_date');
  const actionStatusTypeOfRule = useFilterItemValue('LegalMatriz', 'filter_type_rule');

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
  const [level1Options, setLevel1Options] = useState([]);
  const [level1Selected, setLevel1Selected] = useState('');
  const [level2Options, setLevel2Options] = useState([]);
  const [level2Selected, setLevel2Selected] = useState('');
  const [loadingLevel2, setLoadingLevel2] = useState(true);
  const [level3Options, setLevel3Options] = useState([]);
  const [level3Selected, setLevel3Selected] = useState('');
  const [loadingLevel3, setLoadingLevel3] = useState(true);
  const [level4Options, setLevel4Options] = useState([]);
  const [level4Selected, setLevel4Selected] = useState('');
  const [loadingLevel4, setLoadingLevel4] = useState(true);
  const [level5ptions, setLevel5Options] = useState([]);
  const [level5Selected, setLevel5Selected] = useState('');
  const [loadingLevel5, setLoadingLevel5] = useState(true);

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
        const legals = data?.payload?.data.map((item) => ({
          id: item.id_requisito,
          type: item.requisito_general_tipo,
          articles: item.total_articulos,
          tasks: item.total_tareas,
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
        }));
        setLegals(legals);
        setLegalsFilters(legals);
        console.log('legals', data?.payload);

        const uniqueTypeOfRules = [...new Set(legals.map((item) => item.type_of_rule))];
        setList_type_of_rule(uniqueTypeOfRules);
      }
    });
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

  const [columnDefs, setColumnDefs] = useState([
    {
      field: 'ID',
      headerName: 'ID',
      type: 'string',
      width: 100,
      cellRenderer: (params) => {
        return getSquareIcon(params);
      },
    },
    {
      field: 'comunications',
      headerName: t('communications'),
      width: 140,
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
          
          // Abrir el drawer en la pestaña de comunicaciones (índice 1)
          setOptinDrawerData(params?.data);
          setOptinDrawerTitle(`Requisito: ${params?.data.requirement_name} ID: ${params?.data.id}`);
          setActiveTab(1); // Tab de regulatory_communications
          handleOpenOptionsDrawer();
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
      field: '',
      headerName: t('AMAT-IA'),
      headerComponent: () => (
        <div
          style={customHeaderStyle}>
          {t('AMAT-IA')}
        </div>
      ),
      headerStyle: customHeaderStyle,
      cellRenderer: (params) => {
        return (
          <div>
            <Tooltip title={t('analysis_with_amatia')}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  handleOpenOptionsDrawer();
                  setActiveTab(2);
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
          </div>
        );
      }
    },
    {
      field: 'options',
      headerName: t('options'),
      cellRenderer: (params) => {
        return (
          <div>
            <Tooltip title={t('options')}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  handleOpenOptionsDrawer();
                  setActiveTab(0);
                  setOptinDrawerData(params?.data);
                  //setOptinDrawerTitle(`Id: ${params?.data.id} - ${params?.data.requirement_name}`);
                  setOptinDrawerTitle(`Requisito: ${params?.data.requirement_name} ID: ${params?.data.id}`);
                }}
              >
                <MoreVertOutlined />
              </IconButton>
            </Tooltip>
          </div>
        );
      }
    },
    {
      field: 'type',
      headerName: t('type'),
      filter: 'agSeColumnFilter',
      filterParams: {
        values: null
      }
    },
    {
      field: 'articles',
      headerName: t('articles'),
      filter: 'agSeColumnFilter',
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
                handleOpenOptionsDrawer();
                setActiveTab(3);
                setOptinDrawerData(params?.data);
                //setOptinDrawerTitle(`Id: ${params?.data.id} - ${params?.data.requirement_name}`);
                setOptinDrawerTitle(`Requisito: ${params?.data.requirement_name} ID: ${params?.data.id}`);
                handleSetFilterItemValue('LegalMatriz', 'selected_requisito_id', params?.data.id);
                handleSetFilterItemValue('LegalMatriz', 'isSelected_requisito_id', true);
              }}
            >
              <AddBoxOutlined />
            </IconButton>
          </Box>
        );
      }
    },
    {
    field: 'progress',
      headerName: t('progress'),
      filter: 'agTextColumnFilter',
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
      field: 'tasks',
      headerName: t('tasks'),
      filter: 'agTextColumnFilter',
      filterParams: {
        values: null
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
      field: 'number',
      headerName: t('number'),
      filter: 'agNumberColumnFilter',
      maxWidth: 10000
    },
    {
      field: 'requirement_name',
      headerName: t('requirement_name'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        return (
          <Tooltip title={params?.value || ''} placement="top">
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
      field: 'requirement_description',
      headerName: t('requirement_description'),
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        return (
          <Tooltip title={params?.value || ''} placement="top">
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

  const speedDialActions = [
    { icon: <AddCircleOutline />, name: t('create_legal_requirement') },
  ];

  const viewTab = [
    {
      name: 'requirements',
      icon: <CalendarMonth color={requirementIconColor} fontSize="medium" />
    },
  ];

  const adjustmensts = {
    name: 'adjustments',
    icon: <Tune fontSize="medium" />
  };

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
      setActiveTab(2);
      handleOpenOptionsDrawer();
    }
  }, [isSelected_articulo_id, selected_articulo_id, selected_requisito_id]);

  function handleClearFilters() {
    setLevel1Selected('');
    setLevel2Selected('');
    setLevel3Selected('');
    setLevel4Selected('');
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

  const handleFetchTaskListLevel = (level, formData) => {
    const optionSetters = {
      1: setLevel1Options,
      2: setLevel2Options,
      3: setLevel3Options,
      4: setLevel4Options
    };
    const loadingSetter = {
      2: setLoadingLevel2,
      3: setLoadingLevel3,
      4: setLoadingLevel4
    };
    loadingSetter[level]?.(true);
    const data = { level, formData };
    dispatch(fetchTaskListLevel(data)).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const level1Options = data?.payload?.data.map((item) => ({
          value: item.value,
          label: item.label
        }));

        optionSetters[level]?.(level1Options);
      }
      loadingSetter[level]?.(false);
    });
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

  const filterArray = [
    {
      id: 'level1',
      label: 'Business',
      value: level1Selected,
      handleChange: setLevel1Selected,
      options: level1Options,
      isDisabled: false
    },
    {
      id: 'level2',
      label: 'Company',
      value: level2Selected,
      handleChange: setLevel2Selected,
      options: level2Options,
      isDisabled: loadingLevel2
    },
    {
      id: 'level3',
      label: 'Region',
      value: level3Selected,
      handleChange: setLevel3Selected,
      options: level3Options,
      isDisabled: loadingLevel3
    },
    {
      id: 'level4',
      label: 'Location',
      value: level4Selected,
      handleChange: setLevel4Selected,
      options: level4Options,
      isDisabled: loadingLevel4
    }
  ];

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

  useEffect(() => {
    handleFetchTaskListLevel(1);
  }, []);

  useEffect(() => {
    if (level1Selected) {
      setLoadingLevel2(true);
      const level2FormData = new FormData();
      level2FormData.append('id_level1', level1Selected);
      handleFetchTaskListLevel(2, level2FormData);
    }
  }, [level1Selected]);

  useEffect(() => {
    if (level2Selected) {
      setLoadingLevel3(true);
      const level3FormData = new FormData();
      level3FormData.append('id_level2', level2Selected);
      handleFetchTaskListLevel(3, level3FormData);
    }
  }, [level2Selected]);

  useEffect(() => {
    if (level3Selected) {
      setLoadingLevel4(true);
      const level4FormData = new FormData();
      level4FormData.append('id_level3', level3Selected);
      handleFetchTaskListLevel(4, level4FormData);
    }
  }, [level3Selected]);

  const selectedColumns = useSelector((state) =>
    selectFilterItemValue(state, 'task', 'selectedColumns')
  );

  const adjustmentOptions = [{ label: 'Select columns', value: 'selectedColumnsOption' }];

  const [selectedAdjustments, setSelectedAdjustments] = useState([]);

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
        <Box className="xl:flex items-center justify-between gap-6 w-full py-2 mb-2">
          <Box className="flex items-center justify-center gap-6">
            {
            <Box display="flex" justifyContent="start" gap={1} alignItems="center" flexGrow={1}>
              {filterArray?.map((filter, filterIndex) => {
                return (
                  <FormControl sx={{ minWidth: 100 }} size="small" key={filterIndex}>
                    <InputLabel id={filter?.id}>{t(filter?.label)}</InputLabel>
                    <Select
                      labelId={filter?.id}
                      id={filter?.id}
                      value={filter?.value}
                      disabled={filter?.isDisabled}
                      onChange={(e) => filter?.handleChange(e.target.value)}
                    >
                      {filter?.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              })}

              <Button variant="outlined" color="primary" onClick={handleClearFilters}>
                {t('clear_filters')}
              </Button>
            </Box>
          }
          </Box>

          <Box className="flex gap-6 mt-2 xl:mt-0">
            {viewTab.map((tab, tabIndex) => {
              return (
                <Box
                  key={tabIndex}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => {
                    setSelectedView(tab.name);
                    if (tab.name === 'requirements') {
                      setRequirementIconColor('warning');
                      setListaIconColor('action');
                    } else if (tab.name === 'list') {
                      setRequirementIconColor('action');
                      setListaIconColor('warning');
                    }
                  }}
                >
                  {tab.icon}
                  {<Typography variant="h8">{t(tab.name)}</Typography>}
                </Box>
              );
            })}
            <Box
              key={'adjustmensts'}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                handleOpenAdjustments(e);
              }}
            >
              {adjustmensts.icon}
              {<Typography variant="h8">{t(adjustmensts.name)}</Typography>}
            </Box>
          </Box>
        </Box>

        <Menu
          anchorEl={adjustmentAnchorEl}
          open={Boolean(adjustmentAnchorEl)}
          onClose={handleCloseAdjustments}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <MenuItem disableRipple>
            <div className="flex items-center cursor-default">
              <Checkbox
                checked={selectedColumns}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetFilterItemValue('task', 'selectedColumns', !selectedColumns);
                }}
                className="mr-2 cursor-pointer"
              />
              <span>{t('Select_columns')}</span>
            </div>
          </MenuItem>
        </Menu>

        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {selectedView === 'requirements' ? (
            <TableComponent 
              rowData={legalsFilters} 
              columnDefs={columnDefs}
              onRefresh={() => setLoadLegals(true)}
              onResetFilters={handleResetFilters}
            />
          ) : selectedView === 'list' ? (
            <ListView legals={legalsFilters} />
          ) : null}
        </Box>

        <SpeedDialComponent
          openSpeedDial={openSpeedDial}
          handleCloseSpeedDial={() => setOpenSpeedDial(false)}
          handleOpenSpeedDial={() => setOpenSpeedDial(true)}
          speedDialActions={speedDialActions}
          handleClick={() => {
            handleOpenOptionsDrawer();
            setActiveTab(0);
            setOptinDrawerData(null);
            setOptinDrawerTitle(t('create_legal_requirement'));
          }}
        />

        <OptionsDrawer
          openOptionsDrawer={openOptionsDrawer}
          onCloseOptionsDrawer={handleCloseOptionsDrawer}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          optinDrawerData={optinDrawerData}
          Title={optinDrawerTitle}
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