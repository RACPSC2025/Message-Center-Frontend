// src/components/Findings/FindingFiveWhysTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Divider,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Delete, AttachFile, Save } from '@mui/icons-material';

export default function FindingFiveWhysTab({ 
  fiveWhys = null, 
  findingId = null,
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    why1: '',
    why2: '',
    why3: '',
    why4: '',
    why5: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (fiveWhys) {
      setFormData({
        why1: fiveWhys.why1 || '',
        why2: fiveWhys.why2 || '',
        why3: fiveWhys.why3 || '',
        why4: fiveWhys.why4 || '',
        why5: fiveWhys.why5 || ''
      });
      
      if (fiveWhys.attachments && Array.isArray(fiveWhys.attachments)) {
        setAttachments(fiveWhys.attachments);
      }
    }
  }, [fiveWhys]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (20 MB)
      const maxSize = 20 * 1024 * 1024; // 20 MB en bytes
      if (file.size > maxSize) {
        alert('El archivo excede el tamaño máximo de 20 MB');
        return;
      }

      // Validar formato
      const allowedFormats = [
        'image/jpeg',
        'image/png',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
      ];

      if (!allowedFormats.includes(file.type)) {
        alert('Formato de archivo no permitido. Use: JPG, PNG, XLS, XLSX, DOC, DOCX, PDF');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload-5whys');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    // TODO: Implementar eliminación de adjunto
    console.log('🗑️ Eliminar adjunto:', attachmentId);
  };

  const handleSave = () => {
    // TODO: Implementar guardado
    console.log('💾 Guardar 5 Porqués:', {
      findingId,
      formData,
      file: selectedFile
    });
  };

  // Componente para campo de solo lectura
  const ReadOnlyWhyField = ({ label, value }) => (
    <Grid item xs={12}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
          {value || 'No especificado'}
        </Typography>
      </Box>
    </Grid>
  );

  // Componente para campo editable
  const EditableWhyField = ({ label, value, name }) => (
    <Grid item xs={12}>
      <TextField
        fullWidth
        label={label}
        name={name}
        value={value}
        onChange={(e) => handleChange(name, e.target.value)}
        multiline
        rows={3}
        size="small"
        variant="outlined"
        InputLabelProps={{
          sx: { color: 'text.primary' }
        }}
        sx={{
          '& .MuiInputBase-input': {
            color: 'text.primary'
          }
        }}
      />
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Análisis 5 Porqués</Typography>
      </Box>

      {/* Alerta informativa */}
      {isEditing && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Recuerde que si va a pegar texto desde otras fuentes, debe utilizar el pegado especial
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Sección de 5 Porqués */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Preguntas de Análisis
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Por qué 1 */}
        {isEditing ? (
          <EditableWhyField
            label="Por qué 1"
            value={formData.why1}
            name="why1"
          />
        ) : (
          <ReadOnlyWhyField label="Por qué 1" value={formData.why1} />
        )}

        {/* Por qué 2 */}
        {isEditing ? (
          <EditableWhyField
            label="Por qué 2"
            value={formData.why2}
            name="why2"
          />
        ) : (
          <ReadOnlyWhyField label="Por qué 2" value={formData.why2} />
        )}

        {/* Por qué 3 */}
        {isEditing ? (
          <EditableWhyField
            label="Por qué 3"
            value={formData.why3}
            name="why3"
          />
        ) : (
          <ReadOnlyWhyField label="Por qué 3" value={formData.why3} />
        )}

        {/* Por qué 4 */}
        {isEditing ? (
          <EditableWhyField
            label="Por qué 4"
            value={formData.why4}
            name="why4"
          />
        ) : (
          <ReadOnlyWhyField label="Por qué 4" value={formData.why4} />
        )}

        {/* Por qué 5 */}
        {isEditing ? (
          <EditableWhyField
            label="Por qué 5"
            value={formData.why5}
            name="why5"
          />
        ) : (
          <ReadOnlyWhyField label="Por qué 5" value={formData.why5} />
        )}

        {/* Sección de archivos adjuntos */}
        {isEditing && (
          <>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Subir Archivo
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Los formatos permitidos son JPG, PNG, XLS, XLSX, DOC, DOCX, PDF y el tamaño máximo permitido por archivo es de 20 MB
              </Alert>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  id="file-upload-5whys"
                  type="file"
                  accept=".jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx,.pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload-5whys">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFile />}
                  >
                    Seleccionar archivo
                  </Button>
                </label>
                
                {selectedFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    <IconButton size="small" onClick={handleRemoveFile} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Ningún archivo seleccionado
                  </Typography>
                )}
              </Box>
            </Grid>
          </>
        )}

        {/* Lista de archivos adjuntos existentes */}
        {attachments.length > 0 && (
          <>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Archivos Adjuntos
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <List>
                {attachments.map((attachment) => (
                  <ListItem
                    key={attachment.id}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'white'
                    }}
                  >
                    <ListItemText
                      primary={attachment.old_name || attachment.new_name}
                      secondary={`Subido: ${attachment.created_at || 'N/A'}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => window.open(attachment.url, '_blank')}
                        sx={{ mr: 1 }}
                      >
                        <AttachFile />
                      </IconButton>
                      {isEditing && (
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </>
        )}

        {/* Botón guardar */}
        {isEditing && (
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Save />}
              onClick={handleSave}
              size="large"
            >
              Guardar
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}