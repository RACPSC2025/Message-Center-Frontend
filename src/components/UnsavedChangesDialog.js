import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const UnsavedChangesDialog = ({ open, onClose, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="unsaved-changes-dialog-title"
      aria-describedby="unsaved-changes-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="unsaved-changes-dialog-title">
        {t('confirm_exit_without_save_title')}
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="unsaved-changes-dialog-description">
          {t('confirm_exit_without_save_message')}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} variant="outlined">
          {t('Cancel')}
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
          {t('exit_without_save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
