import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setFilter } from '../stores/filterSlice';
import { fetchModuleNavigationIds } from '../stores/messages/fetchModuleNavigationIdsSlice';
import { updateMessageFlag } from '../stores/messages/updateMessageFlagSlice';

/**
 * Hook personalizado para manejar la navegación a diferentes módulos
 * basándose en module_string, module_table y module_table_record_id
 */
export const useModuleNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Establece un valor de filtro en Redux
   */
  const setFilterValue = useCallback((module, id, value) => {
    if (!module) {
      console.error('El módulo es undefined o inválido');
      return;
    }
    const payload = {
      module,
      updatedFilter: { [id]: value }
    };
    dispatch(setFilter(payload));
  }, [dispatch]);

  /**
   * Navega al módulo correcto basándose en los parámetros del mensaje
   * 
   * @param {Object} messageDetails - Detalles del mensaje del dashboard
   * @param {Object} options - Opciones adicionales
   * @param {boolean} options.markAsRead - Si debe marcar el mensaje como leído
   * @param {string} options.userId - ID del usuario (requerido si markAsRead es true)
   * @returns {Promise<boolean>} - True si la navegación fue exitosa
   */
  const navigateToModule = useCallback(async (messageDetails, options = {}) => {
    const { markAsRead = true, userId = '1' } = options;

    // 1. LIMPIEZA INICIAL DE FILTROS (TASK Y LegalMatriz)
    // Se realiza al inicio para asegurar un estado limpio antes de cualquier lógica de navegación.
    
    // Limpiar filtros módulo TASKS
    setFilterValue('task', 'selected_task_id', null);
    setFilterValue('task', 'isSelected_task_id', false);
    setFilterValue('task', 'selected_logtask_id', null);
    setFilterValue('task', 'isSelected_logtask_id', false);
    setFilterValue('task', 'selected_logtask_comment_id', null);
    setFilterValue('task', 'isSelected_logtask_comment_id', false);
    setFilterValue('task', 'selected_logtask_comment_attachment_id', null);
    setFilterValue('task', 'isSelected_logtask_comment_attachment_id', false);

    // Limpiar filtros módulo LegalMatriz
    setFilterValue('LegalMatriz', 'selected_requisito_id', null);
    setFilterValue('LegalMatriz', 'isSelected_requisito_id', false);
    setFilterValue('LegalMatriz', 'selected_articulo_id', null);
    setFilterValue('LegalMatriz', 'isSelected_articulo_id', false);
    setFilterValue('LegalMatriz', 'selected_articulo_data_id', null);
    setFilterValue('LegalMatriz', 'isSelected_articulo_data_id', false);
    setFilterValue('LegalMatriz', 'selected_requisito_data_id', null);
    setFilterValue('LegalMatriz', 'isSelected_requisito_data_id', false);
    setFilterValue('LegalMatriz', 'selected_articulo_licencia_id', null);
    setFilterValue('LegalMatriz', 'isSelected_articulo_licencia_id', false);
    setFilterValue('LegalMatriz', 'selected_licencia_id', null);
    setFilterValue('LegalMatriz', 'isSelected_licencia_id', false);

    try {
      const {
        module_string,
        module_table,
        module_table_record_id,
        id_message,
        is_read
      } = messageDetails;

      // Validar parámetros requeridos
      if (!module_string || !module_table || !module_table_record_id) {
        console.error('Missing required parameters for navigation', {
          module_string,
          module_table,
          module_table_record_id
        });
        return false;
      }

      // 🔹 Marcar mensaje como leído ANTES de navegar (si está configurado)
      if (markAsRead && is_read === '0') {
        const formData = new FormData();
        formData.append('id_message', id_message);
        formData.append('user_id', userId);
        formData.append('is_read', 1);

        try {
          await dispatch(updateMessageFlag(formData));
          console.log('Message marked as read via navigation, refreshing counter');
          window.dispatchEvent(new CustomEvent('dashboard-message-created'));
        } catch (error) {
          console.error('Error marking message as read:', error);
          // Continuar con la navegación incluso si falla marcar como leído
        }
      }

      // 🔹 Obtener los IDs necesarios de la API
      const result = await dispatch(fetchModuleNavigationIds({
        module_string,
        module_table,
        module_table_record_id
      }));

      if (result.payload?.status !== 1) {
        console.error('Failed to fetch navigation IDs', result.payload);
        return false;
      }

      const navigationData = result.payload.data;
      console.log('Navigation data received:', navigationData);

      // 🔹 Configurar los filtros en Redux según el módulo
      if (module_string === 'tasks') {
        // 1. Limpiar filtros anteriores del módulo tasks
        setFilterValue('task', 'selected_task_id', null);
        setFilterValue('task', 'isSelected_task_id', false);
        
        setFilterValue('task', 'selected_logtask_id', null);
        setFilterValue('task', 'isSelected_logtask_id', false);
        
        setFilterValue('task', 'selected_logtask_comment_id', null);
        setFilterValue('task', 'isSelected_logtask_comment_id', false);
        
        setFilterValue('task', 'selected_logtask_comment_attachment_id', null);
        setFilterValue('task', 'isSelected_logtask_comment_attachment_id', false);

        // Siempre establecer selectedTaskView
        setFilterValue('task', 'selectedTaskView', 'list');

        // Establecer task_id si existe
        if (navigationData.task_id) {
          setFilterValue('task', 'selected_task_id', navigationData.task_id.toString());
          setFilterValue('task', 'isSelected_task_id', true);
        }

        // Establecer logtask_id si existe
        if (navigationData.logtask_id) {
          setFilterValue('task', 'selected_logtask_id', navigationData.logtask_id.toString());
          setFilterValue('task', 'isSelected_logtask_id', true);
        }

        // Establecer logtask_comment_id si existe
        if (navigationData.logtask_comment_id) {
          setFilterValue('task', 'selected_logtask_comment_id', navigationData.logtask_comment_id.toString());
          setFilterValue('task', 'isSelected_logtask_comment_id', true);
        }

        // Establecer logtask_comment_attachment_id si existe
        if (navigationData.logtask_comment_attachment_id) {
          setFilterValue('task', 'selected_logtask_comment_attachment_id', navigationData.logtask_comment_attachment_id.toString());
          setFilterValue('task', 'isSelected_logtask_comment_attachment_id', true);
        }
      }

      // 🔹 MÓDULO: LegalMatriz
      //else if (module_string === 'LegalMatriz' || module_string === 'LegalMatriz') {
      else if (module_string === 'LegalMatriz') {
        // Siempre establecer la vista
        //setFilterValue('LegalMatriz', 'selectedView', 'list');

        // Establecer id_requisito si existe
        if (navigationData.id_requisito) {
          setFilterValue('LegalMatriz', 'selected_requisito_id', navigationData.id_requisito.toString());
          setFilterValue('LegalMatriz', 'isSelected_requisito_id', true);
        }

        // Establecer id_articulo si existe (para amatia_articulos_actos)
        if (navigationData.id_articulo) {
          setFilterValue('LegalMatriz', 'selected_articulo_id', navigationData.id_articulo.toString());
          setFilterValue('LegalMatriz', 'isSelected_articulo_id', true);
        }

        // Establecer articulo_data_id si existe (para amatia_articulos_actos_data)
        if (navigationData.articulo_data_id) {
          setFilterValue('LegalMatriz', 'selected_articulo_data_id', navigationData.articulo_data_id.toString());
          setFilterValue('LegalMatriz', 'isSelected_articulo_data_id', true);
        }

        // Establecer requisito_data_id si existe (para amatia_requisito_data)
        if (navigationData.requisito_data_id) {
          setFilterValue('LegalMatriz', 'selected_requisito_data_id', navigationData.requisito_data_id.toString());
          setFilterValue('LegalMatriz', 'isSelected_requisito_data_id', true);
        }

        // Establecer id_articulo_licencia si existe (para amatia_articulos - sistema antiguo)
        if (navigationData.id_articulo_licencia) {
          setFilterValue('LegalMatriz', 'selected_articulo_licencia_id', navigationData.id_articulo_licencia.toString());
          setFilterValue('LegalMatriz', 'isSelected_articulo_licencia_id', true);
        }

        // Establecer id_licencia si existe (para amatia_articulos - sistema antiguo)
        if (navigationData.id_licencia) {
          setFilterValue('LegalMatriz', 'selected_licencia_id', navigationData.id_licencia.toString());
          setFilterValue('LegalMatriz', 'isSelected_licencia_id', true);
        }
      }

      // 🔹 MÓDULO: PERMITS (ejemplo para futuro)
      // else if (module_string === 'permits') {
      //   setFilterValue('permits', 'selectedView', 'list');
      //   
      //   if (navigationData.permit_id) {
      //     setFilterValue('permits', 'selected_permit_id', navigationData.permit_id.toString());
      //     setFilterValue('permits', 'isSelected_permit_id', true);
      //   }
      //   
      //   if (navigationData.permit_document_id) {
      //     setFilterValue('permits', 'selected_permit_document_id', navigationData.permit_document_id.toString());
      //     setFilterValue('permits', 'isSelected_permit_document_id', true);
      //   }
      // }

      // 🔹 MÓDULO: COMPENSATIONS (ejemplo para futuro)
      // else if (module_string === 'compensations') {
      //   setFilterValue('compensations', 'selectedView', 'list');
      //   
      //   if (navigationData.compensation_id) {
      //     setFilterValue('compensations', 'selected_compensation_id', navigationData.compensation_id.toString());
      //     setFilterValue('compensations', 'isSelected_compensation_id', true);
      //   }
      // }

      // 🔹 Navegar a la ruta correcta
      const navigateTo = navigationData.navigate_to || '/view/events';
      console.log('Navigating to:', navigateTo);
      navigate(navigateTo);

      return true;

    } catch (error) {
      console.error('Error during module navigation:', error);
      return false;
    }
  }, [dispatch, navigate, setFilterValue]);

  return {
    navigateToModule,
    setFilterValue
  };
};