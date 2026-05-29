# Documentación del Componente FormBuilder

## Descripción General

`FormBuilder` es un componente React de alto nivel que permite construir formularios dinámicos de manera declarativa. Este componente simplifica la creación de formularios al proporcionar una interfaz unificada para diferentes tipos de campos de entrada, validación integrada, y soporte para modos controlados y no controlados.

**Ubicación:** `src/components/FormBuilder.js`

## Características Principales

- **Lazy Loading:** Todos los componentes de input se cargan de forma diferida para optimizar el rendimiento
- **Validación Integrada:** Validación de campos requeridos automática
- **Modos de Operación:** Soporta modos controlados y no controlados
- **Grid System:** Layout flexible con sistema de grid de Material-UI
- **Campos Mejorados:** Soporte para componentes personalizados en campos específicos
- **Errores Externos:** Integración con errores de validación externos
- **Internacionalización:** Soporte para i18n mediante react-i18next

## Props del Componente

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `inputFields` | `Array` | `[]` | Array de objetos que definen los campos del formulario |
| `initialValues` | `Object` | `{}` | Valores iniciales del formulario |
| `successCallback` | `Function` | `() => {}` | Callback ejecutado cuando el formulario se envía exitosamente |
| `cancelCallback` | `Function` | `() => {}` | Callback ejecutado cuando se cancela el formulario |
| `showActionButton` | `Boolean` | `true` | Muestra/oculta los botones de acción (Guardar/Cancelar) |
| `controlled` | `Boolean` | `false` | Modo de operación del formulario (controlado/no controlado) |
| `formFieldSize` | `String` | `'small'` | Tamaño de los campos (`'small'`, `'medium'`, `'large'`) |
| `formDisplay` | `String` | `'grid'` | Tipo de layout (`'grid'`, `'flex'`) |
| `onChange` | `Function` | `() => {}` | Callback ejecutado cuando cambia cualquier campo |
| `isLoading` | `Boolean` | `false` | Estado de carga para el botón de envío |
| `enhancedFields` | `Array\|Set` | `[]` | IDs de campos que deben usar componente mejorado |
| `EnhancedFieldComponent` | `Component` | `null` | Componente personalizado para campos mejorados |
| `externalErrors` | `Object` | `{}` | Errores de validación externos por campo |

## Tipos de Campos Soportados

El componente `FormBuilder` soporta los siguientes tipos de campos:

| Tipo | Componente | Descripción |
|------|------------|-------------|
| `text` | `InputTextField` | Campo de texto simple |
| `textarea` | `InputTextAreaField` | Área de texto multilinea |
| `dropdown` | `InputSelectField` | Selector desplegable (single/multiple) |
| `radio` | `InputRadioGroup` | Grupo de botones de radio |
| `datetime` | `InputDateField` | Selector de fecha y hora |
| `date` | `InputDateField` | Selector de fecha |
| `signature` | `InputSignatureField` | Campo de firma digital |
| `autocomplete` | `InputAutoComplete` | Campo con autocompletado |
| `file` | `FilePickerComponent` | Selector de archivos |
| `switch` | `InputSwitch` | Interruptor toggle |
| `checkbox` | `InputCheckbox` | Casilla de verificación |
| `progress` | `InputProgressSlider` | Slider de progreso |

## Estructura de un Campo

Cada campo en el array `inputFields` es un objeto con las siguientes propiedades:

### Propiedades Básicas

| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | `String` | ✅ | Identificador único del campo |
| `label` | `String` | ❌ | Etiqueta del campo |
| `type` | `String` | ✅ | Tipo de campo (ver tabla de tipos) |
| `required` | `Boolean` | ❌ | Indica si el campo es obligatorio |
| `defaultValue` | `Any` | ❌ | Valor por defecto del campo |
| `disabled` | `Boolean` | ❌ | Deshabilita el campo |
| `placeholder` | `String` | ❌ | Texto de placeholder |
| `gridSize` | `Number` | ❌ | Tamaño en grid (1-12, default: 12) |
| `error` | `String` | ❌ | Mensaje de error específico del campo |

### Propiedades Específicas por Tipo

#### `text` (InputTextField)
- `autoComplete`: String (default: 'off')
- `inputProps`: Object (propiedades adicionales del input)

#### `dropdown` (InputSelectField)
- `options`: Array de objetos con `{ value, label }`
- `multiple`: Boolean (default: false)
- `isDisabled`: Boolean (auto: true si no hay options)
- `dependent`: String (ID del campo dependiente)

#### `date` / `datetime` (InputDateField)
- `formatValue`: String o Function (formato de salida: 'YYYY-MM-DD')
- `datePickerProps`: Object (props adicionales para DatePicker)

