// Runtime configuration loader
let runtimeConfig = null;

/**
 * Load configuration from public/config.json
 * This allows changing config without rebuilding the app
 */
export const loadRuntimeConfig = async () => {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  try {
    // Fetch config.json from public folder
    // Add timestamp to prevent caching
    const response = await fetch(`${process.env.PUBLIC_URL}/config.json?t=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status}`);
    }
    
    runtimeConfig = await response.json();
    console.log('✅ Runtime configuration loaded:', runtimeConfig);
    return runtimeConfig;
  } catch (error) {
    console.error('❌ Error loading runtime config, using fallback:', error);
    
    // Fallback to .env variables if config.json fails
    runtimeConfig = {
      apiUrl: process.env.REACT_APP_API_URL || 'https://promigasdev.sofacto.info/amatia/',
      baseName: process.env.REACT_APP_BASE_NAME || '/message-center',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.REACT_APP_VERSION || '0.3.6'
    };
    
    return runtimeConfig;
  }
};

/**
 * Get current runtime configuration
 * Must call loadRuntimeConfig() first
 */
export const getRuntimeConfig = () => {
  if (!runtimeConfig) {
    throw new Error('Runtime config not loaded. Call loadRuntimeConfig() first.');
  }
  return runtimeConfig;
};

/**
 * Get API URL from runtime config
 */
export const getApiUrl = () => {
  return getRuntimeConfig().apiUrl;
};

/**
 * Get base name (homepage path) from runtime config
 */
export const getBaseName = () => {
  return getRuntimeConfig().baseName;
};

/**
 * Get environment from runtime config
 */
export const getEnvironment = () => {
  return getRuntimeConfig().environment;
};