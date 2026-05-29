import { useRef, useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, CircularProgress, Alert, IconButton,
  Chip, Divider, Tooltip, Collapse, Button,
  ToggleButtonGroup, ToggleButton, Select, MenuItem,
} from '@mui/material';
import {
  RefreshRounded, AccountTreeRounded,
  FileDownloadRounded, FileUploadRounded,
  VerifiedRounded, ExpandMore, ExpandLess,
  AccountTree, SubjectRounded, FormatListBulleted,
  NavigateBefore, NavigateNext,
} from '@mui/icons-material';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useIntegrity } from '../../hooks/useIntegrity';
import { exportEditsAsJson, importEditsFromJson, loadAllEdits } from '../../lib/editsDb';
import ChapterNode from './ChapterNode';
import TitleNode from './TitleNode';
import ArticleRow from './ArticleRow';

// ── Flatten tree → [ { number, paragraphs, path[] } ] ─────────────────────────
function flattenArticles(tree) {
  const result = [];
  if (!tree) return result;

  const pushArts = (arts) => {
    for (const art of arts ?? []) result.push(art);
  };

  for (const ms of (tree.major_sections ?? []).filter(ms => ms.name !== 'CONSIDERANDO')) {
    pushArts(ms.orphan_articles);

    for (const title of ms.titles ?? []) {
      pushArts(title.orphan_articles);
      for (const ch of title.chapters ?? []) {
        pushArts(ch.orphan_articles);
        for (const sec of ch.sections ?? []) {
          pushArts(sec.articles);
        }
      }
    }

    for (const ch of ms.chapters ?? []) {
      pushArts(ch.orphan_articles);
      for (const sec of ch.sections ?? []) {
        pushArts(sec.articles);
      }
    }
  }
  return result;
}

// ── Normative tree ─────────────────────────────────────────────────────────────
function NormativeTree({
  tree, selectedArticles, editedArticles, onToggleArticle, onToggleParagraph, onOpenArticle, readOnly,
}) {
  const majorSections = (tree?.major_sections ?? []).filter(ms => ms.name !== 'CONSIDERANDO');
  return (
    <>
      {majorSections.map((ms) => {
        const titles   = ms.titles   ?? [];
        const chapters = ms.chapters ?? [];
        const msOrphans = ms.orphan_articles ?? [];
        return (
          <Box key={ms.name} sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                display: 'block', px: 1.5, py: 0.6,
                backgroundColor: '#285064', borderRadius: 1,
                color: '#EFF7F9', textTransform: 'uppercase',
                letterSpacing: 0.8, mb: 0.5,
              }}
            >
              {ms.name}
            </Typography>

            {msOrphans.map((art) => (
              <ArticleRow
                key={art.number}
                art={art}
                selectedArticles={selectedArticles}
                editedArticles={editedArticles}
                onToggleArticle={onToggleArticle}
                onToggleParagraph={onToggleParagraph}
                onOpenArticle={onOpenArticle}
                readOnly={readOnly}
              />
            ))}

            {titles.map((titulo, ti) => (
              <TitleNode
                key={titulo.title ?? ti}
                titulo={titulo}
                selectedArticles={selectedArticles}
                editedArticles={editedArticles}
                onToggleArticle={onToggleArticle}
                onToggleParagraph={onToggleParagraph}
                onOpenArticle={onOpenArticle}
                readOnly={readOnly}
              />
            ))}

            {chapters.map((ch, ci) => (
              <ChapterNode
                key={ch.title ?? ci}
                chapter={ch}
                selectedArticles={selectedArticles}
                editedArticles={editedArticles}
                onToggleArticle={onToggleArticle}
                onToggleParagraph={onToggleParagraph}
                onOpenArticle={onOpenArticle}
                readOnly={readOnly}
              />
            ))}

            {titles.length === 0 && chapters.length === 0 && msOrphans.length === 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ pl: 2 }}>
                Sin artículos
              </Typography>
            )}
          </Box>
        );
      })}
      {majorSections.length === 0 && (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography variant="body2" color="text.disabled">Sin datos de taxonomía</Typography>
        </Box>
      )}
    </>
  );
}

// ── Paginated flat list ────────────────────────────────────────────────────────
const PAGE_SIZES = [10, 30, 50];

