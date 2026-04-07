import { Add, CheckCircle, Insights, TableChart } from '@mui/icons-material';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography
} from '@mui/material';
import { clone, isEmpty, isObject } from 'radash';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import SpeedDialComponent from '../../components/SpeedDialComponent';
import ActionsDrawer from './ActionsDrawer';
import { useCascadingFilters } from '../../hooks/useCascadingFilters';
import { useModuleData } from '../../hooks/useModuleData';
import { fetchActionFormFields } from '../../stores/actions/fetchActionFormFieldsSlice';
import { fetchActionFormModel } from '../../stores/actions/fetchActionFormModelSlice';
import { fetchActionList, fetchActionCount } from '../../stores/actions/fetchActionSlice';
import { fetchTableColumns } from '../../stores/actions/fetchTableColumnsSlice';
import { fetchActionListLevel } from '../../stores/actions/fetchActionListLevelSlice';
import { getActionDetails } from '../../stores/actions/getActionDetailsSlice';
import { submitActionForm } from '../../stores/actions/submitActionFormSlice';
import { removeFilter, selectAppliedFilterModel, selectListOptions, setFilter } from '../../stores/filterSlice';
import { toggleShouldCreateNewAction } from '../../stores/globalDataSlice';
import { convertString, not, showErrorMsg, showSuccessMsg } from '../../utils/others';
import ActionTable from './ActionsTable';
import ActionsReportTremos from './ActionsReportTremos';
import { fetchActionLevelOptions } from './actionLevelService';

const ActionsDetails = lazy(() => import('./ActionsDetails'));
const ActionsComments = lazy(() => import('./ActionsComments'));

const useAppliedFilterModel = (module) =>
  useSelector((state) => selectAppliedFilterModel(state, module));

// Custom hook to get list options
const useListOptions = (module, fieldName) =>
  useSelector((state) => selectListOptions(state, module, fieldName));

