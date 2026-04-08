import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ArchiveIcon from '@mui/icons-material/Archive';
import EmailIcon from '@mui/icons-material/Email';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlagIcon from '@mui/icons-material/Flag';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseEmptyState from '../components/BaseEmptyState';
import BaseFeaturePageLayout from '../components/BaseFeaturePageLayout';
import BaseSortPopper from '../components/BaseSortPopper';
import { BULK_ACTION } from '../config/constants';
import { useLanguage } from '../providers/languageProvider';
import { selectAppliedFilterModel } from '../stores/filterSlice';
import { fetchDashboardMessageDetails } from '../stores/messages/fetchDashboardMessageDetailsSlice';
import { fetchDashboardMessageStatistics } from '../stores/messages/fetchDashboardMessageStatisticsSlice';
import { updateMessageFlag } from '../stores/messages/updateMessageFlagSlice';
import MessageCenterCardDetails from './MessageCenterCardDetails';
import MessageCenterCardDetailsSkeleton from './MessageCenterCarditemDetailsSkeleton';
import MessageCenterImportantTab from './MessageCenterImportantTab';
import MessageCenterUnreadTab from './MessageCenterUnreadTab';
import MessageCenterReadTab from './MessageCenterReadTab';

const defaultStatistics = {
  total_message_count: 0,
  unread_message_count: 0,
  important_message_count: 0,
  archived_message_count: 0 
};

const useAppliedFilterModel = (module) =>
  useSelector((state) => selectAppliedFilterModel(state, module));