#### `autocomplete` (InputAutoComplete)
- `options`: Array de opciones
- `getOptionLabel`: Function (función para obtener label)
- `isOptionEqualToValue`: Function (función de comparación)

#### `file` (FilePickerComponent)
- `accept`: String (tipos de archivo aceptados)
- `multiple`: Boolean (default: false)

#### `switch` / `checkbox`
- Estos campos se renderizan con `FormControlLabel`
- El valor se convierte a Boolean automáticamente

## Modos de Operación

### Modo No Controlado (default)

En este modo, `FormBuilder` maneja el estado internamente:

```javascript
<FormBuilder
  inputFields={formData}
  initialValues={initialData}
  successCallback={(values, resetForm) => {
    console.log('Form values:', values);
    // resetForm() está disponible para resetear el formulario
  }}
  onChange={(formValues) => {
    console.log('Form changed:', formValues);
  }}
/>
```

### Modo Controlado

En este modo, el componente padre maneja el estado:

```javascript
const [formValues, setFormValues] = useState({});

<FormBuilder
  inputFields={formData}
  controlled={true}
  initialValues={formValues}
  onChange={(id, value) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  }}
  successCallback={(values, resetForm) => {
    console.log('Form values:', values);
  }}
/>
```

## Validación

### Validación de Campos Requeridos

El componente valida automáticamente los campos marcados como `required: true`:

```javascript
const formData = [
  {
    id: 'name',
    label: 'Nombre',
    type: 'text',
    required: true  // Este campo será validado
  }
];
```

### Errores Externos

Puedes pasar errores de validación externos mediante el prop `externalErrors`:

```javascript
<FormBuilder
  inputFields={formData}
  externalErrors={{
    email: 'El correo ya está registrado',
    phone: 'Formato inválido'
  }}
/>
```

### Errores por Campo

También puedes especificar errores directamente en la definición del campo:

```javascript
{
  id: 'email',
  label: 'Email',
  type: 'text',
  error: 'Este campo tiene un error específico'
}
```

## Campos Mejorados (Enhanced Fields)

El componente permite usar componentes personalizados para campos específicos:

```javascript
const CustomInput = ({ label, value, onChange, error, ...props }) => (
  <CustomTextField
    label={label}
    value={value}
    onChange={onChange}
    error={error}
    {...props}
  />
);

<FormBuilder
  inputFields={formData}
  enhancedFields={['customField1', 'customField2']}
  EnhancedFieldComponent={CustomInput}
/>
```

## Layout y Display

### Grid Layout (default)

```javascript
<FormBuilder
  formDisplay="grid"
  inputFields={[
    { id: 'field1', type: 'text', gridSize: 6 },  // 50% del ancho
    { id: 'field2', type: 'text', gridSize: 6 },  // 50% del ancho
    { id: 'field3', type: 'text', gridSize: 12 }, // 100% del ancho
  ]}
/>
```

### Flex Layout

```javascript
<FormBuilder
  formDisplay="flex"
  inputFields={formData}
/>
```

## Ejemplos de Uso

### Ejemplo Básico

```javascript
import FormBuilder from './components/FormBuilder';

const basicForm = [
  {
    id: 'firstName',
    label: 'Nombre',
    type: 'text',
    required: true,
    gridSize: 6
  },
  {
    id: 'lastName',
    label: 'Apellido',
    type: 'text',
    required: true,
    gridSize: 6
  },
  {
    id: 'email',
    label: 'Correo Electrónico',
    type: 'text',
    required: true,
    gridSize: 12
  }
];

function MyComponent() {
  const handleSubmit = (values, resetForm) => {
    console.log('Form submitted:', values);
    // Procesar datos...
    resetForm();
  };

  return (
    <FormBuilder
      inputFields={basicForm}
      successCallback={handleSubmit}
    />
  );
}
```

### Ejemplo con Dropdown

```javascript
const departmentOptions = [
  { value: 'it', label: 'Tecnología' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'finance', label: 'Finanzas' }
];

const formWithDropdown = [
  {
    id: 'department',
    label: 'Departamento',
    type: 'dropdown',
    options: departmentOptions,
    required: true
  }
];
```

### Ejemplo con Dropdown Múltiple

```javascript
const skillsForm = [
  {
    id: 'skills',
    label: 'Habilidades',
    type: 'dropdown',
    options: skillOptions,
    multiple: true,
    required: true
  }
];
```

### Ejemplo con Fecha

```javascript
const formWithDate = [
  {
    id: 'birthDate',
    label: 'Fecha de Nacimiento',
    type: 'date',
    formatValue: 'YYYY-MM-DD',
    required: true
  }
];
```

