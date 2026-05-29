import { useEffect, useMemo, useState } from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import FormBuilder from '../../../components/FormBuilder';
import { fetchFindingsOptions } from '../../../stores/findings/fetchFindingsOptionsSlice';
import {
  fetchTaskListLevel,
  resetLevel2AndBelow,
  resetLevel3AndBelow,
  resetLevel4AndBelow
} from '../../../stores/tasks/fetchFindingsListLevelSlice';

const NewFindingDrawer = ({ open, onClose, onSave }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { data: optionsData = {} } = useSelector((state) => state.findingsOptions || {});
  const {
    level1Options = [],
    level2Options = [],
    level3Options = [],
    level4Options = []
  } = useSelector((state) => state.fetchTaskListLevel || {});
  const userDetails = useSelector((state) => state.globalData.userDetails || {});

  const [formValues, setFormValues] = useState({
    tipo_hallazgo: '',
    fuente_hallazgo: '',
    persona_reporta: null,
    pais: '',
    empresa: '',
    departamento_provincia: '',
    ciudad_municipio: '',
    area_dependencia: '',
    gerencia: '',
    contratistas: '',
    contrato: '',
    persona_registro: '',
    que: '',
    cuando: null,
    cuanto: '',
    cual: '',
    donde: '',
    empresa_responsable_tratamiento: '',
    responsables_tratamiento: null,
    empresa_cierre: '',
    hallazgo_cierre_por: null,
    personas_notificar: [],
    descripcion_breve: '',
    fecha_cierre: null
  });

  const [externalErrors, setExternalErrors] = useState({});

  useEffect(() => {
    if (open) {
      dispatch(fetchFindingsOptions());
      dispatch(fetchTaskListLevel({ level: 1 }));
      setFormValues((prev) => ({
        ...prev,
        persona_registro: userDetails.fullname || ''
      }));
      setExternalErrors({});
    }
  }, [open, dispatch, userDetails.fullname]);

  const normalizeOptions = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      value: item.value ?? item.id ?? item,
      label: item.label ?? item.name ?? item.text ?? item
    }));
  };

  const findingTypeOptions = normalizeOptions(optionsData.finding_types);
  const findingSourceOptions = normalizeOptions(optionsData.finding_sources);
  const reporterOptions = normalizeOptions(optionsData.reporters);
  const contractorOptions = normalizeOptions(optionsData.contractors);
  const areaOptions = normalizeOptions(optionsData.area_options);
  const gerenciaOptions = normalizeOptions(optionsData.gerencia_options);
  const userOptions = normalizeOptions(optionsData.users);
  const paisOptions = normalizeOptions(level1Options);
  const empresaOptions = normalizeOptions(level2Options);
  const departamentoProvinciaOptions = normalizeOptions(level3Options);
  const ciudadMunicipioOptions = normalizeOptions(level4Options);

  const handleChange = (id, value) => {
    setExternalErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

    switch (id) {
      case 'pais':
        setFormValues((prev) => ({ ...prev, pais: value, empresa: '', departamento_provincia: '', ciudad_municipio: '' }));
        dispatch(resetLevel2AndBelow());
        if (value) dispatch(fetchTaskListLevel({ level: 2, formData: { id_level1: value } }));
        break;
      case 'empresa':
        setFormValues((prev) => ({ ...prev, empresa: value, departamento_provincia: '', ciudad_municipio: '' }));
        dispatch(resetLevel3AndBelow());
        if (value) dispatch(fetchTaskListLevel({ level: 3, formData: { id_level1: formValues.pais, id_level2: value } }));
        break;
      case 'departamento_provincia':
        setFormValues((prev) => ({ ...prev, departamento_provincia: value, ciudad_municipio: '' }));
        dispatch(resetLevel4AndBelow());
        if (value) dispatch(fetchTaskListLevel({ level: 4, formData: { id_level1: formValues.pais, id_level2: formValues.empresa, id_level3: value } }));
        break;
      default:
        setFormValues((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (values, resetForm) => {
    const errors = {};

    if (values.cuando && dayjs(values.cuando).isAfter(dayjs(), 'day')) {
      errors.cuando = t('field_is_required');
    }
    if (values.fecha_cierre && dayjs(values.fecha_cierre).isBefore(dayjs(), 'day')) {
      errors.fecha_cierre = t('field_is_required');
    }

    if (Object.keys(errors).length > 0) {
      setExternalErrors(errors);
      return;
    }

    if (onSave) {
      onSave(values, () => {
        resetForm();
        setFormValues({
          tipo_hallazgo: '',
          fuente_hallazgo: '',
          persona_reporta: null,
          pais: '',
          empresa: '',
          departamento_provincia: '',
          ciudad_municipio: '',
          area_dependencia: '',
          gerencia: '',
          contratistas: '',
          contrato: '',
          persona_registro: userDetails.fullname || '',
          que: '',
          cuando: null,
          cuanto: '',
          cual: '',
          donde: '',
          empresa_responsable_tratamiento: '',
          responsables_tratamiento: null,
          empresa_cierre: '',
          hallazgo_cierre_por: null,
          personas_notificar: [],
          descripcion_breve: '',
          fecha_cierre: null
        });
        onClose();
      });
    } else {
      resetForm();
      onClose();
    }
  };

  const formFields = useMemo(() => [
    {
      id: 'tipo_hallazgo',
      label: 'Tipo de Hallazgo',
      type: 'dropdown',
      options: findingTypeOptions,
      required: true,
      gridSize: 6
    },
    {
      id: 'fuente_hallazgo',
      label: 'Fuente del Hallazgo',
      type: 'dropdown',
      options: findingSourceOptions,
      required: true,
      gridSize: 6
    },
    {
      id: 'persona_reporta',
      label: 'Persona que reporta',
      type: 'autocomplete',
      options: reporterOptions,
      gridSize: 12
    },
    {
      id: 'pais',
      label: 'País',
      type: 'dropdown',
      options: paisOptions,
      gridSize: 3
    },
    {
      id: 'empresa',
      label: 'Empresa',
      type: 'dropdown',
      options: empresaOptions,
      gridSize: 3
    },
    {
      id: 'departamento_provincia',
      label: 'Departamento/Provincia',
      type: 'dropdown',
      options: departamentoProvinciaOptions,
      gridSize: 3
    },
    {
      id: 'ciudad_municipio',
      label: 'Ciudad/Municipio',
      type: 'dropdown',
      options: ciudadMunicipioOptions,
      gridSize: 3
    },
    {
      id: 'area_dependencia',
      label: 'Área de Dependencia',
      type: 'dropdown',
      options: areaOptions,
      gridSize: 6
    },
    {
      id: 'gerencia',
      label: 'Gerencia',
      type: 'dropdown',
      options: gerenciaOptions,
      gridSize: 6
    },
    {
      id: 'contratistas',
      label: 'Contratistas',
      type: 'dropdown',
      options: contractorOptions,
      gridSize: 6
    },
    {
      id: 'contrato',
      label: 'Contrato',
      type: 'dropdown',
      options: [],
      gridSize: 6
    },
    {
      id: 'persona_registro',
      label: 'Persona que registró',
      type: 'text',
      disabled: true,
      gridSize: 12
    },
    {
      id: 'que',
      label: '¿Qué?',
      type: 'textarea',
      gridSize: 12
    },
    {
      id: 'cuando',
      label: '¿Cuándo? (Fecha del suceso)',
      type: 'date',
      gridSize: 6
    },
    {
      id: 'cuanto',
      label: '¿Cuánto?',
      type: 'text',
      placeholder: 'Ingrese un valor o N/A',
      gridSize: 6
    },
    {
      id: 'cual',
      label: '¿Cuál?',
      type: 'textarea',
      gridSize: 12
    },
    {
      id: 'donde',
      label: '¿Dónde?',
      type: 'textarea',
      gridSize: 12
    },
    {
      id: 'empresa_responsable_tratamiento',
      label: 'Empresa Grupo Promigas (Responsables del tratamiento del hallazgo)',
      type: 'dropdown',
      options: findingSourceOptions,
      gridSize: 6
    },
    {
      id: 'responsables_tratamiento',
      label: 'Responsables del tratamiento del hallazgo',
      type: 'autocomplete',
      options: userOptions,
      gridSize: 6
    },
    {
      id: 'empresa_cierre',
      label: 'Empresa Grupo Promigas (Hallazgo a ser cerrado por)',
      type: 'dropdown',
      options: findingSourceOptions,
      gridSize: 6
    },
    {
      id: 'hallazgo_cierre_por',
      label: 'Hallazgo a ser cerrado por',
      type: 'autocomplete',
      options: userOptions,
      gridSize: 6
    },
    {
      id: 'personas_notificar',
      label: 'Personas a notificar (Multi-select)',
      type: 'dropdown',
      options: userOptions,
      multiple: true,
      gridSize: 12
    },
    {
      id: 'descripcion_breve',
      label: 'Descripción breve del hallazgo',
      type: 'textarea',
      gridSize: 12
    },
    {
      id: 'fecha_cierre',
      label: 'Fecha propuesta de Cierre',
      type: 'date',
      gridSize: 6
    }
  ], [
    findingTypeOptions,
    findingSourceOptions,
    reporterOptions,
    paisOptions,
    empresaOptions,
    departamentoProvinciaOptions,
    ciudadMunicipioOptions,
    areaOptions,
    gerenciaOptions,
    contractorOptions,
    userOptions
  ]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 800,
          maxWidth: '95vw',
          boxSizing: 'border-box'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Nuevo Hallazgo
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>
        <FormBuilder
          inputFields={formFields}
          initialValues={formValues}
          controlled={true}
          onChange={handleChange}
          successCallback={handleSubmit}
          cancelCallback={onClose}
          externalErrors={externalErrors}
          formFieldSize="small"
        />
      </Box>
    </Drawer>
  );
};

export default NewFindingDrawer;
