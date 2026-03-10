// Runtime configuration loader
// Expected config.json structure:
// { "apiUrl": string, "baseName": string, "environment": string, "version": string }
//
// Config is stored in window.__APP_CONFIG__ for synchronous access from any module.

const REQUIRED_FIELDS = ['apiUrl', 'baseName', 'environment', 'version'];

const DEFAULT_CONFIG = {
  apiUrl: process.env.REACT_APP_API_URL || '',
  baseName: process.env.REACT_APP_BASE_NAME || '/message-center',
  environment: process.env.NODE_ENV || 'development',
  version: process.env.REACT_APP_VERSION || '0.3.6'
};

/**
 * Validate that config has all required fields
 */
const validateConfig = (config) => {
  const missing = REQUIRED_FIELDS.filter((field) => config[field] == null);
  if (missing.length > 0) {
    console.warn(`⚠️ Config missing fields: ${missing.join(', ')}. Using defaults for those.`);
    return { ...DEFAULT_CONFIG, ...config };
  }
  return config;
};

/**
 * Load configuration from public/config.json and store in window.__APP_CONFIG__
 * This allows changing config without rebuilding the app
 */
export const loadRuntimeConfig = async () => {
  if (window.__APP_CONFIG__) {
    return window.__APP_CONFIG__;
  }

  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/config.json?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status}`);
    }

    const config = await response.json();
    window.__APP_CONFIG__ = Object.freeze(validateConfig(config));
    console.log('✅ Runtime configuration loaded:', window.__APP_CONFIG__);
    return window.__APP_CONFIG__;
  } catch (error) {
    console.error('❌ Error loading runtime config, using fallback:', error);
    window.__APP_CONFIG__ = Object.freeze({ ...DEFAULT_CONFIG });
    return window.__APP_CONFIG__;
  }
};

/**
 * Get current runtime configuration (synchronous)
 * Reads from window.__APP_CONFIG__ — available after loadRuntimeConfig() resolves
 */
export const getRuntimeConfig = () => {
  if (!window.__APP_CONFIG__) {
    throw new Error('Runtime config not loaded. Call loadRuntimeConfig() first.');
  }
  return window.__APP_CONFIG__;
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

/**
 * Get app version from runtime config
 */
export const getVersion = () => {
  return getRuntimeConfig().version;
};