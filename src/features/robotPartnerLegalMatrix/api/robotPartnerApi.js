export { ingestPDF } from '../../../lib/iaApi';
import { getToken } from '../../../lib/iaApi';

const getBaseUrl = () =>
  (window.__APP_CONFIG__?.api_url_ia || 'http://localhost:8000/').replace(/\/$/, '');

async function authGet(path) {
  const token = await getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Error ${res.status}`);
  }
  return res;
}

export async function fetchTaxonomy(source) {
  const params = new URLSearchParams({ source, include_articles: 'true' });
  const res = await authGet(`/v1/documents/taxonomy?${params}`);
  const data = await res.json();
  return data.api_response ?? data;
}

export async function fetchArticle(article, source) {
  const params = new URLSearchParams({ article, source });
  const res = await authGet(`/v1/documents/article?${params}`);
  const data = await res.json();
  return data.api_response ?? data;
}

export async function fetchIntegrity(source) {
  const params = new URLSearchParams({ source });
  const res = await authGet(`/v1/documents/integrity?${params}`);
  const data = await res.json();
  return data.api_response ?? data;
}
