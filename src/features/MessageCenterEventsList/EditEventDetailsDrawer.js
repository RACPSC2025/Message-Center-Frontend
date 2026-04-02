import { AccessTime, ChatBubbleOutline, InsertDriveFile, MoreVert } from '@mui/icons-material';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Drawer,
  IconButton,
  Link,
  Modal,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormBuilder from '../../components/FormBuilder';
import axiosInstance from '../../lib/axios';
import { getAPIUrl } from '../../config/constants';
import { useLanguage } from '../../providers/languageProvider';
import { uploadCommentAttachments } from '../../stores/actions/uploadCommentAttachmentsSlice';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';
import { useDispatch, useSelector } from 'react-redux';
import AttachmentViewer from './AttachmentViewer';
import CommentCard from './CommentCard';

import {
  fetchListOfUsers,
  fetchRegions,
  fetchUserDetails,
  setActiveModule
} from '../../stores/globalDataSlice';
//} from '../stores/globalDataSlice';

// const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3, px: 0 }}>{children}</Box>}
    </div>
  );
}

// TODO: Preguntar, este componente fue creado de manera provisional
function EmptyState({ title, subtitle }) {
  return (
    <Box
      sx={{
        border: '1px dashed #e0e0e0',
        borderRadius: 2,
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1.25,
        color: '#607d8b'
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#eafcfc'
        }}
      >
        <ChatBubbleOutline sx={{ fontSize: 30, color: '#71e9ec' }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#263238', mt: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', maxWidth: 420 }}>
        {subtitle}
      </Typography>
    </Box>
  );
}

function EditEventDetailsDrawer({
  openEditDrawer,
  onCloseEditDrawer,
  logTaskDetails,
  onDrawerOpened,
  initialTab = 'comentarios',
  initialCommentText = '',
  onCommentAdded,
  focusedCommentId = null
}) {
  const dispatch = useDispatch();
  const [selectedFile, setSezlectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [openCollapseActualizar, setOpenCollapseActualizar] = useState(false);
  const [openCollapseSeguimiento, setOpenCollapseSeguimiento] = useState(true);
  const [tabValue, setTabValue] = useState('comentarios');
  const [logtaskExecutedComments, setLogtaskExecutedComments] = useState([]);
  const [logtaskRevisorComments, setLogtaskRevisorComments] = useState([]);
  const [isLoading, setIsLoading] = useState('loading');
  const [openModal, setOpenModal] = useState(false);
  const [hasExecutedComments, setHasExecutedComments] = useState(false);
  const [hasRevisorComments, setHasRevisorComments] = useState(false);
  const [openModalEjecutor, setOpenModalEjecutor] = useState(false);
  const [addCommentForm, setAddCommentForm] = useState([]);
  const [commentExecutedAttachments, setCommentExecutedAttachments] = useState([]);
  const [commentRevisorAttachments, setCommentRevisorAttachments] = useState([]);
  const [progresoModel, setProgresoModel] = useState({
    progreso: logTaskDetails.progress,
    progreso_id: null
  });
  const [openModalConfirmation, setOpenModalConfirmation] = useState(false);
  const [commentConfirmation, setCommentConfirmation] = useState('');
  const [openModalCommentConfirmation, setOpenModalCommentConfirmation] = useState(false);
  const [isExecutor, setIsExecutor] = useState(true);
  const [errorCommentForm, setErrorCommentForm] = useState(false);
  const [commentErrors, setCommentErrors] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditCommentModal, setOpenEditCommentModal] = useState(false);
  const [openDeleteCommentDialog, setOpenDeleteCommentDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteCommentResponse, setDeleteCommentReponse] = useState('');
  const [updateProgressErrors, setUpdateProgressErrors] = useState(false);
  const [progressUpdated, setProgressUpdated] = useState(false);
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [commentType, setCommentType] = useState('');
  const [attachmentComment, setAttachmentComment] = useState('');
  const [createCommentAttachments, setCreateCommentAttachments] = useState([]);
  const [localFocusedCommentId, setLocalFocusedCommentId] = useState(null);
  
  // Estados para detectar cambios no guardados
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialProgress, setInitialProgress] = useState(logTaskDetails.progress);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initialValues, setInitialValues] = useState({
    progress: null,
    comment: null
  });
  
  // Modal de validacion de comentarios y porcentaje
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const menuEditOpen = Boolean(anchorEl);
  const API_URL = getAPIUrl();
  //const [userData, setUserData] = useState(null);
  const userData = useSelector((state) => state.globalData.userDetails);

  //console.log('logTaskDetails TTTTTKKKKKKKKKKKKKKKKKKKKKKKKKK', logTaskDetails);


  const UPLOADS_URL = `${API_URL}uploads/registros/tasklegal/`;

  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      progreso: progresoModel.progreso || ''
    }
  });

  const { language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'es-ES';

  const ALLOWED_ATTACHMENT_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  
  // Efecto para detectar cambios en el progreso y comentario
  useEffect(() => {
    // NO detectar cambios durante inicialización
    if (isInitializing) return;
    
    // Lógica simple: detectar si hay cambios reales del usuario
    const hasProgressChange = addCommentForm.progress !== undefined && addCommentForm.progress !== initialValues.progress;
    const hasCommentChange = addCommentForm.comment !== undefined && addCommentForm.comment !== initialValues.comment;
    const hasNewComment = addCommentForm.comment && addCommentForm.comment.trim().length > 0;
    
    const hasChanges = hasProgressChange || hasCommentChange || hasNewComment;
    
    setHasUnsavedChanges(hasChanges);
  }, [addCommentForm.progress, addCommentForm.comment, initialValues.progress, initialValues.comment, isInitializing]);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  /*
  useEffect(() => {
    dispatch(fetchUserDetails('userId')).then((result) => {
      console.log('fetchUserDetails result:', result);
      console.log('User Details:', result.payload);
      setUserData(result.payload);
    });
    dispatch(fetchRegions());
  }, [dispatch]);
  */
  
  // attachImageToComment eliminado: ahora solo se usa upload_comment_attachments

  // 
  const handleSelectImage = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Definir tipos permitidos (debe coincidir con el 'accept' del input)
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      // Mostrar mensaje de error usando la utilidad existente
      showErrorMsg(t('Tipo de archivo no permitido.'));

      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente si se desea
      event.target.value = ''; 
      
      return; // Detener la ejecución
    }

    setAttachmentComment(file);

    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSelectCreateCommentFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const invalidFile = selectedFiles.find((file) => !ALLOWED_ATTACHMENT_TYPES.includes(file.type));
    if (invalidFile) {
      showErrorMsg(t('Tipo de archivo no permitido.'));
      event.target.value = '';
      return;
    }

    setCreateCommentAttachments((prevFiles) => {
      const nextFiles = [...prevFiles];

      selectedFiles.forEach((newFile) => {
        const alreadyAdded = nextFiles.some(
          (existingFile) =>
            existingFile.name === newFile.name
            && existingFile.size === newFile.size
            && existingFile.lastModified === newFile.lastModified
        );

        if (!alreadyAdded) {
          nextFiles.push(newFile);
        }
      });

      return nextFiles;
    });

    event.target.value = '';
  };

  const handleRemoveCreateCommentFile = (fileIndex) => {
    setCreateCommentAttachments((prevFiles) => prevFiles.filter((_, index) => index !== fileIndex));
  };

  const handleUploadAttachment = (selectedComment) => {
    if (attachmentComment) {
      handleUploadComments(selectedComment, attachmentComment);
      setOpenAttachmentModal(false);
      setAttachmentComment('');
      setPreviewUrl(null);
      // Actualiza la lista de comentarios después de la carga
      setLogtaskExecutedComments([]);
      setLogtaskRevisorComments([]);
      fetchLogtaskComments(logTaskDetails.id);
    }
  };


  const handleMenuEditCommentOpen = (event, comment) => {
    setSelectedComment(comment);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuEditCommentClose = () => {
    setAnchorEl(null);
  };

  const handleOpenAttachmentModal = (comment_id) => {
    setOpenAttachmentModal(true);
    setSelectedComment(comment_id);
    setAttachmentComment('');
    setPreviewUrl(null);
  };

  const handleUploadComments = (comment_id, file) => {
    // Permitir recibir un objeto comentario o solo el id
    let realCommentId = comment_id;
    if (typeof comment_id === 'object' && comment_id !== null) {
      realCommentId = comment_id.comment_id || comment_id.id;
    }
    const numericCommentId = Number(realCommentId);
    if (!numericCommentId || isNaN(numericCommentId) || numericCommentId <= 0) {
      console.error('comment_id inválido para upload:', comment_id);
      showErrorMsg(t('El comentario no es válido. No se puede adjuntar archivo.'));
      return;
    }

    const formData = new FormData();
    formData.append('comment_id', numericCommentId);
    formData.append('imagefiles[]', file);
    dispatch(
      uploadCommentAttachments({
        formData,
        task_id: logTaskDetails?.task_id ?? null
      })
    ).then((data) => {
      const status = Number(data?.payload?.status);
      const isSuccess = status === 200 || status === 303;

      if (isSuccess) {
        showSuccessMsg(data?.payload?.messages || t('Success'));
        fetchLogtaskComments(logTaskDetails.id);
        if (onCommentAdded) {
          onCommentAdded({
            source: 'attachment_upload',
            status,
            logtask_id: data?.payload?.logtask_id,
            comment_id: data?.payload?.comment_id
          });
        }
      } else {
        showErrorMsg(data?.payload?.messages || t('error_occurred'));
      }
    });
  };

  useEffect(() => {
    if (!openEditDrawer || isLoading !== 'loaded') return;

    const effectiveFocusedCommentId = localFocusedCommentId ?? focusedCommentId;
    if (!effectiveFocusedCommentId) return;

    const normalizedCommentId = Number(effectiveFocusedCommentId);
    const inExecuted = logtaskExecutedComments.some(
      (comment) => Number(comment?.comment_id) === normalizedCommentId
    );
    const inRevisor = logtaskRevisorComments.some(
      (comment) => Number(comment?.comment_id) === normalizedCommentId
    );

    if (inExecuted) {
      setTabValue('comentarios');
    } else if (inRevisor) {
      setTabValue('seguimientos');
    }
  }, [
    openEditDrawer,
    localFocusedCommentId,
    focusedCommentId,
    isLoading,
    logtaskExecutedComments,
    logtaskRevisorComments
  ]);

  const handleCloseAttachmentModal = () => {
    setOpenAttachmentModal(false);
    setAttachmentComment('');
    setPreviewUrl(null);
  };

  const handleOpenEditCommentModal = () => {
    setAddCommentForm((prevState) => ({
      ...prevState,
      comment: selectedComment.comment,
      sharepoint_link: selectedComment.sharepoint_link
    }));
    setAnchorEl(false);
    setOpenEditCommentModal(true);
  };

  const handleCloseEditCommentModal = () => {
    setOpenEditCommentModal(false);
  };

  const handleOpenDeleteCommentDialog = () => {
    setOpenDeleteCommentDialog(true);
  };

  const handleCloseDeleteCommentDialog = () => {
    setOpenDeleteCommentDialog(false);
  };

  const fetchUserName = async (user_id) => {
    try {
      const response = await axiosInstance.post(`/tasklist_api/list_administradores/`);
      const filteredId = response.data.data.filter(
        (user) => parseInt(user.value) === parseInt(user_id)
      );
      return filteredId[0].label;
    } catch (error) {
      console.error('Error fetching user name ', error);
      return [];
    }
  };

  /*
  const getExecutedComments = async (logtask_id) => {
    try {
      let formData = new FormData();
      formData.append('comment_type', 'executed');
      const response = await axiosInstance.post(
        `/tasklist_api/get_logtask_comments/${logtask_id}`,
        formData
      );
      console.log('responseComments', response.data);
      for (const comment of response.data.data) {
        const userName = await fetchUserName(comment.user_id);
        const attachments = await fetchCommentsAttachments(comment.id);
        attachments.map((attachment) => {
          setCommentExecutedAttachments((prevAttachments) => [
            ...prevAttachments,
            {
              path: `${API_URL}${attachment.file_name}`
            }
          ]);
        });
        setLogtaskExecutedComments((prevComments) => [
          ...prevComments,
          {
            user_id: comment.user_id,
            comment: comment.comment,
            created: comment.created,
            userName: userName,
            comment_id: comment.id,
            attachment: attachments
          }
        ]);
      }
      setIsLoading('loaded');
    } catch (error) {
      console.error('Error fetching logtask comments ', error);
      setIsLoading('error');
      return [];
    }
  };
  */

  const getExecutedComments = async (logtask_id) => {
    try {
      let formData = new FormData();
      formData.append('comment_type', 'executed');

      const response = await axiosInstance.post(
        `/tasklist_api/get_logtask_comments_amatia_express/${logtask_id}`,
        formData
      );

      // Mapear comentarios usando los adjuntos que ya vienen en la respuesta
      const processedComments = await Promise.all(
        response.data.data.map(async (comment) => {
          const userName = await fetchUserName(comment.user_id);
          return {
            user_id: comment.user_id,
            comment: comment.comment,
            created: comment.created,
            userName: userName,
            comment_id: comment.id,
            attachment: comment.attachments || []
          };
        })
      );
      setLogtaskExecutedComments(processedComments);
      setHasExecutedComments(processedComments.length > 0);
    } catch (error) {
      console.error('Error fetching logtask comments ', error);
      setIsLoading('error');
    }
  };

  const getRevisorComments = async (logtask_id) => {
    try {
      let formData = new FormData();
      formData.append("comment_type", "revisor");

      const response = await axiosInstance.post(
        `/tasklist_api/get_logtask_comments_amatia_express/${logtask_id}`,
        formData
      );

      const processedComments = await Promise.all(
        response.data.data.map(async (comment) => {
          const userName = await fetchUserName(comment.user_id);
          return {
            user_id: comment.user_id,
            comment: comment.comment,
            created: comment.created,
            userName: userName,
            comment_id: comment.id,
            attachment: comment.attachments || []
          };
        })
      );
      setLogtaskRevisorComments(processedComments);
      setHasRevisorComments(processedComments.length > 0);
    } catch (error) {
      console.error("Error fetching logtask comments ", error);
      setIsLoading("error");
      return [];
    }
  };

  const fetchLogtaskComments = async (logtask_id) => {
    setCommentExecutedAttachments([]);
    setCommentRevisorAttachments([]);
    setLogtaskExecutedComments([]);
    setLogtaskRevisorComments([]);
    await getExecutedComments(logtask_id);
    await getRevisorComments(logtask_id);
  };



  const fetchDeleteLogtaskComment = async (comment_id) => {
    const formData = new FormData();
    formData.append('comment_id', comment_id);
    try {
      const response = await axiosInstance.post('/tasklist_api/delete_logtask_comment', formData);
      setDeleteCommentReponse(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting comment ', error);
      setDeleteCommentReponse(error);
      return error;
    }
  };

  // TODO: revisar ese fetch, endpoint /tasklist_api/get_logtask_comments_amatia_express/{id}

  useEffect(() => {
    const currentLogTaskId = logTaskDetails?.id;
    if (currentLogTaskId && openEditDrawer) {
      setIsInitializing(true);
      setIsLoading('loading');
      
      // Posicionar en el tab indicado al abrir el drawer
      const validTabs = ['comentarios', 'seguimientos', 'crear_comentario'];
      setTabValue(validTabs.includes(initialTab) ? initialTab : 'comentarios');

      fetchLogtaskComments(currentLogTaskId).then(() => {
        setIsLoading('loaded');
        
        // Establecer valores iniciales basados en el estado actual
        const initialProgressValue = initialCommentText ? 100 : 
          Math.min(100, Math.max(0, parseInt(logTaskDetails.progress ?? 0, 10)));
        
        setInitialValues({
          progress: initialProgressValue,
          comment: '' // Siempre establecer como vacío inicialmente
        });
        
        // Pre-poblar el campo comment DESPUÉS de cargar los comentarios
        if (initialCommentText) {
          setAddCommentForm((prev) => ({ ...prev, comment: initialCommentText, progress: 100 }));
        } else {
          setAddCommentForm({});
        }

        setCreateCommentAttachments([]);
        
        // Resetear explícitamente el estado de cambios sin guardar CON UN PEQUEÑO DELAY
        setTimeout(() => {
          setHasUnsavedChanges(false);
          setIsInitializing(false); // Terminar inicialización después del pre-poblado
        }, 50);
      });
    }
  }, [logTaskDetails?.id, openEditDrawer, initialTab, initialCommentText]);

  const handleTabChange = (event, newValue) => {
    const validTabs = ['comentarios', 'seguimientos', 'crear_comentario'];
    if (validTabs.includes(newValue)) {
      setTabValue(newValue);
    }
  };

  const handleDeleteComment = async (comment_id) => {
    fetchDeleteLogtaskComment(comment_id);
    // TODO: update list of comments
    setAnchorEl(false);
    setLogtaskExecutedComments([]);
    setLogtaskRevisorComments([]);
    fetchLogtaskComments(logTaskDetails.id);
    setOpenDeleteCommentDialog(false);
  };

  const handleAgregarComentario = () => {
    setOpenModal(true);
  };

  const handleAgregarComentarioEjecutor = () => {
    setOpenModalEjecutor(true);
  };

  const handleCloseModalEjecutor = () => {
    setOpenModalEjecutor(false);
  };

  const handleCommentConfirmation = (executor) => {
    addCommentForm.comment_type =
      addCommentForm.type === 1 ? setCommentType('executed') : setCommentType('revisor');
    
    const errors = validateCommentForm();
    
    if (errors.length > 0) {
      setCommentErrors(errors);
      setErrorCommentForm(true);
      return;
    }
    
    setOpenModal(false);
    setOpenModalEjecutor(false);
    setIsExecutor(executor);
    setOpenModalConfirmation(true);
    setErrorCommentForm(false);
    setCommentErrors([]);
  };

  const handleCloseModalConfirmation = () => {
    setOpenModalConfirmation(false);
  };

  const handleCloseModalCommentConfirmation = () => {
    setOpenModalCommentConfirmation(false);
  };

  const actualizarProgresoFormData = [
    {
      id: 'progreso',
      label: t('progress'),
      type: 'text',
      defaultValue: '0.0'
    }
  ];

  // comment_type: 'executed' | 'revisor'
  const postComment = async (comment) => {
    console.log('user_id: ', userData);
    console.log('user_id: ', userData.id_administradores);
    console.log('Posting comment: ', comment);
    console.log('comment_type: ', commentType);
    
    try {
      const formData = new FormData();
      formData.append('comment', comment.comment);
      formData.append('sharepoint_link', comment.sharepoint_link);
      formData.append('logtask_id', comment.logtask_id);
      //formData.append('comment_type', comment.comment_type);
      formData.append('comment_type', commentType);
      formData.append('user_id', userData.id_administradores);
      formData.append('user_name', userData.fullname);
      const response = await axiosInstance.post('tasklist_api/add_logtask_comments_messagecenter', formData);
      return response.data;
    } catch (error) {
      console.error('Error posting comment ', error);
      return [];
    }
    
  };

  const updateComment = async (comment) => {
    const formData = new FormData();
    formData.append('comment_id', comment.comment_id);
    formData.append('sharepoint_link', addCommentForm.sharepoint_link);
    formData.append('comment', addCommentForm.comment);
    try {
      const response = await axiosInstance.post('tasklist_api/edit_logtask_comment', formData);
      setLogtaskExecutedComments([]);
      setLogtaskRevisorComments([]);
      fetchLogtaskComments(logTaskDetails.id);
      setOpenEditCommentModal(false);
      return response.data;
    } catch (error) {
      console.error('Error updating comment ', error);
    }
  };

  const handleAddReviewerComment = async () => {
    const formDetails = {
      comment: addCommentForm.comment,
      sharepoint_link: addCommentForm.sharepoint_link,
      logtask_id: logTaskDetails.id,
      comment_type: 'revisor'
    };

    let resp = await postComment(formDetails);
    setOpenModal(false);
    if (resp && resp.status) {
      if (onCommentAdded) onCommentAdded();
    }
  };

  const handleAddEjecutorComment = async () => {
    setOpenModalConfirmation(false);
    const formDetails = {
      comment: addCommentForm.comment,
      sharepoint_link: addCommentForm.sharepoint_link,
      logtask_id: logTaskDetails.id,
      comment_type: 'executed'
    };
    let resp = await postComment(formDetails);

    if (resp.status) {
      setCommentConfirmation(t('comment_created_successfully'));
      if (onCommentAdded) onCommentAdded();
    } else {
      setCommentConfirmation(t('could_not_create_comment'));
    }
    setLogtaskExecutedComments([]);
    setLogtaskRevisorComments([]);
    fetchLogtaskComments(logTaskDetails.id);
    setOpenModalCommentConfirmation(true);
  };

  const handleCloseEditDrawer = () => {
    if (hasUnsavedChanges) {
      // Mostrar diálogo de confirmación si hay cambios sin guardar
      setHasUnsavedChanges(false); // Resetear para evitar múltiples diálogos
      onCloseEditDrawer(true); // Pasar indicador de que hay cambios sin guardar
    } else {
      // Cerrar directamente si no hay cambios
      onCloseEditDrawer();
      setLocalFocusedCommentId(null);
      setUpdateProgressErrors(false);
      setProgressUpdated(false);
      setLogtaskExecutedComments([]);
      setLogtaskRevisorComments([]);
      onDrawerOpened();
    }
  };

  const updateProgress = async (percentage) => {
    const formData = new FormData();
    formData.append('logtask_id', logTaskDetails.id);
    formData.append('percentage', parseInt(percentage));
    try {
      const response = await axiosInstance.post('tasklist_api/update_logtask_progress', formData);
      setProgressUpdated(true);
      return response.data.data;
    } catch (error) {
      console.error('Error updating progress: ', error);
      setUpdateProgressErrors(true);
    }
  };

  const handleUpdateProgress = (data) => {
    setProgressUpdated(false);
    if (
      progresoModel.progreso === '' ||
      progresoModel.progreso < 0 ||
      progresoModel.progreso > 100
    ) {
      setUpdateProgressErrors(true);
    } else {
      setUpdateProgressErrors(false);
      updateProgress(progresoModel.progreso);
    }
  };

  const validateCommentForm = () => {
    const errors = [];
    
    if (!!!addCommentForm?.comment?.trim()) errors.push('comment');
    if (!(addCommentForm?.type > 0)) errors.push('type');
    
    return errors;
  };

  const deriveLogtaskStatusFromProgress = (percentage) => {
    const numericPercentage = Number(percentage);
    const currentStatus = Number(logTaskDetails?.logtask_status);

    if (numericPercentage >= 100) return '1';
    if (numericPercentage > 0 && currentStatus !== 4) return '2';
    if (Number.isFinite(currentStatus) && currentStatus > 0) return String(currentStatus);

    return numericPercentage > 0 ? '2' : '3';
  };

  // crear nuevo comentario handleSubmitCommentFromTab
  const handleSubmitCommentFromTab = async () => {
    const errors = validateCommentForm();
    
    if (errors.length > 0) {
      setCommentErrors(errors);
      setErrorCommentForm(true);
      return;
    }
    
    setErrorCommentForm(false);
    setCommentErrors([]);

    // TODO: VALIDAR MODAL
    const progreso = parseInt(addCommentForm.progress, 10) || 0
    const cantidadComentarios = parseInt(logTaskDetails.comments_logtask_count, 10) || 0


    // ...
    if(progreso === 100 && cantidadComentarios <= 0) {
      setOpenFeedbackModal(true);
      return;
    }
    
    setErrorCommentForm(false);

    const comment_type = addCommentForm.type === 1 ? 'executed' : 'revisor';
    const normalizedPercentage = Math.min(100, Math.max(0, progreso));
    const nextLogtaskStatus = deriveLogtaskStatusFromProgress(normalizedPercentage);

    try {
      const formData = new FormData();

      const monitoringDate = new Date().toISOString().split('T')[0];
      formData.append('data[monitoring_date]', monitoringDate);
      formData.append('data[comment]', addCommentForm.comment);
      formData.append('data[sharepoint_link]', addCommentForm.sharepoint_link || '');
      formData.append('percentaje', String(normalizedPercentage));
      formData.append('logtask_status', nextLogtaskStatus);

      createCommentAttachments.forEach((file) => {
        formData.append('imagefiles[]', file);
      });

      const response = await axiosInstance.post(
        `tasklist_api/add_comment_ajax_amatia_express/${logTaskDetails.id}/-/${comment_type}`,
        formData
      );

      const status = Number(response?.data?.status);
      const isSuccess = status === 200 || status === 303;

      if (isSuccess) {
        const createdCommentId = Number(response?.data?.comment_id);
        const createdCommentType = addCommentForm.type === 1 ? 'comentarios' : 'seguimientos';

        showSuccessMsg(t('comment_created_successfully'));
        setLocalFocusedCommentId(Number.isFinite(createdCommentId) ? createdCommentId : null);
        setTabValue(createdCommentType);
        setAddCommentForm({});
        setCreateCommentAttachments([]);
        setLogtaskExecutedComments([]);
        setLogtaskRevisorComments([]);
        await fetchLogtaskComments(logTaskDetails.id);
        window.dispatchEvent(new CustomEvent('dashboard-message-created'));
        
        if (onCommentAdded) {
          onCommentAdded({
            source: 'comment_create',
            status,
            logtask_id: response?.data?.logtask_id,
            comment_id: response?.data?.comment_id
          });
        }
      } else {
        showErrorMsg(t('could_not_create_comment'));
      }
    } catch (error) {
      console.error('Error posting comment: ', error);
      showErrorMsg(t('could_not_create_comment'));
    }
  };

  const handleCancelCommentFromTab = () => {
    setAddCommentForm({});
    setCreateCommentAttachments([]);
    setErrorCommentForm(false);
    setCommentErrors([]);
    setTabValue('comentarios');
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4
  };

  const typeComment = [
    {
      value: 1,
      label: t('Executioner')
    },
    {
      value: 2,
      label: t('Reviewer')
    }
  ];

  const addCommentFormData = [
    {
      id: 'comment',
      label: t('comment'),
      type: 'textarea',
      defaultValue: '',
      autoFocus: !!initialCommentText
    },
    {
      id: 'sharepoint_link',
      label: t('sharepoint_link'),
      type: 'text',
      defaultValue: ''
    },
    {
      id: 'type',
      label: t('add_comment_like'),
      type: 'dropdown',
      defaultValue: '',
      options: typeComment
    },{
      id: "progress",
      label: t("progress"),
      type: "progress",
      defaultValue: Math.min(100, Math.max(0, parseInt(logTaskDetails.progress ?? 0, 10))),
      required: false,
      disabled: parseInt(logTaskDetails.progress ?? 0, 10) === 100
    }
  ];

  const formatDate = (date) => {
    const fechaObj = new Date(date);

    return `${fechaObj.getDate()} ${fechaObj.toLocaleDateString('default', { month: 'short' })}, ${fechaObj.getFullYear()}`;
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={openEditDrawer}
        onClose={handleCloseEditDrawer}
        PaperProps={{
          sx: {
            maxWidth: '700px', // Maximum width on all screens
            width: {
              sm: '50vw', // On 1280px width, make it 35vw
              md: '40vw', // On 1366px width, make it 38vw
              lg: '700px' // On 1920px width and above, make it 40vw
            }
          }
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography color="white" variant="h5" sx={{ flexGrow: 1 }}>
              {t('edit_details_of_the_activity', { cicloId: logTaskDetails.id})}
            </Typography>
            <IconButton edge="end" onClick={handleCloseEditDrawer} aria-label="close">
              <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
          </Toolbar>
        </AppBar>

        <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
          <Box margin="30px">
            <Box>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="inherit"
                variant="fullWidth"
              >
                <Tab label={t('comments_executor')} value="comentarios" />
                <Tab label={t('followup_reviewer')} value="seguimientos" />
                <Tab label={t('add_comment')} value="crear_comentario" />
              </Tabs>
            </Box>

            {/* Tab de Comentarios Ejecutor */}
            <CustomTabPanel value={tabValue} index="comentarios">
              
              {/* // TODO: Aquí antes era === loaded: cambiar cuando se realice la API */}
              {isLoading === 'loaded' ? (
                hasExecutedComments ? (
                  logtaskExecutedComments.map((comment, index) => {
                    //console.log('Adjuntos del comentario:', comment.attachment); // <-- test
                    return (
                      <CommentCard
                        key={index}
                        comment={comment}
                        isFocused={
                          Number(comment?.comment_id)
                          === Number(localFocusedCommentId ?? focusedCommentId)
                        }
                        role={t('Executioner')}
                        onEdit={(c) => {
                          setSelectedComment(c); // Importante: actualiza el estado del comentario seleccionado
                          // Necesita que handleOpenEditCommentModal use el estado actualizado o pasarle 'c'
                          handleMenuEditCommentOpen({ currentTarget: null }, c); // Simulamos el evento o ajustamos la función
                          // Mejor aún: adapta handleMenuEditCommentOpen o usa handleOpenEditCommentModal directamente
                          // Ajuste rápido con la lógica actual:
                          handleOpenEditCommentModal(); 
                        }}
                        onDelete={(c) => {
                          setSelectedComment(c);
                          handleOpenDeleteCommentDialog();
                        }}
                        onUploadAttachment={(c) => handleOpenAttachmentModal(c)}
                        formatDate={formatDate(comment.created)}
                      />
                    );
                  })
                ) : (
                  <EmptyState
                    title={t('no_comments_title')}
                    subtitle={t('no_comments_description')}
                  />
                )
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                  <CircularProgress />
                </Box>
              )}
            </CustomTabPanel>
            
            {/* Tab de Comentarios Revisor */}
            <CustomTabPanel value={tabValue} index="seguimientos">
                {/* TODO: Aquí antes era === loaded: cambiar cuando se realice la API*/}            
                {isLoading === 'loaded' ? (
                hasRevisorComments ? (
                  logtaskRevisorComments.map((comment, index) => {
                    return (
                      <CommentCard
                        key={index}
                        comment={comment}
                        isFocused={
                          Number(comment?.comment_id)
                          === Number(localFocusedCommentId ?? focusedCommentId)
                        }
                        role={t('Reviewer')}
                        onEdit={(c) => {
                          setSelectedComment(c);
                          handleOpenEditCommentModal();
                        }}
                        onDelete={(c) => {
                          setSelectedComment(c);
                          handleOpenDeleteCommentDialog();
                        }}
                        onUploadAttachment={(c) => handleOpenAttachmentModal(c)}
                        formatDate={formatDate(comment.created)}
                      />
                    );
                  })
                ) : (
                  <EmptyState
                    title={t('no_comments_title')}
                    subtitle={t('no_comments_description')}
                  />
                )
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                  <CircularProgress />
                </Box>
              )}
            </CustomTabPanel>

            {/* Nuevo Tab de Crear Comentario */}
            <CustomTabPanel value={tabValue} index="crear_comentario">
              <Box sx={{ px: 3, py: 1 }}>

                {/* Título */}
                <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                  {t('add_comment')}
                </Typography>

                {errorCommentForm && (
                  <>
                    {commentErrors.includes('comment') && (
                      <Alert severity="error" sx={{ marginBottom: '10px' }}>
                        {t('comment_field_mandatory')}
                      </Alert>
                    )}
                    {commentErrors.includes('type') && (
                      <Alert severity="error" sx={{ marginBottom: '10px' }}>
                        {t('comment_type_mandatory')}
                      </Alert>
                    )}
                  </>
                )}

                {/* Formulario */}
                <FormBuilder
                  inputFields={addCommentFormData}
                  showActionButton={false}
                  controlled={true}
                  initialValues={{
                    ...addCommentForm,
                    progress: addCommentForm.progress !== undefined
                      ? addCommentForm.progress
                      : Math.min(100, Math.max(0, parseInt(logTaskDetails.progress ?? 0, 10)))
                  }}
                  onChange={(id, value) => {
                    setAddCommentForm((prevState) => ({ ...prevState, [id]: value }));
                  }}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('up_attachment')}
                  </Typography>

                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', mb: 1.5 }}
                  >
                    {t('select_image')}
                    <VisuallyHiddenInput
                      type="file"
                      multiple
                      accept="image/png, image/jpg, image/jpeg, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleSelectCreateCommentFiles}
                    />
                  </Button>

                  {createCommentAttachments.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {createCommentAttachments.map((file, index) => (
                        <Box
                          key={`${file.name}-${file.size}-${file.lastModified}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            py: 1,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1
                          }}
                        >
                          <Typography variant="body2" sx={{ pr: 2 }}>
                            {file.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveCreateCommentFile(index)}
                            aria-label="remove-file"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Botones */}
                <Box display="flex" gap={2} sx={{ marginTop: '30px' }}>
                  {/* Agregar comentario */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmitCommentFromTab}
                  >
                    {t('add_comment')}
                  </Button>

                  {/* Cancelar */}
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleCancelCommentFromTab}
                  >
                    {t('Cancel')}
                  </Button>
                </Box>
              </Box>
            </CustomTabPanel>
            
            <Menu open={menuEditOpen} anchorEl={anchorEl} onClose={handleMenuEditCommentClose}>
              <MenuItem onClick={handleOpenEditCommentModal}>{t('edit_comment')}</MenuItem>
              <MenuItem onClick={handleOpenDeleteCommentDialog}>{t('delete_comment')}</MenuItem>
            </Menu>
          </Box>
        </div>
      </Drawer>
      
      <Modal open={openEditCommentModal} onClose={handleCloseEditCommentModal}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{t('edit_comment')}</Typography>
            <IconButton onClick={handleCloseEditCommentModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box>
            <FormBuilder
              inputFields={addCommentFormData}
              showActionButton={false}
              controlled={true}
              initialValues={addCommentForm}
              onChange={(id, value) => {
                setAddCommentForm((prevState) => ({ ...prevState, [id]: value }));
              }}
            />
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{ marginTop: '30px' }}
            onClick={() => updateComment(selectedComment)}
          >
            {t('edit_comment')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ marginTop: '30px', marginLeft: '20px' }}
            onClick={() => setOpenEditCommentModal(false)}
          >
            {t('Cancel')}
          </Button>
        </Box>
      </Modal>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ marginBottom: '40px' }}>
            {t('add_comment_as_reviewer')}
          </Typography>
          {errorCommentForm && (
            <>
              {commentErrors.includes('comment') && (
                <Alert severity="error" sx={{ marginBottom: '10px' }}>
                  {t('comment_field_mandatory')}
                </Alert>
              )}
              {commentErrors.includes('type') && (
                <Alert severity="error" sx={{ marginBottom: '10px' }}>
                  {t('comment_type_mandatory')}
                </Alert>
              )}
            </>
          )}
          <FormBuilder
            inputFields={addCommentFormData}
            showActionButton={false}
            controlled={true}
            initialValues={addCommentForm}
            onChange={(id, value) => {
              setAddCommentForm((prevState) => ({ ...prevState, [id]: value }));
            }}
          />
          <Button
            variant="contained"
            size="large"
            sx={{ marginTop: '30px' }}
            onClick={handleAddReviewerComment}
          >
            {t('add_comment')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ marginTop: '30px', marginLeft: '20px' }}
            onClick={() => setOpenModal(false)}
          >
            {t('Cancel')}
          </Button>
        </Box>
      </Modal>
      
      <Dialog
        open={openDeleteCommentDialog}
        onClose={handleCloseDeleteCommentDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center">
            <HighlightOffIcon color="error" sx={{ fontSize: 80 }} margin="10px 0" align="center" />
          </Box>
          <Typography variant="h4" align="center">
            {t('delete_comment_dialog_message')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="space-between"
            width="100%"
            padding="5px 20px"
            alignItems="center"
          >
            <Button
              size="large"
              variant="outlined"
              onClick={handleCloseDeleteCommentDialog}
              color="primary"
            >
              {t('Cancel')}
            </Button>
            <Button
              size="large"
              color="error"
              variant="contained"
              onClick={() => handleDeleteComment(selectedComment.comment_id)}
            >
              {t('delete')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Modal open={openModalConfirmation} onClose={handleCloseModalConfirmation}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ marginBottom: '40px' }}>
            {t('are_you_sure_to_add_this_comment')}
          </Typography>
          <Typography>
            <strong>{t('title')}:</strong> {logTaskDetails.title}
          </Typography>
         
          <Typography>
            <strong>{t('comment')}:</strong> {addCommentForm.comment}
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ marginTop: '30px' }}
            onClick={handleAddEjecutorComment}
          >
            {t('yes')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ marginTop: '30px', marginLeft: '20px' }}
            onClick={() => {
              setOpenModalConfirmation(false);
              if (isExecutor) {
                setOpenModalEjecutor(true);
              } else {
                setOpenModal(true);
              }
            }}
          >
            {t('no')}
          </Button>
        </Box>
      </Modal>
      <Modal open={openModalCommentConfirmation} onClose={handleCloseModalCommentConfirmation}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ marginBottom: '40px' }}>
            {commentConfirmation}
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ marginTop: '30px' }}
            onClick={() => setOpenModalCommentConfirmation(false)}
          >
            Ok
          </Button>
        </Box>
      </Modal>
      <Modal open={openAttachmentModal} onClose={handleCloseAttachmentModal}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ marginBottom: '6px' }}>
            {t('up_attachment')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '10px' }}>
            {t('type_of_files')}: jpeg, jpg, png, pdf, doc, docx, xls, xlsx
          </Typography>
          {attachmentComment && (
            <Typography>
              {t('file_to_upload')}: {attachmentComment.name}
            </Typography>
          )}
          {previewUrl && (
            <Box sx={{ textAlign: 'center', marginTop: '16px' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </Box>
          )}
          <Box gap={2} display="flex" justifyContent="justify-between" alignItems="center">
            {attachmentComment ? (
              <Button
                variant="contained"
                size="large"
                sx={{ marginTop: '30px' }}
                //onClick={handleUploadAttachment}
                onClick={() => handleUploadAttachment(selectedComment)}
              >
                {t('submit_attachment')}
              </Button>
            ) : (
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                size="large"
                sx={{ marginTop: '30px' }}
              >
                {t('select_image')}
                <VisuallyHiddenInput
                  type="file"
                  accept="image/png, image/jpg, image/jpeg, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => handleSelectImage(event)}
                />
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              sx={{ marginTop: '30px' }}
              onClick={handleCloseAttachmentModal}
            >
              {t('close')}
            </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Modal de Feedback para ciclos al 100% sin comentarios previos */}
      <Dialog
        open={openFeedbackModal}
        onClose={() => setOpenFeedbackModal(false)}
        aria-labelledby="feedback-dialog-title"
        aria-describedby="feedback-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff3cd'
              }}
            >
              <DoNotDisturbIcon sx={{ fontSize: 32, color: '#f39c12' }} />
            </Box>
            <Typography variant="h6" component="div" gutterBottom sx={{ mt: 2 }}>
              {t('feedback_required_title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {t('feedback_required_message')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setOpenFeedbackModal(false)}
            autoFocus
          >
            {t('understood')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditEventDetailsDrawer;
