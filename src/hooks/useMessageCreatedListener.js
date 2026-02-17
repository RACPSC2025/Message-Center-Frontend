// src/hooks/useMessageCreatedListener.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUnreadMessagesCount } from '../stores/messages/unreadMessagesSlice';

export const useMessageCreatedListener = (userData) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Escuchar evento personalizado de mensaje creado
    const handleMessageCreated = (event) => {
        console.log('New message created, refreshing count');
        dispatch(fetchUnreadMessagesCount('1'));

        if (userData?.id_administradores) {
            //dispatch(fetchUnreadMessagesCount(userData.id_administradores));
            dispatch(fetchUnreadMessagesCount('1'));
        }
    };

    window.addEventListener('dashboard-message-created', handleMessageCreated);

    return () => {
      window.removeEventListener('dashboard-message-created', handleMessageCreated);
    };
  }, [dispatch, userData?.id_administradores]);
};

// Luego en EditEventDetailsDrawer.jsx después de crear el comentario:
if (response.data.status) {
  // ... código existente ...
  
  // 🔹 Disparar evento global para actualizar contador
  window.dispatchEvent(new CustomEvent('dashboard-message-created'));
}