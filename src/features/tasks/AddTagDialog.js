

import React, { useEffect, useState } from 'react';
import { CompactPicker } from 'react-color';
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
  Chip,
  Grid
} from '@mui/material';
import { Close, AddCircle, ArrowBack } from '@mui/icons-material';
import axiosInstance from '../../lib/axios';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { fetchListTaskNew } from '../../stores/tasks/fetchListTaskNewSlice';

const COLOR_PALETTE = [
  // Blues
  '#0050d4', '#1976D2', '#2196F3', '#64B5F6', '#B3E5FC',
  // Greens
  '#16A085', '#388E3C', '#4CAF50', '#81C784', '#C8E6C9',
  // Reds
  '#b31b25', '#C62828', '#E53935', '#FF5252', '#FF8A80',
  // Purples
  '#8E44AD', '#9C27B0', '#BA68C8', '#E1BEE7',
  // Oranges & Yellows
  '#F39C12', '#FF9800', '#FFB300', '#FFD54F', '#FFF9C4',
  // Browns
  '#815100', '#A1887F', '#D7CCC8',
  // Greys & Neutrals
  '#2C3E50', '#4e5c71', '#90A4AE', '#B0BEC5', '#ECEFF1',
  // Pinks
  '#E91E63', '#F06292', '#F8BBD0',
  // Misc
  '#3F51B5', '#00BCD4', '#009688', '#CDDC39', '#FFEB3B', '#FFFFFF', '#000000'
];

const AddTagDialog = ({ open, setIsOpen, taskId, onTagsSaved }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]); // multiple
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createMode, setCreateMode] = useState(false);
  // New tag creation state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_PALETTE[0]);
  const [createdTags, setCreatedTags] = useState([]); // for multiple new tags

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
      setSelectedTags([]);
      setCreateMode(false);
      setCreatedTags([]);
      setNewTagName('');
      setNewTagColor(COLOR_PALETTE[0]);
      setError(null);
    }
  }, [open]);

  const handleAddNewTag = () => {
    if (!newTagName.trim()) return;
    setCreatedTags(prev => [...prev, { tag_name: newTagName.trim(), tag_color: newTagColor.replace('#', '') }]);
    setNewTagName('');
    setNewTagColor(COLOR_PALETTE[0]);
  };

  const handleSubmit = async () => {
    if ((!selectedTags || selectedTags.length === 0) && createdTags.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        task_id: taskId,
      };
      if (selectedTags.length > 0) {
        payload.tag_ids = selectedTags.map(tag => tag.value);
      }
      if (createdTags.length > 0) {
        payload.new_tags = createdTags;
      }
      await axiosInstance.post('/tasklist_api/add_tag_to_task', payload);
      if (setIsOpen) setIsOpen(false);
      // Refrescar la lista de tareas al guardar
      dispatch(fetchListTaskNew());
      if (onTagsSaved && typeof onTagsSaved === 'function') {
        onTagsSaved(taskId);
      }
    } catch (e) {
      setError(t('error_adding_tag'));
    } finally {
      setSubmitting(false);
    }
  };

  // Main content: select or create
  return (
    <Dialog open={open} onClose={() => { if (setIsOpen) setIsOpen(false); }} fullWidth maxWidth="xs" scroll="body">
      <AppBar sx={{ position: 'relative', bgcolor: 'primary.main', borderRadius: '12px 12px 2 0' }} elevation={0} color="primary">
        <Toolbar>
          {createMode ? (
            <IconButton edge="start" color="inherit" onClick={() => setCreateMode(false)} aria-label="back">
              <ArrowBack sx={{ color: 'white' }} />
            </IconButton>
          ) : null}
          <Typography sx={{ flex: 1, color: 'white', fontWeight: 800, fontSize: '1.2rem' }} variant="h6">
            {createMode ? t('create_tag') : t('add_tag')}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={() => { if (setIsOpen) setIsOpen(false); }} aria-label="close">
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3, bgcolor: '#f5f7f9', minHeight: 320 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : createMode ? (
          <>
            <Typography sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>{t('new_tag_details')}</Typography>
            <TextField
              label={t('tag_name')}
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 32 }}
              disabled={submitting}
            />
            <Typography sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary' }}>{t('select_color_palette')}</Typography>
            <Box sx={{ mb: 3 }}>
              <CompactPicker
                color={newTagColor}
                colors={COLOR_PALETTE}
                onChange={color => setNewTagColor(color.hex)}
                triangle="hide"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleAddNewTag}
                disabled={!newTagName.trim() || submitting}
                startIcon={<AddCircle />}
                sx={{ borderRadius: 8, fontWeight: 700 }}
              >
                {t('add_tag')}
              </Button>
            </Box>
            {createdTags.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ fontWeight: 600, mb: 1, color: 'text.secondary', fontSize: '0.9rem' }}>{t('tags_to_create')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {createdTags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag.tag_name}
                      sx={{ bgcolor: `#${tag.tag_color}`, color: '#222', fontWeight: 600, borderRadius: 2 }}
                      onDelete={() => setCreatedTags(createdTags.filter((_, i) => i !== idx))}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>{t('organize_with_tags')}</Typography>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={option => option.label}
              value={selectedTags}
              onChange={(_, value) => setSelectedTags(value)}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('select_tag')}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <span className="material-symbols-outlined" style={{ color: '#90a4ae', marginRight: 4, fontSize: 20 }}>{t('search')}</span>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<AddCircle />}
              onClick={() => setCreateMode(true)}
              sx={{ width: '100%', borderRadius: 3, py: 1.5, fontWeight: 700, mb: 2 }}
            >
              {t('create_new_tag')}
            </Button>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
          </>
        )}
      </Box>
      <Box sx={{ px: 3, py: 2, bgcolor: '#e5e9eb', borderTop: '1px solid #edf2f4', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => { if (setIsOpen) setIsOpen(false); }} disabled={submitting} color="inherit" sx={{ borderRadius: 8, fontWeight: 700 }}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ borderRadius: 8, fontWeight: 700 }}
          disabled={submitting || (selectedTags.length === 0 && createdTags.length === 0)}
        >
          {t('Save')}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AddTagDialog;
