import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BaseTab from '../../components/BaseTab';
import CommentCard from '../../components/CommentCard';
import FormBuilder from '../../components/FormBuilder';
import EmptyState from '../../components/EmptyState';
import { editActionComments } from '../../stores/actions/editActionCommentsSlice';
import { fetchActionComments } from '../../stores/actions/fetchActionCommentsSlice';
import { selectListOptions } from '../../stores/filterSlice';
import { showSuccessMsg } from '../../utils/others';

export default function ActionsComments({ 
  actionDetails = {}, 
  defaultTab = 'list', 
  onRefreshTable, // Callback para actualizar tabla
  onFormChange // Callback para notificar cambios en el formulario
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Determinar los valores iniciales según el tab
  const initialProgress = defaultTab === 'form' ? 100 : 0;
  const initialStatus = defaultTab === 'form' ? 'closed' : 'open';
  const initialComment = defaultTab === 'form' ? 'Cerrar acción: ' : '';
  
  const [commentModel, setCommentModel] = useState({ 
    comment: initialComment, 
    comment_id: null, 
    progress: initialProgress, 
    status: initialStatus,
    filePicker: null
  });
  
  // Guardar valores iniciales para detectar cambios
  const [initialFormValues, setInitialFormValues] = useState({
    comment: initialComment,
    status: initialStatus,
    progress: initialProgress,
    filePicker: null
  });

  // Obtener la lista de estados desde el store de filtros
  const actionStatusList = useSelector((state) => selectListOptions(state, 'actions', 'filter_status'));


  const { loading: actionCommentsLoading = false, data: actionCommentsData = {} } = useSelector(
    (state) => state?.fetchActionComments || {}
  );

  const { loading: editActionCommentsLoading = false } = useSelector(
    (state) => state?.editActionComments || {}
  );

  const actionComments = actionCommentsData?.data || [];

  const handleFetchActionComments = ({ action_id, action_table }) => {
    dispatch(fetchActionComments({ action_id }));
  };

  const handleAddEditComments = (payload, resetFormFields) => {
    dispatch(editActionComments(payload)).then((data) => {
      if (data?.payload?.status === 1) {
        showSuccessMsg(data?.payload?.messages);
        resetFormFields();
        setActiveTab('list');
        
        // Resetear estado de cambios al guardar exitosamente
        if (onFormChange) onFormChange(false);
        
        // Llamar al callback para actualizar la tabla
        if (onRefreshTable) onRefreshTable();
      }
    });
  };

  const handleFormSuccess = (updatedFormModel, resetFormFields) => {
    const { action_id, module_id } = actionDetails;
    const { comment, filePicker = null, progress, status } = updatedFormModel;

    // Crear objeto directamente, sin FormData
    const payload = {
      action_id,
      comment,
      action_status: status,
      percentage: progress
    };
    
    handleAddEditComments(payload, resetFormFields);
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    // Resetear los valores según el tab original
    const resetProgress = defaultTab === 'form' ? 100 : 0;
    const resetStatus = defaultTab === 'form' ? 'closed' : 'open';
    const resetComment = defaultTab === 'form' ? 'Cerrar acción: ' : '';
    setCommentModel({ comment: resetComment, comment_id: null, progress: resetProgress, status: resetStatus, filePicker: null });
    // Resetear estado de cambios al cancelar
    if (onFormChange) onFormChange(false);
  };

  const handleClickCommentEdit = (commentObj) => {
    const { comment, id: comment_id } = commentObj;
    // Al editar un comentario, mantener los valores según el contexto
    const editProgress = defaultTab === 'form' ? 100 : 0;
    const editStatus = defaultTab === 'form' ? 'closed' : 'open';
    setCommentModel({ comment, comment_id, progress: editProgress, status: editStatus, filePicker: null });
    setActiveTab('form');
  };

  const getCommentTemplate = () => {
    if (actionCommentsLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <CommentCard
          key={`mc_shimmer_${index}`}
          loading
          wrapperStyle={index > 0 ? { mt: 1 } : {}}
        />
      ));
    }

    const renderCommentGroup = (comments, role) => {
      if (!comments?.length) return null;
      
      return comments.map((comment, index) => (
        <CommentCard
          key={comment.id || `${role}-${index}`}
          comment={comment}
          role={role}
          wrapperStyle={index > 0 ? { mt: 1 } : {}}
          onClickEdit={() => handleClickCommentEdit(comment)}
        />
      ));
    };

    return (
      <>
        {renderCommentGroup(actionComments.responsible_comments, t('Executor'))}
        {renderCommentGroup(actionComments.reviewer_comments, t('Reviewer'))}
        {renderCommentGroup(actionComments.other_comments, t('Other'))}
        
        {/* Mostrar estado vacío si no hay comentarios en ningún grupo */}
        {!actionComments.responsible_comments?.length && 
         !actionComments.reviewer_comments?.length && 
         !actionComments.other_comments?.length && (
          <EmptyState 
            title={t('no_comments_title')}
            subtitle={t('no_comments_description')}
          />
        )}
      </>
    );
  };

  const tabItems = [
    { key: 'list', label: t('list') },
    { key: 'form', label: t('form') }
  ];

  useEffect(() => {
    if (activeTab === 'list' && actionDetails?.action_id && actionDetails?.action_table) {
      handleFetchActionComments({
        action_id: actionDetails?.action_id,
        action_table: actionDetails?.action_table // Eliminar esto
      });
    }
  }, [activeTab, actionDetails]); // Modificar para que solo sea por el cambio del id

  // Detectar cambios en el formulario y notificar al padre
  useEffect(() => {
    if (activeTab === 'form' && onFormChange) {
      const hasChanges = 
        commentModel.comment !== initialFormValues.comment ||
        commentModel.status !== initialFormValues.status ||
        commentModel.progress !== initialFormValues.progress ||
        commentModel.filePicker !== initialFormValues.filePicker;
      
      onFormChange(hasChanges);
    }
  }, [commentModel, initialFormValues, activeTab, onFormChange]);

  // Resetear valores iniciales cuando cambia la acción o el tab por defecto
  useEffect(() => {
    const newInitialValues = {
      comment: defaultTab === 'form' ? 'Cerrar acción: ' : '',
      status: defaultTab === 'form' ? 'closed' : 'open',
      progress: defaultTab === 'form' ? 100 : 0,
      filePicker: null
    };
    setInitialFormValues(newInitialValues);
    // Notificar que no hay cambios al resetear
    if (onFormChange) onFormChange(false);
    
  }, [actionDetails?.action_id, defaultTab, onFormChange]);

  // Hacer focus en el textarea 
  useEffect(() => {
    if (activeTab === 'form') {
      // Pequeño delay para asegurar que el componente esté renderizado
      setTimeout(() => {
        const $textarea = document.querySelector('textarea');
        
        if ($textarea) {
          $textarea.focus();
          // Mover cursor al final del texto
          const length = $textarea.value.length;
          $textarea.setSelectionRange(length, length);
        }
      }, 200);
    }
  }, [activeTab]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Descripción de la acción */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e9ecef' }}>
        <Typography variant="h6" sx={{ mb: 1, color: '#212529' }}>
          {t('what_description')}
        </Typography>
        <Typography variant="body1" sx={{ color: '#6c757d', lineHeight: 1.5 }}>
          {actionDetails?.what_description || 'Sin descripción'}
        </Typography>
      </Box>

      <BaseTab
        items={tabItems}
        activeTab={tabItems.findIndex((tab) => tab.key === activeTab)}
        tabContainerProps={{
          sx: { my: 2 },
          onChange: (_, value) => setActiveTab(tabItems[value].key)
        }}
      />
      <Box
        sx={{
          px: 4,
          pt: activeTab === 'form' ? 1 : 2,
          pb: 2,
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto'
        }}
      >
        {activeTab === 'list' ? (
          getCommentTemplate()
        ) : (
          <FormBuilder
            inputFields={[
              { id: 'comment', 
                type: 'textarea', 
                label: t('comment'), 
                required: true
              },
              { id: 'filePicker', 
                type: 'file', 
                label: t('upload_file'), 
                required: false },
              {
                id: "status",
                label: t("status"),
                type: "dropdown",
                defaultValue: "open",
                required: true,
                options: actionStatusList.map(status => ({
                  value: status.value,
                  label: status.label
                }))
              },
              {
                id: "progress",
                label: t("progress"),
                type: "progress",
                defaultValue: 0,
                required: false
              }
            ]}
            initialValues={commentModel}
            onChange={(newValues) => {
              setCommentModel(prev => ({ ...prev, ...newValues }));
            }}
            isLoading={editActionCommentsLoading}
            successCallback={handleFormSuccess}
            cancelCallback={handleFormCancel}
          />
        )}
      </Box>
    </Box>
  );
}