### Ejemplo con Switch y Checkbox

```javascript
const formWithToggles = [
  {
    id: 'notifications',
    label: 'Recibir notificaciones',
    type: 'switch',
    defaultValue: false
  },
  {
    id: 'terms',
    label: 'Acepto los términos y condiciones',
    type: 'checkbox',
    required: true
  }
];
```

### Ejemplo Controlado

```javascript
import { useState } from 'react';
import FormBuilder from './components/FormBuilder';

function ControlledFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  const handleChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (values, resetForm) => {
    console.log('Submitting:', values);
    // Enviar a API...
  };

  const formFields = [
    {
      id: 'name',
      label: 'Nombre',
      type: 'text',
      required: true
    },
    {
      id: 'email',
      label: 'Email',
      type: 'text',
      required: true
    },
    {
      id: 'age',
      label: 'Edad',
      type: 'text'
    }
  ];

  return (
    <FormBuilder
      inputFields={formFields}
      controlled={true}
      initialValues={formData}
      onChange={handleChange}
      successCallback={handleSubmit}
      showActionButton={false}  // Botones personalizados externos
    />
  );
}
```

### Ejemplo con Campos Dependientes

```javascript
const [phaseOptions, setPhaseOptions] = useState([]);
const [subPhaseOptions, setSubPhaseOptions] = useState([]);

const formWithDependencies = [
  {
    id: 'phase',
    label: 'Fase',
    type: 'dropdown',
    options: phaseOptions,
    dependent: 'subphase'
  },
  {
    id: 'subphase',
    label: 'Subfase',
    type: 'dropdown',
    options: subPhaseOptions
  }
];

// Manejar cambios en el campo padre
const handleChange = (id, value) => {
  if (id === 'phase') {
    // Cargar opciones dependientes
    fetchSubPhases(value).then(setSubPhaseOptions);
  }
  setFormData(prev => ({ ...prev, [id]: value }));
};
```

### Ejemplo con FormDrawer

El componente `FormDrawer` es un wrapper que combina `FormBuilder` con un Drawer de Material-UI:

```javascript
import FormDrawer from './components/FormDrawer';

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values, callback) => {
    console.log('Submitting:', values);
    // Procesar datos...
    callback();  // Cierra el drawer y muestra mensaje de éxito
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Abrir Formulario
      </Button>
      
      <FormDrawer
        open={open}
        handleClose={() => setOpen(false)}
        submitForm={handleSubmit}
        title="Editar Usuario"
        inputFields={formFields}
        initialValues={userData}
      />
    </>
  );
}
```

## Callbacks

### successCallback

```javascript
successCallback: (formValues, resetForm) => {
  // formValues: Object con todos los valores del formulario
  // resetForm: Function para resetear el formulario
  console.log('Form values:', formValues);
  
  // Lógica de envío...
  api.submit(formValues).then(() => {
    resetForm();  // Opcional: resetear después del éxito
  });
}
```

### cancelCallback

```javascript
cancelCallback: () => {
  // Ejecutado al hacer clic en Cancelar
  console.log('Form cancelled');
  // Cerrar drawer, navegar atrás, etc.
}
```

### onChange

```javascript
// Modo no controlado
onChange: (formValues) => {
  console.log('Form changed:', formValues);
  // formValues contiene todos los valores actuales
}

// Modo controlado
onChange: (fieldId, fieldValue) => {
  console.log(`${fieldId} changed to:`, fieldValue);
  // Actualizar estado del campo específico
}
```

## Manejo de Errores

### Jerarquía de Errores

Los errores se muestran en el siguiente orden de prioridad:

1. `externalErrors[fieldId]` - Errores externos (máxima prioridad)
2. `field.error` - Error específico del campo
3. `errors[fieldId]` - Errores internos de validación

### Ejemplo de Manejo de Errores

```javascript
const [externalErrors, setExternalErrors] = useState({});

const handleSubmit = async (values, resetForm) => {
  try {
    const response = await api.submit(values);
    if (response.errors) {
      setExternalErrors(response.errors);
    } else {
      resetForm();
    }
  } catch (error) {
    setExternalErrors({
      email: 'El correo ya existe',
      phone: 'Formato inválido'
    });
  }
};

<FormBuilder
  inputFields={formFields}
  externalErrors={externalErrors}
  successCallback={handleSubmit}
/>
```

## Consideraciones de Rendimiento

- **Lazy Loading:** Todos los componentes de input se cargan bajo demanda
- **React.memo:** Considera envolver componentes personalizados en React.memo
- **Set para Enhanced Fields:** Usa Set para búsqueda rápida de campos mejorados
- **Suspense:** Cada campo está envuelto en Suspense para loading states