function MessageCenterNotifications() {
  const dispatch = useDispatch();
  const [messageDetails, setMessageDetails] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(true);
  const [stats, setStats] = useState(defaultStatistics);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedSortOrder, setSelectedSortOrder] = useState('Newest on top');
  const [showArchivedMessages, setShowArchivedMessages] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [tabKey, setTabKey] = useState(0); // Key para forzar remount de tabs
  const [focusedMessageByTab, setFocusedMessageByTab] = useState({
    important: null,
    unread: null,
    read: null
  });
  const [focusedMessageMetaByTab, setFocusedMessageMetaByTab] = useState({
    important: null,
    unread: null,
    read: null
  });
  const [showSelectionCheckbox] = useState(false);
  const [showSidebar] = useState(false);
  const [showHeaderActions] = useState(false);

  const sortOrderOptions = ['Newest on top', 'Oldest on top'];

  const { language } = useLanguage();
  const { t } = useTranslation();

  const activeBulkAction = useRef(null);
  const filterData = useAppliedFilterModel('notifications');
  const [showModuleStringFilter] = useState(false);

  // Separate API filters from frontend-only module selector.
  const apiFilterData = useMemo(() => {
    return Object.entries(filterData || {}).reduce((acc, [key, value]) => {
      if (key === 'filter_module_string') {
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});
  }, [filterData]);

  const moduleStringFilter = useMemo(() => {
    if (!showModuleStringFilter) {
      return '';
    }

    return String(
      typeof filterData?.filter_module_string === 'object'
        ? filterData?.filter_module_string?.value
        : filterData?.filter_module_string || ''
    )
      .trim()
      .toLowerCase();
  }, [filterData?.filter_module_string, showModuleStringFilter]);

  const keywordToHighlight = useMemo(() => {
    const rawKeyword =
      typeof filterData?.filter_keywords === 'object'
        ? filterData?.filter_keywords?.value
        : filterData?.filter_keywords;

    return String(rawKeyword || '').trim();
  }, [filterData?.filter_keywords]);

  const dashboardMessageLoading = useSelector(
    (state) => state?.fetchDashboardMessageDetails?.loading ?? false
  );

  useEffect(() => {
    refreshData();
  }, [filterData, showArchivedMessages]);

  const prepareAPIParams = () => {
    const formData = new FormData();

    if (Object.keys(filterData).length > 0) {
      Object.keys(filterData).forEach((filterKey) => {
        formData.append(filterKey, filterData[filterKey]);
      });
    }

    // 🔹 Filtros de mensajes (solo enviar los que el backend espera)
    // NOTE: `showReadMessages`, `showUnreadMessages` and `showOnlyImportant` are frontend-only filters
    formData.append('filter_show_archived_messages', showArchivedMessages ? '1' : '0');

    return formData;
  };

  const handleFetchMessagesDetails = (messageID) => {
    const formData = new FormData();
    //formData.append('id_message', messageID);

    console.log('Fetching details for message ID: ', messageID);
    const idMessage = Number(messageID);
    formData.append(
      'id_message',
      Number.isNaN(idMessage) ? 0 : idMessage
    );

    dispatch(fetchDashboardMessageDetails(formData)).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const msgDetails = data?.payload?.data ?? null;
        setMessageDetails(msgDetails);
        // 🔹 REMOVER ESTA LÍNEA - No marcar automáticamente como leído
        // if (msgDetails.is_read === '0') markMessageAsRead(msgDetails.id_message);
      }
    });
  };

  const handleSelectMessage = (tabName, messageID, messageItem = null) => {
    setFocusedMessageByTab((prevState) => ({
      ...prevState,
      [tabName]: messageID
    }));

    if (messageItem) {
      setFocusedMessageMetaByTab((prevState) => ({
        ...prevState,
        [tabName]: {
          id_message: messageItem.id_message,
          is_important: messageItem.is_important
        }
      }));
    }

    handleFetchMessagesDetails(messageID);
  };

  /*
  const handleFetchMessageStatistics = () => {
    const formData = prepareAPIParams();
    dispatch(fetchDashboardMessageStatistics(formData)).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const stats = data?.payload?.data;
        setStats(stats);
      }
    });
  };
  */

  const handleFetchMessageStatistics = () => {
    // 🔹 Solo necesita user_id, no los filtros
    const formData = new FormData();
    formData.append('user_id', '1'); // temporal hasta tener auth de usuarios
    
    dispatch(fetchDashboardMessageStatistics(formData)).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const stats = data?.payload?.data;
        setStats(stats);
      }
    });
  };

  const handleUpdateMessageInfo = (messageID, updatedInfo) => {
    const formData = new FormData();
    formData.append('id_message', messageID);
    formData.append('user_id', '1'); // temporal hasta tener auth de usuarios

    if (updatedInfo.hasOwnProperty('is_read')) formData.append('is_read', updatedInfo.is_read);
    if (updatedInfo.hasOwnProperty('is_important'))
      formData.append('is_important', updatedInfo.is_important);
    if (updatedInfo.hasOwnProperty('is_archived'))
      formData.append('is_archived', updatedInfo.is_archived);

    return dispatch(updateMessageFlag(formData)).then((data) => {
      if (data.payload.messages === 'Success') {
        const { is_read, is_important, is_archived } = data.payload.data;

        // Reconsultar estadisticas cuando cambia estado de lectura o importante.
        if (
          updatedInfo.hasOwnProperty('is_read') ||
          updatedInfo.hasOwnProperty('is_important')
        ) {
          handleFetchMessageStatistics();
        }
        
        // 🔹 Disparar evento SIEMPRE que cambie is_read (tanto a 0 como a 1)
        if (updatedInfo.hasOwnProperty('is_read')) {
          console.log(`Message ${messageID} marked as ${updatedInfo.is_read === 1 ? 'read' : 'unread'}, refreshing counter`);
          window.dispatchEvent(new CustomEvent('dashboard-message-created'));
        }
        
        return { is_read, is_important, is_archived };
      }
      return null;
    });
  };

  const updateMessageInListOfMessages = (messageID, updatedInfo = {}) => {
    // Actualizar detalles del mensaje si está seleccionado
    if (messageID === messageDetails?.id_message) {
      setMessageDetails((prevState) => ({ ...prevState, ...updatedInfo }));
    }
    // Forzar recarga de tabs para reflejar cambios
    setTabKey((prev) => prev + 1);
  };

  const markMessageAsRead = async (messageID) => {
    try {
      const response = await handleUpdateMessageInfo(messageID, { is_read: 1 });
      if (response) {
        updateMessageInListOfMessages(messageID, response);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const toggleMessageAsImportant = async (messageID, isImportant = true) => {
    try {
      const response = await handleUpdateMessageInfo(messageID, {
        is_important: Number(isImportant)
      });
      if (response) {
        updateMessageInListOfMessages(messageID, response);
      }
    } catch (error) {
      console.error('Error marking message as important:', error);
    }
  };

  const markMessageAsUnread = async (messageID) => {
    try {
      const response = await handleUpdateMessageInfo(messageID, { is_read: 0 });
      if (response) {
        updateMessageInListOfMessages(messageID, response);
      }
    } catch (error) {
      console.error('Error marking message as unread:', error);
    }
  };

  const createFooterStatsConfig = (stats) => {
    return [
      {
        name: 'Total',
        count: stats.total_message_count,
        icon: EmailIcon
      },
      {
        name: t('Unread'),
        count: stats.unread_message_count,
        icon: MarkEmailUnreadIcon
      },
      {
        name: t('Important'),
        count: stats.important_message_count,
        icon: FlagIcon
      },
      {
        name: t('Archive'),
        count: stats.archived_message_count,
        icon: ArchiveIcon
      }
    ];
  };

  const handleSortOrderOptionClick = (option) => {
    setSelectedSortOrder(option);
  };

  const handleShowArchivedMessagesChange = (value) => {
    setShowArchivedMessages(value);
  };

  const refreshData = () => {
    // Forzar remount de tabs incrementando la key
    setTabKey((prev) => prev + 1);
    setFocusedMessageByTab({
      important: null,
      unread: null,
      read: null
    });
    setFocusedMessageMetaByTab({
      important: null,
      unread: null,
      read: null
    });
    setSelectedMessages([]);
    setMessageDetails(null);
    setIsFetchingDetails(true);
    setStats(defaultStatistics);
    handleFetchMessageStatistics();
  };

  const handleOpenBulkActionConfirmationDialog = (action) => {
    setOpen(true);
    activeBulkAction.current = action;
  };

  const handleClose = () => {
    setOpen(false);
    activeBulkAction.current = null;
  };

  const handleChangeMessageSelection = (isChecked, messageID) => {
    if (isChecked) {
      setSelectedMessages([...selectedMessages, messageID]);
    } else {
      setSelectedMessages(selectedMessages.filter((id) => id !== messageID));
    }
  };

  const handleBulkAction = async () => {
    if (activeBulkAction.current) {
      try {
        let payload = {};

        if (activeBulkAction.current === BULK_ACTION.archive) {
          payload['is_archived'] = 1;
        }

        const updatedMessagePromises = selectedMessages.map((msgID) =>
          handleUpdateMessageInfo(msgID, payload)
        );

        await Promise.all(updatedMessagePromises);

        setOpen(false);
        setSelectedMessages([]);
        refreshData();
      } catch (error) {
        console.error('Error doing bulk action', error);
      }
    }
  };

  const statsConfig = useMemo(() => createFooterStatsConfig(stats), [stats]);

  const showLoaderForMessageDetails = useMemo(
    () => (isFetchingDetails && messageDetails === null) || dashboardMessageLoading,
    [isFetchingDetails, dashboardMessageLoading, messageDetails]
  );

  const singleNotificationMessageKey =
    language === 'en' ? 'subject_message_en' : 'subject_message_es';
  const singleNotificationDescriptionKey =
    language === 'en' ? 'text_message_en' : 'text_message_es';
  const singleNotificationEmployeeKey =
    language === 'en' ? 'employee_message_en' : 'employee_message_es';

  const moduleStringLabelMap = useMemo(
    () => ({
      LegalMatriz: language === 'en' ? 'Legal Matrix' : 'Matriz legal',
      tasks: language === 'en' ? 'Tasks' : 'Tareas',
      actions: language === 'en' ? 'Actions' : 'Acciones'
    }),
    [language]
  );

  const getModuleStringLabel = (moduleString) => {
    if (!moduleString) return '';
    return moduleStringLabelMap[moduleString] ?? moduleString;
  };

  const handleMessagesLoaded = (tabName, firstMessage) => {
    if (firstMessage?.id_message) {
      handleSelectMessage(tabName, firstMessage.id_message, firstMessage);
      handleFetchMessageStatistics();
    }
  };

  const tabNameByIndex = {
    0: 'important',
    1: 'unread',
    2: 'read'
  };
  const activeTabName = tabNameByIndex[activeTab] || 'important';
  const focusedMessageIsImportant = focusedMessageMetaByTab[activeTabName]?.is_important;

  return (
    <>
      <BaseFeaturePageLayout statsConfig={statsConfig}>
        {/* Sidebar de navegación */}
        {showSidebar && (
          <Box
            sx={{
              width: '240px',
              height: '100%',
              backgroundColor: '#f5f5f5',
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              p: 2
            }}
          >
            {/* Logo y título */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <BusinessIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  CENTRO DE NOTIFICACIONES
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  SISTEMA DE GESTIÓN
                </Typography>
              </Box>
            </Box>

            {/* Menú de navegación */}
            <List sx={{ flexGrow: 1 }}>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.light'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('MessageCenter')}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton sx={{ borderRadius: 1, mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('Alerts')}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton sx={{ borderRadius: 1, mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('History')}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                </ListItemButton>
              </ListItem>
            </List>

            {/* Sección de configuración */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  px: 2,
                  mb: 1,
                  display: 'block'
                }}
              >
                {t('configuration').toUpperCase()}
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton sx={{ borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('Settings')}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Box>
        )}

        {/* Panel de mensajes */}
        <Box
          sx={{
            width: {
              lg: '35%',
              xl: '40%',
              xxl: '45%'
            },
            height: '100%',
            backgroundColor: '#fff',
            borderRight: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Título de Notificaciones */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {/*t('notifications')*/}
              CENTRO DE NOTIFICACIONES
            </Typography>
            {showHeaderActions && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <BaseSortPopper
                  sortOrderOptions={sortOrderOptions}
                  selectedSortOrder={selectedSortOrder}
                  handleSortOrderOptionClick={handleSortOrderOptionClick}
                />
                <Tooltip title="Refresh">
                  <IconButton onClick={refreshData} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Tabs para categorías de mensajes */}
            <Tabs
              value={activeTab}
              onChange={(event, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: '48px',
                bgcolor: 'background.paper',
                '& .MuiTab-root': {
                  minHeight: '48px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab 
                label={`${t('important')} (${stats.important_message_count || 0})`}
              />
              <Tab 
                label={`${t('unread')} (${stats.unread_message_count || 0})`}
              />
              <Tab 
                label={`${t('read')} (${stats.total_message_count - stats.unread_message_count || 0})`}
              />
            </Tabs>

            {/* Contenido del tab activo con componentes separados */}
            {activeTab === 0 && (
              <MessageCenterImportantTab
                key={`important-${tabKey}`}
                filterData={apiFilterData}
                keywordToHighlight={keywordToHighlight}
                moduleStringFilter={moduleStringFilter}
                showArchivedMessages={showArchivedMessages}
                showSelectionCheckbox={showSelectionCheckbox}
                focusedMessageId={focusedMessageByTab.important}
                selectedMessages={selectedMessages}
                messageDetails={messageDetails}
                handleFetchMessagesDetails={handleFetchMessagesDetails}
                handleSelectMessage={(messageID, messageItem) =>
                  handleSelectMessage('important', messageID, messageItem)
                }
                handleChangeMessageSelection={handleChangeMessageSelection}
                toggleMessageAsImportant={toggleMessageAsImportant}
                markMessageAsRead={markMessageAsRead}
                markMessageAsUnread={markMessageAsUnread}
                singleNotificationEmployeeKey={singleNotificationEmployeeKey}
                singleNotificationMessageKey={singleNotificationMessageKey}
                singleNotificationDescriptionKey={singleNotificationDescriptionKey}
                getModuleStringLabel={getModuleStringLabel}
                onMessagesLoaded={(firstMessage) => handleMessagesLoaded('important', firstMessage)}
              />
            )}
            
            {activeTab === 1 && (
              <MessageCenterUnreadTab
                key={`unread-${tabKey}`}
                filterData={apiFilterData}
                keywordToHighlight={keywordToHighlight}
                moduleStringFilter={moduleStringFilter}
                showArchivedMessages={showArchivedMessages}
                showSelectionCheckbox={showSelectionCheckbox}
                focusedMessageId={focusedMessageByTab.unread}
                selectedMessages={selectedMessages}
                messageDetails={messageDetails}
                handleFetchMessagesDetails={handleFetchMessagesDetails}
                handleSelectMessage={(messageID, messageItem) =>
                  handleSelectMessage('unread', messageID, messageItem)
                }
                handleChangeMessageSelection={handleChangeMessageSelection}
                toggleMessageAsImportant={toggleMessageAsImportant}
                markMessageAsRead={markMessageAsRead}
                markMessageAsUnread={markMessageAsUnread}
                singleNotificationEmployeeKey={singleNotificationEmployeeKey}
                singleNotificationMessageKey={singleNotificationMessageKey}
                singleNotificationDescriptionKey={singleNotificationDescriptionKey}
                getModuleStringLabel={getModuleStringLabel}
                onMessagesLoaded={(firstMessage) => handleMessagesLoaded('unread', firstMessage)}
              />
            )}
            
            {activeTab === 2 && (
              <MessageCenterReadTab
                key={`read-${tabKey}`}
                filterData={apiFilterData}
                keywordToHighlight={keywordToHighlight}
                moduleStringFilter={moduleStringFilter}
                showArchivedMessages={showArchivedMessages}
                showSelectionCheckbox={showSelectionCheckbox}
                focusedMessageId={focusedMessageByTab.read}
                selectedMessages={selectedMessages}
                messageDetails={messageDetails}
                handleFetchMessagesDetails={handleFetchMessagesDetails}
                handleSelectMessage={(messageID, messageItem) =>
                  handleSelectMessage('read', messageID, messageItem)
                }
                handleChangeMessageSelection={handleChangeMessageSelection}
                toggleMessageAsImportant={toggleMessageAsImportant}
                markMessageAsRead={markMessageAsRead}
                markMessageAsUnread={markMessageAsUnread}
                singleNotificationEmployeeKey={singleNotificationEmployeeKey}
                singleNotificationMessageKey={singleNotificationMessageKey}
                singleNotificationDescriptionKey={singleNotificationDescriptionKey}
                getModuleStringLabel={getModuleStringLabel}
                onMessagesLoaded={(firstMessage) => handleMessagesLoaded('read', firstMessage)}
              />
            )}
          </Box>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            maxWidth: {
              lg: '60%',
              xl: '55%',
              xxl: '50%'
            },
            px: 2,
            pt: 2,
            overflowY: 'auto'
          }}
        >
          {showLoaderForMessageDetails ? (
            <MessageCenterCardDetailsSkeleton />
          ) : messageDetails === null ? (
            <BaseEmptyState module="messages" section="details" />
          ) : (
            <MessageCenterCardDetails
              messageDetails={messageDetails}
              focusedMessageIsImportant={focusedMessageIsImportant}
              toggleImportant={toggleMessageAsImportant}
              markAsRead={markMessageAsRead}
            />
          )}
        </Box>
      </BaseFeaturePageLayout>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('confirm_archive')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('are_you_sure_you_want_to_archive_this_item')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('disagree')}</Button>
          <Button onClick={handleBulkAction} autoFocus>
            {t('agree')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MessageCenterNotifications;