import { AttachFile as AttachFileIcon, DeleteOutline as DeleteOutlineIcon } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BaseEmptyState from '../components/BaseEmptyState';
import BaseTab from '../components/BaseTab';
import CommentCard from '../components/CommentCard';
import FormBuilder from '../components/FormBuilder';
import { useModuleCatalogs } from '../hooks/usePlatformConfig';
import { editActionComments } from '../stores/actions/editActionCommentsSlice';
import { fetchActionComments } from '../stores/actions/fetchActionCommentsSlice';
import { selectListOptions } from '../stores/filterSlice';
import { uploadActionCommentAttachments } from '../stores/actions/uploadCommentAttachmentsSlice';
import { showErrorMsg, showSuccessMsg } from '../utils/others';

function MessageCenterActionComments({ actionDetails = {}, actionCurrentValues = {}, onCommentSaved }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('list');
  const [commentModel, setCommentModel] = useState({
    comment: '',
    comment_id: null,
    status: '',
    progress: 0
  });
  const [newCommentFiles, setNewCommentFiles] = useState([]);
  const [uploadingCommentId, setUploadingCommentId] = useState(null);
  const perCommentUploadInputRef = useRef(null);

  const userData = useSelector((state) => state?.globalData?.userDetails || {});
  const actionStatusList = useSelector((state) => selectListOptions(state, 'actions', 'filter_status'));
  const actionsStatusCatalog = useModuleCatalogs('actions', 'status') || [];

  const { loading: actionCommentsLoading = false, data: actionCommentsData = {} } = useSelector(
    (state) => state?.fetchActionComments || {}
  );
  const { loading: editActionCommentsLoading = false } = useSelector(
    (state) => state?.editActionComments || {}
  );
  const { loading: uploadCommentAttachmentLoading = false } = useSelector(
    (state) => state?.uploadCommentAttachments || {}
  );

  const groupedComments = actionCommentsData?.data || {};
  const resolveStatusNumericCode = (statusValue) => {
    if (statusValue === undefined || statusValue === null || statusValue === '') return '';

    const numericValue = Number(statusValue);
    if (Number.isFinite(numericValue) && actionsStatusCatalog.some(
      (statusItem) => Number(statusItem?.numeric_code) === numericValue
    )) {
      return numericValue;
    }

    const statusMatch = actionsStatusCatalog.find((statusItem) => {
      const code = String(statusItem?.code || '').toLowerCase().trim();
      const label = String(statusItem?.label || '').toLowerCase().trim();
      const rawValue = String(statusValue).toLowerCase().trim();

      return rawValue === code || rawValue === label;
    });

    if (statusMatch?.numeric_code !== undefined && statusMatch?.numeric_code !== null) {
      return Number(statusMatch.numeric_code);
    }

    return Number.isFinite(numericValue) ? numericValue : '';
  };

  const actionStatusOptions = useMemo(() => {
    if (Array.isArray(actionsStatusCatalog) && actionsStatusCatalog.length > 0) {
      return actionsStatusCatalog.map((status) => ({
        value: Number(status?.numeric_code),
        label: status?.label
      }));
    }

    return (actionStatusList || []).map((status) => ({
      value: status?.value,
      label: status?.label
    }));
  }, [actionsStatusCatalog, actionStatusList]);

  const defaultStatusValue = useMemo(() => {
    if (!actionStatusOptions?.length) return '';
    const actionStatus =
      actionCurrentValues?.action_status
      || actionDetails?.action_status
      || actionCurrentValues?.status
      || actionDetails?.status;

    if (actionStatus !== undefined && actionStatus !== null) {
      const normalizedActionStatus = resolveStatusNumericCode(actionStatus);
      const selectedOption = actionStatusOptions.find((option) => {
        return String(option.value) === String(normalizedActionStatus || actionStatus);
      });
      if (selectedOption) return selectedOption.value;
    }

    return actionStatusOptions[0]?.value || '';
  }, [actionCurrentValues, actionDetails, actionStatusOptions]);

  const defaultProgressValue = useMemo(() => {
    const rawPercentage =
      actionCurrentValues?.percentage
      || actionDetails?.percentage
      || actionCurrentValues?.progress
      || actionDetails?.progress
      || 0;
    const parsedPercentage = Number(rawPercentage);
    if (!Number.isFinite(parsedPercentage)) return 0;
    return Math.max(0, Math.min(100, parsedPercentage));
  }, [actionCurrentValues, actionDetails]);

  const handleFetchActionComments = ({ action_id, action_table }) => {
    dispatch(fetchActionComments({ action_id, action_table }));
  };

  const resetCommentFormState = () => {
    setCommentModel({
      comment: '',
      comment_id: null,
      status: defaultStatusValue,
      progress: defaultProgressValue
    });
    setNewCommentFiles([]);
  };

  const refreshComments = () => {
    if (actionDetails?.action_id && actionDetails?.action_table) {
      handleFetchActionComments({
        action_id: actionDetails.action_id,
        action_table: actionDetails.action_table
      });
    }
  };

  const handleNewCommentFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setNewCommentFiles((prevFiles) => {
      const existingSignatures = new Set(
        prevFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );

      const uniqueNewFiles = selectedFiles.filter((file) => {
        const signature = `${file.name}-${file.size}-${file.lastModified}`;
        return !existingSignatures.has(signature);
      });

      return [...prevFiles, ...uniqueNewFiles];
    });

    event.target.value = '';
  };

  const handleRemoveNewCommentFile = (indexToRemove) => {
    setNewCommentFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleAddEditComments = (payload, resetFormFields) => {
    dispatch(editActionComments(payload)).then((data) => {
      const status = Number(data?.payload?.status);
      if (status === 1 || status === 303) {
        showSuccessMsg(data?.payload?.messages);
        resetFormFields();
        resetCommentFormState();
        setActiveTab('list');
        refreshComments();
        if (onCommentSaved) {
          onCommentSaved();
        }
      } else {
        showErrorMsg(data?.payload?.messages || t('error_occurred'));
      }
    });
  };

  const handleFormSuccess = (updatedFormModel, resetFormFields) => {
    const { action_table, action_id } = actionDetails;
    const { comment, comment_id, progress, status } = updatedFormModel;

    const hasFiles = newCommentFiles.length > 0;
    const normalizedActionStatus = resolveStatusNumericCode(status);

    const payloadBase = {
      action_id,
      comment,
      action_source: action_table,
      action_status: normalizedActionStatus,
      percentage: progress,
      ...(userData?.id_administradores && {
        user_id: userData.id_administradores,
        comment_by: userData.id_administradores
      }),
      ...(comment_id && { comment_id })
    };

    const payload = hasFiles
      ? {
          formData: (() => {
            const formData = new FormData();
            Object.entries(payloadBase).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                formData.append(key, value);
              }
            });
            newCommentFiles.forEach((file) => {
              formData.append('imagefiles[]', file);
            });
            return formData;
          })()
        }
      : payloadBase;

    handleAddEditComments(payload, resetFormFields);
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    resetCommentFormState();
  };

  const handleClickCommentEdit = (commentObj) => {
    const { comment, comment_id, id } = commentObj;
    setCommentModel((prevState) => ({
      ...prevState,
      comment: comment || '',
      comment_id: comment_id || id || null
    }));
    setActiveTab('form');
  };

  const handleClickUploadAttachment = (commentObj) => {
    const commentId = commentObj?.comment_id || commentObj?.id;
    if (!commentId) return;
    setUploadingCommentId(commentId);
    perCommentUploadInputRef.current?.click();
  };

  const handleUploadAttachmentToComment = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !uploadingCommentId) {
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('action_id', actionDetails?.action_id);
    formData.append('comment_id', uploadingCommentId);
    formData.append('comment_type', actionDetails?.action_table || 'hs');

    if (userData?.id_administradores) {
      formData.append('user_id', userData.id_administradores);
    }

    files.forEach((file) => {
      formData.append('upload_file[]', file);
    });

    dispatch(
      uploadActionCommentAttachments({
        formData,
        comment_id: uploadingCommentId
      })
    ).then((result) => {
      const status = Number(result?.payload?.status);
      if (status === 1 || status === 303) {
        showSuccessMsg(result?.payload?.messages || t('upload_success'));
        refreshComments();
      } else {
        showErrorMsg(result?.payload?.messages || t('error_occurred'));
      }
    });

    setUploadingCommentId(null);
    event.target.value = '';
  };

  const commentsByRole = useMemo(
    () => [
      {
        role: t('Executor'),
        items: groupedComments?.responsible_comments || []
      },
      {
        role: t('Reviewer'),
        items: groupedComments?.reviewer_comments || []
      },
      {
        role: t('Other'),
        items: groupedComments?.other_comments || []
      }
    ],
    [groupedComments, t]
  );

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

    const renderedComments = commentsByRole.flatMap((roleGroup) =>
      roleGroup.items.map((comment, index) => (
        <CommentCard
          key={comment.comment_id || comment.id || `${roleGroup.role}-${index}`}
          comment={comment}
          role={roleGroup.role}
          wrapperStyle={index > 0 ? { mt: 1 } : {}}
          onClickEdit={() => handleClickCommentEdit(comment)}
          onUploadAttachment={() => handleClickUploadAttachment(comment)}
          uploadingAttachments={uploadCommentAttachmentLoading}
        />
      ))
    );

    if (renderedComments.length > 0) {
      return renderedComments;
    }

    return <BaseEmptyState module="actions" section="comment_list" />;
  };

  const tabItems = [
    { key: 'list', label: t('list') },
    { key: 'form', label: t('form') }
  ];

  useEffect(() => {
    if (activeTab === 'list' && actionDetails.action_id && actionDetails.action_table) {
      refreshComments();
    }
  }, [activeTab, actionDetails.action_id, actionDetails.action_table]);

  useEffect(() => {
    resetCommentFormState();
  }, [defaultStatusValue, defaultProgressValue, actionDetails.action_id]);

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
      <BaseTab
        items={tabItems}
        activeTab={tabItems.findIndex((tab) => tab.key === activeTab)}
        tabContainerProps={{
          sx: { my: 2 },
          onChange: (_, value) => setActiveTab(tabItems[value].key)
        }}
        showBorderBottom
      />
      <Box
        sx={{
          px: 2,
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
          <>
            <FormBuilder
              inputFields={[
                {
                  id: 'comment',
                  type: 'textarea',
                  label: t('comment'),
                  required: true
                },
                {
                  id: 'status',
                  type: 'dropdown',
                  label: t('status'),
                  required: true,
                  options: actionStatusOptions
                },
                {
                  id: 'progress',
                  type: 'progress',
                  label: t('progress'),
                  required: false,
                  defaultValue: defaultProgressValue
                }
              ]}
              initialValues={commentModel}
              isLoading={editActionCommentsLoading}
              successCallback={handleFormSuccess}
              cancelCallback={handleFormCancel}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('upload_file')}
              </Typography>
              <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
                {t('Choose files')}
                <input
                  hidden
                  multiple
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  onChange={handleNewCommentFilesChange}
                />
              </Button>
              {!!newCommentFiles.length && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  {newCommentFiles.map((file, index) => (
                    <Chip
                      key={`${file.name}-${file.size}-${index}`}
                      label={file.name}
                      onDelete={() => handleRemoveNewCommentFile(index)}
                      deleteIcon={<DeleteOutlineIcon />}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </>
        )}
      </Box>
      <input
        hidden
        ref={perCommentUploadInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
        onChange={handleUploadAttachmentToComment}
      />
    </Box>
  );
}

export default MessageCenterActionComments;