## Internacionalización

El componente usa `react-i18next` para textos:

```javascript
const { t } = useTranslation();

// Textos traducibles:
- t('field_is_required') - Mensaje de campo requerido
- t('loading') - Estado de carga
- t('Cancel') - Botón cancelar
- t('Save') - Botón guardar
```

## Valores por Defecto por Tipo

| Tipo | Valor por Defecto |
|------|-------------------|
| `text` | `''` |
| `textarea` | `''` |
| `dropdown` | `''` |
| `radio` | `''` |
| `datetime` | `null` |
| `date` | `null` |
| `signature` | `null` |
| `autocomplete` | `null` |
| `file` | `null` |
| `switch` | `false` |
| `checkbox` | `false` |
| `progress` | `0` |

## Reset del Formulario

La función `resetFormFields` está disponible internamente y:

- Resetea todos los valores a sus defaults
- Limpia todos los errores
- Solo funciona en modo no controlado

## Ejemplo Completo

```javascript
import React, { useState } from 'react';
import FormBuilder from './components/FormBuilder';

function CompleteExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    startDate: null,
    acceptTerms: false
  });

  const [externalErrors, setExternalErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const departments = [
    { value: 'engineering', label: 'Ingeniería' },
    { value: 'design', label: 'Diseño' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const formFields = [
    {
      id: 'name',
      label: 'Nombre Completo',
      type: 'text',
      required: true,
      gridSize: 12
    },
    {
      id: 'email',
      label: 'Correo Electrónico',
      type: 'text',
      required: true,
      gridSize: 12
    },
    {
      id: 'department',
      label: 'Departamento',
      type: 'dropdown',
      options: departments,
      required: true,
      gridSize: 6
    },
    {
      id: 'startDate',
      label: 'Fecha de Inicio',
      type: 'date',
      formatValue: 'YYYY-MM-DD',
      required: true,
      gridSize: 6
    },
    {
      id: 'acceptTerms',
      label: 'Acepto los términos y condiciones',
      type: 'checkbox',
      required: true,
      gridSize: 12
    }
  ];

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Limpiar error del campo cuando el usuario cambia el valor
    if (externalErrors[id]) {
      setExternalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (values, resetForm) => {
    setIsLoading(true);
    try {
      const response = await api.createEmployee(values);
      if (response.success) {
        showSuccessMsg('Empleado creado exitosamente');
        resetForm();
      } else {
        setExternalErrors(response.errors);
      }
    } catch (error) {
      showErrorMsg('Error al crear empleado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      startDate: null,
      acceptTerms: false
    });
    setExternalErrors({});
  };

  return (
    <FormBuilder
      inputFields={formFields}
      controlled={true}
      initialValues={formData}
      onChange={handleChange}
      successCallback={handleSubmit}
      cancelCallback={handleCancel}
      externalErrors={externalErrors}
      isLoading={isLoading}
      formFieldSize="medium"
    />
  );
}
```

## Best Practices

1. **Usar IDs únicos:** Cada campo debe tener un `id` único
2. **Validación en backend:** No confíes solo en la validación del cliente
3. **Modo controlado para formularios complejos:** Usa modo controlado cuando necesites más control sobre el estado
4. **Lazy loading de opciones:** Carga opciones de dropdowns dinámicamente cuando sea posible
5. **Manejo de errores:** Proporciona mensajes de error claros y específicos
6. **Accesibilidad:** Usa labels descriptivos y placeholders apropiados
7. **Performance:** Para formularios muy grandes, considera dividirlos en secciones

## Troubleshooting

### Problema: Los campos no se actualizan en modo controlado

**Solución:** Asegúrate de que `initialValues` se actualiza cuando cambia el estado:

```javascript
<FormBuilder
  controlled={true}
  initialValues={formData}  // Debe ser el estado actual
  onChange={handleChange}
/>
```

### Problema: La validación no funciona

**Solución:** Verifica que `required: true` esté configurado y que el valor no sea vacío:

```javascript
{
  id: 'field',
  type: 'text',
  required: true  // Campo requerido
}
```

### Problema: Los dropdowns no muestran opciones

**Solución:** Asegúrate de que el array `options` tenga el formato correcto:

```javascript
options: [
  { value: 'val1', label: 'Opción 1' },
  { value: 'val2', label: 'Opción 2' }
]
```

## Referencias

- **Material-UI:** https://mui.com/
- **React Hook Form:** https://react-hook-form.com/ (usado en algunos componentes)
- **Day.js:** https://day.js.org/ (usado para fechas)
- **react-i18next:** https://react.i18next.com/ (internacionalización)
