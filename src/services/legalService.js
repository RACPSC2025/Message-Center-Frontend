const API_BASE_URL = '';
//import { API_URL } from "../../config/constants";
import { API_URL } from "../config/constants";
import axiosInstance from '../lib/axios';

class LegalService {
  async getDropdownOptions() {
    //const url = `${API_BASE_URL}/api/message_center_api/legal_api/get_dropdown_options`;
    const response = await axiosInstance.get('/message_center_api/legal_api/get_dropdown_options');
    return response.data;
    /*
    const url = `${API_URL}/message_center_api/legal_api/get_dropdown_options`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Auth-Token': '$2y$10$HYG/Oj2NUm2wKLquLxct7.CBHw4.B2p3Hs67vimGaWZldraKmwcSa'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
    */
  }

  async createLegalRequirement(formData) {
    // Obtener el nombre de la autoridad si se envió un ID
    let emitidoporValue = formData.emitidopor;
    if (formData.emitidopor && formData.emitidoporName) {
      emitidoporValue = formData.emitidoporName;
    }
    
    const dataToSend = {
      ...formData,
      emitidopor: emitidoporValue,
      apply_lto: formData.apply_lto ? 'Apply' : null,
      new_or_renewal: formData.new_or_renewal || 0,
      id_alert: formData.id_alert && formData.id_alert !== '' ? parseInt(formData.id_alert) : null,
      
      // 🔹 DATOS PARA DASHBOARD MESSAGE
      create_dashboard_message: '1', // Flag para crear mensaje
      module_string: 'LegalMatriz',
      module_table: 'amatia_requisitos',
      date_message: new Date().toISOString().split('T')[0], // Fecha actual YYYY-MM-DD
      due_date: formData.plazof || '', // Usar la fecha límite del requisito si existe
      
      // Mensajes en español
      employee_message_es: formData.legal_id 
        ? 'Requisito legal actualizado' 
        : 'Nuevo requisito legal creado',
      subject_message_es: formData.legal_id
        ? `Requisito legal actualizado: ${formData.numero || 'Sin número'}`
        : `Nuevo requisito legal creado: ${formData.numero || 'Sin número'}`,
      text_message_es: `${formData.nombre || 'Sin nombre'} - ${formData.descripcion?.substring(0, 100) || 'Sin descripción'}...`,
      long_text_message_es: `Se ha ${formData.legal_id ? 'actualizado' : 'creado'} el requisito legal "${formData.nombre || 'Sin nombre'}". Número: ${formData.numero || 'N/A'}. Descripción: ${formData.descripcion || 'N/A'}`,
      
      // Mensajes en inglés
      employee_message_en: formData.legal_id 
        ? 'Legal requirement updated' 
        : 'New legal requirement created',
      subject_message_en: formData.legal_id
        ? `Legal requirement updated: ${formData.numero || 'No number'}`
        : `New legal requirement created: ${formData.numero || 'No number'}`,
      text_message_en: `${formData.nombre || 'No name'} - ${formData.descripcion?.substring(0, 100) || 'No description'}...`,
      long_text_message_en: `Legal requirement "${formData.nombre || 'No name'}" has been ${formData.legal_id ? 'updated' : 'created'}. Number: ${formData.numero || 'N/A'}. Description: ${formData.descripcion || 'N/A'}`,
      
      // Destinatarios y remitente
      user_ids: '1', // Por ahora hardcodeado, después se puede hacer dinámico
      who_sent_id: '1', // Por ahora hardcodeado
      
      // Estado y otros
      status: 'pending',
      form_code: '', // Código de formulario asociado (si aplica)
      subdomain: '', // Se puede obtener del contexto si es necesario
      created: new Date().toISOString().replace('T', ' ').substring(0, 19), // YYYY-MM-DD HH:MM:SS
      created_by: '1' // Por ahora hardcodeado
    };
    
    const response = await axiosInstance.post('/message_center_api/legal_api/create_legal_amatia_express', dataToSend);
    return response.data;
  }

  async getChildRequisito(params) {
    const formData = new FormData();
    formData.append('node', params.node || '');
    formData.append('requisito', params.requisito);
    formData.append('page', params.page || 1);
    formData.append('rows', params.rows || 10);
    formData.append('sidx', params.sidx || 'id_articulo');
    formData.append('sord', params.sord || 'asc');

    const response = await axiosInstance.post('/message_center_api/legal_api/get_child_requisito_amatia_express', formData);
    return response.data;
  }

  /*
  async createArticle(data) {
    //const response = await axiosInstance.post('/message_center_api/legal_api/create_article', data);
    const response = await axiosInstance.post('/message_center_api/legal_api/create_article_amatia_express', data);
    return response.data;
  }
  */

