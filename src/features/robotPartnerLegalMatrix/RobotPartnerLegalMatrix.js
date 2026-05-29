import { useState, useCallback, useRef } from 'react';
import {
  Drawer, Box, Typography, IconButton,
  Button, Divider, Tooltip, Snackbar, Alert,
} from '@mui/material';
import {
  CloseRounded, SmartToyRounded, AssignmentRounded,
} from '@mui/icons-material';
import { DRAWER_STATES } from './constants/drawerStates';
import { UploadState, DocTypeSelectState, IndexingState, ReadyState } from './components';
import { saveEdit, loadAllEdits } from './lib/editsDb';
import { fetchArticle } from './api';

const RobotPartnerLegalMatrix = ({ open, onClose, onGenerateRequirement }) => {
  const [drawerState, setDrawerState]       = useState(DRAWER_STATES.UPLOAD);
  const [pdfFile, setPdfFile]               = useState(null);
  const [pdfUrl, setPdfUrl]                 = useState(null);
  const [pdfName, setPdfName]               = useState(null);
  const [docTypeHint, setDocTypeHint]       = useState(null);
  const [requisitoGeneral, setRequisitoGeneral] = useState(null);
  const [normativeMeta, setNormativeMeta]   = useState(null);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [editedArticles, setEditedArticles] = useState({});
  const [snackbar, setSnackbar]             = useState(null);
  const [generating, setGenerating]         = useState(false);
  const generatingRef = useRef(false);

  // Step 1: file selected → show PDF + type selector
  const handleFileSelected = useCallback((file) => {
    setPdfFile(file);
    setPdfUrl(URL.createObjectURL(file));
    setDocTypeHint(null);
    setDrawerState(DRAWER_STATES.DOC_TYPE_SELECT);
  }, []);

  // Step 2: user picks doc type → start indexing
  const handleDocTypeConfirm = useCallback(({ docType, requisitoGeneral: rg }) => {
    setDocTypeHint(docType);
    setRequisitoGeneral(rg);
    setDrawerState(DRAWER_STATES.INDEXING);
  }, []);

  // Step 3: indexing done → ready
  const handleIndexingComplete = useCallback(async ({ processedFiles }) => {
    const name = processedFiles?.[0] ?? pdfFile?.name ?? null;
    setPdfName(name);
    setSelectedArticles([]);
    const saved = name ? await loadAllEdits(name) : {};
    setEditedArticles(saved);
    setDrawerState(DRAWER_STATES.READY);
  }, [pdfFile]);

  const handleBack = useCallback(() => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfFile(null);
    setPdfUrl(null);
    setPdfName(null);
    setDocTypeHint(null);
    setRequisitoGeneral(null);
    setNormativeMeta(null);
    setDrawerState(DRAWER_STATES.UPLOAD);
  }, [pdfUrl]);

  const handleClose = useCallback(() => {
    handleBack();
    onClose();
  }, [handleBack, onClose]);

  // Toggle article-level selection (no paragraphId)
  const handleToggleArticle = useCallback((articleId) => {
    setSelectedArticles((prev) => {
      const exists = prev.some((a) => a.articleId === articleId && !a.paragraphId);
      if (exists) return prev.filter((a) => !(a.articleId === articleId && !a.paragraphId));
      return [...prev, { articleId, editedContent: editedArticles[articleId] ?? null }];
    });
  }, [editedArticles]);

  // Toggle individual PARÁGRAFO selection
  const handleToggleParagraph = useCallback((articleId, paragraphId, content) => {
    setSelectedArticles((prev) => {
      const exists = prev.some((a) => a.articleId === articleId && a.paragraphId === paragraphId);
      if (exists) {
        return prev.filter((a) => !(a.articleId === articleId && a.paragraphId === paragraphId));
      }
      return [...prev, { articleId, paragraphId, editedContent: content ?? null }];
    });
  }, []);

  const handleSaveArticle = useCallback(async ({ article, editedContent }) => {
    if (pdfName) await saveEdit(pdfName, article, editedContent);
    setEditedArticles((prev) => ({ ...prev, [article]: editedContent }));
    setSelectedArticles((prev) =>
      prev.map((a) =>
        a.articleId === article && !a.paragraphId ? { ...a, editedContent } : a,
      )
    );
    setSnackbar('Edición guardada localmente');
  }, [pdfName]);

  const handleRestoreArticle = useCallback((articleId) => {
    setEditedArticles((prev) => {
      const next = { ...prev };
      delete next[articleId];
      return next;
    });
    setSelectedArticles((prev) =>
      prev.map((a) =>
        a.articleId === articleId && !a.paragraphId ? { ...a, editedContent: null } : a,
      )
    );
    setSnackbar('Edición descartada — restaurado original');
  }, []);

  const handleGenerate = async () => {
    if (!onGenerateRequirement || generatingRef.current) return;
    generatingRef.current = true;
    setGenerating(true);
    try {
      const enriched = await Promise.all(
        selectedArticles.map(async (a) => {
          // PARÁGRAFO: content already available from tree
          if (a.paragraphId) return a;
          // Article with local edit
          if (a.editedContent !== null) return a;
          // Article without content: fetch from API
          try {
            const data = await fetchArticle(a.articleId, pdfName);
            return { ...a, editedContent: data?.content ?? '' };
          } catch {
            return { ...a, editedContent: '' };
          }
        })
      );
      onGenerateRequirement(enriched, pdfName, requisitoGeneral, normativeMeta);
    } finally {
      generatingRef.current = false;
      setGenerating(false);
    }
  };

  const isReady       = drawerState === DRAWER_STATES.READY;
  const showLoadAnother = drawerState !== DRAWER_STATES.UPLOAD;

  // Count distinct article IDs + standalone PARÁGRAFOS for tooltip
  const selCount = selectedArticles.length;
  const artCount = new Set(selectedArticles.filter((a) => !a.paragraphId).map((a) => a.articleId)).size;
  const parCount = selectedArticles.filter((a) => a.paragraphId).length;
  const selLabel = selCount === 0 ? '' :
    [artCount > 0 && `${artCount} art.`, parCount > 0 && `${parCount} par.`]
      .filter(Boolean).join(' + ');

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: '100vw', md: '85vw' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* Toolbar */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SmartToyRounded color="primary" sx={{ fontSize: 22 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Partner Business — Análisis Documental
            </Typography>
            {pdfName && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {pdfName}
              </Typography>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {isReady && (
              <Tooltip
                title={
                  selCount === 0
                    ? 'Selecciona artículos o PARÁGRAFOS con el checkbox para habilitar'
                    : `Generar requisito con ${selLabel}`
                }
              >
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AssignmentRounded />}
                    disabled={selCount === 0 || generating}
                    onClick={handleGenerate}
                    sx={{ fontSize: 12 }}
                  >
                    {generating ? 'Preparando...' : `Generar requisito${selCount > 0 ? ` (${selLabel})` : ''}`}
                  </Button>
                </span>
              </Tooltip>
            )}
            {showLoadAnother && (
              <Button size="small" variant="outlined" onClick={handleBack} sx={{ fontSize: 11 }}>
                Cargar otro PDF
              </Button>
            )}
            <IconButton onClick={handleClose}>
              <CloseRounded />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {drawerState === DRAWER_STATES.UPLOAD && (
            <UploadState onFileSelected={handleFileSelected} />
          )}

          {drawerState === DRAWER_STATES.DOC_TYPE_SELECT && pdfUrl && (
            <DocTypeSelectState
              pdfUrl={pdfUrl}
              fileName={pdfFile?.name}
              onConfirm={handleDocTypeConfirm}
            />
          )}

          {drawerState === DRAWER_STATES.INDEXING && pdfFile && (
            <IndexingState
              file={pdfFile}
              pdfUrl={pdfUrl}
              docType={docTypeHint}
              onIndexingComplete={handleIndexingComplete}
              onBack={handleBack}
            />
          )}

          {isReady && (
            <ReadyState
              pdfUrl={pdfUrl}
              source={pdfName}
              selectedArticles={selectedArticles}
              editedArticles={editedArticles}
              docTypeHint={docTypeHint}
              onToggleArticle={handleToggleArticle}
              onToggleParagraph={handleToggleParagraph}
              onSaveArticle={handleSaveArticle}
              onRestoreArticle={handleRestoreArticle}
              onEditsImported={(updated) => setEditedArticles(updated)}
              onMetadataReady={setNormativeMeta}
            />
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSnackbar(null)} sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RobotPartnerLegalMatrix;
