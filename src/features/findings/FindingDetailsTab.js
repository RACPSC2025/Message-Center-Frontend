// src/components/Findings/FindingDetailsTab.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Chip,
  Divider,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import dayjs from 'dayjs';

export default function FindingDetailsTab({ 
  finding, 
  isEditing, 
  dropdownOptions,
  onFormDataChange = () => {}
}) {
  const [formData, setFormData] = useState({
    finding_source: '',
    textofinding: '',
    finding_type: '',
    finding_type_other: '',
    reporting_person: '',
    level1: '',
    level2: '',
    level3: '',
    level4: '',
    area_ocurrencia: '',
    gerencia_formulario: '',
    contractors: '',
    contract: '',
    que_what: '',
    que_when: '',
    que_how_much: '',
    que_which: '',
    que_where: '',
    closing_approval_responsible: '',
    risk_controlled_by: '',
    people_notifly: [],
    brief_description: '',
    closure_date_required: ''
  });

  const [showOtherType, setShowOtherType] = useState(false);
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const initialFormDataRef = useRef(null);

  // Inicializar formData cuando cambia el finding
  useEffect(() => {
    if (finding) {
      const initialData = {
        finding_source: String(finding.finding_source || ''),
        textofinding: finding.textofinding_es || finding.textofinding_en || '',
        finding_type: String(finding.finding_type || ''),
        finding_type_other: '',
        reporting_person: String(finding.reporting_person || ''),
        level1: String(finding.level1 || ''),
        level2: String(finding.level2 || ''),
        level3: String(finding.level3 || ''),
        level4: String(finding.level4 || ''),
        area_ocurrencia: String(finding.area_ocurrencia || ''),
        gerencia_formulario: String(finding.gerencia_formulario || ''),
        contractors: String(finding.contractor_id || ''),
        contract: String(finding.contract_id || ''),
        que_what: finding.que_what || '',
        que_when: finding.que_when || '',
        que_how_much: finding.que_how_much || '',
        que_which: finding.que_which || '',
        que_where: finding.que_where || '',
        closing_approval_responsible: String(finding.closing_approval_responsible || ''),
        risk_controlled_by: String(finding.risk_controlled_by || ''),
        people_notifly: finding.people_notifly ? finding.people_notifly.split(',').map(id => String(id)) : [],
        brief_description: finding.brief_description || '',
        closure_date_required: finding.closure_date_required || ''
      };

      setFormData(initialData);
      initialFormDataRef.current = { ...initialData };
      setModifiedFields(new Set());

      const findingTypeNum = parseInt(finding.finding_type);
      if (findingTypeNum && ![1, 2, 3].includes(findingTypeNum)) {
        setShowOtherType(true);
        initialData.finding_type = '4';
        initialData.finding_type_other = finding.finding_type;
        setFormData(initialData);
        initialFormDataRef.current = initialData;
      }
    }
  }, [finding]);

  // Función para comparar valores
  const areValuesEqual = useCallback((value1, value2) => {
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) return false;
      return value1.every((val, index) => val === value2[index]);
    }
    return value1 === value2;
  }, []);

  // ✅ handleChange memoizado
  const handleChange = useCallback((field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };
      
      if (field === 'finding_type') {
        setShowOtherType(value === '4');
        if (value !== '4') {
          updatedData.finding_type_other = '';
        }
      }

      // Calcular campos modificados
      const newModifiedFields = new Set(modifiedFields);
      if (initialFormDataRef.current) {
        const initialValue = initialFormDataRef.current[field];
        const isModified = !areValuesEqual(value, initialValue);
        
        if (isModified) {
          newModifiedFields.add(field);
        } else {
          newModifiedFields.delete(field);
        }
        setModifiedFields(newModifiedFields);
      }

      // Construir objeto con solo campos modificados
      const modifiedData = {};
      newModifiedFields.forEach(fieldName => {
        modifiedData[fieldName] = updatedData[fieldName];
      });

      // Notificar al padre
      onFormDataChange({
        allData: updatedData,
        modifiedData: modifiedData,
        modifiedFields: Array.from(newModifiedFields)
      });

      return updatedData;
    });
  }, [areValuesEqual, modifiedFields, onFormDataChange]);

  if (!finding) return null;

  const getStatusLabel = (status) => {
    const labels = { 1: 'Abierto', 2: 'En Proceso', 3: 'Cerrado' };
    return labels[status] || 'Desconocido';
  };

  const getStatusColor = (status) => {
    const colors = { 1: 'warning', 2: 'info', 3: 'success' };
    return colors[status] || 'default';
  };

  const getOptionId = (option) => String(option?.id || option?.value || '');
  const getOptionLabel = (option) => option?.name || option?.text || option?.label || 'Sin nombre';

  return (
    <Box>
      {isEditing && (!dropdownOptions || Object.keys(dropdownOptions).length === 0) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Las opciones de los campos no se han cargado correctamente. Por favor, recarga la página.
        </Alert>
      )}

      {isEditing && modifiedFields.size > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {modifiedFields.size} campo{modifiedFields.size > 1 ? 's' : ''} modificado{modifiedFields.size > 1 ? 's' : ''}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Información General</Typography>
        <Chip label={getStatusLabel(finding.status)} color={getStatusColor(finding.status)} size="small" />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" gutterBottom>Datos Básicos</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* ID */}
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">ID</Typography>
          <Typography variant="body2">{finding.id}</Typography>
        </Grid>

        {/* Fecha Creación */}
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">Fecha de Creación</Typography>
          <Typography variant="body2">
            {finding.created_at ? dayjs(finding.created_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
          </Typography>
        </Grid>

        {/* Fuente del Hallazgo */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: modifiedFields.has('finding_source') ? 'warning.main' : 'text.primary' }}>
                Fuente del Hallazgo
              </InputLabel>
              <Select
                value={formData.finding_source}
                onChange={(e) => handleChange('finding_source', e.target.value)}
                label="Fuente del Hallazgo"
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.finding_sources || []).map((opt, idx) => (
                  <MenuItem key={`fs-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Fuente del Hallazgo</Typography>
              <Typography variant="body2">{finding.finding_source_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Tipo de Hallazgo */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: modifiedFields.has('finding_type') ? 'warning.main' : 'text.primary' }}>
                Tipo de Hallazgo
              </InputLabel>
              <Select
                value={formData.finding_type}
                onChange={(e) => handleChange('finding_type', e.target.value)}
                label="Tipo de Hallazgo"
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                <MenuItem value="1">No conformidad</MenuItem>
                <MenuItem value="2">Observación</MenuItem>
                <MenuItem value="3">Oportunidad de mejora</MenuItem>
                <MenuItem value="4">Otro</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Tipo de Hallazgo</Typography>
              <Typography variant="body2">{finding.finding_type_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Otro tipo */}
        {showOtherType && isEditing && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Especificar Otro Tipo"
              value={formData.finding_type_other}
              onChange={(e) => handleChange('finding_type_other', e.target.value)}
            />
          </Grid>
        )}

        {/* Persona que Reporta */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: modifiedFields.has('reporting_person') ? 'warning.main' : 'text.primary' }}>
                Persona que Reporta
              </InputLabel>
              <Select
                value={formData.reporting_person}
                onChange={(e) => handleChange('reporting_person', e.target.value)}
                label="Persona que Reporta"
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.reporting_persons || []).map((opt, idx) => (
                  <MenuItem key={`rp-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Persona que Reporta</Typography>
              <Typography variant="body2">{finding.reporter_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Creado por */}
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">Creado por</Typography>
          <Typography variant="body2">{finding.created_by_name || 'N/A'}</Typography>
        </Grid>

        {/* UBICACIÓN */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>Ubicación</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Level 1 */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>{dropdownOptions.level1_name || "País"}</InputLabel>
              <Select
                value={formData.level1}
                onChange={(e) => handleChange('level1', e.target.value)}
                label={dropdownOptions.level1_name || "País"}
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.level1 || []).map((opt, idx) => (
                  <MenuItem key={`l1-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                {dropdownOptions.level1_name || "País"}
              </Typography>
              <Typography variant="body2">{finding.region_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Level 2 */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>{dropdownOptions.level2_name || "Empresa"}</InputLabel>
              <Select
                value={formData.level2}
                onChange={(e) => handleChange('level2', e.target.value)}
                label={dropdownOptions.level2_name || "Empresa"}
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.level2 || [])
                  .filter(opt => !formData.level1 || String(opt.parent_id) === String(formData.level1))
                  .map((opt, idx) => (
                    <MenuItem key={`l2-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                      {getOptionLabel(opt)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                {dropdownOptions.level2_name || "Empresa"}
              </Typography>
              <Typography variant="body2">{finding.country_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Level 3 */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>{dropdownOptions.level3_name || "Departamento"}</InputLabel>
              <Select
                value={formData.level3}
                onChange={(e) => handleChange('level3', e.target.value)}
                label={dropdownOptions.level3_name || "Departamento"}
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.level3 || [])
                  .filter(opt => !formData.level2 || String(opt.parent_id) === String(formData.level2))
                  .map((opt, idx) => (
                    <MenuItem key={`l3-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                      {getOptionLabel(opt)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                {dropdownOptions.level3_name || "Departamento"}
              </Typography>
              <Typography variant="body2">{finding.location_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Level 4 */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>{dropdownOptions.level4_name || "Provincia"}</InputLabel>
              <Select
                value={formData.level4}
                onChange={(e) => handleChange('level4', e.target.value)}
                label={dropdownOptions.level4_name || "Provincia"}
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.level4 || [])
                  .filter(opt => !formData.level3 || String(opt.parent_id) === String(formData.level3))
                  .map((opt, idx) => (
                    <MenuItem key={`l4-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                      {getOptionLabel(opt)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                {dropdownOptions.level4_name || "Provincia"}
              </Typography>
              <Typography variant="body2">{finding.business_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Área Ocurrencia */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>Área de Ocurrencia</InputLabel>
              <Select
                value={formData.area_ocurrencia}
                onChange={(e) => handleChange('area_ocurrencia', e.target.value)}
                label="Área de Ocurrencia"
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.occurrence_areas || []).map((opt, idx) => (
                  <MenuItem key={`ao-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Área de Ocurrencia</Typography>
              <Typography variant="body2">{finding.area_ocurrencia_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Gerencia */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>Gerencia del Formulario</InputLabel>
              <Select
                value={formData.gerencia_formulario}
                onChange={(e) => handleChange('gerencia_formulario', e.target.value)}
                label="Gerencia del Formulario"
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.managements || []).map((opt, idx) => (
                  <MenuItem key={`gf-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Gerencia</Typography>
              <Typography variant="body2">{finding.gerencia_formulario_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Contratistas */}
        {dropdownOptions.contractors_enabled && (
          <>
            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Contratistas</InputLabel>
                  <Select
                    value={formData.contractors}
                    onChange={(e) => handleChange('contractors', e.target.value)}
                    label="Contratistas"
                  >
                    <MenuItem value=""><em>Seleccionar</em></MenuItem>
                    {(dropdownOptions.contractors || []).map((opt, idx) => (
                      <MenuItem key={`ct-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                        {getOptionLabel(opt)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">Contratista</Typography>
                  <Typography variant="body2">{finding.contractor_name || 'N/A'}</Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Contrato</InputLabel>
                  <Select
                    value={formData.contract}
                    onChange={(e) => handleChange('contract', e.target.value)}
                    label="Contrato"
                  >
                    <MenuItem value=""><em>Seleccionar</em></MenuItem>
                    {(dropdownOptions.contracts || [])
                      .filter(opt => !formData.contractors || String(opt.contractor_id) === String(formData.contractors))
                      .map((opt, idx) => (
                        <MenuItem key={`cn-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                          {getOptionLabel(opt)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">Contrato</Typography>
                  <Typography variant="body2">{finding.contract_name || 'N/A'}</Typography>
                </>
              )}
            </Grid>
          </>
        )}

        {/* 5Qs */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>5Qs - Análisis del Hallazgo</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Qué */}
        <Grid item xs={12}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              label="¿Qué? (What)"
              multiline
              rows={3}
              value={formData.que_what}
              onChange={(e) => handleChange('que_what', e.target.value)}
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">¿Qué?</Typography>
              <Typography variant="body2">{finding.que_what || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Cuándo */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              type="date"
              label="¿Cuándo? (When)"
              value={formData.que_when}
              onChange={(e) => handleChange('que_when', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: dayjs().format('YYYY-MM-DD') }}
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">¿Cuándo?</Typography>
              <Typography variant="body2">
                {finding.que_when ? dayjs(finding.que_when).format('DD/MM/YYYY') : 'N/A'}
              </Typography>
            </>
          )}
        </Grid>

        {/* Cuánto */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              label="¿Cuánto? (How Much)"
              value={formData.que_how_much}
              onChange={(e) => handleChange('que_how_much', e.target.value)}
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">¿Cuánto?</Typography>
              <Typography variant="body2">{finding.que_how_much || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Cuál */}
        <Grid item xs={12}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              label="¿Cuál? (Which)"
              multiline
              rows={3}
              value={formData.que_which}
              onChange={(e) => handleChange('que_which', e.target.value)}
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">¿Cuál?</Typography>
              <Typography variant="body2">{finding.que_which || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Dónde */}
        <Grid item xs={12}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              label="¿Dónde? (Where)"
              value={formData.que_where}
              onChange={(e) => handleChange('que_where', e.target.value)}
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">¿Dónde?</Typography>
              <Typography variant="body2">{finding.que_where || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Descripción */}
        <Grid item xs={12}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              label="Descripción Breve"
              multiline
              rows={3}
              value={formData.brief_description}
              onChange={(e) => handleChange('brief_description', e.target.value)}
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Descripción Breve</Typography>
              <Typography variant="body2">{finding.brief_description || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* RESPONSABLES */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>Responsables</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Responsable Aprobación */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>Responsable Aprobación de Cierre</InputLabel>
              <Select
                value={formData.closing_approval_responsible}
                onChange={(e) => handleChange('closing_approval_responsible', e.target.value)}
                label="Responsable Aprobación de Cierre"
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.administrators || []).map((opt, idx) => (
                  <MenuItem key={`car-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                Responsable Aprobación de Cierre
              </Typography>
              <Typography variant="body2">{finding.closing_approval_responsible_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Riesgo Controlado Por */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>Riesgo Controlado Por</InputLabel>
              <Select
                value={formData.risk_controlled_by}
                onChange={(e) => handleChange('risk_controlled_by', e.target.value)}
                label="Riesgo Controlado Por"
              >
                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                {(dropdownOptions.administrators || []).map((opt, idx) => (
                  <MenuItem key={`rcb-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Riesgo Controlado Por</Typography>
              <Typography variant="body2">{finding.risk_controlled_by_name || 'N/A'}</Typography>
            </>
          )}
        </Grid>

        {/* Personas a Notificar */}
        <Grid item xs={12}>
          {isEditing ? (
            <FormControl fullWidth size="small">
              <InputLabel>Personas a Notificar</InputLabel>
              <Select
                multiple
                value={formData.people_notifly}
                onChange={(e) => handleChange('people_notifly', e.target.value)}
                label="Personas a Notificar"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((val) => {
                      const person = (dropdownOptions.administrators || []).find(p => getOptionId(p) === String(val));
                      return <Chip key={val} label={person ? getOptionLabel(person) : val} size="small" />;
                    })}
                  </Box>
                )}
              >
                {(dropdownOptions.administrators || []).map((opt, idx) => (
                  <MenuItem key={`pn-${getOptionId(opt)}-${idx}`} value={getOptionId(opt)}>
                    {getOptionLabel(opt)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Personas a Notificar</Typography>
              <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {finding.people_notifly_names && finding.people_notifly_names.length > 0 ? (
                  finding.people_notifly_names.map((name, index) => (
                    <Chip key={index} label={name} size="small" />
                  ))
                ) : (
                  <Typography variant="body2">N/A</Typography>
                )}
              </Box>
            </>
          )}
        </Grid>

        {/* FECHAS */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>Fechas</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        {/* Fecha Cierre Propuesta */}
        <Grid item xs={12} sm={6}>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha de Cierre Propuesta"
              value={formData.closure_date_required}
              onChange={(e) => handleChange('closure_date_required', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Fecha de Cierre Propuesta</Typography>
              <Typography variant="body2">
                {finding.closure_date_required ? dayjs(finding.closure_date_required).format('DD/MM/YYYY') : 'N/A'}
              </Typography>
            </>
          )}
        </Grid>

        {/* Fecha Cierre Real */}
        {finding.actual_closure_date && (
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">Fecha de Cierre Real</Typography>
            <Typography variant="body2">{dayjs(finding.actual_closure_date).format('DD/MM/YYYY')}</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}