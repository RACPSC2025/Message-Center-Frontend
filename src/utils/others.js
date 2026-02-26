import { toast } from 'react-toastify';

export async function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function getHumanReadableFileSize(fileSizeInBytes) {
  /**
   * 1 Byte
   * 1 KB = 1024 Bytes (10 ^ 3 Bytes)
   * 1 MB = 1024 KB (10 ^ 6 Bytes)
   * 1 GB = 1024 MB (10 ^ 9 Bytes)
   */

  const fileSizeUnits = ['Bytes', 'Kb', 'Mb', 'Gb'];
  const e = Math.pow(10, 3);
  const f = parseInt(Math.log10(fileSizeInBytes) / Math.log10(e));
  const fileSize = (fileSizeInBytes / Math.pow(e, f)).toFixed(2);
  return `${fileSize} ${fileSizeUnits[f]}`;
}

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export const getInitials = (name) => {
  const [firstName, lastName] = name.split(' ');
  const fullNameInitials = [firstName, lastName]
    .filter((name) => name)
    .map((name) => name[0])
    .join('');
  return fullNameInitials;
};

export function stringAvatar(name, customStyle = {}) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      ...customStyle
    },
    children: getInitials(name)
  };
}

export function isBase64ImageData(str) {
  const imageDataRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+\/]+=*$/;
  return imageDataRegex.test(str);
}

export function not(fn) {
  return function (...args) {
    return !fn(...args);
  };
}

export function convertString(inputString, joinCharacter = '_') {
  return inputString.toLowerCase().split(' ').join(joinCharacter);
}

export function convertObjectToArray(obj, nestedProperty = null) {
  const finalObj = nestedProperty ? obj[nestedProperty] : obj;
  return Object.keys(finalObj).map((objKey) => finalObj[objKey]);
}

export const isValidArray = (data) => {
  return data && Array.isArray(data) && data.length > 0;
};

export const isValidObject = (data) => {
  return typeof data === 'object' && data !== null && Object.keys(data).length !== 0;
};

export const showSuccessMsg = (msg = '') => {
  toast.success(msg);
};

export const showErrorMsg = (msg = 'Something went wrong.') => {
  toast.error(msg);
};

export const handleServerValidation = (data) => {
  if (data?.payload?.code === 422) {
    showErrorMsg(data?.payload?.message ?? data?.payload?.exception?.message ?? 'Invalid data!');
  } else if (data?.payload?.code === 400) {
    showErrorMsg(data?.payload?.message ?? 'Bad request!');
  } else if (data?.payload?.code === 404) {
    showErrorMsg(data?.payload?.dataObj?.message ?? 'Service not found!');
  } else if (data?.payload?.code === 503) {
    showErrorMsg(data?.payload?.dataObj?.error ?? 'Service is not available!');
  } else if (data?.payload?.code === 500 || data?.code === 500) {
    showErrorMsg(data?.payload?.exception ?? data?.exception ?? 'Server error!');
  } else {
    showErrorMsg(data?.payload?.message ?? 'Something went wrong!');
  }
};

export const setLocalStorageData = (key, data) => {
  const finalData = isValidArray(data) || isValidObject(data) ? JSON.stringify(data) : '';
  return localStorage.setItem(key, finalData);
};

export const getLocalStorageData = (key) => {
  const data = localStorage.getItem(key) ?? '';
  const finalData = !!data ? JSON.parse(data) : '';
  return finalData;
};

export const removeLocalStorageData = (key) => {
  return localStorage.removeItem(key);
};

export const normalizeStatusCode = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (!status || status === '-1' || status === '0' || status === 'all') return null;

  if (status === '4' || status === 'vencido' || status === 'expired' || status === 'delayed') return '4';
  if (status === '3' || status === 'abierto' || status === 'open' || status === 'pending') return '3';
  if (
    status === '2'
    || status === 'permanent'
    || status === 'en progreso'
    || status === 'in progress'
    || status === 'in_progress'
    || status === 'under_progress'
  ) return '2';

  if (status === '1' || status === 'completado' || status === 'completed' || status === 'closed') return '1';

  return null;
};

/**
 * Extrae texto plano de un árbol Lexical Editor (estructura JSON con nodos).
 * Recorre recursivamente todos los nodos y concatena el texto de los nodos "text".
 */
const extractTextFromLexicalNode = (node) => {
  if (!node || typeof node !== 'object') return '';

  // Nodo de texto directo
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }

  // Nodo con hijos (paragraph, root, etc.)
  if (Array.isArray(node.children)) {
    return node.children
      .map(extractTextFromLexicalNode)
      .filter(Boolean)
      .join(' ');
  }

  // Nodo raíz de Lexical { root: { children: [...] } }
  if (node.root) {
    return extractTextFromLexicalNode(node.root);
  }

  return '';
};

/**
 * Limpia texto que puede contener HTML, entidades HTML codificadas,
 * objetos Lexical Editor o JSON de Lexical Editor.
 * Maneja casos como:
 *   "<p>Texto</p>"
 *   "&lt;p&gt;Texto&lt;/p&gt;"
 *   "&lt;p&gt;Otorgar autorizaci&oacute;n&lt;/p&gt;"
 *   "&lt;p&gt;Notificar el&nbsp; acto&lt;/p&gt;"
 *   { root: { children: [...] } }  (objeto Lexical)
 *   '{"root":{"children":[...]}}' (JSON string de Lexical)
 */
export const stripHtmlTags = (text) => {
  if (!text) return '';

  // A. Si es un objeto (e.g. Lexical editor state pasado directamente)
  if (typeof text === 'object') {
    const extracted = extractTextFromLexicalNode(text);
    return extracted.replace(/\s+/g, ' ').trim() || '';
  }

  if (typeof text !== 'string') return '';

  // B. Detectar string "[object Object]" (objeto serializado erróneamente)
  const trimmed = text.trim();
  if (trimmed === '[object Object]') return '';

  // C. Intentar parsear como JSON (Lexical Editor u otra estructura con texto)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      // Lexical Editor: { root: { children: [...] } }
      if (parsed?.root) {
        const extracted = extractTextFromLexicalNode(parsed);
        const result = extracted.replace(/\s+/g, ' ').trim();
        if (result) return result;
        return ''; // JSON Lexical válido pero sin texto visible
      }
      // Otro JSON no reconocido → devolver vacío en lugar del JSON crudo
      return '';
    } catch {
      // No es JSON válido, continuar con limpieza HTML
    }
  }

  // C. Decodificar entidades HTML (e.g. &lt; -> <, &oacute; -> ó, &nbsp; -> ' ')
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  let decoded = textarea.value;

  // D. Si tras decodificar aún quedan entidades (doble encoding), decodificar de nuevo
  if (/&[a-zA-Z]+;|&#\d+;/.test(decoded)) {
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }

  // E. Eliminar etiquetas HTML
  const div = document.createElement('div');
  div.innerHTML = decoded;
  const plainText = div.textContent || div.innerText || '';

  // F. Colapsar espacios múltiples y limpiar
  return plainText.replace(/\s+/g, ' ').trim();
};