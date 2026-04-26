// Runtime configuration loader
// Primary source: public/config.js IIFE loaded via <script> in index.html — sets window.__APP_CONFIG__ synchronously.
// Fallback: DEFAULT_CONFIG (used only if config.js fails to load).
// Config is stored in window.__APP_CONFIG__ for synchronous access from any module.


const DEFAULT_CONFIG = {
  apiUrl: '',
  baseName: '/message-center',
  environment: 'development',
  version: '0.3.6'
};

/**
 * Validate that config has all required fields
 */
/**
 * Load configuration — reads window.__APP_CONFIG__ set by public/config.js IIFE.
 */
export const loadRuntimeConfig = async () => {
  if (window.__APP_CONFIG__) {
    return window.__APP_CONFIG__;
  }

  // config.js IIFE did not run — use DEFAULT_CONFIG so the app still starts.
  console.warn('⚠️ window.__APP_CONFIG__ not set by config.js. Using default configuration.');
  window.__APP_CONFIG__ = Object.freeze(DEFAULT_CONFIG);
  return window.__APP_CONFIG__;
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