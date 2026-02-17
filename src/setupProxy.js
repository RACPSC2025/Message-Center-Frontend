const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Lee la URL del API desde variables de entorno
  // Fallback a la URL de desarrollo por defecto
  const apiUrl = process.env.REACT_APP_API_URL || 'https://promigasdev.sofacto.info/amatia/';
  
  console.log('🔄 Configurando proxy de desarrollo hacia:', apiUrl);
  
  app.use(
    '/api', // Match the route prefix for API calls
    createProxyMiddleware({
      target: apiUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log('📤 Proxy request:', req.method, req.path, '→', apiUrl);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('📥 Proxy response:', proxyRes.statusCode, req.path);
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
      }
    })
  );
};