const _base = () => (window.__APP_CONFIG__?.api_url_ia || 'http://localhost:8000/').replace(/\/$/, '');

let _devToken = null;

export async function getToken() {
  // Producción: token puesto por login-amatia-express
  const lsToken = localStorage.getItem('Auth-Token');
  if (lsToken) return lsToken;

  // Dev fallback: /auth/dev-token (solo ENVIRONMENT=DEV)
  if (_devToken) return _devToken;
  const res = await fetch(`${_base()}/auth/dev-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'username=devuser&password=devpass123',
  });
  const data = await res.json();
  _devToken = data.api_response?.access_token || data.access_token;
  return _devToken;
}

async function _authFetch(path, options = {}) {
  const token = await getToken();
  if (!token) throw new Error('No autenticado — token no encontrado');
  const res = await fetch(`${_base()}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (res.status === 401) {
    if (localStorage.getItem('Auth-Token')) {
      // Token de localStorage expiró — no se puede auto-renovar
      throw new Error('Sesión expirada — vuelve a iniciar sesión');
    }
    // Token de dev-token expiró — limpiar y reintentar una vez
    _devToken = null;
    return _authFetch(path, options);
  }
  return res;
}

async function _parseResponse(res) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function ingestPDF(file, docType = null) {
  const form = new FormData();
  form.append('files', file);
  form.append('force_reconvert', 'true');
  if (docType) form.append('doc_type', docType);
  const res = await _authFetch('/v1/documents/ingest', { method: 'POST', body: form });
  const data = await _parseResponse(res);
  // Backend retorna flat: { status: "success" | "partial", processed_files, indexed_chunks, errors }
  // Tolerar también envelope { status: 200, api_response: {...} } por compatibilidad.
  const payload = data.api_response ?? data;
  if (payload.status && payload.status !== 'success' && payload.status !== 'partial') {
    throw new Error(payload.errors?.[0] || data.error_description || 'Error al ingestar PDF');
  }
  return payload;
}

export async function queryLibrary(question, topK = 10, sourceFilter = null, promptType = 'legal') {
  const body = {
    question,
    top_k: topK,
    source_filter: sourceFilter,
    prompt_type: promptType,
  };
  const res = await _authFetch('/v1/query/library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await _parseResponse(res);
  // Backend retorna flat con `answer`. Tolerar envelope por compatibilidad.
  const payload = data.api_response ?? data;
  if (!payload.answer) {
    throw new Error(data.error_description || 'Error en consulta');
  }
  return payload;
}
