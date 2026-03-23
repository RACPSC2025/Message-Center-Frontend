
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  DialogContent
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axiosInstance from '../../lib/axios';
import { useTranslation } from 'react-i18next';

const AddTagDialog = ({ open, setIsOpen, taskId }) => {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      axiosInstance.get('/tasklist_api/list_tags').then(res => {
        setTags(res.data.data || []);
        setLoading(false);
      }).catch(() => {
        setTags([]);
        setLoading(false);
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedTag) return;
    setSubmitting(true);
    setError(null);
    try {
      // Aquí deberías llamar al endpoint para asociar el tag a la tarea
      // await axiosInstance.post('/tasklist_api/add_tag_to_task', { task_id: taskId, tag_id: selectedTag.value });
      if (setIsOpen) setIsOpen(false);
    } catch (e) {
      setError(t('error_adding_tag'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => { if (setIsOpen) setIsOpen(false); }} fullWidth maxWidth="xs" scroll="body">
      <AppBar sx={{ position: 'relative' }} elevation={0} color="primary">
        <Toolbar>
          <Typography sx={{ flex: 1, color: 'white' }} variant="h6">
            {t('add_tag')}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={() => { if (setIsOpen) setIsOpen(false); }} aria-label="close">
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="form" onSubmit={e => { e.preventDefault(); handleSubmit(); }} noValidate sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          <Autocomplete
            options={tags}
            getOptionLabel={option => option.label}
            value={selectedTag}
            onChange={(_, value) => setSelectedTag(value)}
            renderInput={params => <TextField {...params} label={t('select_tag')} fullWidth />}
            disabled={submitting}
            sx={{ mb: 2 }}
          />
        )}
        {error && <Typography color="error" variant="body2">{error}</Typography>}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button onClick={() => { if (setIsOpen) setIsOpen(false); }} disabled={submitting} color="inherit">
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} type="submit" variant="contained" disabled={!selectedTag || submitting}>
            {t('add')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddTagDialog;
