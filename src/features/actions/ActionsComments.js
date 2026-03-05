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

export default function ActionsComments({ actionDetails = {}, defaultTab = 'list' }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [commentModel, setCommentModel] = useState({ comment: '', comment_id: null, progress: 0, status: 'open' });

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
    console.log('[DEBUG] Haciendo fetch con datos (ID acción): ', action_id);
    // dispatch(fetchActionComments({ action_id, action_table }));
    dispatch(fetchActionComments({ action_id }));
    console.log('[DEBUG] Comentarios de acción (actionComments)', actionComments)
  };

  const handleAddEditComments = (payload, resetFormFields) => {
    dispatch(editActionComments(payload)).then((data) => {
      if (data?.payload?.status === 1) {
        showSuccessMsg(data?.payload?.messages);
        resetFormFields();
        setActiveTab('list');
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
    setCommentModel({ comment: '', comment_id: null, progress: 0, status: 'open' });
  };

  const handleClickCommentEdit = (commentObj) => {
    const { comment, id: comment_id } = commentObj;
    setCommentModel({ comment, comment_id });
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
    // eliminar la actionDetails?.action_table
    if (activeTab === 'list' && actionDetails?.action_id && actionDetails?.action_table) {
      handleFetchActionComments({
        action_id: actionDetails?.action_id,
        action_table: actionDetails?.action_table // Eliminar esto
      });
    }
  }, [activeTab, actionDetails]); // Modificar para que solo sea por el cambio del id

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
            isLoading={editActionCommentsLoading}
            successCallback={handleFormSuccess}
            cancelCallback={handleFormCancel}
          />
        )}
      </Box>
    </Box>
  );
}
