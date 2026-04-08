import { Close } from '@mui/icons-material';
import { AppBar, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import { isEmpty, isObject } from 'radash';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getActionDetails } from '../../stores/actions/getActionDetailsSlice';
import { submitActionForm } from '../../stores/actions/submitActionFormSlice';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';
import UnsavedChangesDialog from '../../components/UnsavedChangesDialog';
import { fetchActionLevelOptions } from './actionLevelService';

const ActionsDetails = lazy(() => import('./ActionsDetails'));
const ActionsComments = lazy(() => import('./ActionsComments'));

export default function ActionsDrawer({
  drawerOpen = false,
  handleCloseDrawer = () => {},
  viewType = null,
  handleFetchActionList = () => {},
  selectedAction = null,
  formFields = [],
  formTabItems = [],
  actionFormModel = {},
  setActionFormModel = () => {},
  setFormFields = () => {}
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados para el diálogo de confirmación de cambios sin guardar
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState(null);
  
  // Estado para detectar cambios en el formulario de comentarios
  const [hasCommentFormChanges, setHasCommentFormChanges] = useState(false);
  
  // Debug: Log cuando cambia el estado
  useEffect(() => {
    console.log('DEBUG: hasCommentFormChanges changed to:', hasCommentFormChanges);
  }, [hasCommentFormChanges]);

  // Manejadores para el diálogo de cambios sin guardar
  const handleConfirmExitWithoutSave = () => {
    if (pendingCloseAction) {
      pendingCloseAction();
      setPendingCloseAction(null);
    }
    setShowUnsavedChangesDialog(false);
  };

  const handleCancelExit = () => {
    setPendingCloseAction(null);
    setShowUnsavedChangesDialog(false);
  };

  // Manejador de cierre con detección de cambios
  const handleCloseDrawerWithConfirmation = (hasUnsavedChanges = false) => {
    console.log('DEBUG: handleCloseDrawerWithConfirmation - hasUnsavedChanges:', hasUnsavedChanges);
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true);
      setPendingCloseAction(() => () => {
        handleCloseDrawer();
      });
    } else {
      handleCloseDrawer();
    }
  };

  const drawerStyleAttrs = {
    view_action: {
      sx: {
        maxWidth: '50vw',
        width: {
          sm: '50vw',
          md: '30vw',
          lg: '45vw'
        }
      }
    },
    view_comment: {
      sx: {
        maxWidth: '50vw',
        width: {
          lg: '45vw',
          xl: '32vw',
          xxl: '40vw'
        }
      }
    }
  };

  const drawerTitle = viewType === 'view_action' ? 'CreateAction' : 'action_comments';

  const actionDetailsLoading = useSelector((state) => state?.getActionDetails?.loading ?? false);

  const flattenFormFields = () => {
    const formFieldGroups = Object.keys(formFields);
    return formFieldGroups.reduce((acc, cur) => {
      const fieldMapping = formFields[cur];
      return [...acc, ...Object.keys(fieldMapping).map((fieldKey) => fieldMapping[fieldKey])];
    }, []);
  };

  const getFieldById = (fieldID) => {
    const formFieldGroups = Object.keys(formFields);
    for (const group of formFieldGroups) {
      if (formFields[group]?.[fieldID]) {
        return formFields[group][fieldID];
      }
    }
    return null;
  };

  const getFormFieldGroup = (fieldID) => {
    const formFieldGroups = Object.keys(formFields);
    const group = formFieldGroups.find((fieldGroup) => {
      const fieldIDs = Object.keys(formFields[fieldGroup]);
      return fieldIDs.includes(fieldID);
    });
    return group;
  };

  const setFieldOptions = (fieldID, options) => {
    const group = getFormFieldGroup(fieldID);
    if (!group) return;

    setFormFields((prevFields) => {
      const field = prevFields?.[group]?.[fieldID];
      if (!field) return prevFields;

      return {
        ...prevFields,
        [group]: {
          ...prevFields[group],
          [fieldID]: {
            ...field,
            options,
            api_details: {}
          }
        }
      };
    });
  };

  const loadLevelOptions = async (level, selectedValues, targetFieldID) => {
    try {
      const options = await fetchActionLevelOptions({
        dispatch,
        level,
        selectedValues
      });
      setFieldOptions(targetFieldID, options);
    } catch (error) {
      setFieldOptions(targetFieldID, []);
    }
  };

  const loadDependentLevelOptions = (changedFieldID, formModel) => {
    if (changedFieldID === 'level_1') {
      if (!formModel?.level_1) {
        setFieldOptions('level_2', []);
        setFieldOptions('level_3', []);
        setFieldOptions('level_4', []);
        return;
      }
      loadLevelOptions(2, { level_1: formModel.level_1 }, 'level_2');
      setFieldOptions('level_3', []);
      setFieldOptions('level_4', []);
    }

    if (changedFieldID === 'level_2') {
      if (!formModel?.level_2) {
        setFieldOptions('level_3', []);
        setFieldOptions('level_4', []);
        return;
      }
      loadLevelOptions(3, { level_1: formModel?.level_1, level_2: formModel.level_2 }, 'level_3');
      setFieldOptions('level_4', []);
    }

    if (changedFieldID === 'level_3') {
      if (!formModel?.level_3) {
        setFieldOptions('level_4', []);
        return;
      }
      loadLevelOptions(
        4,
        {
          level_1: formModel?.level_1,
          level_2: formModel?.level_2,
          level_3: formModel.level_3
        },
        'level_4'
      );
    }
  };

  const checkDependentFields = (id, value, nextFormModel) => {
    let updatedFormModel = { ...nextFormModel };
    const findFormField = (id) => flattenFormFields().find((field) => field.name === id);

    const formField = findFormField(id);
    const { dependent = [] } = formField || {};

    if (dependent.length) {
      dependent.forEach((dependentID) => {
        updatedFormModel[dependentID] = null;
      });

      const [firstDependentID] = dependent;

      //Also update API details for dependent field
      const dependentFieldDetails = findFormField(firstDependentID);
      const updatedDependentFieldDetails = getUpdatedCascadingDropdownField(dependentFieldDetails, {
        ...updatedFormModel,
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

    loadDependentLevelOptions(id, updatedFormModel);
    return updatedFormModel;
  };

  const handleUpdateModel = (id, value) => {
    setActionFormModel((prevFormModel) => {
      const nextFormModel = {
        ...prevFormModel,
        [id]: value
      };

      return checkDependentFields(id, value, nextFormModel);
    });
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

  const handleGetActionDetails = (formData) => {
    dispatch(getActionDetails(formData)).then((data) => {
      if (data?.payload?.status === 1) {
        const rawFormModel = data?.payload?.data;
        updateCascadingDropdownFormFields(rawFormModel);
        setActionFormModel(rawFormModel);
      }
    });
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
    const { action_id = '', action_table = 'hs_action' } = selectedAction || {};
    const formData = {
      ...actionFormModel,
      action_id,
      action_source: actionFormModel?.action_source || action_table || 'hs_action'
    };
    handleActionForm(formData);
  };

  useEffect(() => {
    if (isObject(selectedAction) && !isEmpty(selectedAction)) {
      const { id: dashboard_action_id, action_table, action_id } = selectedAction;
      const formData = { dashboard_action_id, action_table, action_id };
      handleGetActionDetails(formData);
    }
  }, [selectedAction]);

  // Resetear el estado de cambios cuando se abre el drawer
  useEffect(() => {
    if (drawerOpen) {
      setHasCommentFormChanges(false);
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (!getFieldById('level_1')) return;

    loadLevelOptions(1, {}, 'level_1');

    if (actionFormModel?.level_1) {
      loadLevelOptions(2, { level_1: actionFormModel.level_1 }, 'level_2');
    }

    if (actionFormModel?.level_2) {
      loadLevelOptions(
        3,
        { level_1: actionFormModel?.level_1, level_2: actionFormModel.level_2 },
        'level_3'
      );
    }

    if (actionFormModel?.level_3) {
      loadLevelOptions(
        4,
        {
          level_1: actionFormModel?.level_1,
          level_2: actionFormModel?.level_2,
          level_3: actionFormModel.level_3
        },
        'level_4'
      );
    }
  }, [
    drawerOpen,
    selectedAction?.id,
    actionFormModel?.level_1,
    actionFormModel?.level_2,
    actionFormModel?.level_3
  ]);

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => handleCloseDrawerWithConfirmation(hasCommentFormChanges)}
      PaperProps={drawerStyleAttrs[viewType] || {}}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography color="white" variant="h5" sx={{ flexGrow: 1 }}>
            {t(drawerTitle)}
          </Typography>
          <IconButton edge="end" onClick={() => handleCloseDrawerWithConfirmation(hasCommentFormChanges)} aria-label="close">
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Suspense fallback={<div>{t('loading')}</div>}>
        {viewType === 'view_comment' ? (
          <ActionsComments 
            actionDetails={selectedAction}
            onFormChange={setHasCommentFormChanges}
          />
        ) : viewType === 'view_action' ? (
          <ActionsDetails
            isFetching={actionDetailsLoading}
            formFields={formFields}
            formTabItems={formTabItems}
            formModel={actionFormModel}
            onUpdateModel={handleUpdateModel}
            onSubmit={handleSubmitActionData}
            onCancel={() => handleCloseDrawerWithConfirmation(false)}
          />
        ) : (
          ''
        )}
      </Suspense>
      
      {/* Diálogo de confirmación para cambios sin guardar */}
      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExitWithoutSave}
        onCancel={handleCancelExit}
      />
    </Drawer>
  );
}