  // 🔹 MÉTODO ACTUALIZADO CON DASHBOARD MESSAGE
  async createArticle(data) {
    const dataToSend = {
      ...data,
      
      // 🔹 DATOS PARA DASHBOARD MESSAGE
      create_dashboard_message: '1', // Flag para crear mensaje
      module_string: 'LegalMatriz',
      module_table: 'amatia_articulos_actos',
      date_message: new Date().toISOString().split('T')[0], // Fecha actual YYYY-MM-DD
      due_date: '', // Se puede agregar si el artículo tiene fecha límite
      
      // Mensajes en español
      employee_message_es: data.id_articulo 
        ? 'Artículo actualizado' 
        : 'Nuevo artículo creado',
      subject_message_es: data.id_articulo
        ? `Artículo actualizado: ${data.numeracion || 'Sin numeración'} - ${data.nombre || 'Sin nombre'}`
        : `Nuevo artículo creado: ${data.numeracion || 'Sin numeración'} - ${data.nombre || 'Sin nombre'}`,
      text_message_es: `${data.nombre || 'Sin nombre'} - ${data.descripcion?.substring(0, 100) || 'Sin descripción'}...`,
      long_text_message_es: `Se ha ${data.id_articulo ? 'actualizado' : 'creado'} el artículo "${data.nombre || 'Sin nombre'}". Numeración: ${data.numeracion || 'N/A'}. Descripción: ${data.descripcion || 'N/A'}. Criticidad: ${data.criticity || 'N/A'}. Estado: ${data.estado || 'N/A'}`,
      
      // Mensajes en inglés
      employee_message_en: data.id_articulo 
        ? 'Article updated' 
        : 'New article created',
      subject_message_en: data.id_articulo
        ? `Article updated: ${data.numeracion || 'No number'} - ${data.nombre || 'No name'}`
        : `New article created: ${data.numeracion || 'No number'} - ${data.nombre || 'No name'}`,
      text_message_en: `${data.nombre || 'No name'} - ${data.descripcion?.substring(0, 100) || 'No description'}...`,
      long_text_message_en: `Article "${data.nombre || 'No name'}" has been ${data.id_articulo ? 'updated' : 'created'}. Number: ${data.numeracion || 'N/A'}. Description: ${data.descripcion || 'N/A'}. Criticity: ${data.criticity || 'N/A'}. Status: ${data.estado || 'N/A'}`,
      
      // Destinatarios y remitente
      user_ids: '1', // Por ahora hardcodeado, después se puede hacer dinámico
      who_sent_id: '1', // Por ahora hardcodeado
      
      // Estado y otros
      status: 'pending',
      form_code: '', // Código de formulario asociado (si aplica)
      subdomain: '', // Se puede obtener del contexto si es necesario
      created: new Date().toISOString().replace('T', ' ').substring(0, 19), // YYYY-MM-DD HH:MM:SS
      created_by: '1' // Por ahora hardcodeado
    };
    
    const response = await axiosInstance.post('/message_center_api/legal_api/create_article_amatia_express', dataToSend);
    return response.data;
  }

  async getLegalCategories() {
    const response = await axiosInstance.get('/message_center_api/legal_api/list_legal_categories');
    return response.data;
  }

  async getArticleTypes() {
    const response = await axiosInstance.get('/message_center_api/legal_api/list_article_types');
    return response.data;
  }

  async getIdArticulo(id_requisito, id = '') {
    const response = await axiosInstance.post('/message_center_api/legal_api/list_id_articulo', { id, id_requisito });
    return response.data;
  }

  async getTemas() {
    const response = await axiosInstance.get('/message_center_api/legal_api/list_temas');
    return response.data;
  }

  async getArticleDetailsTable(legal_id) {
    const response = await axiosInstance.post('/message_center_api/legal_api/article_details_table', { legal_id });
    return response.data;
  }

  async getArticleDetailOperations(legal_id, article_id, level_str) {
    const response = await axiosInstance.post('/message_center_api/legal_api/article_detail_operations', {
      legal_id,
      article_id,
      level_str
    });
    return response.data;
  }

  async setArticleSpecialStatus(legal_id, article_id, level_str, status) {
    const response = await axiosInstance.post('/message_center_api/legal_api/set_article_special_status', {
      legal_id,
      article_id,
      level_str,
      status
    });
    return response.data;
  }

  async uploadAttachment(formData) {
    const response = await axiosInstance.post('/message_center_api/legal_api/upload_attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getAttachments(type, upload_id, level_str) {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('upload_id', upload_id);
    formData.append('level_str', level_str);
    const response = await axiosInstance.post('/message_center_api/legal_api/get_attachments', formData);
    return response.data;
  }

  async deleteAttachment(file_id) {
    const formData = new FormData();
    formData.append('file_id', file_id);
    const response = await axiosInstance.post('/message_center_api/legal_api/delete_attachment', formData);
    return response.data;
  }

  async getTaskFormData() {
    const response = await axiosInstance.get('/message_center_api/legal_api/get_task_form_data');
    return response.data;
  }

  async getCountriesForTask(region_id) {
    const formData = new FormData();
    formData.append('region_id', region_id);
    const response = await axiosInstance.post('/message_center_api/legal_api/get_countries_for_task', formData);
    return response.data;
  }

  async getBusinessForTask(country_id) {
    const formData = new FormData();
    formData.append('country_id', country_id);
    const response = await axiosInstance.post('/message_center_api/legal_api/get_business_for_task', formData);
    return response.data;
  }

  async getPlantsForTask(business_id) {
    const formData = new FormData();
    formData.append('business_id', business_id);
    const response = await axiosInstance.post('/message_center_api/legal_api/get_plants_for_task', formData);
    return response.data;
  }

  async getSubfases(fase_id) {
    const formData = new FormData();
    formData.append('fase_id', fase_id);
    const response = await axiosInstance.post('/message_center_api/legal_api/get_subfases', formData);
    return response.data;
  }

  async getProgramsForTask(pma_id) {
    const formData = new FormData();
    formData.append('pma_id', pma_id);
    const response = await axiosInstance.post('/message_center_api/legal_api/get_programs_for_task', formData);
    return response.data;
  }

  async getSubprogramsForTask(program_id) {
    const formData = new FormData();
    formData.append('program_id', program_id);
    const response = await axiosInstance.post('/message_center_api/legal_api/get_subprograms_for_task', formData);
    return response.data;
  }

  async createTask(taskData) {
    const response = await axiosInstance.post('/message_center_api/legal_api/create_task_amatia_express', taskData);
    return response.data;
  }

  async getTasksLinkedToArticle(article_id, level_str) {
    const response = await axiosInstance.post('/message_center_api/legal_api/get_tasks_linked_to_article', {
      article_id,
      level_str
    });
    return response.data;
  }
}

export default new LegalService();