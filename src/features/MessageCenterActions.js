import { Add, Close } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography
} from '@mui/material';
import { clone, isEmpty, isObject } from 'radash';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BaseFeaturePageLayout from '../components/BaseFeaturePageLayout';
import SpeedDialComponent from '../components/SpeedDialComponent';
import { useCascadingFilters } from '../hooks/useCascadingFilters';
import { fetchActionFormFields } from '../stores/actions/fetchActionFormFieldsSlice';
import { fetchActionFormModel } from '../stores/actions/fetchActionFormModelSlice';
import { fetchActionList } from '../stores/actions/fetchActionSlice';
import { fetchTableColumns } from '../stores/actions/fetchTableColumnsSlice';
import { getActionDetails } from '../stores/actions/getActionDetailsSlice';
import { submitActionForm } from '../stores/actions/submitActionFormSlice';
import { removeFilter, selectAppliedFilterModel, selectListOptions, setFilter } from '../stores/filterSlice';
import { toggleShouldCreateNewAction } from '../stores/globalDataSlice';
import { fetchTaskListLevel } from '../stores/tasks/fetchtaskListLevelSlice';
import { convertString, not, showErrorMsg, showSuccessMsg } from '../utils/others';
import MessageCenterActionViewTable from './MessageCenterActionViewTable';

const MessageCenterActionDetails = lazy(() => import('./MessageCenterActionDetails'));
const MessageCenterActionComments = lazy(() => import('./MessageCenterActionComments'));

const useAppliedFilterModel = (module) =>
  useSelector((state) => selectAppliedFilterModel(state, module));

// Custom hook to get list options
const useListOptions = (module, fieldName) =>
  useSelector((state) => selectListOptions(state, module, fieldName));

export function Component() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const newActionFormModel = useRef(null);

  const [actionFormModel, setActionFormModel] = useState({});
  const [formFields, setFormFields] = useState([]);
  const [formTabItems, setFormTabItems] = useState([]);
  const [tableColumnConfig, setTableColumnConfig] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewType, setViewType] = useState(null);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [organizationFilterState, setOrganizationFilterState] = useState({});

  const filterData = useAppliedFilterModel('actions');
  const enableLevel5 = Boolean(filterData?.enable_level5);

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
  const drawerTitle = viewType === 'view_action' ? 'Action Details' : 'Comentarios de la acción';

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
        formData.append(filterKey, filterData[filterKey]);
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

  function handleClearFilters() {
    resetCascadingFilters();
    ['id_level1', 'id_level2', 'id_level3', 'id_level4', 'id_level5'].forEach((key) => {
      dispatch(
        removeFilter({
          module: 'actions',
          fieldID: key
        })
      );
    });
    setOrganizationFilterState({});
  }

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
      level1: filterData?.id_level1 || '',
      level2: filterData?.id_level2 || '',
      level3: filterData?.id_level3 || '',
      level4: filterData?.id_level4 || ''
    };

    if (enableLevel5) {
      initialValues.level5 = filterData?.id_level5 || '';
    }

    return initialValues;
  }, [enableLevel5, filterData]);

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
      const { column: field, title: headerName, column_width: width, ...rest } = config;
      return {
        ...rest,
        field,
        headerName,
        width
      };
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

  const handleClickTableActionButton = (actionData, viewType) => {
    setSelectedAction(actionData);
    setViewType(viewType);
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

  const filterArray = cascadingFilters.map((filter) => ({
    id: filter.id,
    label: filter.label,
    value: filter.value,
    options: filter.options,
    isDisabled: filter.isDisabled || filter.isLoading
  }));

  const handleFetchTableColumns = () => {
    dispatch(fetchTableColumns()).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const tableData = data?.payload?.data ?? {};
        const config = Object.keys(tableData?.headers).map(
          (columnKey) => tableData?.headers[columnKey]
        );
        const columnConfig = modifyTableColumns(getConfig(config));
        setTableColumnConfig(columnConfig);
      }
    });
  };

  const handleFetchFormFields = () => {
    dispatch(fetchActionFormFields()).then((data) => {
      if (data?.payload?.messages === 'Success') {
        let rawFormFields = data?.payload?.data;
        const tabItems = Object.keys(rawFormFields).map((fieldGroupKey) => ({
          key: convertString(fieldGroupKey),
          label: fieldGroupKey
        }));

        rawFormFields = Object.keys(rawFormFields).reduce((acc, cur) => {
          const tabItem = tabItems.find((item) => item.label === cur);
          if (tabItem) {
            acc[tabItem.key] = rawFormFields[tabItem.label];
          }
          return acc;
        }, {});

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

  return (
    <>
      <BaseFeaturePageLayout>
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            display="flex"
            justifyContent="start"
            gap={1}
            alignItems="center"
            padding="20px"
            bgcolor="white"
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
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
            <MessageCenterActionViewTable
              actions={actionList ?? []}
              actionStatus={actionStatus}
              columnConfig={tableColumnConfig}
              isFetching={actionListLoading}
              onClickTableAction={handleClickTableActionButton}
              onRefresh={() => handleFetchActionList()}
            />
          </Box>
        </Box>

        {/*  SpeedDial for create action
        <SpeedDialComponent
          openSpeedDial={openSpeedDial}
          handleCloseSpeedDial={() => setOpenSpeedDial(false)}
          handleOpenSpeedDial={() => setOpenSpeedDial(true)}
          speedDialActions={speedDialActions}
          handleClick={() => dispatch(toggleShouldCreateNewAction({ status: true }))}
        />
        */}
        
      </BaseFeaturePageLayout>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={drawerStyleAttrs[viewType] || {}}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography color="white" variant="h5" sx={{ flexGrow: 1 }}>
              {t(drawerTitle)}
            </Typography>
            <IconButton edge="end" onClick={handleCloseDrawer} aria-label="close">
              <Close sx={{ color: 'white' }} />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Suspense fallback={<div>{t('loading')}</div>}>
          {viewType === 'view_comment' ? (
            <MessageCenterActionComments actionDetails={selectedAction} />
          ) : viewType === 'view_action' ? (
            <MessageCenterActionDetails
              isFetching={actionDetailsLoading}
              formFields={formFields}
              formTabItems={formTabItems}
              formModel={actionFormModel}
              onUpdateModel={handleUpdateModel}
              onSubmit={handleSubmitActionData}
              onCancel={handleCloseDrawer}
            />
          ) : (
            ''
          )}
        </Suspense>
      </Drawer>
    </>
  );
}

Component.displayName = 'MessageCenterActions';
export default Component;
