// src/components/Findings/FindingsDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Chip,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FindingDetailsTab from './FindingDetailsTab';
import FindingRiskAnalysisTab from './FindingRiskAnalysisTab';
import FindingFiveWhysTab from './FindingFiveWhysTab';

export default function FindingsDrawer({
  open,
  finding,
  onClose,
  dropdownOptions,
  onSave,
  mode = 'view',
  initialTab = 0,
  findingDetails,
  loading
}) {
  const currentFinding = findingDetails || finding;
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  
  const [allFormData, setAllFormData] = useState({});
  const [modifiedData, setModifiedData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCurrentTab(initialTab);
    setIsEditing(mode === 'edit');
  }, [initialTab, mode]);

  useEffect(() => {
    if (open && finding) {
      setModifiedData({});
      setHasChanges(false);
      setIsEditing(mode === 'edit');
    }
  }, [open, finding, mode]);

  const handleFormDataChange = (data) => {
    setAllFormData(data.allData);
    setModifiedData(data.modifiedData);
    setHasChanges(data.modifiedFields && data.modifiedFields.length > 0);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleView = () => {
    if (hasChanges) {
      if (window.confirm('¿Desea descartar los cambios?')) {
        setIsEditing(false);
        setModifiedData({});
        setHasChanges(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      alert('No hay cambios para guardar');
      return;
    }

    if (Object.keys(modifiedData).length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    // ✅ Validar que onSave existe
    if (typeof onSave !== 'function') {
      console.error('❌ onSave no es una función:', onSave);
      alert('Error: No se puede guardar. La función onSave no está configurada.');
      return;
    }

    try {
      setSaving(true);
      
      const dataToUpdate = { ...modifiedData };

      if (dataToUpdate.finding_type === '4' && allFormData.finding_type_other) {
        dataToUpdate.finding_type = allFormData.finding_type_other;
        delete dataToUpdate.finding_type_other;
      }

      if ('contractors' in dataToUpdate && allFormData.contract) {
        dataToUpdate.contract = allFormData.contract;
      }

      console.log('🚀 Guardando cambios:', dataToUpdate);

      await onSave(finding.id, dataToUpdate);
      
      setModifiedData({});
      setHasChanges(false);
      setIsEditing(false);
      
      console.log('✅ Guardado exitoso');
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('Error al guardar: ' + (error.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('¿Desea descartar los cambios?')) {
        setModifiedData({});
        setHasChanges(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('¿Desea cerrar sin guardar los cambios?')) {
        setModifiedData({});
        setHasChanges(false);
        setIsEditing(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const isLocked = finding?.status === 3;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: '80%', md: '60%' } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ✅ Header con título y botones */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          {/* Título a la izquierda */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="h2" sx={{ m: 0 }}>
              Hallazgo #{finding?.id}
            </Typography>
            {isLocked && (
              <Chip 
                label="Cerrado"
                color="error" 
                size="small" 
              />
            )}
          </Box>

          {/* ✅ Botones más a la derecha */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {!isLocked && (
              <>
                {!isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      size="small"
                      disabled
                    >
                      Modo Vista
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      size="small"
                      onClick={handleEdit}
                    >
                      Editar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      size="small"
                      onClick={handleView}
                      disabled={saving}
                    >
                      Vista
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      size="small"
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      color="success"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      size="small"
                      onClick={handleCancel}
                      disabled={saving}
                      color="error"
                    >
                      Cancelar
                    </Button>
                    {hasChanges && (
                      <Chip 
                        label={`${Object.keys(modifiedData).length}`}
                        color="warning" 
                        size="small" 
                      />
                    )}
                  </>
                )}
              </>
            )}
            {/* Botón cerrar al final */}
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Mensaje de hallazgo cerrado */}
        {isLocked && (
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: 'error.light',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="error.dark" fontWeight="bold" textAlign="center">
              ⚠️ Este hallazgo está cerrado y no puede ser editado
            </Typography>
          </Box>
        )}

        {/* Tabs */}
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Detalles" />
          <Tab label="Análisis de causas" />
          <Tab label="Análisis 5 porqué" />
        </Tabs>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {currentTab === 0 && (
            <FindingDetailsTab
              finding={finding}
              isEditing={isEditing && !isLocked}
              dropdownOptions={dropdownOptions}
              onFormDataChange={handleFormDataChange}
            />
          )}
          {currentTab === 1 && (
            <FindingRiskAnalysisTab
              finding={finding}
              isEditing={isEditing && !isLocked}
            />
          )}
          {currentTab === 2 && (
            <FindingFiveWhysTab
              finding={finding}
              isEditing={isEditing && !isLocked}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
}