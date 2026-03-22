import ArchiveIcon from '@mui/icons-material/Archive';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlagIcon from '@mui/icons-material/Flag';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import FormDrawer from '../components/FormDrawer';
import { useModuleNavigation } from '../hooks/useModuleNavigation';
import { useLanguage } from '../providers/languageProvider';
import { fetchMessageFormFields } from '../stores/messages/fetchMessageFormFieldsSlice';
import { submitMessageData } from '../stores/messages/submitMessageDataSlice';
import { isBase64ImageData, stringAvatar } from '../utils/others';

function MessageCenterCardDetails({ messageDetails, toggleImportant, markAsRead }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const dispatch = useDispatch();
  const { navigateToModule } = useModuleNavigation();
  const base64FieldIds = useRef([]);
  const [formFields, setFormFields] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedRelatedMessages, setExpandedRelatedMessages] = useState({});

  const isMenuOpen = Boolean(anchorEl);

  const { form_code = null, form_title = null, is_important, extra_params = {} } = messageDetails;

  const user = useSelector((state) => state.globalData.userDetails);

  const defaultFormModel = {
    master_record_id: '',
    master_table_name: '',
    extra_params,
    additionalData: []
  };

  /**
   * Navega al módulo correspondiente basándose en los datos del mensaje
   * Marca el mensaje como leído antes de navegar
   */
  const handleNavigateToModule = async () => {
    console.log('handleNavigateToModule called with messageDetails:', messageDetails);
    
    const success = await navigateToModule(messageDetails, {
      markAsRead: true,
      userId: user?.id_administradores || '1' // Usar el ID del usuario logueado
    });

    if (!success) {
      console.error('Navigation failed');
      // Opcionalmente mostrar un mensaje de error al usuario
    }
  };

  /**
   * Obtiene los campos del formulario asociado al mensaje
   */
  const handleFetchMessageFormFields = (formCode) => {
    const formData = new FormData();
    formData.append('form_code', formCode);
    dispatch(fetchMessageFormFields(formData)).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const formFields = getFormBuilderInputFields(data.payload.data) ?? [];
        setFormFields(formFields);

        base64FieldIds.current = formFields
          .filter((field) => field.type === 'file')
          .map((field) => field.id);
      }
    });
  };

  /**
   * Carga los campos del formulario cuando se abre el diálogo
   */
  useEffect(() => {
    if (form_code && isDialogOpen && formFields.length === 0) {
      handleFetchMessageFormFields(form_code);
    }
  }, [form_code, isDialogOpen, formFields]);

  /**
   * Resetea los campos del formulario cuando cambia el form_code
   */
  useEffect(() => {
    if (form_code) {
      setFormFields([]);
    }
  }, [form_code]);

  /**
   * Log de cambios en messageDetails para debugging
   */
  useEffect(() => {
    console.log('Message Details Updated:', messageDetails);
  }, [messageDetails]);

  /**
   * Transforma los campos del formulario al formato esperado por FormDrawer
   */
  const getFormBuilderInputFields = (fields) => {
    return fields.map((field) => {
      const labelKey = language === 'en' ? 'label_en' : 'label_es';
      const { id, [labelKey]: label, control_type: type, is_require: required, options } = field;

      let formFieldInfo = {
        id,
        label,
        type,
        required: Boolean(required)
      };

      let updatedOptions = [];
      if (type === 'dropdown') {
        updatedOptions = options.split(',').map((opt) => ({ value: opt, label: opt }));
        formFieldInfo.options = updatedOptions;
      }

      return formFieldInfo;
    });
  };

  /**
   * Prepara los datos del formulario antes de enviarlos
   */
  const prepareFormData = (formValues) => {
    let formData = {
      ...defaultFormModel,
      unique_filled_form_id: `${user.id_administradores}${+new Date()}`,
      cf: formValues
    };

    const base64FieldWithValues = base64FieldIds.current.filter((fieldId) =>
      isBase64ImageData(formValues[fieldId])
    );
    if (base64FieldWithValues.length) {
      formData['base_64'] = base64FieldWithValues.reduce(
        (acc, cur) => ({ ...acc, [cur]: cur }),
        {}
      );
    }

    return formData;
  };

  /**
   * Envía los datos del formulario
   */
  const handleSubmitFormData = (formValues, successCallback) => {
    const formData = prepareFormData(formValues);
    dispatch(submitMessageData(formData)).then((data) => {
      if (data?.payload?.messages === 'Success') successCallback();
    });
  };

  /**
   * Cierra el diálogo del formulario
   */
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  /**
   * Abre el diálogo del formulario
   */
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  /**
   * Abre el menú contextual
   */
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Cierra el menú contextual
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Alterna la expansión de un mensaje relacionado
   */
  const toggleRelatedMessage = (messageId) => {
    setExpandedRelatedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Claves para los mensajes según el idioma
  const singleNotificationMessageKey =
    language === 'en' ? 'subject_message_en' : 'subject_message_es';
  const singleNotificationDescriptionKey =
    language === 'en' ? 'text_message_en' : 'text_message_es';

  // Configuración de avatares
  const avatarCommonStyle = { width: 24, height: 24 };
  const whoSentAvatarProps = stringAvatar(messageDetails.who_sent_name, {
    ...avatarCommonStyle,
    bgcolor: 'primary.main'
  });

  // Ordenar mensajes relacionados por fecha (más reciente primero)
  // Excluir el mensaje principal de la lista de relacionados
  const sortedRelatedMessages = messageDetails.related_messages
    ? [...messageDetails.related_messages]
        .filter(msg => msg.id_message !== messageDetails.id_message)
        .sort((a, b) => {
          const dateA = new Date(a.date_message);
          const dateB = new Date(b.date_message);
          return dateB - dateA; // Más reciente primero
        })
    : [];

  return (
    <Fragment>
      <Box
        sx={{
          minHeight: '100%',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '10px',
          p: 2
        }}
      >
        {/* Header con título y acciones */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h5" sx={{ width: '90%' }}>
            {messageDetails[singleNotificationMessageKey]}
          </Typography>
          <Box sx={{ ml: 3, display: 'flex' }}>
            {/* Botón de marcar como importante */}
            <IconButton
              size="small"
              color={is_important === '0' ? 'default' : 'primary'}
              onClick={() => toggleImportant(messageDetails.id_message, is_important === '0')}
            >
              <FlagIcon />
            </IconButton>
            {/* Botón de menú contextual */}
            <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 1 }}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>
                <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                {t('archive_message')}
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Información del remitente y suscriptores */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          {/* Avatar y datos del remitente */}
          <Avatar {...whoSentAvatarProps} />
          <Box sx={{ ml: 1 }}>
            <Typography variant="body2" color="text.primary" fontWeight="bold">
              {messageDetails.who_sent_name}
            </Typography>

            {messageDetails.who_sent_email && (
              <Typography variant="caption" color="text.secondary">
                {messageDetails.who_sent_email}
              </Typography>
            )}
          </Box>

          {/* Suscriptores del mensaje */}
          {messageDetails.user_names && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: 'flex', mr: '4px' }}
              >
                {t('subscribers')}
              </Typography>
              <AvatarGroup max={4}>
                {messageDetails.user_names.split(',').map((userName, idx) => {
                  const avatarProps = stringAvatar(userName.trim(), {
                    ...avatarCommonStyle,
                    fontSize: '0.8rem'
                  });
                  return <Avatar key={idx} {...avatarProps} />;
                })}
              </AvatarGroup>
            </Box>
          )}
        </Box>

        {/* Contenido del mensaje */}
        <Box sx={{ display: 'flex', border: '1px solid #ccc', p: 3, borderRadius: '4px' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">
              {messageDetails[singleNotificationDescriptionKey]}
            </Typography>

            {/* Botón "Ver actividad" - Navega al módulo relacionado */}
            {messageDetails.module_table_record_id && (
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={handleNavigateToModule}
              >
                {t('show_element')}
              </Button>
            )}

            {/* Botón del formulario asociado (si existe) */}
            {form_code && form_title && (
              <Button
                size="small"
                variant="contained"
                sx={{ 
                  backgroundColor: '#ff0066', 
                  color: '#fff', 
                  mt: 2, 
                  ml: 1,
                  fontWeight: 'normal',
                  '&:hover': {
                    backgroundColor: '#cc0052'
                  }
                }}
                onClick={handleDialogOpen}
              >
                {form_title}
              </Button>
            )}
          </Box>
        </Box>

        {/* Mensajes relacionados */}
        {sortedRelatedMessages.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                color: 'primary.main'
              }}
            >
              {t('activity')} ({sortedRelatedMessages.length})
            </Typography>
            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              {sortedRelatedMessages.map((relatedMsg) => {
                const isExpanded = expandedRelatedMessages[relatedMsg.id_message];
                return (
                  <Box
                    key={relatedMsg.id_message}
                    sx={{
                      border: '1px solid #ccc',
                      borderRadius: '10px',
                      mb: 2,
                      overflow: 'hidden',
                      backgroundColor: '#fff'
                    }}
                  >
                    {/* Header del mensaje relacionado */}
                    <Box
                      onClick={() => toggleRelatedMessage(relatedMsg.id_message)}
                      sx={{
                        display: 'flex',
                        p: 2,
                        cursor: 'pointer',
                        borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
                        '&:hover': {
                          backgroundColor: 'grey.50'
                        }
                      }}
                    >
                      {/* Indicador de color */}
                      <Box
                        sx={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: relatedMsg.is_important === '1' ? 'error.main' : 'info.main',
                          mt: 0.5,
                          mr: 2,
                          flexShrink: 0
                        }}
                      />
                      
                      {/* Contenido del mensaje */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            sx={{ 
                              flex: 1,
                              pr: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {relatedMsg[singleNotificationMessageKey]}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                          >
                            {new Date(relatedMsg.date_message).toLocaleDateString(language, {
                              month: 'short',
                              day: '2-digit'
                            })}, {new Date(relatedMsg.date_message).toLocaleTimeString(language, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.4
                          }}
                        >
                          {relatedMsg[singleNotificationDescriptionKey]}
                        </Typography>
                      </Box>

                      {/* Icono de expansión */}
                      <ExpandMoreIcon
                        sx={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                          color: 'text.secondary',
                          ml: 1,
                          flexShrink: 0
                        }}
                      />
                    </Box>

                    {/* Contenido expandido del mensaje relacionado */}
                    {isExpanded && (
                      <Box sx={{ px: 2, pb: 2 }}>
                        {/* Información del remitente y suscriptores */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                          {/* Avatar y datos del remitente */}
                          <Avatar
                            {...stringAvatar(relatedMsg.who_sent_name, {
                              ...avatarCommonStyle,
                              bgcolor: 'primary.main'
                            })}
                          />
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body2" color="text.primary" fontWeight="bold">
                              {relatedMsg.who_sent_name}
                            </Typography>
                            {relatedMsg.who_sent_email && (
                              <Typography variant="caption" color="text.secondary">
                                {relatedMsg.who_sent_email}
                              </Typography>
                            )}
                          </Box>

                          {/* Suscriptores del mensaje */}
                          {relatedMsg.user_names && (
                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: 'flex', mr: '4px' }}
                              >
                                {t('subscribers')}
                              </Typography>
                              <AvatarGroup max={4}>
                                {relatedMsg.user_names.split(',').map((userName, idx) => {
                                  const avatarProps = stringAvatar(userName.trim(), {
                                    ...avatarCommonStyle,
                                    fontSize: '0.8rem'
                                  });
                                  return <Avatar key={idx} {...avatarProps} />;
                                })}
                              </AvatarGroup>
                            </Box>
                          )}
                        </Box>

                        {/* Contenido del mensaje */}
                        <Box sx={{ display: 'flex', border: '1px solid #ccc', p: 3, borderRadius: '4px', mt: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1">
                              {relatedMsg[singleNotificationDescriptionKey]}
                            </Typography>

                            {/* Botón "Ver actividad" - Navega al módulo relacionado */}
                            {relatedMsg.module_table_record_id && (
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={() => {
                                  // Navegar al módulo del mensaje relacionado
                                  navigateToModule(relatedMsg, {
                                    markAsRead: false,
                                    userId: user?.id_administradores || '1'
                                  });
                                }}
                              >
                                {t('show_element')}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Footer vacío con fondo azul (puede ser usado para información adicional) */}
        <Box sx={{ p: 2, backgroundColor: 'blue2.main', textAlign: 'center', mt: 2 }}>
          {/* Espacio para información adicional si se necesita */}
        </Box>
      </Box>

      {/* Diálogo del formulario */}
      {form_code && form_title && (
        <FormDrawer
          title={form_title}
          open={isDialogOpen}
          submitForm={handleSubmitFormData}
          handleClose={handleDialogClose}
          inputFields={formFields}
        />
      )}
    </Fragment>
  );
}

export default MessageCenterCardDetails;