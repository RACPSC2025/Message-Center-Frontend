import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip,
  CircularProgress, Collapse, Divider, Switch, FormControlLabel,
  Alert, Paper,
} from '@mui/material';
import {
  AccountTreeRounded, RefreshRounded,
  ExpandMore, ExpandLess, FolderRounded, FolderOpenRounded,
  ArticleRounded, CloseRounded, DownloadRounded,
} from '@mui/icons-material';
import { Button } from '@mui/material';
import { getToken } from '../../../lib/iaApi';

const getBaseUrl = () =>
  (window.__APP_CONFIG__?.api_url_ia || 'http://localhost:8000/').replace(/\/$/, '');

async function fetchTaxonomy(source, includeArticles = false) {
  const token = await getToken();
  if (!token) throw new Error('No autenticado');
  const params = new URLSearchParams({ source, include_articles: includeArticles });
  const res = await fetch(`${getBaseUrl()}/v1/documents/taxonomy?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error_description || `Error ${res.status}`);
  }
  const data = await res.json();
  const payload = data.api_response ?? data;
  if (!payload.tree && !payload.text) {
    throw new Error(data.error_description || 'Respuesta inesperada del servidor');
  }
  return payload;
}

async function downloadTaxonomyExport(source, format = 'csv') {
  const token = await getToken();
  if (!token) throw new Error('No autenticado');
  const params = new URLSearchParams({ source, format });
  const res = await fetch(`${getBaseUrl()}/v1/documents/taxonomy/export?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const filename = res.headers.get('Content-Disposition')
    ?.match(/filename="?([^"]+)"?/)?.[1] ?? `taxonomy.${format}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchArticle(article, source) {
  const token = await getToken();
  if (!token) throw new Error('No autenticado');
  const params = new URLSearchParams({ article });
  if (source) params.set('source', source);
  const res = await fetch(`${getBaseUrl()}/v1/documents/article?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error_description || `Error ${res.status}`);
  }
  const data = await res.json();
  return data.api_response ?? data;
}

// ── Panel detalle artículo ───────────────────────────────────────────────────
function ArticleDetail({ article, source, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!article) return;
    setLoading(true);
    setError(null);
    setDetail(null);
    fetchArticle(article, source)
      .then(d => setDetail(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [article, source]);

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        border: '1px solid #e0e0e0', borderRadius: 2,
        overflow: 'hidden', minWidth: 0,
      }}
    >
      {/* Header */}
      <Box
        display="flex" alignItems="center" justifyContent="space-between"
        sx={{ px: 1.5, py: 0.75, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}
      >
        <Box display="flex" alignItems="center" gap={0.75}>
          <ArticleRounded sx={{ fontSize: 15, color: '#1565c0' }} />
          <Typography variant="caption" fontWeight={700} color="primary">
            Art. {article}
          </Typography>
          {detail?.major_section && (
            <Chip
              label={detail.major_section}
              size="small"
              sx={{ height: 16, fontSize: 10, backgroundColor: '#e8eaf6', color: '#3949ab' }}
            />
          )}
          {detail?.page && (
            <Typography variant="caption" sx={{ color: '#9e9e9e', fontSize: 10 }}>
              pág. {detail.page}
            </Typography>
          )}
        </Box>
        <Tooltip title="Cerrar">
          <IconButton size="small" onClick={onClose}>
            <CloseRounded sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ fontSize: '0.78rem' }}>{error}</Alert>}
        {!detail && !loading && !error && (
          <Typography variant="caption" color="text.disabled">Artículo no encontrado</Typography>
        )}
        {detail && !loading && (
          <>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.8rem', color: '#212121' }}
            >
              {detail.content}
            </Typography>
            {detail.chunks?.length > 1 && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#bdbdbd' }}>
                {detail.chunks.length} fragmentos
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}

// ── Nodo sección ────────────────────────────────────────────────────────────
function SectionNode({ section, selectedArticle, onSelectArticle }) {
  const [open, setOpen] = useState(false);
  const hasArticles = section.articles?.length > 0;

  return (
    <Box sx={{ ml: 3, mt: 0.25 }}>
      <Box
        display="flex" alignItems="center" gap={0.5}
        sx={{ cursor: hasArticles ? 'pointer' : 'default', py: 0.25 }}
        onClick={() => hasArticles && setOpen(p => !p)}
      >
        <ArticleRounded sx={{ fontSize: 13, color: '#90a4ae' }} />
        <Typography variant="caption" sx={{ flex: 1, color: '#546e7a' }}>
          {section.title}
        </Typography>
        <Chip
          label={`${section.article_count} art.`}
          size="small"
          sx={{ height: 16, fontSize: 10, backgroundColor: '#e3f2fd', color: '#1565c0' }}
        />
        {hasArticles && (open ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />)}
      </Box>

      {hasArticles && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ ml: 2, borderLeft: '1px dashed #cfd8dc', pl: 1, py: 0.5 }}>
            {section.articles.map(art => (
              <Box
                key={art}
                onClick={() => onSelectArticle(art)}
                sx={{
                  py: 0.2, px: 0.75, borderRadius: 0.5, cursor: 'pointer',
                  backgroundColor: selectedArticle === art ? '#e3f2fd' : 'transparent',
                  color: selectedArticle === art ? '#1565c0' : '#78909c',
                  fontWeight: selectedArticle === art ? 700 : 400,
                  fontSize: '0.72rem', fontFamily: 'inherit',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  transition: 'background-color 0.15s',
                }}
              >
                Art. {art}
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

// ── Nodo capítulo ────────────────────────────────────────────────────────────
function ChapterNode({ chapter, selectedArticle, onSelectArticle }) {
  const [open, setOpen] = useState(false);
  const totalArts = (chapter.orphan_articles?.length || 0) +
    (chapter.sections || []).reduce((s, sec) => s + sec.article_count, 0);

  return (
    <Box sx={{ ml: 2, mt: 0.5 }}>
      <Box
        display="flex" alignItems="center" gap={0.75}
        sx={{
          cursor: 'pointer', py: 0.5, px: 0.75, borderRadius: 1,
          '&:hover': { backgroundColor: '#f5f5f5' },
        }}
        onClick={() => setOpen(p => !p)}
      >
        {open
          ? <FolderOpenRounded sx={{ fontSize: 16, color: '#ffa726' }} />
          : <FolderRounded sx={{ fontSize: 16, color: '#ffa726' }} />}
        <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, fontSize: '0.8rem' }}>
          {chapter.title || '(sin título)'}
        </Typography>
        <Chip
          label={`${totalArts} art.`}
          size="small"
          sx={{ height: 18, fontSize: 10, backgroundColor: '#fff3e0', color: '#e65100' }}
        />
        {open ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ borderLeft: '2px solid #ffe0b2', ml: 1, pl: 1, mt: 0.25 }}>
          {chapter.orphan_articles?.map(art => (
            <Box
              key={art}
              onClick={() => onSelectArticle(art)}
              sx={{
                py: 0.2, px: 0.75, ml: 1, borderRadius: 0.5, cursor: 'pointer',
                backgroundColor: selectedArticle === art ? '#e3f2fd' : 'transparent',
                color: selectedArticle === art ? '#1565c0' : '#78909c',
                fontWeight: selectedArticle === art ? 700 : 400,
                fontSize: '0.72rem', fontFamily: 'inherit',
                '&:hover': { backgroundColor: '#f5f5f5' },
                transition: 'background-color 0.15s',
              }}
            >
              Art. {art}
            </Box>
          ))}
          {(chapter.sections || []).map((sec, i) => (
            <SectionNode
              key={i}
              section={sec}
              selectedArticle={selectedArticle}
              onSelectArticle={onSelectArticle}
            />
          ))}
          {!chapter.sections?.length && !chapter.orphan_articles?.length && (
            <Typography variant="caption" sx={{ color: '#bdbdbd', ml: 1 }}>Sin secciones</Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
const TaxonomyTab = ({ source }) => {
  const [taxonomy, setTaxonomy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [includeArticles, setIncludeArticles] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [exportingFormat, setExportingFormat] = useState(null); // 'csv' | 'xlsx' | null
  const [exportError, setExportError] = useState(null);

  const handleExport = async (format) => {
    setExportingFormat(format);
    setExportError(null);
    try {
      await downloadTaxonomyExport(source, format);
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExportingFormat(null);
    }
  };

  const load = useCallback(async () => {
    if (!source) return;
    setLoading(true);
    setError(null);
    setSelectedArticle(null);
    try {
      const data = await fetchTaxonomy(source, includeArticles);
      setTaxonomy(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [source, includeArticles]);

  useEffect(() => {
    if (source) load();
  }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleArticles = (e) => {
    setIncludeArticles(e.target.checked);
    setSelectedArticle(null);
  };

  const handleSelectArticle = (art) => {
    setSelectedArticle(prev => prev === art ? null : art);
  };

  if (!source) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} gap={1}>
        <AccountTreeRounded sx={{ fontSize: 48, color: '#bdbdbd' }} />
        <Typography variant="body2" color="text.disabled">
          Carga un PDF para ver su taxonomía
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '560px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountTreeRounded color="primary" sx={{ fontSize: 18 }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Taxonomía del documento
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={includeArticles}
                onChange={handleToggleArticles}
              />
            }
            label={<Typography variant="caption">Con artículos</Typography>}
            sx={{ mr: 0 }}
          />
          <Tooltip title={includeArticles ? 'Aplicar y recargar' : 'Recargar'}>
            <span>
              <IconButton size="small" onClick={load} disabled={loading}>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats */}
      {taxonomy && (
        <Box display="flex" gap={1} mb={1} flexWrap="wrap">
          <Chip
            label={`${taxonomy.total_articles} artículos`}
            size="small" color="primary" variant="outlined"
            sx={{ height: 20, fontSize: 11 }}
          />
          <Chip
            label={source}
            size="small" variant="outlined"
            sx={{ height: 20, fontSize: 10, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}
          />
          {includeArticles && !selectedArticle && (
            <Typography variant="caption" sx={{ color: '#9e9e9e', alignSelf: 'center' }}>
              Haz clic en un artículo para ver su contenido
            </Typography>
          )}
        </Box>
      )}

      {/* Exportar */}
      {taxonomy && (
        <Box display="flex" gap={1} mb={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={exportingFormat === 'csv' ? <CircularProgress size={12} /> : <DownloadRounded />}
            disabled={!!exportingFormat}
            onClick={() => handleExport('csv')}
            sx={{ fontSize: 11, py: 0.25, px: 1 }}
          >
            CSV
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={exportingFormat === 'xlsx' ? <CircularProgress size={12} sx={{ color: 'white' }} /> : <DownloadRounded />}
            disabled={!!exportingFormat}
            onClick={() => handleExport('xlsx')}
            sx={{ fontSize: 11, py: 0.25, px: 1 }}
          >
            Excel
          </Button>
          {exportError && (
            <Typography variant="caption" color="error">{exportError}</Typography>
          )}
        </Box>
      )}

      <Divider sx={{ mb: 1 }} />

      {/* Cuerpo: árbol [+ detalle] */}
      <Box sx={{ flex: 1, display: 'flex', gap: 1, overflow: 'hidden' }}>

        {/* Árbol */}
        <Box sx={{ flex: selectedArticle ? '0 0 45%' : 1, overflowY: 'auto', pr: 0.5 }}>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress size={28} />
            </Box>
          )}
          {error && !loading && (
            <Alert severity="error" sx={{ fontSize: '0.8rem' }}>{error}</Alert>
          )}
          {taxonomy && !loading && (
            <Box>
              {taxonomy.tree?.major_sections?.map((ms, i) => (
                <Box key={i} mb={2}>
                  <Typography
                    variant="caption" fontWeight={700}
                    sx={{
                      display: 'block', mb: 0.5, px: 1, py: 0.25,
                      backgroundColor: '#e8eaf6', borderRadius: 1,
                      color: '#3949ab', textTransform: 'uppercase', letterSpacing: 0.5,
                    }}
                  >
                    {ms.name}
                  </Typography>

                  {ms.orphan_articles?.map(art => (
                    <Box
                      key={art}
                      onClick={() => includeArticles && handleSelectArticle(art)}
                      sx={{
                        py: 0.2, px: 0.75, ml: 2, borderRadius: 0.5,
                        cursor: includeArticles ? 'pointer' : 'default',
                        backgroundColor: selectedArticle === art ? '#e3f2fd' : 'transparent',
                        color: selectedArticle === art ? '#1565c0' : '#78909c',
                        fontSize: '0.72rem', fontFamily: 'inherit',
                        '&:hover': includeArticles ? { backgroundColor: '#f5f5f5' } : {},
                      }}
                    >
                      Art. {art}
                    </Box>
                  ))}

                  {(ms.chapters || []).map((ch, j) => (
                    <ChapterNode
                      key={j}
                      chapter={ch}
                      selectedArticle={selectedArticle}
                      onSelectArticle={includeArticles ? handleSelectArticle : () => {}}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Panel detalle artículo */}
        {selectedArticle && (
          <ArticleDetail
            article={selectedArticle}
            source={source}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </Box>
    </Box>
  );
};

export default TaxonomyTab;
