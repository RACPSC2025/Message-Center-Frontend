// src/components/Findings/FindingRiskAnalysisTab.jsx
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Download,
  Visibility
} from '@mui/icons-material';
import dayjs from 'dayjs';
import TextFieldWithActions from '../actions/TextFieldWithActions'; 

export default function FindingRiskAnalysisTab({
  riskAnalysis = null,
  findingId,
  isEditing = false
}) {
  const [observations, setObservations] = useState(riskAnalysis?.observations || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState(riskAnalysis?.attachments || []);

  // Manejar cambio en observaciones - SIMPLIFICADO
  const handleObservationsChange = (newValue) => {
    setObservations(newValue);
  };

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    // Validar tamaño (20 MB máximo)
    const maxSize = 20 * 1024 * 1024; // 20 MB en bytes
    if (file.size > maxSize) {
      alert('El archivo excede el tamaño máximo permitido de 20 MB');
      event.target.value = '';
      return;
    }

    // Validar formato
    const allowedFormats = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'xls', 'xlsx', 'doc', 'docx', 'pdf'];

    if (!allowedFormats.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Formato de archivo no permitido. Los formatos permitidos son: JPG, PNG, XLS, XLSX, DOC, DOCX, PDF');
      event.target.value = '';
      return;
    }

    console.log('📎 Archivo seleccionado:', file.name, 'Tamaño:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    setSelectedFile(file);
  };

  // Guardar observación
  const handleSaveObservation = () => {
    console.log('💾 Guardando observación:', observations);
    
    // TODO: Implementar llamada al API para guardar observaciones
    // dispatch(updateRiskAnalysisObservations({ findingId, observations }));
    
    alert('Observación guardada exitosamente');
  };

  // Subir archivo
  const handleUploadFile = () => {
    if (!selectedFile) {
      alert('Por favor seleccione un archivo primero');
      return;
    }

    console.log('📤 Subiendo archivo:', selectedFile.name);
    
    // TODO: Implementar subida de archivo
    // const formData = new FormData();
    // formData.append('file', selectedFile);
    // formData.append('finding_id', findingId);
    // formData.append('type', 'risk_analysis');
    // dispatch(uploadFindingAttachment(formData));

    alert('Archivo subido exitosamente');
    setSelectedFile(null);
    
    // Reset input
    const fileInput = document.getElementById('risk-analysis-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Ver archivo
  const handleViewFile = (attachment) => {
    console.log('👁️ Ver archivo:', attachment.file_name);
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  // Descargar archivo
  const handleDownloadFile = (attachment) => {
    console.log('⬇️ Descargar archivo:', attachment.file_name);
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Eliminar archivo
  const handleDeleteFile = (attachmentId) => {
    if (window.confirm('¿Está seguro de eliminar este archivo?')) {
      console.log('🗑️ Eliminar archivo:', attachmentId);
      
      // TODO: Implementar eliminación de archivo
      // dispatch(deleteFindingAttachment({ findingId, attachmentId }));
      
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      alert('Archivo eliminado exitosamente');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" gutterBottom>
        Análisis de causas
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Alert de pegado especial */}
      {isEditing && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Recuerde que si va a pegar texto desde otras fuentes, debe utilizar el pegado especial
        </Alert>
      )}

      {/* Campo de Observaciones - ACTUALIZADO con TextFieldWithActions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Observaciones
        </Typography>
        
        {isEditing ? (
          <>
            {/* NUEVO: Usar TextFieldWithActions en lugar de TextField */}
            <TextFieldWithActions
              value={observations}
              onChange={handleObservationsChange}
              label="Observaciones"
              disabled={false}
              placeholder="Ingrese sus observaciones aquí..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              color="success"
              onClick={handleSaveObservation}
              sx={{ 
                bgcolor: '#28a745',
                '&:hover': {
                  bgcolor: '#218838'
                }
              }}
            >
              Guardar observación
            </Button>
          </>
        ) : (
          <Box
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              bgcolor: '#f9f9f9',
              minHeight: 100
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {observations || 'Sin observaciones'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Sección de Archivos */}
      {isEditing && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Escoja el archivo
          </Typography>

          {/* Alert de formatos permitidos */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Los formatos permitidos son JPG, PNG, XLS, XLSX, DOC, DOCX, PDF y el tamaño máximo permitido por archivo es de 20 MB
          </Alert>

          {/* Input de archivo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ minWidth: 180 }}
            >
              Seleccionar archivo
              <input
                id="risk-analysis-file-input"
                type="file"
                hidden
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx,.pdf"
              />
            </Button>
            
            <Typography variant="body2" color="text.secondary">
              {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
            </Typography>
          </Box>

          {/* Botón Subir Archivo */}
          <Button
            variant="contained"
            color="success"
            startIcon={<CloudUpload />}
            onClick={handleUploadFile}
            disabled={!selectedFile}
            sx={{ 
              bgcolor: '#28a745',
              '&:hover': {
                bgcolor: '#218838'
              },
              '&.Mui-disabled': {
                bgcolor: '#cccccc'
              }
            }}
          >
            Subir Archivo
          </Button>
        </Box>
      )}

      {/* Lista de archivos adjuntos */}
      {attachments && attachments.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Archivos Adjuntos
          </Typography>
          
          <List sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}>
            {attachments.map((attachment, index) => (
              <React.Fragment key={attachment.id || index}>
                <ListItem
                  sx={{
                    '&:hover': {
                      bgcolor: '#f0f0f0'
                    }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleViewFile(attachment)}
                        title="Ver"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDownloadFile(attachment)}
                        title="Descargar"
                      >
                        <Download fontSize="small" />
                      </IconButton>
                      
                      {isEditing && (
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteFile(attachment.id)}
                          title="Eliminar"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={attachment.file_name || attachment.old_name}
                    secondary={
                      attachment.uploaded_at 
                        ? `Subido: ${dayjs(attachment.uploaded_at).format('DD/MM/YYYY HH:mm')}`
                        : null
                    }
                  />
                </ListItem>
                {index < attachments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Mensaje cuando no hay archivos */}
      {(!attachments || attachments.length === 0) && !isEditing && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No hay archivos adjuntos
          </Typography>
        </Box>
      )}
    </Box>
  );
}