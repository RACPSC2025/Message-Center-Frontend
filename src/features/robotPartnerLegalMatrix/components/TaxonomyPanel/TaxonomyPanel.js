import { useRef, useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, IconButton,
  Chip, Divider, Tooltip, Collapse, Button,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  RefreshRounded, AccountTreeRounded,
  FileDownloadRounded, FileUploadRounded,
  VerifiedRounded, ExpandMore, ExpandLess,
  AccountTree, SubjectRounded,
} from '@mui/icons-material';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useIntegrity } from '../../hooks/useIntegrity';
import { exportEditsAsJson, importEditsFromJson, loadAllEdits } from '../../lib/editsDb';
import ChapterNode from './ChapterNode';
import TitleNode from './TitleNode';
import ArticleRow from './ArticleRow';

// ── Normative tree ─────────────────────────────────────────────────────────────
function NormativeTree({ tree, selectedArticles, editedArticles, onToggleArticle, onOpenArticle }) {
  const majorSections = tree?.major_sections ?? [];

  return (
    <>
      {majorSections.map((ms) => {
        const titles = ms.titles ?? [];
        const chapters = ms.chapters ?? [];
        const msOrphans = ms.orphan_articles ?? [];

        return (
          <Box key={ms.name} sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                display: 'block', px: 1, py: 0.5,
                backgroundColor: '#e8eaf6', borderRadius: 1,
                color: '#283593', textTransform: 'uppercase',
                letterSpacing: 0.5, mb: 0.5,
              }}
            >
              {ms.name}
            </Typography>

            {/* ms-level orphan articles */}
            {msOrphans.map((art) => (
              <ArticleRow
                key={art.number}
                art={art}
                selectedArticles={selectedArticles}
                editedArticles={editedArticles}
                onToggleArticle={onToggleArticle}
                onOpenArticle={onOpenArticle}
              />
            ))}

            {/* TÍTULO level (Ley 99, Código Civil, etc.) */}
            {titles.map((titulo, ti) => (
              <TitleNode
                key={titulo.title ?? ti}
                titulo={titulo}
                selectedArticles={selectedArticles}
                editedArticles={editedArticles}
                onToggleArticle={onToggleArticle}
                onOpenArticle={onOpenArticle}
              />
            ))}

            {/* Direct chapters (Decretos, Resoluciones) */}
            {chapters.map((ch, ci) => (
              <ChapterNode
                key={ch.title ?? ci}
                chapter={ch}
                selectedArticles={selectedArticles}
                editedArticles={editedArticles}
                onToggleArticle={onToggleArticle}
                onOpenArticle={onOpenArticle}
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
const TaxonomyPanel = ({ source, selectedArticles, editedArticles = {}, onToggleArticle, onOpenArticle, onEditsImported, onMetadataReady }) => {
  const { taxonomy, loading, error, reload } = useTaxonomy(source);
  const importInputRef = useRef(null);
  const [viewMode, setViewMode] = useState('tree');

  useEffect(() => {
    if (taxonomy?.normative_metadata && onMetadataReady) {
      onMetadataReady(taxonomy.normative_metadata);
    }
  }, [taxonomy?.normative_metadata, onMetadataReady]);

  const tree = taxonomy?.tree ?? null;
  const totalArticles = taxonomy?.total_articles ?? 0;
  const editCount = Object.keys(editedArticles).length;
  const isNormativo = true;

  // Reset override when source changes
  const totalLabel = `${totalArticles} arts.`;

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
          <AccountTreeRounded sx={{ fontSize: 16, color: '#1565c0' }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Taxonomía
          </Typography>
          {totalArticles > 0 && (
            <Chip label={totalLabel} size="small" sx={{ height: 18, fontSize: 10, backgroundColor: '#e3f2fd', color: '#1565c0' }} />
          )}
          {selectedArticles.length > 0 && (
            <Chip label={`${selectedArticles.length} sel.`} size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />
          )}
          {editCount > 0 && (
            <Chip label={`${editCount} edit.`} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
          )}
        </Box>

        <Box display="flex" alignItems="center">
          {isNormativo && editCount > 0 && (
            <Tooltip title="Exportar ediciones como JSON">
              <IconButton size="small" onClick={handleExport}>
                <FileDownloadRounded sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {isNormativo && (
            <Tooltip title="Importar ediciones desde JSON">
              <IconButton size="small" onClick={() => importInputRef.current?.click()}>
                <FileUploadRounded sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={reload} disabled={loading}>
            <RefreshRounded sx={{ fontSize: 16 }} />
          </IconButton>
          <input ref={importInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </Box>
      </Box>

      {source && (
        <Box display="flex" alignItems="center" gap={1} sx={{ px: 1.5, py: 0.5, flexShrink: 0, flexWrap: 'wrap' }}>
          <Chip label={source} size="small" variant="outlined" sx={{ fontSize: 10, height: 18, maxWidth: 260 }} />

          {/* Vista árbol / texto */}
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
            </ToggleButtonGroup>
          )}
        </Box>
      )}

      <Divider />

      {/* Tree body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0.5 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
        )}
        {error && !loading && (
          <Alert severity="error" sx={{ fontSize: '0.78rem' }}>{error}</Alert>
        )}
        {!loading && !error && tree && viewMode === 'text' && (
          <Box sx={{ px: 1, py: 0.5 }}>
            <Typography
              component="pre"
              sx={{ fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#424242' }}
            >
              {taxonomy?.text ?? 'Sin texto disponible'}
            </Typography>
          </Box>
        )}
        {!loading && !error && tree && viewMode === 'tree' && (
          <NormativeTree
            tree={tree}
            selectedArticles={selectedArticles}
            editedArticles={editedArticles}
            onToggleArticle={onToggleArticle}
            onOpenArticle={onOpenArticle}
          />
        )}
        {!loading && !error && !tree && (
          <Box display="flex" justifyContent="center" py={4}>
            <Typography variant="body2" color="text.disabled">Sin datos de taxonomía</Typography>
          </Box>
        )}
      </Box>

      {/* Integrity panel — only normativo */}
      {isNormativo && source && <IntegrityPanel source={source} />}
    </Box>
  );
};

export default TaxonomyPanel;
