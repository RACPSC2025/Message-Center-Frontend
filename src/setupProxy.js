const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

module.exports = function (app) {
  const target = process.env.REACT_APP_API_URL || 'http://ocensa-ambiental/';

  // S3 PDF proxy — handled in Node.js (no CORS, no WAMP cURL needed)
  app.get('/message_center_api/legal_api/proxy_pdf', (req, res) => {
    const url = req.query.url;
    if (!url || !url.toLowerCase().includes('legal-docs-procesados.s3.')) {
      return res.status(403).json({ error: 'URL no autorizada' });
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL inválida' });
    }
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { host: parsedUrl.hostname },
    };
    const s3req = https.get(options, (s3res) => {
      if (s3res.statusCode !== 200) {
        res.status(502).json({ error: `S3 returned ${s3res.statusCode}` });
        s3res.resume();
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'private, max-age=300');
      s3res.pipe(res);
    });
    s3req.on('error', (err) => {
      if (!res.headersSent) res.status(502).json({ error: err.message });
    });
    s3req.setTimeout(30000, () => {
      s3req.destroy();
      if (!res.headersSent) res.status(504).json({ error: 'S3 request timed out' });
    });
  });

  // General WAMP proxy
  app.use(
    createProxyMiddleware({
      pathFilter: '/message_center_api/**',
      target,
      changeOrigin: true,
    })
  );
};
