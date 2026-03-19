/**
 * Configuración centralizada de validación de campos
 * Este archivo define qué campos son obligatorios en el formulario de acciones
 */

// Configuración de campos obligatorios por nombre de campo
// true = obligatorio, false = opcional
export const REQUIRED_FIELDS_CONFIG = {
  // Ubicación Organizacional
  create_date: true,
  real_closing_date: true,
  level_1: true,
  level_2: true,
  level_3: true,
  level_4: true,
  
  // Observación
  hs_process: true,
  hs_fuente: true,
  hs_causes: false, // <-- CAMPO OPCIONAL según solicitud
  description_fuente: true,
  
  // Clasificación de la acción
  action_category: true,
  action_status: true,
  type_intervention: true,
  cause_description: true,
  
  // Acción Propuesta
  what_description: true,
  how_description: true,
  action_start_date: true,
  action_closing_date: true,
  responsible_person: true,
};

/**
 * Función para verificar si un campo es obligatorio según la configuración centralizada
 * @param {string} fieldName - Nombre del campo a verificar
 * @returns {boolean} - true si es obligatorio, false si es opcional
 */
export const isFieldRequired = (fieldName) => {
  return REQUIRED_FIELDS_CONFIG[fieldName] || false;
};

/**
 * Función para obtener todos los campos obligatorios
 * @returns {string[]} - Array con los nombres de los campos obligatorios
 */
export const getRequiredFields = () => {
  return Object.keys(REQUIRED_FIELDS_CONFIG).filter(fieldName => 
    REQUIRED_FIELDS_CONFIG[fieldName]
  );
};

/**
 * Función para obtener todos los campos opcionales
 * @returns {string[]} - Array con los nombres de los campos opcionales
 */
export const getOptionalFields = () => {
  return Object.keys(REQUIRED_FIELDS_CONFIG).filter(fieldName => 
    !REQUIRED_FIELDS_CONFIG[fieldName]
  );
};

/**
 * Función para actualizar la configuración de un campo específico
 * @param {string} fieldName - Nombre del campo
 * @param {boolean} isRequired - Si es obligatorio o no
 */
export const updateFieldRequirement = (fieldName, isRequired) => {
  if (fieldName in REQUIRED_FIELDS_CONFIG) {
    REQUIRED_FIELDS_CONFIG[fieldName] = isRequired;
  } else {
    console.warn(`El campo "${fieldName}" no existe en la configuración`);
  }
};
