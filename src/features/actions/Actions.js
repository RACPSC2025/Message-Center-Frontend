import { Add, Close, CheckCircle } from '@mui/icons-material';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import { clone, isEmpty, isObject } from 'radash';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import SpeedDialComponent from '../../components/SpeedDialComponent';
import { useModuleData } from '../../hooks/useModuleData';
import { fetchActionFormFields } from '../../stores/actions/fetchActionFormFieldsSlice';
import { fetchActionFormModel } from '../../stores/actions/fetchActionFormModelSlice';
import { fetchActionList, fetchActionCount } from '../../stores/actions/fetchActionSlice';
import { fetchTableColumns } from '../../stores/actions/fetchTableColumnsSlice';
import { getActionDetails } from '../../stores/actions/getActionDetailsSlice';
import { submitActionForm } from '../../stores/actions/submitActionFormSlice';
import { selectAppliedFilterModel, selectListOptions } from '../../stores/filterSlice';
import { toggleShouldCreateNewAction } from '../../stores/globalDataSlice';
import { convertString, not, showErrorMsg, showSuccessMsg } from '../../utils/others';
import ActionTable from './ActionsTable';

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
        
        <Box sx={{ pt: 2, px: 4, display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              {actionCountLoading ? 'Cargando...' : `${actionCount} acciones encontradas`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0, px: 1 }}>
          <ActionTable
            actions={actionList}
            actionStatus={actionStatus}
            columnConfig={tableColumnConfig}
            isFetching={actionListLoading}
            onClickTableAction={handleClickTableActionButton}
            newActionByUser={newActionByDescription}
            onRefreshData={handleFetchActionList}
          />
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

      {/* Drawer para detalles de la acción */}
      {/* Drawer para detalles de la acción - Compartido entre creación, edición y comentarios */}
      {drawerOpen && (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          PaperProps={drawerStyleAttrs[viewType] || {}}
        >
          {/* Header del Drawer con AppBar */}
          <AppBar position="static">
            <Toolbar>
              <Typography color="white" variant="h5" sx={{ flexGrow: 1 }}>
                {`${t('CreateAction')}`}
              </Typography>

              <IconButton edge="end" onClick={handleCloseDrawer} aria-label="close">
                <Close sx={{ color: 'white' }} />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Contenido dinámico del drawer según viewType */}
          <Suspense fallback={<div>{t('loading')}</div>}>
            {/* Vista de comentarios de la acción */}
            {viewType === 'view_comment' ? (
              <ActionsComments 
                actionDetails={selectedAction} 
                defaultTab={initialCommentTab}
                onRefreshTable={handleFetchActionList}
              />
            ) : 
            viewType === 'view_action' ? (
              /* Vista de formulario de acción (creación o edición) */
              <ActionsDetails
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
      )}
    </BaseFeaturePageLayout>
  );
}

Component.displayName = 'Actions';
export default Component;
