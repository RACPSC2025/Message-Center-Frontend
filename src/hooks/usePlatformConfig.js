import { useSelector } from 'react-redux';

/**
 * Hook para acceder a la configuración de la plataforma
 * @returns {Object} - Configuración completa de la plataforma
 */
export const usePlatformConfig = () => {
  return useSelector((state) => state.platformConfig.data);
};

/**
 * Hook para verificar si un módulo está habilitado
 * @param {string} moduleName - Nombre del módulo (legal_matrix, task, findings, actions)
 * @returns {boolean} - true si el módulo está habilitado
 */
export const useIsModuleEnabled = (moduleName) => {
  return useSelector((state) => {
    const module = state.platformConfig?.data?.modules?.[moduleName];
    return module?.enabled ?? false;
  });
};

/**
 * Hook para verificar un permiso específico de un módulo
 * @param {string} moduleName - Nombre del módulo
 * @param {string} permission - Nombre del permiso a verificar
 * @returns {boolean} - true si el permiso está habilitado
 */
export const useHasPermission = (moduleName, permission) => {
  return useSelector((state) => {
    const module = state.platformConfig?.data?.modules?.[moduleName];
    if (!module?.enabled) return false;
    return module.permissions?.[permission] ?? false;
  });
};

/**
 * Hook para obtener una característica específica de un módulo
 * @param {string} moduleName - Nombre del módulo
 * @param {string} featurePath - Ruta de la característica (ej: 'ia.documents')
 * @returns {any} - Valor de la característica
 */
export const useModuleFeature = (moduleName, featurePath) => {
  return useSelector((state) => {
    const module = state.platformConfig?.data?.modules?.[moduleName];
    if (!module) return null;

    if (!module?.features || Array.isArray(module.features)) {
      return null;
    }
    
    const keys = featurePath.split('.');
    let value = module.features;
    
    for (const key of keys) {
      if (value === undefined || value === null) return null;
      value = value[key];
    }
    
    return value;
  });
};

/**
 * Hook para obtener los catálogos de un módulo
 * @param {string} moduleName - Nombre del módulo
 * @param {string} catalogName - Nombre del catálogo (opcional)
 * @returns {Object|Array} - Catálogo(s) del módulo
 */
export const useModuleCatalogs = (moduleName, catalogName = null) => {
  return useSelector((state) => {
    const module = state.platformConfig?.data?.modules?.[moduleName];
    const catalogs = module?.catalogs;

    if (!catalogs || Array.isArray(catalogs)) {
      return catalogName ? null : {};
    }
    
    if (catalogName) {
      return catalogs[catalogName] ?? null;
    }
    
    return catalogs;
  });
};

/**
 * Hook para obtener el estado de carga de la configuración
 * @returns {boolean} - true si está cargando
 */
export const usePlatformConfigLoading = () => {
  return useSelector((state) => state.platformConfig.loading);
};

/**
 * Hook para verificar si la configuración fue cargada desde la API
 * @returns {boolean} - true si se obtuvo de la API
 */
export const useIsConfigFromApi = () => {
  return useSelector((state) => state.platformConfig.fetchedFromApi);
};

/**
 * Hook combinado que retorna toda la información útil de un módulo
 * @param {string} moduleName - Nombre del módulo
 * @returns {Object} - Información completa del módulo
 */
export const useModuleInfo = (moduleName) => {
  return useSelector((state) => {
    const config = state.platformConfig?.data?.modules?.[moduleName];
    return {
      enabled: config?.enabled ?? false,
      description: config?.description ?? '',
      order: config?.order ?? '0',
      permissions: config?.permissions ?? {},
      features: Array.isArray(config?.features) ? {} : (config?.features ?? {}),
      catalogs: Array.isArray(config?.catalogs) ? {} : (config?.catalogs ?? {}),
      title_es: config?.title_es ?? '',
      title_en: config?.title_en ?? ''
    };
  });
};
