import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { dashboardMessageUnread } from '../stores/messages/dashboardMessageUnreadSlice';
import { useIntersectionObserver } from '../hooks/useInterSectionObserver';
import MessageCenterCardItem from './MessageCenterCardItem';
import MessageCenterCarditemSkeleton from './MessageCenterCarditemSkeleton';

const MessageCenterUnreadTab = ({
  filterData = {},
  keywordToHighlight = '',
  moduleStringFilter = '',
  showArchivedMessages = false,
  showSelectionCheckbox = false,
  focusedMessageId = null,
  selectedMessages,
  messageDetails,
  handleFetchMessagesDetails,
  handleSelectMessage,
  handleChangeMessageSelection,
  toggleMessageAsImportant,
  markMessageAsRead,
  markMessageAsUnread,
  singleNotificationEmployeeKey,
  singleNotificationMessageKey,
  singleNotificationDescriptionKey,
  getModuleStringLabel,
  onMessagesLoaded
}) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollContainerRef = useRef(null);
  const targetRef = useRef(null);
  const isIntersecting = useIntersectionObserver(targetRef, scrollContainerRef);

  const isFetching = useSelector((state) => state?.dashboardMessageUnread?.loading ?? false);

  // Fetch messages when page number changes
  useEffect(() => {
    if (pageNum >= 1 && !hasReachedEnd) {
      fetchMessages();
    }
  }, [pageNum]);

  // Handle intersection observer
  useEffect(() => {
    if (isIntersecting && !hasReachedEnd && !isLoading && messages.length > 0) {
      setPageNum((prev) => prev + 1);
    }
  }, [isIntersecting, hasReachedEnd, isLoading]);

  useEffect(() => {
    setMessages([]);
    setHasReachedEnd(false);
    setPageNum(1);
    fetchMessages(1, true);
  }, [filterData, moduleStringFilter, showArchivedMessages]);

  const fetchMessages = (nextPage = pageNum, replaceData = false) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('user_id', '1');
    formData.append('page', nextPage);
    formData.append('filter_show_archived_messages', showArchivedMessages ? '1' : '0');

    Object.keys(filterData || {}).forEach((filterKey) => {
      const filterValue = filterData[filterKey];
      if (filterValue === undefined || filterValue === null || filterValue === '') {
        return;
      }

      if (dayjs.isDayjs(filterValue)) {
        formData.append(filterKey, filterValue.format('YYYY-MM-DD'));
        return;
      }

      formData.append(filterKey, filterValue);
    });

    dispatch(dashboardMessageUnread(formData)).then((res) => {
      const dataObj = res?.payload;
      if (dataObj?.messages === 'Success') {
        const data = dataObj?.data || [];
        const filteredData = moduleStringFilter
          ? data.filter(
              (msg) => String(msg?.module_string || '').trim().toLowerCase() === moduleStringFilter
            )
          : data;
        const next = dataObj?.next;

        if (replaceData || nextPage === 1) {
          setMessages(filteredData);
          const hasSelectedMessageInCurrentTab =
            focusedMessageId && filteredData.some((msg) => msg.id_message === focusedMessageId);

          // Seleccionar el primer mensaje por defecto cuando no hay selección válida en este tab
          if (filteredData.length > 0 && onMessagesLoaded && !hasSelectedMessageInCurrentTab) {
            onMessagesLoaded(filteredData[0]);
          }
        } else {
          setMessages((prevMessages) => {
            const existingIds = new Set(prevMessages.map((m) => m.id_message));
            const newMessages = filteredData.filter((m) => !existingIds.has(m.id_message));
            return [...prevMessages, ...newMessages];
          });
        }
        setHasReachedEnd(!next);
      }
      setIsLoading(false);
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = dayjs(msg.date_message).format('dddd, D [de] MMMM [de] YYYY');
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey).push(msg);
    return groups;
  }, new Map());

  return (
    <Box ref={scrollContainerRef} sx={{ maxHeight: '600px', overflowY: 'auto' }}>
      {Array.from(groupedMessages).map(([dateKey, msgs]) => (
        <Box key={`unread-${dateKey}`} sx={{ my: 0.5 }}>
          <Typography variant="body2" color="text.primary" sx={{ ml: 1, mb: 0.5 }}>
            {dateKey}
          </Typography>
          {msgs.map((msg) => (
            <MessageCenterCardItem
              key={msg.id_message}
              keywordToHighlight={keywordToHighlight}
              showSelectionCheckbox={showSelectionCheckbox}
              reviewer={msg[singleNotificationEmployeeKey]}
              moduleLabel={getModuleStringLabel?.(msg.module_string)}
              message={msg[singleNotificationMessageKey]}
              desc={msg[singleNotificationDescriptionKey]}
              date={msg.date_message}
              isSelected={selectedMessages.includes(msg.id_message)}
              isActive={focusedMessageId === msg.id_message}
              isUnread={msg.is_read === '0'}
              isImportant={msg.is_important !== '0'}
              targetDate={msg.due_date}
              status={msg.status}
              onClick={() => {
                handleSelectMessage(msg?.id_message, msg);
              }}
              onCheckChanged={(isChecked) =>
                handleChangeMessageSelection(isChecked, msg.id_message)
              }
              onToggleImportant={() =>
                toggleMessageAsImportant(msg.id_message, msg.is_important === '0')
              }
              onMarkAsRead={() => markMessageAsRead(msg.id_message)}
              onMarkAsUnread={() => markMessageAsUnread(msg.id_message)}
            />
          ))}
        </Box>
      ))}
      {/* Loader para paginación */}
      {!hasReachedEnd && (
        <Box
          ref={targetRef}
          sx={{
            mt: isFetching && messages.length === 0 ? 2 : 0,
            display: 'block'
          }}
        >
          <MessageCenterCarditemSkeleton />
          <MessageCenterCarditemSkeleton />
        </Box>
      )}
    </Box>
  );
};

export default MessageCenterUnreadTab;