function PaginatedList({
  tree, selectedArticles, editedArticles, onToggleArticle, onToggleParagraph, onOpenArticle,
  pageSize, setPageSize, page, setPage,
}) {
  const allArticles = useMemo(() => flattenArticles(tree), [tree]);
  const totalPages  = Math.max(1, Math.ceil(allArticles.length / pageSize));
  const safePage    = Math.min(page, totalPages - 1);
  const paged       = allArticles.slice(safePage * pageSize, (safePage + 1) * pageSize);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [safePage, page, setPage]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Pagination controls */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1, py: 0.5, borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" color="text.disabled">Por página:</Typography>
          <Select
            value={pageSize}
            onChange={(e) => { setPageSize(e.target.value); setPage(0); }}
            size="small"
            variant="standard"
            sx={{ fontSize: '0.72rem', minWidth: 40 }}
          >
            {PAGE_SIZES.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.72rem' }}>{s}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" color="text.disabled">
            {safePage + 1} / {totalPages}
          </Typography>
          <IconButton size="small" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <NavigateBefore sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
            <NavigateNext sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Article list */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0.5 }}>
        {paged.map((art) => (
          <ArticleRow
            key={art.number}
            art={art}
            selectedArticles={selectedArticles}
            editedArticles={editedArticles}
            onToggleArticle={onToggleArticle}
            onToggleParagraph={onToggleParagraph}
            onOpenArticle={onOpenArticle}
          />
        ))}
        {paged.length === 0 && (
          <Box display="flex" justifyContent="center" py={4}>
            <Typography variant="body2" color="text.disabled">Sin artículos en esta página</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Integrity panel ────────────────────────────────────────────────────────────
function IntegrityPanel({ source }) {
  const { data, loading, error, check } = useIntegrity(source);
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (!open && !data && !loading) check();
    setOpen((p) => !p);
  };

  return (
    <Box sx={{ borderTop: '1px solid #e0e0e0', flexShrink: 0 }}>
      <Box
        display="flex" alignItems="center" justifyContent="space-between"
        sx={{ px: 1.5, py: 0.75, cursor: 'pointer', '&:hover': { backgroundColor: '#fafafa' } }}
        onClick={toggle}
      >
        <Box display="flex" alignItems="center" gap={0.75}>
          <VerifiedRounded sx={{ fontSize: 14, color: data?.is_complete ? '#2e7d32' : '#f57c00' }} />
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Integridad del documento
          </Typography>
          {data && (
            <Chip
              label={data.is_complete ? 'Completo' : `${data.total_gaps} gaps`}
              size="small"
              color={data.is_complete ? 'success' : 'warning'}
              sx={{ height: 16, fontSize: 10 }}
            />
          )}
        </Box>
        {open ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
      </Box>

      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          {loading && <CircularProgress size={18} />}
          {error && <Alert severity="error" sx={{ fontSize: '0.75rem' }}>{error}</Alert>}
          {!data && !loading && !error && (
            <Button size="small" onClick={check} sx={{ fontSize: 11 }}>Verificar ahora</Button>
          )}
          {data && (
            <Box sx={{ fontSize: '0.75rem' }}>
              <Typography variant="caption" sx={{ display: 'block' }}>
                <strong>Total artículos:</strong> {data.total_articles}
              </Typography>
              {data.missing_articles?.length > 0 && (
                <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                  <strong>Faltantes:</strong> {data.missing_articles.join(', ')}
                </Typography>
              )}
              {data.duplicate_articles?.length > 0 && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                  <strong>Duplicados:</strong> {data.duplicate_articles.join(', ')}
                </Typography>
              )}
              {data.vigencia_date && (
                <Typography variant="caption" sx={{ display: 'block' }}>
                  <strong>Vigencia:</strong> {data.vigencia_date}
                </Typography>
              )}
              {data.signatories?.length > 0 && (
                <Typography variant="caption" sx={{ display: 'block' }}>
                  <strong>Firmantes:</strong> {data.signatories.join(', ')}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────
const TaxonomyPanel = ({
  source,
  selectedArticles,
  editedArticles = {},
  onToggleArticle,
  onToggleParagraph,
  onOpenArticle,
  onEditsImported,
  onMetadataReady,
  readOnly = false,
  pollInterval = 0,
  allowPartial = false,
}) => {
  const { taxonomy, loading, error, reload } = useTaxonomy(source, { allowPartial, pollInterval });
  const importInputRef = useRef(null);
  const [viewMode, setViewMode]   = useState('tree');
  const [pageSize, setPageSize]   = useState(30);
  const [page, setPage]           = useState(0);

  useEffect(() => {
    if (taxonomy?.normative_metadata && onMetadataReady) {
      onMetadataReady(taxonomy.normative_metadata);
    }
  }, [taxonomy?.normative_metadata, onMetadataReady]);

  // Reset page when source or pageSize changes
  useEffect(() => { setPage(0); }, [source, pageSize]);

  const tree          = taxonomy?.tree ?? null;
  const totalArticles = taxonomy?.total_articles ?? 0;
  const editCount     = Object.keys(editedArticles).length;
  const isNormativo   = true;
  const totalLabel    = `${totalArticles} arts.`;

  const handleExport = () => { if (source) exportEditsAsJson(source); };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { count } = await importEditsFromJson(file);
      if (onEditsImported) {
        const updated = await loadAllEdits(source);
        onEditsImported(updated);
      }
      alert(`${count} ediciones importadas`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1, borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <AccountTreeRounded sx={{ fontSize: 16, color: '#19AABB' }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Taxonomía
          </Typography>
          {totalArticles > 0 && (
            <Chip label={totalLabel} size="small" sx={{ height: 18, fontSize: 10, backgroundColor: '#EDF4F5', color: '#285064', fontWeight: 600 }} />
          )}
          {!readOnly && selectedArticles.length > 0 && (
            <Chip label={`${selectedArticles.length} sel.`} size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />
          )}
          {!readOnly && editCount > 0 && (
            <Chip label={`${editCount} edit.`} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
          )}
          {readOnly && (
            <Chip label="vista previa" size="small" variant="outlined" sx={{ height: 18, fontSize: 10, color: '#9e9e9e' }} />
          )}
        </Box>

        <Box display="flex" alignItems="center">
          {!readOnly && isNormativo && editCount > 0 && (
            <Tooltip title="Exportar ediciones como JSON">
              <IconButton size="small" onClick={handleExport}>
                <FileDownloadRounded sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {!readOnly && isNormativo && (
            <Tooltip title="Importar ediciones desde JSON">
              <IconButton size="small" onClick={() => importInputRef.current?.click()}>
                <FileUploadRounded sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={reload} disabled={loading}>
            <RefreshRounded sx={{ fontSize: 16 }} />
          </IconButton>
          {!readOnly && (
            <input ref={importInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
          )}
        </Box>
      </Box>

      {source && (
        <Box display="flex" alignItems="center" gap={1} sx={{ px: 1.5, py: 0.5, flexShrink: 0, flexWrap: 'wrap' }}>
          <Chip label={source} size="small" variant="outlined" sx={{ fontSize: 10, height: 18, maxWidth: 260 }} />

          {tree && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
              sx={{ height: 20 }}
            >
              <ToggleButton value="tree" sx={{ px: 0.75, py: 0 }}>
                <Tooltip title="Vista árbol"><AccountTree sx={{ fontSize: 12 }} /></Tooltip>
              </ToggleButton>
              <ToggleButton value="text" sx={{ px: 0.75, py: 0 }}>
                <Tooltip title="Vista texto"><SubjectRounded sx={{ fontSize: 12 }} /></Tooltip>
              </ToggleButton>
              <ToggleButton value="list" sx={{ px: 0.75, py: 0 }}>
                <Tooltip title="Lista paginada"><FormatListBulleted sx={{ fontSize: 12 }} /></Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      )}

      <Divider />

      {/* Tree body */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
        )}
        {error && !loading && (
          <Alert severity="error" sx={{ fontSize: '0.78rem', m: 1 }}>{error}</Alert>
        )}

        {!loading && !error && tree && viewMode === 'text' && (
          <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0.5 }}>
            <Typography
              component="pre"
              sx={{ fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#424242' }}
            >
              {taxonomy?.text ?? 'Sin texto disponible'}
            </Typography>
          </Box>
        )}

        {!loading && !error && tree && viewMode === 'tree' && (
          <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0.5 }}>
            <NormativeTree
              tree={tree}
              selectedArticles={selectedArticles}
              editedArticles={editedArticles}
              onToggleArticle={onToggleArticle}
              onToggleParagraph={onToggleParagraph}
              onOpenArticle={onOpenArticle}
              readOnly={readOnly}
            />
          </Box>
        )}

        {!loading && !error && tree && viewMode === 'list' && (
          <PaginatedList
            tree={tree}
            selectedArticles={selectedArticles}
            editedArticles={editedArticles}
            onToggleArticle={onToggleArticle}
            onToggleParagraph={onToggleParagraph}
            onOpenArticle={onOpenArticle}
            pageSize={pageSize}
            setPageSize={setPageSize}
            page={page}
            setPage={setPage}
          />
        )}

        {!loading && !error && !tree && (
          <Box display="flex" justifyContent="center" py={4}>
            <Typography variant="body2" color="text.disabled">Sin datos de taxonomía</Typography>
          </Box>
        )}
      </Box>

      {!readOnly && isNormativo && source && <IntegrityPanel source={source} />}
    </Box>
  );
};

export default TaxonomyPanel;
