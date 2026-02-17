import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnreadMessagesCount } from '../stores/messages/unreadMessagesSlice';

/**
 * Hook personalizado para hacer polling del contador de mensajes no leídos
 * @param {number} interval - Intervalo de polling en milisegundos (default: 30000 = 30 segundos)
 * @param {boolean} enabled - Si el polling está habilitado (default: true)
 */
export const useUnreadMessagesPolling = (interval = 30000, enabled = true) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const userData = useSelector((state) => state.globalData.userDetails);

  useEffect(() => {
    if (!enabled || !userData?.id_administradores) {
      return;
    }

    // Fetch inicial
    //dispatch(fetchUnreadMessagesCount(userData.id_administradores));
    dispatch(fetchUnreadMessagesCount('1'));

    // Configurar polling
    intervalRef.current = setInterval(() => {
      //dispatch(fetchUnreadMessagesCount(userData.id_administradores));
      dispatch(fetchUnreadMessagesCount('1'));
    }, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, interval, enabled, userData?.id_administradores]);

  // Función manual para refrescar
  const refreshCount = () => {
    
    dispatch(fetchUnreadMessagesCount('1'));
    if (userData?.id_administradores) {
      //dispatch(fetchUnreadMessagesCount(userData.id_administradores));
      //dispatch(fetchUnreadMessagesCount('1'));
    }
  };

  return { refreshCount };
};