export function Component() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const newActionFormModel = useRef(null);
  const { fetchModuleDataById } = useModuleData();

  const [actionFormModel, setActionFormModel] = useState({});
  const [formFields, setFormFields] = useState([]);
  const [formTabItems, setFormTabItems] = useState([]);
  const [tableColumnConfig, setTableColumnConfig] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewType, setViewType] = useState(null);
  const [initialCommentTab, setInitialCommentTab] = useState('list'); // Nuevo estado
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [organizationFilterState, setOrganizationFilterState] = useState({});
  const [selectedView, setSelectedView] = useState('table');

  const viewTabArray = ['table', 'report'];

  const iconMapping = (viewTab, currentView) => {
    const iconProps = {
      color: currentView === viewTab ? 'warning' : 'action',
      fontSize: 'medium'
    };

    const icons = {
      table: <TableChart {...iconProps} />,
      report: <Insights {...iconProps} />
    };

    return icons[viewTab] || null;
  };

  const filterData = useAppliedFilterModel('actions');

  const shouldCreateNewAction = useSelector((state) => state?.globalData?.shouldCreateNewAction);
  const actionDetailsLoading = useSelector((state) => state?.getActionDetails?.loading ?? false);
  const { loading: actionListLoading = false, data: actionListData = {} } = useSelector(
    (state) => state?.actionData?.actionList || {}
  );
  const actionList = actionListData?.data || [];
  const { loading: actionCountLoading = false, data: actionCountData = {} } = useSelector(
    (state) => state?.actionData?.actionCount || {}
  );
  const actionCount = actionCountData?.data?.total || actionList.length;

  const actionStatusList = useListOptions('actions', 'filter_status');
  const actionStatus = actionStatusList.reduce((acc, cur) => {
    const { value, ...rest } = cur;
    acc[value] = { value, ...rest };
    return acc;
  }, {});

  const drawerStyleAttrs = {
    view_action: {
      sx: {
        maxWidth: '50vw', // Maximum width on all screens
        width: {
          sm: '50vw', // On 1280px width, make it 35vw
          md: '30vw', // On 1366px width, make it 38vw
          lg: '45vw' // On 1920px width and above, make it 40vw
        }
      }
    },
    view_comment: {
      sx: {
        maxWidth: '50vw', // Maximum width on all screens
        width: {
          lg: '45vw', // On 1280px width and above, make it 35vw,
          xl: '32vw', // On 1366px width, make it 32vw
          xxl: '40vw'
        }
      }
    }
  };

  //const drawerTitle = viewType === 'view_action' ? 'Action Details' : 'Action Comment(s)';
  const drawerTitle = viewType === 'view_action' ? t('action_details') : 'action_comments';

  const flattenFormFields = useMemo(() => {
    const formFieldGroups = Object.keys(formFields);
    return formFieldGroups.reduce((acc, cur) => {
      const fieldMapping = formFields[cur];
      return [...acc, ...Object.keys(fieldMapping).map((fieldKey) => fieldMapping[fieldKey])];
    }, []);
  }, [formFields]);

  const prepareAPIParams = () => {
    const formData = new FormData();

    if (Object.keys(filterData).length > 0) {
      Object.keys(filterData).forEach((filterKey) => {
        const filterValue = filterData[filterKey];

        // Level filters are applied client-side in Actions table.
        if (['id_level1', 'id_level2', 'id_level3', 'id_level4'].includes(filterKey)) {
          return;
        }

        formData.append(filterKey, filterValue);
      });
    }

    return formData;
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setViewType(null);
    if (shouldCreateNewAction) {
      dispatch(toggleShouldCreateNewAction({ status: false }));
    }
  };

  const handleClearFilters = () => {
    resetCascadingFilters();
    ['id_level1', 'id_level2', 'id_level3', 'id_level4'].forEach((key) => {
      dispatch(
        removeFilter({
          module: 'actions',
          fieldID: key
        })
      );
    });
    setOrganizationFilterState({});
  };

  const fetchLevelData = (level, selectedValues = {}) =>
    fetchActionLevelOptions({
      dispatch,
      level,
      selectedValues
    });

  const filterDefinitions = useMemo(() => {
    return [
      {
        id: 'level1',
        label: 'Business',
        fetchOptions: async () => fetchLevelData(1)
      },
      {
        id: 'level2',
        label: 'Company',
        fetchOptions: async (parentValues) => fetchLevelData(2, parentValues)
      },
      {
        id: 'level3',
        label: 'Region',
        fetchOptions: async (parentValues) => fetchLevelData(3, parentValues)
      },
      {
        id: 'level4',
        label: 'Location',
        fetchOptions: async (parentValues) => fetchLevelData(4, parentValues)
      }
    ];
  }, [dispatch]);

  const getInitialOrganizationValues = useMemo(() => {
    return {
      level1: filterData?.id_level1 || '',
      level2: filterData?.id_level2 || '',
      level3: filterData?.id_level3 || '',
      level4: filterData?.id_level4 || ''
    };
  }, [filterData]);

  const handleOrganizationFilterChange = (values) => {
    const previousValues = { ...organizationFilterState };
    setOrganizationFilterState(values);

    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== previousValues[key]) {
        dispatch(
          setFilter({
            module: 'actions',
            updatedFilter: { [`id_${key}`]: value }
          })
        );
      }
    });

    Object.entries(previousValues).forEach(([key, prevValue]) => {
      if (prevValue && (!values[key] || values[key] === '')) {
        dispatch(
          removeFilter({
            module: 'actions',
            fieldID: `id_${key}`
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

  const filterArray = cascadingFilters.map((filter) => ({
    id: filter.id,
    label: filter.label,
    value: filter.value,
    options: filter.options,
    isDisabled: filter.isDisabled || filter.isLoading
  }));

  const handleFetchActionList = () => {
    const formData = prepareAPIParams();
    dispatch(fetchActionList(formData));
  };

  const handleFetchActionCount = () => {
    const formData = prepareAPIParams();
    dispatch(fetchActionCount(formData));
  };

  const handleActionForm = (formData) => {
    dispatch(submitActionForm(formData)).then((data) => {
      if (data?.payload?.status === 1) {
        showSuccessMsg(data?.payload?.messages);
        // Fetch updated action module count for navbar
        fetchModuleDataById('actions');
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
    const level1Value =
      actionFormModel?.level_1
      || actionFormModel?.id_region
      || actionFormModel?.id_level1
      || '';

    if (!String(level1Value).trim()) {
      showErrorMsg(t('level1_required', { defaultValue: 'Level 1 is required' }));
      return;
    }

    const { action_id = '' } = selectedAction || {};
    const formData = {
      ...actionFormModel,
      action_id,
      level_1: actionFormModel?.level_1 || actionFormModel?.id_region || '',
      action_source: actionFormModel?.action_source || selectedAction?.action_table || 'hs_action'
    };

    handleActionForm(formData);
  };

  const handleUpdateModel = (id, value) => {
    setActionFormModel((prevFormModel) => ({
      ...prevFormModel,
      [id]: value
    }));
    checkDependentFields(id, value);
  };

  const getConfig = (config, isTableColumnConfig = true) => {
    const tableConfigFilterFn = (data) => data.display_in_table;
    const otherConfigFilterFn = not(tableConfigFilterFn);
    return config.filter(isTableColumnConfig ? tableConfigFilterFn : otherConfigFilterFn);
  };

  const modifyTableColumns = (columnConfig) => {
    return columnConfig.map((config) => {
      const { 
        column: field, 
        title, 
        title_es, 
        title_en, 
        column_width, 
        edit,
        ...rest 
      } = config;

      // Determinamos el nombre del encabezado según el idioma
      const headerName = i18n.language === 'en' ? (title_en || title) : (title_es || title);
      
      const columnProps = {
        ...rest,
        field,
        headerName,
        width: column_width && column_width !== "" ? parseInt(column_width, 10) : undefined,
        editable: edit ?? true
      };

      if (
        field === 'action_closing_date' ||
        field === 'action_real_closing_date' ||
        field === 'action_start_date' ||
        field === 'action_registered_date'
      ) {
        columnProps.cellEditor = 'agDateCellEditor';
        columnProps.cellEditorParams = {
          min: '1950-01-01',
          max: '2050-12-31'
        };
        columnProps.valueFormatter = (params) => {
          const date = new Date(params.value);
          return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
        };
        columnProps.filter = 'agDateColumnFilter'; // Si deseas filtrado por fecha
      }

      return columnProps;
    });
  };

  const getFormFieldGroup = (fieldID) => {
    const formFieldGroups = Object.keys(formFields);
    const group = formFieldGroups.find((fieldGroup) => {
      const fieldIDs = Object.keys(formFields[fieldGroup]);
      return fieldIDs.includes(fieldID);
    });
    return group;
  };

  const handleClickTableActionButton = (actionData, viewType, initialTab = 'list') => {
    setSelectedAction(actionData);
    setViewType(viewType);
    setInitialCommentTab(initialTab); // Establecer el tab inicial
    setDrawerOpen(true);
  };

  const updateCascadingDropdownFormFields = (formModel) => {
    const formFieldGroups = Object.keys(formFields);
    const updatedFormFields = formFieldGroups.reduce((acc, cur) => {
      const fieldMapping = formFields[cur];
      acc[cur] = Object.keys(fieldMapping).reduce((facc, fieldKey) => {
        const field = fieldMapping[fieldKey];
        facc[fieldKey] = getUpdatedCascadingDropdownField(field, formModel);
        return facc;
      }, {});
      return acc;
    }, {});

    setFormFields((formFields) => ({ ...formFields, ...updatedFormFields }));
  };

  const getUpdatedCascadingDropdownField = (field, formModel) => {
    const { api_details = {} } = field;
    const { param_value, ...restDetails } = api_details;

    const isParentValueAvailable =
      Object.prototype.hasOwnProperty.call(api_details, 'parent_element') &&
      formModel[api_details.parent_element];
    if (isParentValueAvailable) {
      return {
        ...field,
        api_details: {
          ...restDetails,
          param_value: isParentValueAvailable
        }
      };
    }

    return {
      ...field,
      api_details: restDetails
    };
  };

  const checkDependentFields = (id, value) => {
    const findFormField = (id) => flattenFormFields.find((field) => field.name === id);

    const formField = findFormField(id);
    const { dependent = [] } = formField || {};

    if (dependent.length) {
      const [firstDependentID] = dependent;
      //Clear the next dependent field
      handleUpdateModel(firstDependentID, null);

      //Also update API details for dependent field
      const dependentFieldDetails = findFormField(firstDependentID);
      const updatedDependentFieldDetails = getUpdatedCascadingDropdownField(dependentFieldDetails, {
        ...actionFormModel,
        [id]: value
      });

      const dependentFieldGroup = getFormFieldGroup(firstDependentID);
      const updatedDependentFieldGroup = {
        ...formFields[dependentFieldGroup],
        [firstDependentID]: updatedDependentFieldDetails
      };
      setFormFields((formFields) => ({
        ...formFields,
        [dependentFieldGroup]: updatedDependentFieldGroup
      }));
    }
  };

  const speedDialActions = [{ icon: <Add />, name: 'Crear Acción' }];

  const handleFetchTableColumns = () => {
    dispatch(fetchTableColumns()).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const tableData = data?.payload?.data ?? {};
        const config = Object.keys(tableData?.headers)
          .map((columnKey) => tableData?.headers[columnKey])
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        const columnConfig = modifyTableColumns(getConfig(config));
        setTableColumnConfig(columnConfig);
      }
    });
  };

  const handleFetchFormFields = () => {
    dispatch(fetchActionFormFields()).then((data) => {
      if (data?.payload?.messages === 'Success') {
        let rawFormFields = clone(data?.payload?.data || {});
        const tabItems = Object.keys(rawFormFields).map((fieldGroupKey) => ({
          key: convertString(fieldGroupKey),
          label: fieldGroupKey
        }));

        rawFormFields = Object.keys(rawFormFields).reduce((acc, cur) => {
          const tabItem = tabItems.find((item) => item.label === cur);
          if (tabItem) {
            acc[tabItem.key] = clone(rawFormFields[tabItem.label] || {});
          }
          return acc;
        }, {});

        // Keep level requirement rules explicit in UI metadata.
        ['level_2', 'level_3', 'level_4'].forEach((fieldID) => {
          const groupKey = Object.keys(rawFormFields).find((group) =>
            Object.prototype.hasOwnProperty.call(rawFormFields[group] || {}, fieldID)
          );

          if (groupKey && rawFormFields[groupKey]?.[fieldID]) {
            rawFormFields[groupKey][fieldID] = {
              ...rawFormFields[groupKey][fieldID],
              required: false
            };
          }
        });

        const level1GroupKey = Object.keys(rawFormFields).find((group) =>
          Object.prototype.hasOwnProperty.call(rawFormFields[group] || {}, 'level_1')
        );

        if (level1GroupKey && rawFormFields[level1GroupKey]?.level_1) {
          rawFormFields[level1GroupKey].level_1 = {
            ...rawFormFields[level1GroupKey].level_1,
            required: true
          };
        }

        setFormTabItems(tabItems);
        setFormFields(rawFormFields);
      }
    });
  };

  const handleFetchFormModel = () => {
    dispatch(fetchActionFormModel()).then((data) => {
      if (data?.payload?.messages === 'Success') {
        newActionFormModel.value = data?.payload?.data;
      }
    });
  };

  const handleGetActionDetails = (formData) => {
    dispatch(getActionDetails(formData)).then((data) => {
      if (data?.payload?.status === 1) {
        const rawFormModel = data?.payload?.data;
        updateCascadingDropdownFormFields(rawFormModel);
        setActionFormModel(rawFormModel);
      }
    });
  };

  useEffect(() => {
    handleFetchTableColumns();
    handleFetchFormFields();
    handleFetchFormModel();
  }, [actionStatusList]);

  useEffect(() => {
    handleFetchActionList();
    handleFetchActionCount();
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
  
  // ✅ WORKAROUND TEMPORAL: Filtrado cliente-side para filtros que no funcionan en backend
  // filter_executor, filter_reviewer y niveles organizacionales son filtrados aquí.
  const filteredActions = useMemo(() => {
    let result = actionList; // ← Viene del backend (ya filtrado por status, keywords, etc.)

    const isSameValue = (a, b) => String(a ?? '').trim() === String(b ?? '').trim();

    const levelFieldCandidates = {
      id_level1: ['level_1', 'level1', 'id_level1'],
      id_level2: ['level_2', 'level2', 'id_level2'],
      id_level3: ['level_3', 'level3', 'id_level3'],
      id_level4: ['level_4', 'level4', 'id_level4']
    };

    ['id_level1', 'id_level2', 'id_level3', 'id_level4'].forEach((levelFilterKey) => {
      const selectedValue = filterData?.[levelFilterKey];
      if (!selectedValue) return;

      const candidates = levelFieldCandidates[levelFilterKey];
      result = result.filter((action) =>
        candidates.some((fieldName) => isSameValue(action?.[fieldName], selectedValue))
      );
    });

    // Solo aplicar filtrado cliente-side para los filtros que NO funcionan en backend
    if (filterData.filter_executor && filterData.filter_executor.trim() !== '') {
      result = result.filter((action) => {
        // Filtrar por ID (responsible_person), no por nombre
        return isSameValue(action.responsible_person, filterData.filter_executor);
      });
    }

    if (filterData.filter_reviewer && filterData.filter_reviewer.trim() !== '') {
      result = result.filter((action) => {
        // Filtrar por ID (reviewer_person), no por nombre
        return isSameValue(action.reviewer_person, filterData.filter_reviewer);
      });
    }

    return result;
  }, [
    actionList,
    filterData?.id_level1,
    filterData?.id_level2,
    filterData?.id_level3,
    filterData?.id_level4,
    filterData?.filter_executor,
    filterData?.filter_reviewer
  ]);

  const [newActionByDescription, setNewActionByDescription] = useState('');
  const createNewAction= (newDescription) => {
    if(newDescription !== '') {
      setNewActionByDescription(newDescription);
    }
  };

  return (
    <BaseFeaturePageLayout>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper'
        }}
      >
        
        <Box
          sx={{
            pt: 2,
            px: 4,
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
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
                    onChange={(e) => handleCascadingFilterChange(filter?.id, e.target.value)}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
            <CheckCircle sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '1rem',
                fontStyle: 'italic'
              }}
            >
              {actionCountLoading ? 'Cargando...' : (
                filteredActions.length !== actionList.length 
                  ? `${filteredActions.length} de ${actionCount} acciones (filtrado)`
                  : `${actionCount} acciones encontradas`
              )}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-end', pb: 0.5 }}>
            {viewTabArray.map((viewTab) => {
              const isActive = selectedView === viewTab;
              return (
                <Box
                  key={viewTab}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { opacity: 1 }
                  }}
                  onClick={() => setSelectedView(viewTab)}
                >
                  <Box sx={{ color: isActive ? '#f57c00' : '#b0bec5', mb: 0.2 }}>
                    {iconMapping(viewTab, selectedView)}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: isActive ? '#263238' : '#b0bec5',
                      textTransform: 'capitalize'
                    }}
                  >
                    {t(viewTab)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0, px: 1 }}>
          {selectedView === 'report' ? (
            <ActionsReportTremos actions={filteredActions} isLoading={actionListLoading} />
          ) : (
            <ActionTable
              actions={filteredActions}
              actionStatus={actionStatus}
              columnConfig={tableColumnConfig}
              isFetching={actionListLoading}
              onClickTableAction={handleClickTableActionButton}
              newActionByUser={newActionByDescription}
              onRefreshData={handleFetchActionList}
            />
          )}
        </Box>
      </Box>

      {/* SpeedDial para crear acción */}
      <SpeedDialComponent
        openSpeedDial={openSpeedDial}
        handleCloseSpeedDial={() => setOpenSpeedDial(false)}
        handleOpenSpeedDial={() => setOpenSpeedDial(true)}
        speedDialActions={speedDialActions}
        // Al hacer click, activa el estado para crear nueva acción
        handleClick={() => dispatch(toggleShouldCreateNewAction({ status: true }))}
      />

      {/* Drawer para detalles de la acción - Compartido entre creación, edición y comentarios */}
      <ActionsDrawer
        drawerOpen={drawerOpen}
        handleCloseDrawer={handleCloseDrawer}
        viewType={viewType}
        handleFetchActionList={handleFetchActionList}
        selectedAction={selectedAction}
        formFields={formFields}
        formTabItems={formTabItems}
        actionFormModel={actionFormModel}
        setActionFormModel={setActionFormModel}
        setFormFields={setFormFields}
      />
    </BaseFeaturePageLayout>
  );
}

Component.displayName = 'Actions';
export default Component;
