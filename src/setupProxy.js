const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.REACT_APP_API_URL || 'http://ocensa-ambiental/';

  // pathFilter en http-proxy-middleware v3 — conserva el prefijo en la URL reenviada
  app.use(
    createProxyMiddleware({
      pathFilter: '/message_center_api/**',
      target,
      changeOrigin: true,
    })
  );
};