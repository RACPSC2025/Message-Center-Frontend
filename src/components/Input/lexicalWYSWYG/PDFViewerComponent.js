import React, { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { highlightPlugin, Trigger } from '@react-pdf-viewer/highlight';
import { searchPlugin } from '@react-pdf-viewer/search';
import * as pdfjsLib from 'pdfjs-dist';

// Importar estilos
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Tooltip,
  Badge,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';

import {
  NoteAddRounded,
  DeleteRounded,
  EditRounded,
  SaveRounded,
  CloseRounded,
  CommentRounded,
  VisibilityRounded,
  HighlightRounded,
  FormatUnderlinedRounded,
  CropSquareRounded,
  CheckBoxOutlineBlankRounded,
  ColorLensRounded,
  WarningRounded,
  AutoAwesome,
  ArrowBackRounded,
  ArrowForwardRounded,
  AddPhotoAlternateRounded,
  ArticleRounded
} from '@mui/icons-material';

import { useDispatch, useSelector } from 'react-redux';
import { selectFilterItemValue, setFilter } from '../../../stores/filterSlice';
import { showErrorMsg, showSuccessMsg } from '../../../utils/others';
import { getToken } from '../../../lib/iaApi';

// Tipos de marcadores
const MARKER_TYPES = {
  HIGHLIGHT: 'highlight',
  UNDERLINE: 'underline',
  BOX: 'box',
  POINT: 'point',
  AREA: 'area',
  IMAGE_ANALYSIS: 'image_analysis',
  PDF_ANALYSIS: 'pdf_analysis'
};

// Colores disponibles
const MARKER_COLORS = {
  YELLOW: { name: 'Amarillo', value: '#ffeb3b', dark: '#fbc02d' },
  GREEN: { name: 'Verde', value: '#4caf50', dark: '#388e3c' },
  BLUE: { name: 'Azul', value: '#2196f3', dark: '#1976d2' },
  RED: { name: 'Rojo', value: '#f44336', dark: '#d32f2f' },
  ORANGE: { name: 'Naranja', value: '#ff9800', dark: '#f57c00' },
  PURPLE: { name: 'Morado', value: '#9c27b0', dark: '#7b1fa2' }
};

const PDFViewerComponent = ({ pdfUrl, fileName = 'Documento', requisito_id, onImageAnalysis, onPdfAnalysis, toolbarVisible = false }) => {
  const dispatch = useDispatch();
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para anotaciones
  const storedNotes = useSelector((state) => 
    selectFilterItemValue(state, 'LegalMatriz', `pdf-notes-${requisito_id}`)
  );
  
  // Estados para análisis de imagen
  const [isCapturingImage, setIsCapturingImage] = useState(false);
  const [captureArea, setCaptureArea] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const viewerContainerRef = useRef(null);
  const pdfDocumentRef = useRef(null);
  const lastSavedNotesRef = useRef(null);
  
  // Estados para análisis de PDF completo
  const [analyzingPDF, setAnalyzingPDF] = useState(false);
  const [pdfAnalysisProgress, setPdfAnalysisProgress] = useState(0);
  const [pdfAnalysisStatus, setPdfAnalysisStatus] = useState('');
  const [pdfAnalysisResults, setPdfAnalysisResults] = useState([]);
  
  // Estados para preview de imagen (soporte multi-página)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [capturedImagesArray, setCapturedImagesArray] = useState([]); // Array de imágenes capturadas
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0); // Índice del carrusel
  const [noteImageTitle, setNoteImageTitle] = useState('');
  const [noteImageDescription, setNoteImageDescription] = useState('');
  
  const [notes, setNotes] = useState([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [notesListOpen, setNotesListOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  // Estados para confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  
  // Estados para marcadores
  const [markerMode, setMarkerMode] = useState(null);
  const [markerType, setMarkerType] = useState(MARKER_TYPES.HIGHLIGHT);
  const [markerColor, setMarkerColor] = useState(MARKER_COLORS.YELLOW);
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  
  // Estados para selección de área rectangular
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawEnd, setDrawEnd] = useState(null);
  const [drawingPageIndex, setDrawingPageIndex] = useState(null);
  
  // Estado para texto seleccionado del PDF
  const [pdfSelectedText, setPdfSelectedText] = useState('');
  const [pdfSelectionCoords, setPdfSelectionCoords] = useState(null);
  const [pdfSelectionRange, setPdfSelectionRange] = useState(null); // Range completo para highlight
  
  // Cargar notas desde Redux o localStorage al montar
  useEffect(() => {
    if (storedNotes) {
      // Solo actualizar si las notas son diferentes (evitar loop infinito)
      const areEqual = JSON.stringify(notes) === JSON.stringify(storedNotes);
      if (!areEqual) {
        setNotes(storedNotes);
      }
    } else {
      const storageKey = `pdf-notes-${requisito_id || 'default'}`;
      const savedNotes = localStorage.getItem(storageKey);
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          const areEqual = JSON.stringify(notes) === JSON.stringify(parsedNotes);
          if (!areEqual) {
            setNotes(parsedNotes);
            dispatch(setFilter({
              module: 'LegalMatriz',
              updatedFilter: { [`pdf-notes-${requisito_id}`]: parsedNotes }
            }));
          }
        } catch (e) {
          console.error('Error al cargar notas:', e);
        }
      }
    }
  }, [requisito_id, storedNotes, dispatch]);

  // Guardar notas en Redux y localStorage cuando cambien
  useEffect(() => {
    // Evitar loop infinito: solo actualizar si realmente cambió
    const notesJson = JSON.stringify(notes);
    if (lastSavedNotesRef.current === notesJson) {
      return; // Ya está guardado, no hacer nada
    }
    
    lastSavedNotesRef.current = notesJson;
    const storageKey = `pdf-notes-${requisito_id || 'default'}`;
    
    if (notes.length > 0) {
      localStorage.setItem(storageKey, notesJson);
      
      dispatch(setFilter({
        module: 'LegalMatriz',
        updatedFilter: { [`pdf-notes-${requisito_id}`]: notes }
      }));
    } else {
      // Eliminar del localStorage si no hay notas
      localStorage.removeItem(storageKey);
      dispatch(setFilter({
        module: 'LegalMatriz',
        updatedFilter: { [`pdf-notes-${requisito_id}`]: [] }
      }));
    }
  }, [notes, requisito_id, dispatch]);

  // Limpiar notas cuando cambia el PDF
  useEffect(() => {
    if (pdfUrl) {
      setNotes([]);
      const storageKey = `pdf-notes-${requisito_id || 'default'}`;
      localStorage.removeItem(storageKey);
    }
  }, [pdfUrl, requisito_id]);

  // Desactivar modo al presionar Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMarkerMode(null);
        setIsDrawingArea(false);
        setDrawStart(null);
        setDrawEnd(null);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Detectar selección de texto en el PDF
  useEffect(() => {
    const handleTextSelection = (event) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selectedText && selectedText.length > 0 && selection.rangeCount > 0) {
        setPdfSelectedText(selectedText);
        
        // Guardar el Range completo para poder crear highlights después
        const range = selection.getRangeAt(0);
        setPdfSelectionRange(range.cloneRange());
        
        // Capturar coordenadas de inicio de la selección para la nota de punto
        const rect = range.getBoundingClientRect();
        
        // Buscar el contenedor de página más cercano
        let pageElement = range.startContainer;
        while (pageElement && !pageElement.classList?.contains('rpv-core__page-layer')) {
          pageElement = pageElement.parentElement;
        }
        
        if (pageElement) {
          const pageRect = pageElement.getBoundingClientRect();
          const pageIndex = Array.from(document.querySelectorAll('.rpv-core__page-layer')).indexOf(pageElement);
          
          // Calcular posición relativa dentro de la página (en porcentaje)
          const left = ((rect.left - pageRect.left) / pageRect.width) * 100;
          const top = ((rect.top - pageRect.top) / pageRect.height) * 100;
          const width = (rect.width / pageRect.width) * 100;
          const height = (rect.height / pageRect.height) * 100;
          
          setPdfSelectionCoords({
            pageIndex: pageIndex >= 0 ? pageIndex : 0,
            left: Math.max(0, Math.min(100, left)),
            top: Math.max(0, Math.min(100, top)),
            width: Math.max(0, Math.min(100, width)),
            height: Math.max(0, Math.min(100, height))
          });
        }
      } else {
        setPdfSelectedText('');
        setPdfSelectionCoords(null);
        setPdfSelectionRange(null);
      }
    };
    
    // Escuchar eventos de selección
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
    };
  }, []);

  // Función para generar el siguiente título de nota
  const getNextNoteTitle = () => {
    const noteNumbers = notes
      .map(note => {
        const match = note.title?.match(/^Nota (\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const maxNumber = noteNumbers.length > 0 ? Math.max(...noteNumbers) : 0;
    return `Nota ${maxNumber + 1}`;
  };

  // Renderizar marcador según tipo
  const renderMarker = (note, currentPageIndex) => {
    if (!note.highlightAreas || note.highlightAreas.length === 0) return null;

    const color = note.color || MARKER_COLORS.YELLOW.value;
    const type = note.markerType || MARKER_TYPES.HIGHLIGHT;
    
    // Filtrar solo las áreas que pertenecen a la página actual
    const pageAreas = note.highlightAreas.filter(area => area.pageIndex === currentPageIndex);
    
    if (pageAreas.length === 0) return null;
    
    return pageAreas.map((area, idx) => {
      const baseStyle = {
        position: 'absolute',
        left: `${area.left}%`,
        top: `${area.top}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
        cursor: 'pointer',
        pointerEvents: 'auto',
        zIndex: type === MARKER_TYPES.POINT ? 2 : 1,
      };

      switch (type) {
        case MARKER_TYPES.HIGHLIGHT:
          return (
            <div
              key={`${note.id}-${idx}`}
              style={{
                ...baseStyle,
                backgroundColor: color,
                opacity: 0.4,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewNote(note);
              }}
            />
          );

        case MARKER_TYPES.UNDERLINE:
          return (
            <div
              key={`${note.id}-${idx}`}
              style={{
                ...baseStyle,
                height: '2px',
                top: `${area.top + area.height}%`,
                backgroundColor: color,
                opacity: 0.8,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewNote(note);
              }}
            />
          );

        case MARKER_TYPES.BOX:
          return (
            <div
              key={`${note.id}-${idx}`}
              style={{
                ...baseStyle,
                border: `2px solid ${color}`,
                backgroundColor: 'transparent',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewNote(note);
              }}
            />
          );

        case MARKER_TYPES.AREA:
          return (
            <div
              key={`${note.id}-${idx}`}
              style={{
                ...baseStyle,
                backgroundColor: color,
                opacity: 0.2,
                border: `2px dashed ${color}`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewNote(note);
              }}
            />
          );

        case MARKER_TYPES.POINT:
          return (
            <div
              key={`${note.id}-${idx}`}
              style={{
                ...baseStyle,
                width: '24px',
                height: '24px',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewNote(note);
              }}
            >
              <CommentRounded 
                style={{ 
                  fontSize: 24, 
                  color: color,
                  filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' 
                }} 
              />
            </div>
          );

        case MARKER_TYPES.IMAGE_ANALYSIS:
          return (
            <div
              key={`${note.id}-${idx}`}
              style={{
                ...baseStyle,
                backgroundColor: color,
                opacity: 0.2,
                border: `2px solid ${color}`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewNote(note);
              }}
            />
          );

        default:
          return null;
      }
    });
  };

  // Manejar inicio de dibujo de área
  const handleMouseDown = (e, pageIndex) => {
    if (markerMode !== 'area' && markerMode !== 'image_analysis') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawingArea(true);
    setDrawStart({ x, y });
    setDrawEnd({ x, y });
    setDrawingPageIndex(pageIndex);
  };

  // Manejar movimiento durante dibujo
  const handleMouseMove = (e) => {
    if (!isDrawingArea || !drawStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDrawEnd({ x, y });
  };

  // Extraer texto de un área específica del PDF
  const extractTextFromArea = async (pageIndex, left, top, width, height) => {
    try {
      if (!pdfDocumentRef.current) {
        console.warn('Documento PDF no disponible para extraer texto');
        return '';
      }

      const page = await pdfDocumentRef.current.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();

      // Convertir porcentajes a coordenadas del viewport
      const areaLeft = (left / 100) * viewport.width;
      const areaTop = (top / 100) * viewport.height;
      const areaRight = areaLeft + (width / 100) * viewport.width;
      const areaBottom = areaTop + (height / 100) * viewport.height;

      let extractedText = '';

      // Iterar sobre los items de texto y filtrar los que están dentro del área
      textContent.items.forEach((item) => {
        const tx = item.transform;
        const itemLeft = tx[4];
        const itemTop = viewport.height - tx[5]; // Invertir Y porque PDF usa origen inferior izquierdo
        const itemWidth = item.width;
        const itemHeight = item.height;

        // Verificar si el texto está dentro del área seleccionada
        // Usamos una verificación de intersección de rectángulos
        const itemRight = itemLeft + itemWidth;
        const itemBottom = itemTop + itemHeight;

        const intersects = (
          itemLeft < areaRight &&
          itemRight > areaLeft &&
          itemTop < areaBottom &&
          itemBottom > areaTop
        );

        if (intersects) {
          extractedText += item.str + ' ';
        }
      });

      return extractedText.trim();
    } catch (error) {
      console.error('Error al extraer texto del área:', error);
      return '';
    }
  };

  // Manejar fin de dibujo
  const handleMouseUp = async () => {
    if (!isDrawingArea || !drawStart || !drawEnd) return;
    
    const left = Math.min(drawStart.x, drawEnd.x);
    const top = Math.min(drawStart.y, drawEnd.y);
    const width = Math.abs(drawEnd.x - drawStart.x);
    const height = Math.abs(drawEnd.y - drawStart.y);
    
    if (width > 1 && height > 1) {
      // Si estamos en modo de análisis de imagen, capturar y analizar
      if (markerMode === 'image_analysis') {
        handleCaptureAndAnalyzeArea(drawingPageIndex, left, top, width, height);
      } else {
        // Modo normal de anotación (área) - extraer texto del área
        const areaData = [{
          pageIndex: drawingPageIndex,
          left,
          top,
          width,
          height
        }];
        
        // Extraer texto del área seleccionada
        const textInArea = await extractTextFromArea(drawingPageIndex, left, top, width, height);
        
        setSelectedArea(areaData);
        setSelectedText(textInArea || ''); // Asignar el texto extraído
        setNoteTitle(getNextNoteTitle());
        setNoteDialogOpen(true);
      }
    }
    
    setIsDrawingArea(false);
    setDrawStart(null);
    setDrawEnd(null);
  };

  // Función para analizar el PDF completo
  const handleAnalyzePDF = async () => {
    if (!pdfUrl) {
      showErrorMsg('No hay un PDF cargado para analizar');
      return;
    }

    if (!onPdfAnalysis) {
      showErrorMsg('No hay callback configurado para análisis de PDF');
      return;
    }

    setAnalyzingPDF(true);
    setPdfAnalysisProgress(0);
    setPdfAnalysisStatus('Iniciando análisis del PDF...');
    setPdfAnalysisResults([]);

    onPdfAnalysis({ status: 'start', message: 'Iniciando análisis del PDF...' });

    try {
      const token = await getToken();
      if (!token) throw new Error('No autenticado — token no encontrado');

      // Obtener el archivo PDF desde la URL cargada
      const pdfResponse = await fetch(pdfUrl);
      const blob = await pdfResponse.blob();
      const file = new File([blob], fileName || 'documento.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);

      const iaBaseUrl = (window.__APP_CONFIG__?.api_url_ia || 'http://localhost:8000/').replace(/\/$/, '');
      const analysisResponse = await fetch(`${iaBaseUrl}/analyze/pdf/stream`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (analysisResponse.status === 401) throw new Error('Sesión expirada — vuelve a iniciar sesión');
      if (!analysisResponse.ok) throw new Error(`Error del servidor: ${analysisResponse.status}`);

      const reader = analysisResponse.body.getReader();
      const decoder = new TextDecoder();
      let detectedArticles = [];
      let totalSections = 0;
      let sseBuffer = '';

      const processChunk = (chunk) => {
        sseBuffer += chunk;
        const lines = sseBuffer.split('\n\n');
        sseBuffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.replace('data: ', '').trim());

            if (data.event === 'start') {
              totalSections = data.total_sections || 0;
              const message = `Iniciando análisis de ${totalSections} secciones...`;
              setPdfAnalysisStatus(message);
              onPdfAnalysis({ status: 'processing', message, totalSections });

            } else if (data.event === 'obligation_detected') {
              const article = data.analysis;
              if (article) {
                detectedArticles.push(article);
                setPdfAnalysisResults(prev => [...prev, article]);

                // Progreso basado en secciones procesadas
                if (totalSections > 0) {
                  setPdfAnalysisProgress(Math.round((detectedArticles.length / totalSections) * 100));
                }

                // Nota en el visor usando page_start del análisis
                const noteId = Date.now() + detectedArticles.length;
                setNotes(prev => [...prev, {
                  id: noteId,
                  title: article.article_number || 'Artículo detectado',
                  content: `${article.description}\n\nSujeto: ${article.subject || 'N/A'}\nPrioridad: ${article.priority || 'N/A'}`,
                  quote: article.original_content || article.description,
                  pageIndex: article.page_start ? article.page_start - 1 : 0,
                  highlightAreas: [],
                  markerType: MARKER_TYPES.PDF_ANALYSIS,
                  color: MARKER_COLORS.GREEN.value,
                  createdAt: new Date().toISOString(),
                  analysisData: article
                }]);

                onPdfAnalysis({
                  status: 'article_detected',
                  article: { ...article, id_requisito: requisito_id },
                  totalDetected: detectedArticles.length
                });
              }

            } else if (data.event === 'section_error') {
              console.warn(`Sección ${data.section_index} falló: ${data.error}`);

            } else if (data.event === 'complete') {
              const message = `Análisis completado. ${detectedArticles.length} artículos detectados.`;
              setPdfAnalysisStatus(message);
              setPdfAnalysisProgress(100);
              showSuccessMsg(`Análisis completado: ${detectedArticles.length} artículos encontrados`);
              onPdfAnalysis({ status: 'complete', message, totalDetected: detectedArticles.length });
            }

          } catch (e) {
            console.warn('Error parseando evento SSE:', e);
          }
        }
      };

      let streamDone = false;
      while (!streamDone) {
        const { value, done } = await reader.read();
        streamDone = done;
        if (!done) processChunk(decoder.decode(value, { stream: true }));
      }

    } catch (error) {
      console.error('❌ Error al analizar PDF:', error);
      showErrorMsg(`Error al analizar PDF: ${error.message}`);
      const errorMessage = `Error en el análisis: ${error.message}`;
      setPdfAnalysisStatus(errorMessage);
      onPdfAnalysis({ status: 'error', message: errorMessage });
    } finally {
      setAnalyzingPDF(false);
    }
  };

  // Función para confirmar y procesar las imágenes (soporte multi-página)
  const handleConfirmImageAnalysis = async () => {
    if (!noteImageTitle.trim()) {
      showErrorMsg('Por favor ingresa un título para la nota');
      return;
    }

    if (capturedImagesArray.length === 0) {
      showErrorMsg('No hay imágenes capturadas para procesar');
      return;
    }

    if (onImageAnalysis) {
      // Convertir todos los blobs a base64
      const convertPromises = capturedImagesArray.map(imageData => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageData.imageBlob);
        });
      });

      const imagesBase64 = await Promise.all(convertPromises);
      
      // Crear nota con el array de imágenes
      const noteId = Date.now();
      const allHighlightAreas = capturedImagesArray.flatMap(img => img.highlightAreas);
      
      const newNote = {
        id: noteId,
        title: noteImageTitle,
        content: noteImageDescription,
        quote: '',
        pageIndex: capturedImagesArray[0].pageIndex, // Primera página como referencia
        highlightAreas: allHighlightAreas,
        markerType: MARKER_TYPES.IMAGE_ANALYSIS,
        color: markerColor.value,
        createdAt: new Date().toISOString(),
        imageData: imagesBase64, // Array de base64
        totalImages: capturedImagesArray.length
      };

      setNotes(prev => [...prev, newNote]);

      // Enviar al API con array de blobs
      onImageAnalysis({
        imageBlobs: capturedImagesArray.map(img => img.imageBlob), // Array de blobs
        pageIndexes: capturedImagesArray.map(img => img.pageIndex),
        fileNames: capturedImagesArray.map((img, idx) => `page-${idx + 1}.png`),
        dimensions: capturedImagesArray.map(img => img.dimensions),
        note_reference: noteId.toString(),
        noteTitle: noteImageTitle,
        noteDescription: noteImageDescription,
        totalImages: capturedImagesArray.length
      });

      handleCloseImagePreview();
    } else {
      handleCloseImagePreview();
    }
  };

  // Función para cancelar y cerrar el preview
  const handleCloseImagePreview = () => {
    // Liberar todas las URLs de objetos
    capturedImagesArray.forEach(imageData => {
      if (imageData?.imageUrl) {
        URL.revokeObjectURL(imageData.imageUrl);
      }
    });
    setImagePreviewOpen(false);
    setCapturedImagesArray([]);
    setCurrentPreviewIndex(0);
    setNoteImageTitle('');
    setNoteImageDescription('');
    setMarkerMode(null);
  };

  // Navegación del carrusel de imágenes
  const handleNextImage = () => {
    setCurrentPreviewIndex(prev => Math.min(capturedImagesArray.length - 1, prev + 1));
  };

  const handlePrevImage = () => {
    setCurrentPreviewIndex(prev => Math.max(0, prev - 1));
  };

  // Eliminar imagen actual del carrusel
  const handleDeleteCurrentImage = () => {
    if (capturedImagesArray.length === 1) {
      // Si es la única imagen, cerrar el preview
      handleCloseImagePreview();
      return;
    }

    const imageToDelete = capturedImagesArray[currentPreviewIndex];
    if (imageToDelete?.imageUrl) {
      URL.revokeObjectURL(imageToDelete.imageUrl);
    }

    const newArray = capturedImagesArray.filter((_, idx) => idx !== currentPreviewIndex);
    setCapturedImagesArray(newArray);
    
    // Ajustar índice si es necesario
    if (currentPreviewIndex >= newArray.length) {
      setCurrentPreviewIndex(newArray.length - 1);
    }
  };

  // Continuar agregando más páginas sin cerrar el preview
  const handleAddMorePages = () => {
    setImagePreviewOpen(false);
    // Mantener markerMode activo para continuar capturando
    // No limpiar capturedImagesArray
  };

  // Capturar área del PDF como imagen y enviar a análisis
  const handleCaptureAndAnalyzeArea = async (pageIndex, left, top, width, height) => {
    try {
      setAnalyzingImage(true);
      
      // Intentar obtener el canvas del visor primero
      let canvas = null;
      const allCanvases = document.querySelectorAll('.rpv-core__page-layer canvas');
      
      if (allCanvases && allCanvases.length > pageIndex) {
        canvas = allCanvases[pageIndex];
        console.log(`✅ Canvas encontrado en el visor para página ${pageIndex + 1}`);
      }
      
      // Si el canvas no está disponible, renderizar la página manualmente
      if (!canvas && pdfDocumentRef.current) {
        console.log(`🔄 Renderizando página ${pageIndex + 1} manualmente...`);
        
        const page = await pdfDocumentRef.current.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 2.0 }); // Escala 2x para mejor calidad
        
        // Crear canvas temporal
        canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Renderizar la página
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        console.log(`✅ Página ${pageIndex + 1} renderizada: ${canvas.width}x${canvas.height}px`);
      }
      
      if (!canvas) {
        throw new Error(`No se pudo obtener o renderizar la página ${pageIndex + 1} del PDF`);
      }
      
      console.log(`📄 Procesando página ${pageIndex + 1}:`, {
        width: canvas.width,
        height: canvas.height
      });
      
      // Calcular coordenadas en píxeles
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const x = (left / 100) * canvasWidth;
      const y = (top / 100) * canvasHeight;
      const w = (width / 100) * canvasWidth;
      const h = (height / 100) * canvasHeight;
      
      // Crear un nuevo canvas para la región seleccionada
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = w;
      croppedCanvas.height = h;
      const ctx = croppedCanvas.getContext('2d');
      
      // Copiar la región seleccionada
      ctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
      
      // Convertir a blob (PNG)
      const blob = await new Promise((resolve) => {
        croppedCanvas.toBlob(resolve, 'image/png', 1.0);
      });
      
      console.log('📸 Imagen capturada:', {
        format: 'PNG',
        size: `${(blob.size / 1024).toFixed(2)} KB`,
        dimensions: `${w}x${h}px`,
        pageIndex: pageIndex + 1
      });
      
      // Crear URL de la imagen para preview
      const imageUrl = URL.createObjectURL(blob);
      
      // Crear objeto de imagen capturada
      const newImageData = {
        imageBlob: blob,
        imageUrl: imageUrl,
        pageIndex,
        fileName: `pdf-area-page${pageIndex + 1}.png`,
        dimensions: { width: w, height: h },
        highlightAreas: [{
          pageIndex,
          left,
          top,
          width,
          height
        }]
      };
      
      // Agregar a array de imágenes capturadas
      setCapturedImagesArray(prev => [...prev, newImageData]);
      setCurrentPreviewIndex(prev => prev.length > 0 ? prev.length : 0);
      
      // Establecer título autogenerado por defecto solo si es la primera imagen
      if (capturedImagesArray.length === 0) {
        setNoteImageTitle(getNextNoteTitle());
      }
      
      // Mostrar diálogo de preview
      setImagePreviewOpen(true);
      
    } catch (error) {
      console.error('❌ Error al capturar área:', error);
      
      // Mensaje de error más específico
      let errorMsg = error.message;
      if (error.message.includes('No se encontraron páginas')) {
        errorMsg = 'El PDF aún no está completamente cargado. Por favor espera unos segundos e intenta nuevamente.';
      }
      
      showErrorMsg(`Error al capturar imagen: ${errorMsg}`);
    } finally {
      setAnalyzingImage(false);
      setMarkerMode(null);
    }
  };

  // Manejar clic para nota de punto
  const handleAddPointNote = (pageIndex, left, top) => {
    const pointArea = [{
      pageIndex,
      left,
      top,
      width: 2,
      height: 2,
    }];
    setSelectedArea(pointArea);
    setSelectedText('');
    setNoteTitle(getNextNoteTitle());
    setNoteDialogOpen(true);
  };

  // Plugin personalizado para renderizar marcadores y capas interactivas
  const notesPlugin = {
    renderPageLayer: (renderProps) => {
      const pageNotes = notes.filter(note =>
        note.highlightAreas && note.highlightAreas.some(area => area.pageIndex === renderProps.pageIndex)
      );

      return (
        <div key={`page-${renderProps.pageIndex}-${notes.length}`}>
          {pageNotes.map(note => renderMarker(note, renderProps.pageIndex))}
          
          {markerMode === 'point' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'crosshair',
                zIndex: 10,
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
              }}
              onClick={(e) => {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const left = (x / rect.width) * 100;
                const top = (y / rect.height) * 100;
                
                handleAddPointNote(renderProps.pageIndex, left, top);
              }}
            />
          )}
          
          {markerMode === 'area' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'crosshair',
                zIndex: 10,
                backgroundColor: 'rgba(255, 152, 0, 0.05)',
              }}
              onMouseDown={(e) => handleMouseDown(e, renderProps.pageIndex)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {isDrawingArea && drawStart && drawEnd && drawingPageIndex === renderProps.pageIndex && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(drawStart.x, drawEnd.x)}%`,
                    top: `${Math.min(drawStart.y, drawEnd.y)}%`,
                    width: `${Math.abs(drawEnd.x - drawStart.x)}%`,
                    height: `${Math.abs(drawEnd.y - drawStart.y)}%`,
                    border: `2px dashed ${markerColor.value}`,
                    backgroundColor: markerColor.value,
                    opacity: 0.2,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          )}
          
          {markerMode === 'image_analysis' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'crosshair',
                zIndex: 10,
                backgroundColor: 'rgba(76, 175, 80, 0.05)',
              }}
              onMouseDown={(e) => handleMouseDown(e, renderProps.pageIndex)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {isDrawingArea && drawStart && drawEnd && drawingPageIndex === renderProps.pageIndex && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(drawStart.x, drawEnd.x)}%`,
                    top: `${Math.min(drawStart.y, drawEnd.y)}%`,
                    width: `${Math.abs(drawEnd.x - drawStart.x)}%`,
                    height: `${Math.abs(drawEnd.y - drawStart.y)}%`,
                    border: '3px dashed #4caf50',
                    backgroundColor: '#4caf50',
                    opacity: 0.15,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          )}
        </div>
      );
    }
  };

  // Renderizar highlight para texto seleccionado
  const renderHighlightTarget = (props) => (
    <div
      style={{
        background: markerColor.value,
        opacity: markerType === MARKER_TYPES.HIGHLIGHT ? 0.4 : 
                 markerType === MARKER_TYPES.UNDERLINE ? 0 : 0.4,
        ...props.style,
        ...(markerType === MARKER_TYPES.UNDERLINE && {
          height: '2px',
          bottom: 0,
          top: 'auto',
          opacity: 0.8
        }),
        ...(markerType === MARKER_TYPES.BOX && {
          border: `2px solid ${markerColor.value}`,
          background: 'transparent'
        })
      }}
      onClick={() => handleHighlightClick(props)}
    />
  );

  const renderHighlightContent = (props) => {
    const note = notes.find(n => 
      n.highlightAreas && 
      n.highlightAreas.some(area => 
        area.pageIndex === props.highlightAreas[0].pageIndex
      )
    );

    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(0, 0, 0, 0.3)',
          borderRadius: '4px',
          padding: '8px',
          position: 'absolute',
          zIndex: 1,
          maxWidth: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        {note ? (
          <>
            <Typography variant="caption" color="primary" fontWeight="bold">
              📝 {note.title}
            </Typography>
            {note.quote && (
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic', color: 'text.secondary' }}>
                &ldquo;{note.quote.substring(0, 100)}{note.quote.length > 100 ? '...' : ''}&rdquo;
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {note.content}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {new Date(note.createdAt).toLocaleString()}
            </Typography>
          </>
        ) : (
          <Button
            size="small"
            startIcon={<NoteAddRounded />}
            onClick={() => handleAddNoteToHighlight(props)}
            sx={{ textTransform: 'none' }}
          >
            Agregar nota
          </Button>
        )}
      </div>
    );
  };

  const handleHighlightClick = (props) => {
    const note = notes.find(n => 
      n.highlightAreas && 
      n.highlightAreas.some(area => 
        area.pageIndex === props.highlightAreas[0].pageIndex
      )
    );
    
    if (note) {
      handleViewNote(note);
    }
  };

  const handleAddNoteToHighlight = (props) => {
    setSelectedArea(props.highlightAreas);
    setSelectedText(props.selectedText || '');
    setNoteTitle(getNextNoteTitle());
    setNoteDialogOpen(true);
  };

  // Plugin de highlight
  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget,
    renderHighlightContent,
    trigger: Trigger.TextSelection,
  });

  const { jumpToHighlightArea } = highlightPluginInstance;

  // Listener para navegación a notas desde ArticlesList
  useEffect(() => {
    const handleNavigateToNote = (event) => {
      const { noteId, pageIndex } = event.detail;
      console.log('📍 Recibida solicitud de navegación a nota:', noteId, 'Página:', pageIndex);
      
      // Buscar la nota por ID
      const note = notes.find(n => n.id === noteId);
      
      if (note && note.highlightAreas && note.highlightAreas.length > 0) {
        console.log('✅ Nota encontrada, navegando...');
        // Usar jumpToHighlightArea del plugin de highlight
        jumpToHighlightArea(note.highlightAreas[0]);
        
        // NO abrir el diálogo de la nota, solo navegar
        // setTimeout(() => {
        //   handleViewNote(note);
        // }, 500);
      } else {
        console.warn('⚠️ Nota no encontrada con ID:', noteId);
      }
    };

    window.addEventListener('navigate-to-note', handleNavigateToNote);
    return () => window.removeEventListener('navigate-to-note', handleNavigateToNote);
  }, [notes, jumpToHighlightArea]);

  // Plugin de búsqueda
  const searchPluginInstance = searchPlugin();

  // Plugin de layout por defecto
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      {
        ...defaultTabs[0],
        content: defaultTabs[0].content,
      },
      {
        ...defaultTabs[1],
        content: defaultTabs[1].content,
      },
      {
        icon: <CommentRounded />,
        title: 'Notas',
        content: (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mis Notas ({notes.length})
            </Typography>
            
            {notes.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No hay notas. Selecciona texto o usa las herramientas de marcado.
              </Typography>
            ) : (
              <List dense>
                {notes.map((note) => {
                  const typeIcon = note.markerType === MARKER_TYPES.POINT ? '📍' :
                                  note.markerType === MARKER_TYPES.AREA ? '⬜' :
                                  note.markerType === MARKER_TYPES.BOX ? '▢' :
                                  note.markerType === MARKER_TYPES.UNDERLINE ? '＿' : '✏️';
                  
                  return (
                    <React.Fragment key={note.id}>
                      <ListItem
                        button
                        onClick={() => handleViewNote(note)}
                        sx={{
                          borderLeft: `3px solid ${note.color || MARKER_COLORS.YELLOW.value}`,
                          mb: 1,
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: '#e3f2fd'
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <span>{typeIcon}</span>
                              <Typography variant="body2" fontWeight="medium">
                                {note.title || 'Sin título'}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              {note.quote && (
                                <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', mb: 0.3 }}>
                                  &ldquo;{note.quote.substring(0, 50)}{note.quote.length > 50 ? '...' : ''}&rdquo;
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.disabled">
                                Pág. {note.pageIndex + 1} • {new Date(note.createdAt).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (note.highlightAreas) {
                                jumpToHighlightArea(note.highlightAreas[0]);
                              }
                            }}
                          >
                            <VisibilityRounded fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestDelete(note.id);
                            }}
                          >
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Box>
        ),
      }
    ],
    toolbarPlugin: {
      searchPlugin: searchPluginInstance,
    },
  });

  const handleDocumentLoad = async (e) => {
    setNumPages(e.doc.numPages);
    setLoading(false);
    console.log('PDF cargado:', e.doc.numPages, 'páginas');
    
    // Guardar referencia al documento PDF para renderizado manual
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdfDoc = await loadingTask.promise;
      pdfDocumentRef.current = pdfDoc;
      console.log('📝 Documento PDF almacenado para renderizado manual');
    } catch (error) {
      console.error('Error al cargar documento PDF para referencia:', error);
    }
  };

  const handleDocumentLoadError = (error) => {
    console.error('Error al cargar PDF:', error);
    setError('No se pudo cargar el documento PDF');
    setLoading(false);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      showErrorMsg('Por favor ingresa un título para la nota');
      return;
    }

    if (editingNoteId) {
      setNotes(prev => prev.map(note => 
        note.id === editingNoteId 
          ? { 
              ...note, 
              title: noteTitle,
              content: noteText, 
              updatedAt: new Date().toISOString() 
            }
          : note
      ));
    } else {
      let noteMarkerType;
      if (markerMode === 'point') {
        noteMarkerType = MARKER_TYPES.POINT;
      } else if (markerMode === 'area') {
        noteMarkerType = MARKER_TYPES.AREA;
      } else {
        noteMarkerType = markerType;
      }

      const newNote = {
        id: Date.now(),
        title: noteTitle,
        content: noteText,
        quote: selectedText, // Guardar texto completo extraído
        pageIndex: selectedArea ? selectedArea[0].pageIndex : 0,
        highlightAreas: selectedArea,
        markerType: noteMarkerType,
        color: markerColor.value,
        createdAt: new Date().toISOString(),
      };

      setNotes(prev => [...prev, newNote]);
    }

    handleCloseNoteDialog();
  };

  const handleViewNote = (note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteText(note.content);
    setSelectedText(note.quote || ''); // Cargar texto extraído si existe
    setEditingNoteId(note.id);
    setNoteDialogOpen(true);
  };

  const handleRequestDelete = (noteId) => {
    setNoteToDelete(noteId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      setNotes(prev => prev.filter(note => note.id !== noteToDelete));
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setNoteToDelete(null);
  };

  // Función para extraer article_name y article_number del texto usando regex
  const extractArticleInfo = (text) => {
    if (!text || !text.trim()) {
      return { article_name: '', article_number: '' };
    }

    // Patrones regex para detectar artículos, parágrafos, literales, numerales
    // Cada patrón captura: grupo 1 = tipo (artículo, parágrafo), grupo 2 = número
    const patterns = [
      // Artículo + número arábigo: "Artículo 1", "ARTÍCULO 25"
      { regex: /(artículo|articulo|artículo)\s+(\d+)/i, type: 1 },
      // Artículo + número romano: "Artículo I", "ARTÍCULO XV"
      { regex: /(artículo|articulo|artículo)\s+([IVXLCDM]+)/i, type: 1 },
      // Artículo + número en palabras: "ARTÍCULO TERCERO", "Artículo primero"
      { regex: /(artículo|articulo|artículo)\s+(primero|segundo|tercero|cuarto|quinto|sexto|séptimo|s[eé]ptimo|octavo|noveno|d[eé]cimo|und[eé]cimo|duod[eé]cimo|decimotercero|decimocuarto|decimoquinto|vig[eé]simo)/i, type: 1 },
      // Parágrafo + número: "Parágrafo 1", "§ 2"
      { regex: /(parágrafo|par[aá]grafo|§)\s+(\d+)/i, type: 2 },
      // Parágrafo + número en palabras: "Parágrafo primero"
      { regex: /(parágrafo|par[aá]grafo)\s+(primero|segundo|tercero|cuarto|quinto)/i, type: 2 },
      // Literal + letra: "Literal a", "LITERAL B"
      { regex: /(literal)\s+([a-zA-Z])/i, type: 3 },
      // Numeral + número: "Numeral 1", "NUMERAL 5"
      { regex: /(numeral)\s+(\d+)/i, type: 4 },
      // Inciso + letra: "Inciso a", "INCISO b"
      { regex: /(inciso)\s+([a-zA-Z])/i, type: 5 }
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const typePart = match[1]; // "ARTÍCULO", "Parágrafo", "Literal", etc.
        const numberPart = match[2]; // "TERCERO", "1", "a", etc.
        
        // Preservar el case original del texto
        const typeIndex = text.indexOf(match[0]);
        const originalType = text.substring(typeIndex, typeIndex + match[1].length);
        const originalNumber = text.substring(typeIndex + match[1].length, typeIndex + match[0].length).trim();
        
        return {
          article_name: originalType,
          article_number: originalNumber
        };
      }
    }

    // Si no se encuentra ningún patrón, retornar vacío
    return { article_name: '', article_number: '' };
  };

  const handleCreateArticle = () => {
    if (!selectedText || !selectedText.trim()) {
      showErrorMsg('No hay texto seleccionado para crear el artículo');
      return;
    }

    if (!noteTitle.trim()) {
      showErrorMsg('Por favor ingresa un título para la nota');
      return;
    }

    // Primero guardar la nota con el marco de selección
    let noteMarkerType;
    let noteHighlightAreas;
    
    if (markerMode === 'area') {
      // Nota de área rectangular (ya existe selectedArea)
      noteMarkerType = MARKER_TYPES.AREA;
      noteHighlightAreas = selectedArea;
    } else if (pdfSelectionCoords && !selectedArea) {
      // Nota de punto para selección directa de texto + highlight del texto
      noteMarkerType = MARKER_TYPES.HIGHLIGHT; // Cambiar a HIGHLIGHT para resaltar texto
      
      // Crear highlight area basado en las coordenadas capturadas
      noteHighlightAreas = [{
        pageIndex: pdfSelectionCoords.pageIndex,
        left: pdfSelectionCoords.left,
        top: pdfSelectionCoords.top,
        width: pdfSelectionCoords.width || 20, // Ancho del texto seleccionado
        height: pdfSelectionCoords.height || 2  // Alto del texto seleccionado
      }];
    } else if (selectedArea) {
      // Usar el área proporcionada
      noteMarkerType = markerMode === 'point' ? MARKER_TYPES.POINT : markerType;
      noteHighlightAreas = selectedArea;
    } else {
      // Fallback: crear nota de punto en página 0
      noteMarkerType = MARKER_TYPES.POINT;
      noteHighlightAreas = [{
        pageIndex: 0,
        left: 10,
        top: 10,
        width: 2,
        height: 2
      }];
    }

    const noteId = Date.now(); // ID entero sin decimales para evitar problemas de búsqueda
    const newNote = {
      id: noteId,
      title: noteTitle,
      content: noteText,
      quote: selectedText, // Guardar texto completo extraído
      pageIndex: noteHighlightAreas ? noteHighlightAreas[0].pageIndex : 0,
      highlightAreas: noteHighlightAreas,
      markerType: noteMarkerType,
      color: markerColor.value,
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => [...prev, newNote]);

    // Extraer article_name y article_number del texto seleccionado
    const { article_name, article_number } = extractArticleInfo(selectedText);

    // Crear evento personalizado para comunicar con AnalysisRegulation
    // Generar ID único con timestamp más preciso para evitar colisiones
    const uniqueId = Date.now() + Math.random();
    const newArticle = {
      id: uniqueId,
      id_process: uniqueId,
      number: article_number,
      article_number: article_name ? `${article_name} ${article_number}`.trim() : '',
      description: selectedText.trim(),
      complete_description: selectedText.trim(),
      subject: noteText.trim() || '',
      parent: null,
      section_index: 0,
      note_reference: noteId.toString(), // Enlace a la nota creada
      pageIndex: noteHighlightAreas?.[0]?.pageIndex || 0, // Página de la nota
      highlightAreas: noteHighlightAreas, // Coordenadas para navegación
      _expanded: true, // Marcar como expandido
      _fromPdfNote: true // Indicador de origen
    };

    // Despachar evento personalizado
    window.dispatchEvent(new CustomEvent('create-article-from-pdf', {
      detail: { article: newArticle }
    }));

    // Cerrar el diálogo de nota
    handleCloseNoteDialog();
  };

  const handleCreateArticleFromSelection = () => {
    if (!pdfSelectedText || !pdfSelectedText.trim()) {
      showErrorMsg('No hay texto seleccionado en el PDF');
      return;
    }

    // Abrir diálogo con el texto seleccionado
    setSelectedText(pdfSelectedText);
    setNoteTitle(getNextNoteTitle());
    setNoteText('');
    setSelectedArea(null); // No hay área específica, se usará pdfSelectionCoords
    setNoteDialogOpen(true);
    
    // Limpiar selección visual del PDF pero mantener coordenadas y range
    window.getSelection()?.removeAllRanges();
    setPdfSelectedText('');
    // NO limpiar pdfSelectionCoords ni pdfSelectionRange aquí
  };

  const handleCloseNoteDialog = () => {
    setNoteDialogOpen(false);
    setNoteTitle('');
    setNoteText('');
    setSelectedText('');
    setSelectedArea(null);
    setCurrentNote(null);
    setEditingNoteId(null);
    setMarkerMode(null);
    setPdfSelectionCoords(null);
    setPdfSelectionRange(null); // Limpiar range también
  };

  const handleExportNotes = () => {
    const notesText = notes.map((note, idx) => {
      const type = note.markerType === MARKER_TYPES.POINT ? 'Punto' :
                   note.markerType === MARKER_TYPES.AREA ? 'Área' :
                   note.markerType === MARKER_TYPES.BOX ? 'Recuadro' :
                   note.markerType === MARKER_TYPES.UNDERLINE ? 'Subrayado' : 'Resaltado';
      
      let noteText = `${idx + 1}. ${note.title}\n   [Página ${note.pageIndex + 1}] [${type}]\n`;
      
      if (note.quote && note.quote.trim()) {
        noteText += `   Texto extraído: "${note.quote}"\n`;
      }
      
      if (note.content && note.content.trim()) {
        noteText += `   Comentario: ${note.content}\n`;
      }
      
      return noteText + '\n';
    }).join('\n');

    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!pdfUrl) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        p={4}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          📄 No hay documento cargado
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Sube un PDF usando el botón de adjuntar
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Header con herramientas de marcado */}
      {toolbarVisible && (
        <Box 
          sx={{ 
            p: 1, 
            backgroundColor: '#f5f5f5', 
            borderBottom: '1px solid #e0e0e0',
        }}
      >

        {/* Barra de herramientas de marcado */}
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/*
          <Divider orientation="vertical" flexItem />
          */}
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary" >
                Herramientas:
              </Typography>
              <Tooltip title={markerMode === 'point' ? "Cancelar nota de punto" : "Nota en punto específico"}>
                <Button
                  size="small"
                  variant={markerMode === 'point' ? "contained" : "outlined"}
                  color={markerMode === 'point' ? "error" : "primary"}
                  startIcon={<CommentRounded />}
                  onClick={() => setMarkerMode(markerMode === 'point' ? null : 'point')}
                  sx={{ textTransform: 'none' }}
                >
                  {markerMode === 'point' ? "Cancelar" : "Nota"}
                </Button>
              </Tooltip>

              <Tooltip title={markerMode === 'area' ? "Cancelar selección de área" : "Seleccionar área rectangular"}>
                <Button
                  size="small"
                  variant={markerMode === 'area' ? "contained" : "outlined"}
                  color={markerMode === 'area' ? "error" : "secondary"}
                  startIcon={<CheckBoxOutlineBlankRounded />}
                  onClick={() => setMarkerMode(markerMode === 'area' ? null : 'area')}
                  sx={{ textTransform: 'none' }}
                >
                  {markerMode === 'area' ? "Cancelar" : "Marcador"}
                </Button>
              </Tooltip>

              <Tooltip title={markerMode === 'image_analysis' ? "Cancelar análisis de imagen" : "Analizar área con IA"}>
                <Button
                  size="small"
                  variant={markerMode === 'image_analysis' ? "contained" : "outlined"}
                  color={markerMode === 'image_analysis' ? "error" : "success"}
                  //startIcon={analyzingImage ? <CircularProgress size={16} /> : <WarningRounded />}
                  startIcon={<CheckBoxOutlineBlankRounded />}
                  onClick={() => {
                    if (markerMode === 'image_analysis') {
                      setMarkerMode(null);
                    } else {
                      setMarkerMode('image_analysis');
                    }
                  }}
                  disabled={analyzingImage}
                  sx={{ textTransform: 'none' }}
                >
                  {analyzingImage ? "Analizando..." : 
                   markerMode === 'image_analysis' ? "Cancelar" : "Recorte IA"}
                </Button>
              </Tooltip>

              <Tooltip title="Analizar el PDF completo con IA">
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={analyzingPDF ? <CircularProgress size={16} /> : <ArticleRounded />}
                  onClick={handleAnalyzePDF}
                  disabled={analyzingPDF || !pdfUrl}
                  sx={{ textTransform: 'none' }}
                >
                  {analyzingPDF ? `${pdfAnalysisProgress}%` : "Análisis PDF"}
                </Button>
              </Tooltip>

              {pdfSelectedText && (
                <Tooltip title="Crear artículo con el texto seleccionado del PDF">
                  <Button
                    size="small"
                    variant="contained"
                    color="info"
                    startIcon={<ArticleRounded />}
                    onClick={handleCreateArticleFromSelection}
                    sx={{ 
                      textTransform: 'none',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.8 }
                      }
                    }}
                  >
                    Crear artículo
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box display="flex" alignItems="center" gap={1}>
                      
            <Typography variant="caption" color="text.secondary">
              Color:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ColorLensRounded />}
              onClick={(e) => setColorMenuAnchor(e.currentTarget)}
              sx={{ 
                textTransform: 'none',
                borderColor: markerColor.value,
                '&:hover': {
                  borderColor: markerColor.dark
                }
              }}
            >
              <Box 
                sx={{ 
                  width: 20, 
                  height: 20, 
                  backgroundColor: markerColor.value,
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                }} 
              />
            </Button>
          </Box>
          
          <Divider orientation="vertical" flexItem />

          <Box display="flex" alignItems="center" gap={1}>  
            <Typography variant="caption" color="text.secondary">
              Notas:
            </Typography>
            <Tooltip title="Ver lista de notas">
              <IconButton
                size="small"
                onClick={() => setNotesListOpen(true)}
                color="primary"
              >
                <Badge badgeContent={notes.length} color="error">
                  <CommentRounded />
                </Badge>
              </IconButton>
            </Tooltip>

            {/*notes.length > 0 && (
              <Tooltip title="Exportar notas">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SaveRounded />}
                  onClick={handleExportNotes}
                  sx={{ textTransform: 'none' }}
                >
                  Exportar
                </Button>
              </Tooltip>
            )*/}
          </Box>

        </Box>

        {markerMode && (
          <Alert 
            severity={markerMode === 'image_analysis' ? "warning" : "info"}
            sx={{ mt: 1 }}
            onClose={() => {
              setMarkerMode(null);
            }}
          >
            {markerMode === 'point' ? '📍 Haz clic en cualquier punto del PDF para agregar una nota' :
             markerMode === 'image_analysis' ? 
               '🤖 Arrastra para seleccionar el área del PDF que deseas analizar con IA (se capturará como imagen PNG)' :
             markerMode === 'area' ? '⬜ Arrastra el mouse para seleccionar un área rectangular y crear una nota' : ''}
          </Alert>
        )}
      </Box>
      )}

      {/* Menu de colores */}
      <Menu
        anchorEl={colorMenuAnchor}
        open={toolbarVisible && Boolean(colorMenuAnchor)}
        onClose={() => setColorMenuAnchor(null)}
      >
        {Object.values(MARKER_COLORS).map((color) => (
          <MenuItem
            key={color.value}
            onClick={() => {
              setMarkerColor(color);
              setColorMenuAnchor(null);
            }}
            selected={markerColor.value === color.value}
          >
            <ListItemIcon>
              <Box 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  backgroundColor: color.value,
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.2)'
                }} 
              />
            </ListItemIcon>
            <ListItemText>{color.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {loading && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="400px"
        >
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Cargando documento...
          </Typography>
        </Box>
      )}

      {error && (
        <Box p={2}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {!error && (
        <Box sx={{ height: 'calc(100% - 140px)', overflow: 'hidden' }}>
          <Worker workerUrl={`${process.env.PUBLIC_URL}/static/js/pdf.worker.min.js`}>
            <Viewer
              fileUrl={pdfUrl}
              plugins={[
                defaultLayoutPluginInstance,
                highlightPluginInstance,
                searchPluginInstance,
                notesPlugin
              ]}
              onDocumentLoad={handleDocumentLoad}
              onDocumentLoadError={handleDocumentLoadError}
              defaultScale={1.2}
              theme="light"
            />
          </Worker>
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" m={1}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle1" fontWeight="medium">
            📄 {fileName}
          </Typography>
          {numPages && (
            <Chip 
              label={`${numPages} página${numPages !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

      </Box>

      {/* Dialog para agregar/editar nota */}
      <Dialog 
        open={noteDialogOpen} 
        onClose={handleCloseNoteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <NoteAddRounded color="primary" />
              <Typography variant="h6">
                {editingNoteId ? 'Editar Nota' : 'Nueva Nota'}
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <Button 
                onClick={handleCloseNoteDialog}
                startIcon={<CloseRounded />}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveNote}
                variant="contained"
                startIcon={<SaveRounded />}
                disabled={!noteTitle.trim()}
              >
                {editingNoteId ? 'Guardar Cambios' : 'Agregar'}
              </Button>
              {selectedText && selectedText.trim() && (
                <Button 
                  onClick={handleCreateArticle}
                  variant="contained"
                  color="success"
                  startIcon={<ArticleRounded />}
                >
                  Crear artículo
                </Button>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Campo de título */}
          <TextField
            autoFocus
            fullWidth
            label="Título de la nota"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Ej: Nota 1, Obligación importante, etc."
            variant="outlined"
            sx={{ mb: 2 }}
            required
          />

          {selectedText && (
            <TextField
              multiline
              rows={8}
              fullWidth
              label="Texto seleccionado (editable)"
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              variant="outlined"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderLeft: `3px solid ${markerColor.value}`,
                }
              }}
              helperText="Puedes editar el texto extraído del área seleccionada"
            />
          )}

          <TextField
            multiline
            rows={4}
            fullWidth
            label="Contenido de la nota (opcional)"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ingresa tus comentarios, observaciones o ideas..."
            variant="outlined"
          />
        </DialogContent>

      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningRounded color="warning" />
            <Typography variant="h6">
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1">
            ¿Estás seguro de que deseas eliminar esta nota?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleCancelDelete}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteRounded />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de preview de imagen con carrusel multi-página */}
      <Dialog
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <WarningRounded color="primary" />
              <Typography variant="h6">
                Vista previa - Análisis con IA
              </Typography>
              {capturedImagesArray.length > 0 && (
                <Chip
                  label={`${capturedImagesArray.length} página${capturedImagesArray.length !== 1 ? 's' : ''}`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>

            <Box display="flex" gap={1}>
              <Button
                onClick={handleCloseImagePreview}
                startIcon={<CloseRounded />}
                variant="outlined"
              >
                Cancelar todo
              </Button>

              <Button
                onClick={handleAddMorePages}
                startIcon={<AddPhotoAlternateRounded />}
                variant="outlined"
                color="secondary"
              >
                Agregar otra página
              </Button>

              <Button
                onClick={handleConfirmImageAnalysis}
                variant="contained"
                color="primary"
                startIcon={<AutoAwesome />}
                disabled={analyzingImage || capturedImagesArray.length === 0}
              >
                {analyzingImage
                  ? 'Procesando...'
                  : `Procesar ${capturedImagesArray.length} página${capturedImagesArray.length !== 1 ? 's' : ''}`}
              </Button>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {capturedImagesArray.length === 1
              ? 'Esta imagen será enviada para análisis con IA.'
              : `Estas ${capturedImagesArray.length} imágenes se procesarán como un documento continuo.`}
            {' '}Verifica que el contenido sea el correcto antes de procesar.
          </Typography>

          {/* Campo de título */}
          <TextField
            label="Título de la nota"
            variant="outlined"
            value={noteImageTitle}
            onChange={(e) => setNoteImageTitle(e.target.value)}
            required
            placeholder="Ej: Obligación artículo 5"
            fullWidth
            sx={{ mb: 3 }}
          />
          {/* Descripción */}
          <TextField
            fullWidth
            label="Descripción (opcional)"
            variant="outlined"
            value={noteImageDescription}
            onChange={(e) => setNoteImageDescription(e.target.value)}
            multiline
            rows={2}
            placeholder="Agrega detalles adicionales sobre esta nota..."
            sx={{ mb: 3 }}
          />

          {/* Carrusel / navegación / imágenes (sin cambios) */}
          {capturedImagesArray.length > 1 && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <IconButton
                onClick={handlePrevImage}
                disabled={currentPreviewIndex === 0}
                color="primary"
              >
                <ArrowBackRounded />
              </IconButton>

              <Box textAlign="center">
                <Typography variant="body2" fontWeight="medium">
                  Página {currentPreviewIndex + 1} de {capturedImagesArray.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Dimensiones:</strong>{' '}
                  {capturedImagesArray[currentPreviewIndex]?.dimensions.width.toFixed(0)}x
                  {capturedImagesArray[currentPreviewIndex]?.dimensions.height.toFixed(0)}px
                  {' • '}
                  <strong>PDF página:</strong>{' '}
                  {capturedImagesArray[currentPreviewIndex]?.pageIndex + 1}
                </Typography>
              </Box>

              <IconButton
                onClick={handleNextImage}
                disabled={currentPreviewIndex === capturedImagesArray.length - 1}
                color="primary"
              >
                <ArrowForwardRounded />
              </IconButton>
            </Box>
          )}

          {capturedImagesArray.length > 0 && (
            <>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  p: 2,
                  border: '2px solid #e0e0e0',
                  position: 'relative',
                  minHeight: 400,
                }}
              >
                <img
                  src={capturedImagesArray[currentPreviewIndex]?.imageUrl}
                  alt={`Preview ${currentPreviewIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: 4,
                  }}
                />

                <Tooltip title="Eliminar esta página">
                  <IconButton
                    onClick={handleDeleteCurrentImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'white',
                      '&:hover': { backgroundColor: '#ffebee' },
                    }}
                    color="error"
                    size="small"
                  >
                    <DeleteRounded />
                  </IconButton>
                </Tooltip>
              </Box>

              {capturedImagesArray.length > 1 && (
                <Box
                  display="flex"
                  gap={1}
                  justifyContent="center"
                  sx={{ mt: 2, flexWrap: 'wrap' }}
                >
                  {capturedImagesArray.map((imgData, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setCurrentPreviewIndex(idx)}
                      sx={{
                        width: 60,
                        height: 60,
                        border: idx === currentPreviewIndex ? '3px solid' : '1px solid',
                        borderColor: idx === currentPreviewIndex ? 'primary.main' : 'grey.300',
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: idx === currentPreviewIndex ? 1 : 0.6,
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <img
                        src={imgData.imageUrl}
                        alt={`Thumb ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
      </Dialog>


      {/* Dialog de lista de notas */}
      <Dialog 
        open={notesListOpen} 
        onClose={() => setNotesListOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <CommentRounded color="primary" />
              <Typography variant="h6">
                Mis Notas y Marcadores ({notes.length})
              </Typography>
            </Box>
            {notes.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<SaveRounded />}
                onClick={handleExportNotes}
                sx={{ textTransform: 'none' }}
              >
                Exportar
              </Button>
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {notes.length === 0 ? (
            <Box textAlign="center" py={4}>
              <CommentRounded sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No hay notas aún. Usa las herramientas de marcado o selecciona texto.
              </Typography>
            </Box>
          ) : (
            <List>
              {notes.map((note, index) => {
                const typeIcon = note.markerType === MARKER_TYPES.POINT ? '📍' :
                               note.markerType === MARKER_TYPES.AREA ? '⬜' :
                               note.markerType === MARKER_TYPES.BOX ? '▢' :
                               note.markerType === MARKER_TYPES.UNDERLINE ? '＿' : '✏️';
                
                return (
                  <React.Fragment key={note.id}>
                    <ListItem
                      button
                      onClick={() => {
                        setNotesListOpen(false);
                        handleViewNote(note);
                      }}
                      sx={{
                        backgroundColor: '#fafafa',
                        borderRadius: 1,
                        mb: 2,
                        border: '1px solid #e0e0e0',
                        borderLeft: `4px solid ${note.color || MARKER_COLORS.YELLOW.value}`
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <span style={{ fontSize: '1.2em' }}>{typeIcon}</span>
                            <Typography variant="body1" fontWeight="medium">
                              {note.title || 'Sin título'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {note.quote && (
                              <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                                &ldquo;{note.quote.substring(0, 150)}{note.quote.length > 150 ? '...' : ''}&rdquo;
                              </Typography>
                            )}
                            {note.content && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {note.content}
                              </Typography>
                            )}
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip 
                                label={`Página ${note.pageIndex + 1}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.disabled">
                                {new Date(note.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          <Tooltip title="Ver en PDF">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (note.highlightAreas) {
                                  jumpToHighlightArea(note.highlightAreas[0]);
                                  setNotesListOpen(false);
                                }
                              }}
                            >
                              <VisibilityRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestDelete(note.id);
                              }}
                              color="error"
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < notes.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setNotesListOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PDFViewerComponent;