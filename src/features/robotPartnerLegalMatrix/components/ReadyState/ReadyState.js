import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PDFViewerComponent from '../../../../components/Input/lexicalWYSWYG/PDFViewerComponent';
import TaxonomyPanel from '../TaxonomyPanel';
import ArticleEditorDialog from '../ArticleEditorDialog';

const MIN_RATIO = 20;
const MAX_RATIO = 80;

const ReadyState = ({ pdfUrl, source, selectedArticles, editedArticles = {}, docTypeHint, onToggleArticle, onSaveArticle, onEditsImported, onMetadataReady }) => {
  const [splitRatio, setSplitRatio] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [dialogArticle, setDialogArticle] = useState(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);

    const onMove = (ev) => {
      const container = document.getElementById('rplm-split-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const ratio = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio)));
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  return (
    <Box
      id="rplm-split-container"
      display="flex"
      sx={{ height: '100%', overflow: 'hidden', userSelect: dragging ? 'none' : 'auto' }}
    >
      {/* Left: PDF viewer */}
      <Box sx={{ width: `${splitRatio}%`, overflow: 'hidden', flexShrink: 0 }}>
        {pdfUrl && <PDFViewerComponent pdfUrl={pdfUrl} />}
      </Box>

      {/* Drag handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          width: 6,
          flexShrink: 0,
          cursor: 'col-resize',
          backgroundColor: dragging ? '#90caf9' : '#e0e0e0',
          transition: 'background-color 0.15s',
          '&:hover': { backgroundColor: '#90caf9' },
        }}
      />

      {/* Right: Taxonomy */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TaxonomyPanel
          source={source}
          selectedArticles={selectedArticles}
          editedArticles={editedArticles}
          onToggleArticle={onToggleArticle}
          onOpenArticle={(artId) => setDialogArticle(artId)}
          onEditsImported={onEditsImported}
          onMetadataReady={onMetadataReady}
        />
      </Box>

      <ArticleEditorDialog
        open={!!dialogArticle}
        articleId={dialogArticle}
        source={source}
        onClose={() => setDialogArticle(null)}
        onSave={(payload) => {
          onSaveArticle(payload);
          setDialogArticle(null);
        }}
      />
    </Box>
  );
};

export default ReadyState;
