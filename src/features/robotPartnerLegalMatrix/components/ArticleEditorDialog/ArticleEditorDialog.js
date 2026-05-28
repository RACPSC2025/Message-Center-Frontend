import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress,
  Chip, Alert, Tooltip, IconButton,
} from '@mui/material';
import { ArticleRounded, RestoreRounded, SaveRounded } from '@mui/icons-material';
import { fetchArticle } from '../../api';
import { loadEdit, clearEdit } from '../../lib/editsDb';

const ArticleEditorDialog = ({ open, articleId, source, onClose, onSave }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [hasSavedEdit, setHasSavedEdit] = useState(false);

  useEffect(() => {
    if (!open || !articleId || !source) return;
    setLoading(true);
    setError(null);
    setDetail(null);
    setHasSavedEdit(false);

    Promise.all([
      fetchArticle(articleId, source),
      loadEdit(source, articleId),
    ])
      .then(([data, saved]) => {
        setDetail(data);
        const apiContent = data?.content ?? '';
        setOriginalContent(apiContent);
        if (saved !== null) {
          setEditedContent(saved);
          setHasSavedEdit(true);
        } else {
          setEditedContent(apiContent);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [open, articleId, source]);

  const handleSave = () => {
    onSave({ article: articleId, editedContent });
    onClose();
  };

  const handleRestoreOriginal = async () => {
    await clearEdit(source, articleId);
    setEditedContent(originalContent);
    setHasSavedEdit(false);
  };

  const isDirty = editedContent !== originalContent;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <ArticleRounded color="primary" />
          <Typography variant="h6" fontWeight={700}>
            {articleId}
          </Typography>
          {detail?.major_section && (
            <Chip label={detail.major_section} size="small" variant="outlined" />
          )}
          {detail?.page && (
            <Chip label={`Pág. ${detail.page}`} size="small" />
          )}
          {hasSavedEdit && (
            <Chip
              label="Edición guardada localmente"
              size="small"
              color="warning"
              variant="filled"
              sx={{ fontSize: 10 }}
            />
          )}
          {isDirty && !hasSavedEdit && (
            <Chip
              label="Sin guardar"
              size="small"
              color="default"
              variant="outlined"
              sx={{ fontSize: 10 }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <TextField
            multiline
            fullWidth
            minRows={10}
            maxRows={24}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            variant="outlined"
            inputProps={{ style: { fontSize: '0.85rem', lineHeight: 1.7, fontFamily: 'inherit' } }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        {(hasSavedEdit || isDirty) && (
          <Tooltip title="Descarta ediciones y restaura el texto original del documento">
            <span>
              <Button
                startIcon={<RestoreRounded />}
                onClick={handleRestoreOriginal}
                color="warning"
                size="small"
                disabled={loading || !!error}
              >
                Restaurar original
              </Button>
            </span>
          </Tooltip>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} color="inherit">Cerrar</Button>
        <Button
          variant="contained"
          startIcon={<SaveRounded />}
          onClick={handleSave}
          disabled={loading || !!error || !isDirty}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleEditorDialog;
