import {
  AddToPhotos,
  AutoAwesome,
  ExpandLess,
  ExpandMore,
  LabelImportant,
  MoreVert,
  AttachFile,
  UploadFile,
  Delete,
  SendRounded,
  AttachFileRounded,
  AutoFixHighRounded,
  SummarizeRounded,
  FormatListNumbered,
  FormatListBulleted,
  PictureAsPdfRounded,
  CheckCircle,
  ChatRounded
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  Checkbox,   
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
  Card,
  CardContent,
  CircularProgress,
  Fade,
} from '@mui/material';

import { API_URL } from "../../config/constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';

import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';

import { Fragment, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import LexicalInput from '../../components/Input/lexicalWYSWYG/LexicalInput';
import ChatInputBox from '../../components/Input/lexicalWYSWYG/ChatInputBox';
//import PDFViewerComponent from '../../components/PDFViewer/PDFViewerComponent';
import PDFViewerComponent from '../../components/Input/lexicalWYSWYG/PDFViewerComponent';

import axios from 'axios';
import { queryLibrary, getToken, ingestPDF } from '../../lib/iaApi';
import { 
  evalWithIA, 
  evalWithIAComplete,
  evalpdfIA, 
  evalAnalysis, 
  evalpdfAnalysisStandard,
  generateTasksFromArticlesWithIA,
  upload_legal_pdf,
  check_progress_pdf,
  bedrock_query,
  bedrock_query_deep, 
  bedrock_query_knowledge_base,
  get_articles_knowledge_base,
  evalWithIAcorrection,
  evalWithIAresume
} from '../../stores/legal/fetchListLegalsSlice';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import CreateArticleFromAnalysis from './CreateArticleFromAnalysis';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';

import {
  ProcessingProgressBar,
  ViewModeSwitcher,
  ChatNormaTab,
  KnowledgeBaseTab,
  ArticlesList,
  SelectedArticlesList
} from './components';

import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAutocompleteOptions,
  removeAllFilters,
  removeFilter,
  selectFilterItemValue,
  selectListOptions,
  selectAppliedFilterModel,
  setFilter
} from '../../stores/filterSlice';

import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/static/js/pdf.worker.min.js`;

// Custom hook to get list options
const useListOptions = (module, fieldName) =>
  useSelector((state) => selectListOptions(state, module, fieldName));

const EMPTY_ARRAY = [];

const useListOptionsGlobal = (fieldName) =>
  useSelector((state) => state.globalData?.[fieldName] ?? EMPTY_ARRAY);

const useFilterItemValue = (module, fieldName) =>
  useSelector((state) => selectFilterItemValue(state, module, fieldName));

export default function AnalysisRegulation({
  handleMenuOpen = () => {},
  handleAIClick = () => {},
  handleLexicalInput = () => {},
  loadingAI = 'not clicked',
  storeModule = 'LegalMatriz',
  initialFileUrl = null,
  initialFileName = null,
}) {
  
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const requisito_actual = useSelector((state) => 
    selectFilterItemValue(state, storeModule, 'requisito_actual')
  ) || null;

  const id_requisito_actual = useSelector((state) => 
    selectFilterItemValue(state, storeModule, 'id_requisito_actual')
  ) || null;
  
  const storedArticles = useFilterItemValue(storeModule, 'dataList');
  const storedSelectedArticles = useFilterItemValue(storeModule, 'selectedArticles');
  const storedSelectedFile = useFilterItemValue(storeModule, 'selectedFile');
  const storedHistoricTextIA = useFilterItemValue(storeModule, 'historicTextIA');

  const [loadingAIdata, setLoadingAIdata] = useState(false);
  const [aiData, setAiData] = useState();
  const [pdf, setPdf] = useState(null);
  const [userText, setUserText] = useState('');
  const [userText2, setUserText2] = useState('');
  const [dataError, setDataError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingKnowledgeBase, setLoadingKnowledgeBase] = useState(false);
  const [loadingQueryWithContext, setLoadingQueryWithContext] = useState(false);

  const [openList, setOpenList] = useState({});
  const [openTaskList, setOpenTaskList] = useState({});
  
  const [tabIndexArticle, setTabIndexArticle] = useState(storeModule === 'LegalMatriz' ? 0 : 2);
  const [showArticleTabs, setShowArticleTabs] = useState(storeModule === 'LegalMatriz');
  const [showActionButtons, setShowActionButtons] = useState(storeModule === 'LegalMatriz');
  const [tabIndexTaskOptions, setTabIndexTaskOptions] = useState(0);
  const [tabIndexIA, setTabIndexIA] = useState(0);

  const [deleteIndex, setDeleteIndex] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const [chatText, setChatText] = useState("");
  const [articles, setArticles] = useState(storedArticles || []);
  const [selectedArticles, setSelectedArticles] = useState(storedSelectedArticles || []);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  // Estados para análisis PDF
  const [pdfAnalyzing, setPdfAnalyzing] = useState(false);
  const [pdfAnalysisMessage, setPdfAnalysisMessage] = useState('');
  const [pdfAnalysisProgress, setPdfAnalysisProgress] = useState(0);
  const [pdfArticlesDetected, setPdfArticlesDetected] = useState(0);

  // Asegurar que todos los artículos tengan id_requisito actualizado
  useEffect(() => {
    if (id_requisito_actual && articles.length > 0) {
      setArticles(prevArticles => 
        prevArticles.map(art => ({
          ...art,
          id_requisito: id_requisito_actual
        }))
      );
    }
  }, [id_requisito_actual]); // Solo cuando cambia el requisito actual

  // Sincronizar selectedArticles cuando articles cambie (drag & drop, delete, etc.)
  useEffect(() => {
    if (selectedArticles.length > 0) {
      setSelectedArticles(prevSelected => {
        const updatedSelected = prevSelected
          .map(selected => {
            // Buscar la versión actualizada en articles
            const updated = articles.find(art => art.id_process === selected.id_process);
            return updated || selected;
          })
          .filter(art => 
            // Eliminar de la selección si ya no existe en articles
            articles.some(a => a.id_process === art.id_process)
          );
        
        // Solo actualizar si hay cambios reales
        const hasChanges = JSON.stringify(updatedSelected) !== JSON.stringify(prevSelected);
        return hasChanges ? updatedSelected : prevSelected;
      });
    }
  }, [articles]); // Solo depende de articles para evitar bucles infinitos

  // Listener para crear artículo desde nota de PDF
  useEffect(() => {
    const handleCreateArticleFromPdf = (event) => {
      const { article } = event.detail;
      
      // Agregar el artículo a la lista principal de articles
      setArticles(prev => [...prev, article]);
      
      // Agregar el artículo a selectedArticles y abrir su collapse
      setSelectedArticles(prev => {
        const newArticles = [...prev, article];
        // Abrir el collapse del nuevo artículo (será el último)
        const newIndex = newArticles.length - 1;
        setOpenList(prevOpenList => ({
          ...prevOpenList,
          [`selected-${newIndex}`]: true
        }));
        return newArticles;
      });
      
      // Cambiar al tab de selectedArticles (tab index 1)
      setTabIndexArticle(1);
      
      console.log('✅ Artículo creado desde nota de PDF:', article);
    };

    window.addEventListener('create-article-from-pdf', handleCreateArticleFromPdf);
    return () => window.removeEventListener('create-article-from-pdf', handleCreateArticleFromPdf);
  }, []);

  // Handler para crear nuevo artículo vacío
  const handleCreateNewArticle = (newArticle) => {
    // Agregar a la lista principal de articles
    setArticles(prev => [...prev, newArticle]);
    
    // Agregar a selectedArticles y abrir su collapse
    setSelectedArticles(prev => {
      const newArticles = [...prev, newArticle];
      const newIndex = newArticles.length - 1;
      setOpenList(prevOpenList => ({
        ...prevOpenList,
        [`selected-${newIndex}`]: true
      }));
      return newArticles;
    });
    
    console.log('✅ Nuevo artículo vacío creado:', newArticle);
  };

  const [customPrompt, setCustomPrompt] = useState('');
  const [loadingArticlesIA, setLoadingArticlesIA] = useState(false);
  const [result, setResult] = useState(null);
  const [articlesIA, setArticlesIA] = useState(null);

  const [resultAnalysisData, setResultAnalysisData] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // datos de PDF
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(storedSelectedFile || null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [pdfDataError, setPDFDataError] = useState(false);
  const [progressPDF, setProgressPDF] = useState(0);
  const [processingStatusPDF, setProcessingStatusPDF] = useState('');
  const [resultFilesPDF, setResultFilesPDF] = useState([]);

  const [extractedText, setExtractedText] = useState(''); 
  const [textBlocks, setTextBlocks] = useState([]);

  const [currentStreamingBlock, setCurrentStreamingBlock] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(null);

  const [historicTextIA, setHistoricTextIA] = useState(storedHistoricTextIA || [
    {
      id: Date.now(),
      label: "Contenido legal",
      contenido: []
    }
  ]);
  const [currentHistoricIAPosition, setCurrentHistoricIAPosition] = useState(0);
  const [loadingCorrection, setLoadingCorrection] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // 🆕 Estados para vista PDF
  const [viewMode, setViewMode] = useState('pdf'); // 'chat' | 'pdf'
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
  const [currentPdfName, setCurrentPdfName] = useState(null);
  const [pdfToolbarVisible, setPdfToolbarVisible] = useState(true); // Mostrar/ocultar Herramientas PDF

  const storedPdfUrl = useFilterItemValue(storeModule, 'storedPdfUrl');
  const storedPdfName = useFilterItemValue(storeModule, 'storedPdfName');
  const storedNotes = useFilterItemValue(storeModule, `pdf-notes-${id_requisito_actual}`);

  useEffect(() => {
    if (storedPdfUrl) {
      setCurrentPdfUrl(storedPdfUrl);
    }
    if (storedPdfName) {
      setCurrentPdfName(storedPdfName);
    }
  }, [storedPdfUrl, storedPdfName]);

  useEffect(() => {
    if (currentPdfUrl) {
      handleSetFilterItemValue(storeModule, 'storedPdfUrl', currentPdfUrl);
    }
  }, [currentPdfUrl]);

  useEffect(() => {
    if (currentPdfName) {
      handleSetFilterItemValue(storeModule, 'storedPdfName', currentPdfName);
    }
  }, [currentPdfName]);

  useEffect(() => {
    if (!initialFileUrl) return;

    let cancelled = false;

    const loadAndIngest = async () => {
      try {
        // Usar proxy backend para evitar CORS con URLs firmadas de S3
        const proxyUrl = `/message_center_api/legal_api/proxy_pdf?url=${encodeURIComponent(initialFileUrl)}`;
        const response = await fetch(proxyUrl);
        if (cancelled) return;
        if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
        const blob = await response.blob();
        if (cancelled) return;
        const name = initialFileName || 'documento.pdf';
        const file = new File([blob], name, { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setCurrentPdfUrl(blobUrl);
          setCurrentPdfName(name);
          setViewMode('pdf');
          ingestPDF(file).catch((err) => console.error('Error al indexar PDF:', err));
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error cargando archivo para análisis:', err);
        // Fallback: URL directa (puede fallar por CORS en el PDF viewer)
        setCurrentPdfUrl(initialFileUrl);
        setCurrentPdfName(initialFileName || 'documento.pdf');
        setViewMode('pdf');
      }
    };

    loadAndIngest();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFileUrl, initialFileName]);

  const legacyDataList = useSelector((state) => 
    selectFilterItemValue(state, storeModule, 'article_data_list')
  ) || [];

  const taskList = useSelector((state) => 
    selectFilterItemValue(state, storeModule, 'task_data_list')
  ) || [];

  const dataAnalysis = useSelector((state) => 
    selectFilterItemValue(state, storeModule, 'data_analysis')
  ) || [];

  const resultAnalysis = useSelector((state) => 
    selectFilterItemValue(state, storeModule, 'result_analysis')
  ) || {};

  const handleSetFilterItemValue = (module, id, value) => {
    if (!module) {
      console.error("El módulo es undefined o inválido");
      return;
    }
    const payload = { 
      module, 
      updatedFilter: { [id]: value }
    };
    dispatch(setFilter(payload));
  };
  
  useEffect(() => {
    handleSetFilterItemValue(storeModule, 'dataList', articles);
  }, [articles]);

  useEffect(() => {
    handleSetFilterItemValue(storeModule, 'selectedArticles', selectedArticles);
  }, [selectedArticles]);

  useEffect(() => {
    handleSetFilterItemValue(storeModule, 'selectedFile', selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    handleSetFilterItemValue(storeModule, 'historicTextIA', historicTextIA);
  }, [historicTextIA]);

  const toggleListOpen = (index) => {
    setOpenList((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleTaskListOpen = (index) => {
    setOpenTaskList((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addMessageToChat = (role, text) => {
    const updatedHistoric = [...historicTextIA];
    
    const updatedConversation = {
      ...updatedHistoric[currentHistoricIAPosition],
      contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
    };

    updatedConversation.contenido.push({
      role,
      text,
      timestamp: new Date()
    });
    
    updatedHistoric[currentHistoricIAPosition] = updatedConversation;
    setHistoricTextIA(updatedHistoric);
    
    setTimeout(() => {
      const chatArea = document.querySelector('.overflow-y-auto.bg-gray-50');
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    }, 100);
  };

  const addMessageToCurrentChat = (role, text) => {
    const updatedHistoric = [...historicTextIA];
    
    const updatedConversation = {
      ...updatedHistoric[currentHistoricIAPosition],
      contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
    };

    updatedConversation.contenido.push({
      role,
      text,
      timestamp: new Date()
    });
    
    updatedHistoric[currentHistoricIAPosition] = updatedConversation;
    setHistoricTextIA(updatedHistoric);
  };

  const currentConversation = historicTextIA[currentHistoricIAPosition];

  const onCorrectText = async () => {
    try {
      const currentConversation = historicTextIA[currentHistoricIAPosition];
      
      if (!currentConversation || currentConversation.contenido.length === 0) {
        console.warn('Aún no se ha cargado un documento legal');
        return;
      }

      const lastMessage = currentConversation.contenido[currentConversation.contenido.length - 1];
      const textToCorrect = lastMessage.text;

      if (!textToCorrect || textToCorrect.trim() === '') {
        console.warn('El último mensaje está vacío');
        return;
      }

      setLoadingCorrection(true);
      addMessageToCurrentChat('assistant', 'Corrigiendo texto...');

      const resultAction = await dispatch(evalWithIAcorrection(textToCorrect));

      if (evalWithIAcorrection.fulfilled.match(resultAction)) {
        const correctedText = resultAction.payload;

        const updatedHistoric = [...historicTextIA];
        
        const updatedConversation = {
          ...updatedHistoric[currentHistoricIAPosition],
          contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
        };
        
        updatedConversation.contenido.pop();
        
        updatedConversation.contenido.push({
          role: 'assistant',
          text: correctedText,
          timestamp: new Date()
        });
        
        updatedHistoric[currentHistoricIAPosition] = updatedConversation;
        setHistoricTextIA(updatedHistoric);

        setTimeout(() => {
          const chatArea = document.querySelector('.overflow-y-auto.bg-gray-50');
          if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
          }
        }, 100);

      } else {
        console.error('Error en la corrección:', resultAction.payload);
        
        const updatedHistoric = [...historicTextIA];
        
        const updatedConversation = {
          ...updatedHistoric[currentHistoricIAPosition],
          contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
        };
        
        updatedConversation.contenido.pop();
        updatedConversation.contenido.push({
          role: 'assistant',
          text: 'Lo siento, hubo un error al corregir el texto. Por favor, intenta nuevamente.',
          timestamp: new Date()
        });
        
        updatedHistoric[currentHistoricIAPosition] = updatedConversation;
        setHistoricTextIA(updatedHistoric);
      }

    } catch (error) {
      console.error('Error al corregir texto:', error);
      
      addMessageToCurrentChat(
        'assistant', 
        'Lo siento, ocurrió un error inesperado. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoadingCorrection(false);
    }
  };
  
  const onResumeText = async () => {
    try {
      const currentConversation = historicTextIA[currentHistoricIAPosition];
      
      if (!currentConversation || currentConversation.contenido.length === 0) {
        console.warn('Aún no se ha cargado un documento legal');
        return;
      }

      const lastMessage = currentConversation.contenido[currentConversation.contenido.length - 1];
      const textToCorrect = lastMessage.text;

      if (!textToCorrect || textToCorrect.trim() === '') {
        console.warn('El último mensaje está vacío');
        return;
      }

      setLoadingCorrection(true);
      addMessageToCurrentChat('assistant', 'Resumiendo texto...');

      const resultAction = await dispatch(evalWithIAresume(textToCorrect));

      if (evalWithIAresume.fulfilled.match(resultAction)) {
        const correctedText = resultAction.payload;

        const updatedHistoric = [...historicTextIA];
        
        const updatedConversation = {
          ...updatedHistoric[currentHistoricIAPosition],
          contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
        };
        
        updatedConversation.contenido.pop();
        
        updatedConversation.contenido.push({
          role: 'assistant',
          text: correctedText,
          timestamp: new Date()
        });
        
        updatedHistoric[currentHistoricIAPosition] = updatedConversation;
        setHistoricTextIA(updatedHistoric);

        setTimeout(() => {
          const chatArea = document.querySelector('.overflow-y-auto.bg-gray-50');
          if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
          }
        }, 100);

      } else {
        console.error('Resumen:', resultAction.payload);
        
        const updatedHistoric = [...historicTextIA];
        
        const updatedConversation = {
          ...updatedHistoric[currentHistoricIAPosition],
          contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
        };
        
        updatedConversation.contenido.pop();
        updatedConversation.contenido.push({
          role: 'assistant',
          text: 'Lo siento, hubo un error al resumir el texto. Por favor, intenta nuevamente.',
          timestamp: new Date()
        });
        
        updatedHistoric[currentHistoricIAPosition] = updatedConversation;
        setHistoricTextIA(updatedHistoric);
      }

    } catch (error) {
      console.error('Error al corregir texto:', error);
      
      addMessageToCurrentChat(
        'assistant', 
        'Lo siento, ocurrió un error inesperado. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoadingCorrection(false);
    }
  };

  const pollProgress = async (jobId) => {
    const maxAttempts = 120;
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        attempts++;

        try {
          const result = await dispatch(check_progress_pdf({ id_requisito: id_requisito_actual, job_id: jobId })).unwrap();
          
          setProgress(result.progress || 0);
          setProcessingStatus(result.status);

          if (result.status === 'SUCCEEDED') {
            clearInterval(intervalId);
            setProgress(100);
            setResultFiles(result.files || []);
            
            setExtractedText(result.extracted_text || '');
            setTextBlocks(result.blocks || []);
            
            resolve(result);
          }
          else if (result.status === 'FAILED') {
            clearInterval(intervalId);
            reject(new Error(result.error || 'Procesamiento fallido'));
          }
          else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            reject(new Error('Tiempo máximo de espera excedido'));
          }

        } catch (error) {
          clearInterval(intervalId);
          reject(error);
        }
      }, 3000);
    });
  };

  const handleUpload = async () => {
    console.log("🚀 Iniciando upload de PDF");
    setTabIndexArticle(0);

    if (!selectedFile) {
      console.error('No hay archivo seleccionado');
      return;
    }

    const formData = new FormData();
    formData.append('pdf_file', selectedFile);

    console.log('Iniciando upload de PDF a la IA');

    setLoadingPDF(true);
    setPDFDataError(false);
    setProgressPDF(0);
    setProcessingStatusPDF('');
    setResultFilesPDF([]);
    setExtractedText('');
    setTextBlocks([]);
    
    setCurrentStreamingBlock(null);
    setCurrentBlockIndex(null);

    try {
      const uploadResult = await dispatch(
        upload_legal_pdf({
          formData,
          requisito_id: id_requisito_actual
        })
      ).unwrap();

      console.log('Upload exitoso:', uploadResult);

      if (uploadResult.mode === 'sync') {
        setProgressPDF(100);
        setProcessingStatusPDF('SUCCEEDED');
        
        const blocks = uploadResult.blocks || [];
        setTextBlocks(blocks);
        
        const fullText = blocks.map(b => b.text).join('\n\n');
        setExtractedText(fullText);
        
        setLoadingPDF(false);
        return;
      }

      if (uploadResult.mode === 'async' && uploadResult.job_id) {
        console.log('Iniciando streaming para job:', uploadResult.job_id);
        setProcessingStatusPDF('IN_PROGRESS');

        const finalResult = await streamProgress(uploadResult.job_id);
        
        console.log('Streaming completado:', finalResult);
        setLoadingPDF(false);
      }

    } catch (error) {
      console.error('Error en el procesamiento:', error);
      setPDFDataError(true);
      setProcessingStatusPDF('FAILED');
      setLoadingPDF(false);
      
      alert(`Error: ${error.message || 'Error desconocido'}`);
    }
  };

  const streamProgress = (jobId) => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        `/message_center_api/legal_api/stream_textract_progress?job_id=${jobId}`
      );

      let receivedBlocks = [];

      eventSource.addEventListener('progress', (e) => {
        const data = JSON.parse(e.data);
        setProgressPDF(data.progress);
        setProcessingStatusPDF(data.status);
        console.log('Progreso:', data.progress);
      });

      eventSource.addEventListener('block', (e) => {
        const data = JSON.parse(e.data);
        
        console.log(`Bloque ${data.index + 1}/${data.total} recibido`);
        
        setCurrentStreamingBlock(data.block);
        setCurrentBlockIndex(data.index);
        
        receivedBlocks.push(data.block);
        setTextBlocks([...receivedBlocks]);
        
        const progress = Math.round((data.index + 1) / data.total * 100);
        setProgressPDF(progress);
      });

      eventSource.addEventListener('complete', (e) => {
        const data = JSON.parse(e.data);
        
        console.log('Streaming completado:', data);
        
        setProgressPDF(100);
        setProcessingStatusPDF('SUCCEEDED');
        setResultFilesPDF(data.files || []);
        
        const fullText = receivedBlocks.map(b => b.text).join('\n\n');
        setExtractedText(fullText);
        
        eventSource.close();
        resolve(data);
      });

      eventSource.addEventListener('error', (e) => {
        console.error('Error en streaming:', e);
        eventSource.close();
        reject(new Error('Error en streaming'));
      });

      eventSource.addEventListener('close', () => {
        eventSource.close();
      });
    });
  };
  // FUNCIÓN: Consulta al backend IA (ingest + query/library)
  const handleClearChatNorma = () => {
    setHistoricTextIA((prev) => {
      const updated = [...prev];
      updated[currentHistoricIAPosition] = {
        ...updated[currentHistoricIAPosition],
        contenido: []
      };
      return updated;
    });
  };

  const handleCustomQuery = async () => {
    const question = userText?.trim();
    if (!question) {
      alert('Por favor ingresa una pregunta');
      return;
    }

    setTabIndexArticle(2);
    setLoadingQueryWithContext(true);

    const pushMsg = (role, text, extra = {}) => {
      setHistoricTextIA((prev) => {
        const updated = [...prev];
        updated[currentHistoricIAPosition] = {
          ...updated[currentHistoricIAPosition],
          contenido: [
            ...updated[currentHistoricIAPosition].contenido,
            { role, text, timestamp: new Date(), ...extra }
          ]
        };
        return updated;
      });
    };

    const replaceLastMsg = (role, text, extra = {}) => {
      setHistoricTextIA((prev) => {
        const updated = [...prev];
        const contenido = [...updated[currentHistoricIAPosition].contenido];
        contenido[contenido.length - 1] = { role, text, timestamp: new Date(), ...extra };
        updated[currentHistoricIAPosition] = { ...updated[currentHistoricIAPosition], contenido };
        return updated;
      });
    };

    pushMsg('user', question);
    pushMsg('assistant', '🔍 Consultando norma...');
    setUserText('');

    try {
      const result = await queryLibrary(question, 10, currentPdfName || null);

      replaceLastMsg('assistant', result.answer, {
        sources: result.source_docs || [],
        grade: result.grade,
        hallucination: result.hallucination_detected,
        cacheHit: result.cache_hit,
      });

    } catch (error) {
      replaceLastMsg('assistant', `❌ Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoadingQueryWithContext(false);
    }
  };

  // NUEVA FUNCIÓN: Consulta simple sin concatenar con mensaje anterior
  const handleCustomQuery_knowledge_base = async () => {
    try {
      if (!userText2 || userText2.trim() === '') {
        alert('Por favor ingresa una pregunta');
        return;
      }

      setLoadingKnowledgeBase(true);

      const updatedHistoric = [...historicTextIA];
      
      const updatedConversation = {
        ...updatedHistoric[currentHistoricIAPosition],
        contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
      };
      
      updatedConversation.contenido.push({
        role: 'user',
        text: userText2,
        timestamp: new Date()
      });
      
      updatedHistoric[currentHistoricIAPosition] = updatedConversation;
      setHistoricTextIA(updatedHistoric);

      addMessageToCurrentChat('assistant', '🔍 Consultando base de conocimiento...');

      const response = await dispatch(
        bedrock_query_knowledge_base({
          prompt: userText2,
          sessionId: null
        })
      ).unwrap();

      console.log('✅ Respuesta de Bedrock:', response);

      if (response.success && response.answer) {
        const updatedHistoric2 = [...historicTextIA];
        
        const updatedConversation2 = {
          ...updatedHistoric2[currentHistoricIAPosition],
          contenido: [...updatedHistoric2[currentHistoricIAPosition].contenido]
        };
        
        updatedConversation2.contenido.pop();
        
        updatedConversation2.contenido.push({
          role: 'assistant',
          text: response.answer,
          timestamp: new Date(),
          sources: response.sources || [],
          sessionId: response.sessionId,
          citations: response.citations || []
        });
        
        updatedHistoric2[currentHistoricIAPosition] = updatedConversation2;
        setHistoricTextIA(updatedHistoric2);
        setResult(response);

        setUserText2('');

        setTimeout(() => {
          const chatArea = document.querySelector('.overflow-y-auto.bg-gray-50');
          if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
          }
        }, 100);

      } else {
        console.error('Error en la respuesta:', response);
        
        const updatedHistoric2 = [...historicTextIA];
        
        const updatedConversation2 = {
          ...updatedHistoric2[currentHistoricIAPosition],
          contenido: [...updatedHistoric2[currentHistoricIAPosition].contenido]
        };
        
        updatedConversation2.contenido.pop();
        
        updatedConversation2.contenido.push({
          role: 'assistant',
          text: '❌ Lo siento, hubo un error al consultar la base de conocimiento. Por favor, intenta nuevamente.',
          timestamp: new Date()
        });
        
        updatedHistoric2[currentHistoricIAPosition] = updatedConversation2;
        setHistoricTextIA(updatedHistoric2);
      }

    } catch (error) {
      console.error('❌ Error al consultar:', error);
      
      const updatedHistoric = [...historicTextIA];
      
      const updatedConversation = {
        ...updatedHistoric[currentHistoricIAPosition],
        contenido: [...updatedHistoric[currentHistoricIAPosition].contenido]
      };

      if (updatedConversation.contenido.length > 0) {
        const lastMsg = updatedConversation.contenido[updatedConversation.contenido.length - 1];
        if (lastMsg.role === 'assistant' && lastMsg.text.includes('Consultando')) {
          updatedConversation.contenido.pop();
        }
      }
      
      updatedConversation.contenido.push({
        role: 'assistant',
        text: `❌ Error: ${error.message || 'Error desconocido al procesar la consulta'}`,
        timestamp: new Date()
      });
      
      updatedHistoric[currentHistoricIAPosition] = updatedConversation;
      setHistoricTextIA(updatedHistoric);
      
    } finally {
      setLoadingKnowledgeBase(false);
    }
  };

  const handleArticleSaved = (articleIndex) => {
    setSelectedArticles((prev) => 
      prev.map((art, idx) => {
        if (idx !== articleIndex) return art;
        const currentSaved = art.savedRequisitoIds || [];
        if (!currentSaved.includes(id_requisito_actual)) {
          return { ...art, savedRequisitoIds: [...currentSaved, id_requisito_actual] };
        }
        return art;
      })
    );
  };

  const handleGetArticlesWithObligations = async () => {
    setLoadingArticlesIA(true);
    setArticlesIA(null);
    setArticles([]);
    setSelectedArticles([]);
    setLoading(true);

    try {
      const response = await dispatch(
        get_articles_knowledge_base({
          filter_type: 'obligations'
        })
      ).unwrap();

      console.log('✅ Artículos obtenidos:', response);
      setArticlesIA(response);

      const newArticles = Array.isArray(response.articulos) 
        ? response.articulos.map(art => ({ ...art, id_requisito: id_requisito_actual })) 
        : [];
      setArticles(prev => [...prev, ...newArticles]);
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoadingArticlesIA(false);
      setLoading(false);
    }
  };

  const handleGetArticlesWithDeadlines = async () => {
    setLoadingArticlesIA(true);
    setArticlesIA(null);
    setArticles([]);
    setSelectedArticles([]);
    setLoading(true);

    try {
      const response = await dispatch(
        get_articles_knowledge_base({
          filter_type: 'deadlines'
        })
      ).unwrap();

      console.log('✅ Artículos con plazos:', response);
      setArticlesIA(response);
      
      const newArticles = Array.isArray(response.articulos) 
        ? response.articulos.map(art => ({ ...art, id_requisito: id_requisito_actual })) 
        : [];
      setArticles(prev => [...prev, ...newArticles]);

    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoadingArticlesIA(false);
      setLoading(false);
    }
  };

  const handleUploadAnalysisStandard = async () => {
    setTabIndexArticle(1);
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('pdf_file', selectedFile);
    
    console.log("se hace request de texto a la API de la IA");

    setLoadingAIdata(true);
    setDataError(false);

    dispatch(evalpdfAnalysisStandard(formData)).then((data) => {
      const response = data?.payload;
      if (data?.payload?.messages === 'Success') {
        console.log("AI TEXT Response");
        console.log(response);
        setResultAnalysisData(response?.data);
        handleSetFilterItemValue(storeModule, 'resultAnalysis', response?.data);
        setLoadingAIdata(true);
      } else {
        console.log("Respuesta inesperada o vacía:", response);
        if (data?.error?.message === 'Rejected') {
          setDataError(true);
        }
      }
    });
  };

  const handleAIrequest = (evalText) => {
    setTabIndexArticle(1);
    console.log("se hace request de texto a la API de la IA");
    setLoadingAIdata(true);
    setDataError(false);
    
    dispatch(evalAnalysis(evalText)).then((data) => {
      const response = data?.payload;
    
      if ( response?.data != null && data?.payload?.messages === 'Success') {
        console.log("AI TEXT Response");
        console.log(response);
        setResultAnalysisData(response?.data);
        handleSetFilterItemValue(storeModule, 'resultAnalysis', response?.data);
        setLoadingAIdata(true);
      } else {
        console.log("Respuesta inesperada o vacía:", response);
        if (data?.error?.message === 'Rejected') {
          setDataError(true);
        }
      }
    });
  };

  const handleAIrequestArticles = async (evalText) => {
    setTabIndexArticle(0);
    console.log("🚀 Iniciando procesamiento por bloques");
    
    setLoading(true);
    setError(null);
    setArticles([]);
    setSelectedArticles([]);
    
    try {
      const MAX_TOKENS_PER_BLOCK = 1000;
      const blocks = segmentTextIntoBlocks(evalText, MAX_TOKENS_PER_BLOCK);

      console.log(`📦 Bloques generados:`, blocks);
      
      if (blocks.length === 0) {
        console.warn("⚠️ No se generaron bloques");
        setLoading(false);
        return;
      }

      setProgress({ current: 0, total: blocks.length });
      setMetadata({
        totalBlocks: blocks.length,
        startTime: new Date().toISOString(),
        tokenEstimate: blocks.reduce((sum, b) => sum + b.token_estimate, 0)
      });

      console.log(`📦 Total de bloques a procesar: ${blocks.length}`);
      
      let processedCount = 0;
      let failedCount = 0;
      const failedBlocks = [];

      const processBlock = async (block, index) => {
        console.log(`⏳ Procesando bloque ${index + 1}/${blocks.length}`);
        
        try {
          const response = await dispatch(evalWithIAComplete(block.text)).unwrap();
          
          if (response?.data != null && response?.messages === 'Success') {
            console.log(`✅ Bloque ${index + 1} procesado exitosamente`);
            
            const newArticles = Array.isArray(response.data) 
              ? response.data.map(art => ({ ...art, id_requisito: id_requisito_actual })) 
              : [];
            setArticles(prev => [...prev, ...newArticles]);
            
            processedCount++;
            setProgress({ current: processedCount, total: blocks.length });
            
            return {
              success: true,
              blockIndex: index,
              articles: newArticles,
              block: block
            };
          } else {
            console.warn(`⚠️ Respuesta inesperada en bloque ${index + 1}:`, response);
            failedCount++;
            failedBlocks.push({ blockIndex: index, reason: 'Respuesta inesperada' });
            
            processedCount++;
            setProgress({ current: processedCount, total: blocks.length });
            
            return {
              success: false,
              blockIndex: index,
              error: 'Respuesta inesperada',
              block: block
            };
          }
        } catch (error) {
          console.error(`❌ Error en bloque ${index + 1}:`, error);
          failedCount++;
          failedBlocks.push({ blockIndex: index, reason: error.message });
          
          processedCount++;
          setProgress({ current: processedCount, total: blocks.length });
          
          return {
            success: false,
            blockIndex: index,
            error: error.message,
            block: block
          };
        }
      };

      await processBlocksWithConcurrency(
        blocks, 
        processBlock, 
        5
      );

      console.log(`\n📊 Procesamiento completado:`);
      console.log(`  ✅ Exitosos: ${processedCount - failedCount}/${blocks.length}`);
      console.log(`  ❌ Fallidos: ${failedCount}/${blocks.length}`);

      setMetadata(prev => ({
        ...prev,
        endTime: new Date().toISOString(),
        successfulBlocks: processedCount - failedCount,
        failedBlocks: failedCount,
        failedBlocksDetails: failedBlocks
      }));

      if (failedCount > 0) {
        setError(`${failedCount} bloque(s) fallaron en el procesamiento`);
      }

    } catch (error) {
      console.error("💥 Error general en el procesamiento:", error);
      setError(error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAIrequestArticlesByBlocks = async () => {
    const currentConversation = historicTextIA[currentHistoricIAPosition];
    
    if (!currentConversation || currentConversation.contenido.length === 0) {
      console.warn('Aún no se ha cargado un documento legal');
      return;
    }

    const lastMessage = currentConversation.contenido[currentConversation.contenido.length - 1];
    const evalText = lastMessage.text;

    if (!evalText || evalText.trim() === '') {
      console.warn('El último mensaje está vacío');
      return;
    }

    setLoadingArticlesIA(true);
    addMessageToCurrentChat('assistant', 'Procesando artículos...');

    await handleAIrequestArticles(evalText);
    setLoadingArticlesIA(false);
  };

  const processBlocksWithConcurrency = async (blocks, processFn, maxConcurrent = 5) => {
    const results = [];
    const executing = [];
    
    for (const [index, block] of blocks.entries()) {
      const promise = processFn(block, index).then(result => {
        executing.splice(executing.indexOf(promise), 1);
        return result;
      });

      results.push(promise);
      executing.push(promise);

      if (executing.length >= maxConcurrent) {
        await Promise.race(executing);
      }
    }

    return Promise.all(results);
  };

  const segmentTextIntoBlocks = (text, maxTokens = 1000, customReplacements = {}) => {
    const defaultReplacements = {
      'articulo': 'artículo',
      'Articulo': 'Artículo',
      'ARTICULO': 'ARTÍCULO'
    };

    const replacements = { ...defaultReplacements, ...customReplacements };

    const applyCorrections = (inputText) => {
      let correctedText = inputText;
      let correctionsCount = 0;

      Object.entries(replacements).forEach(([incorrect, correct]) => {
        const regex = new RegExp(`\\b${incorrect}\\b`, 'g');
        const matches = correctedText.match(regex);
        
        if (matches) {
          correctionsCount += matches.length;
          correctedText = correctedText.replace(regex, correct);
        }
      });

      if (correctionsCount > 0) {
        console.log(`🔧 Se aplicaron ${correctionsCount} correcciones de texto`);
      }

      return correctedText;
    };

    const correctedText = applyCorrections(text);
    const paragraphs = correctedText.split(/\n\n+/).filter(p => p.trim());
    const blocks = [];
    let currentBlock = {
      order: 0,
      paragraphs: [],
      text: '',
      token_estimate: 0,
      char_start: 0,
      char_end: 0
    };
    
    let globalCharOffset = 0;

    paragraphs.forEach((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      const words = trimmedParagraph.split(/\s+/).length;
      const estimatedTokens = Math.ceil(words * 1.3);

      if (currentBlock.token_estimate + estimatedTokens > maxTokens && currentBlock.paragraphs.length > 0) {
        currentBlock.text = currentBlock.paragraphs.join('\n\n');
        currentBlock.char_end = globalCharOffset;
        blocks.push({ ...currentBlock });

        currentBlock = {
          order: blocks.length,
          paragraphs: [trimmedParagraph],
          text: '',
          token_estimate: estimatedTokens,
          char_start: globalCharOffset,
          char_end: 0
        };
      } else {
        currentBlock.paragraphs.push(trimmedParagraph);
        currentBlock.token_estimate += estimatedTokens;
      }

      globalCharOffset += paragraph.length + 2;
    });

    if (currentBlock.paragraphs.length > 0) {
      currentBlock.text = currentBlock.paragraphs.join('\n\n');
      currentBlock.char_end = globalCharOffset;
      blocks.push(currentBlock);
    }

    console.log(`✅ Texto segmentado en ${blocks.length} bloques`);
    return blocks;
  };

  const ProcessingProgressBar = ({ progress, loading }) => {
    // Priorizar estado de análisis PDF si está activo
    const isAnalyzing = pdfAnalyzing || loading;
    const displayMessage = pdfAnalyzing ? pdfAnalysisMessage : (loading ? '⏳ Procesando contenido...' : '✅ Procesamiento completado');
    const currentProgress = pdfAnalyzing ? pdfArticlesDetected : progress.current;
    const totalProgress = pdfAnalyzing ? (progress.total || 0) : progress.total;

    if (!isAnalyzing && progress.current === 0 && !pdfAnalyzing) return null;

    const percentage = totalProgress > 0 
      ? Math.round((currentProgress / totalProgress) * 100) 
      : 0;

    const isComplete = currentProgress === totalProgress && totalProgress > 0 && !isAnalyzing;

    return (
      <Box 
        sx={{
          p: 2,
          backgroundColor: pdfAnalyzing ? '#fef3c7' : (isComplete ? '#f0fdf4' : '#f0f9ff'),
          border: `1px solid ${pdfAnalyzing ? '#fbbf24' : (isComplete ? '#86efac' : '#bae6fd')}`,
          borderRadius: 2,
          mb: 2
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight="medium">
            {displayMessage}
          </Typography>
          {totalProgress > 0 && (
            <Typography variant="body2" color="text.secondary">
              {currentProgress}/{totalProgress} {pdfAnalyzing ? 'artículos' : 'bloques'}
            </Typography>
          )}
        </Box>

        <Box 
          sx={{
            width: '100%',
            height: 8,
            backgroundColor: '#e0f2fe',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 1
          }}
        >
          <Box 
            sx={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: pdfAnalyzing ? '#f59e0b' : (isComplete ? '#22c55e' : '#0ea5e9'),
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} 
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {percentage}% completado
          </Typography>
          
          {isAnalyzing && (
            <Typography variant="caption" color="text.secondary">
              {pdfAnalyzing ? 'Análisis de PDF en curso...' : 'Máx. 5 bloques simultáneos'}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const handleAIrequestTasksFormArticles = () => {
    setTabIndexTaskOptions(0);
    const evalText = selectedArticles.map((article, index) => {
      const fields = Object.entries(article)
        .map(([key, value]) => `${key}: ${value ?? ''}`)
        .join('\n');

      return `Artículo ${index + 1}:\n${fields}`;
    }).join('\n\n----------------------------------\n\n');

    console.log("Texto para generar tareas desde artículos seleccionados:");
    console.log(evalText);
    
    dispatch(generateTasksFromArticlesWithIA(evalText)).then((data) => {
      const response = data?.payload;
    
      if ( response?.data != null && data?.payload?.messages === 'Success') {
        console.log("AI task TEXT Response");
        console.log(response);
      
        const updatedTaskList = [...taskList, ...response.data];
        handleSetFilterItemValue(storeModule, 'task_data_list', updatedTaskList);
      } else {
        console.log("Respuesta inesperada o vacía:", response);
        if (data?.error?.message === 'Rejected') {
          setDataError(true);
        }
      }
    });
  };

  const extractTextFromPDF = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      let fullText = '';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setPdfProgress(Math.round((pageNum / totalPages) * 100));

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY = -1;
        let pageText = '';
        
        textContent.items.forEach((item) => {
          const y = item.transform[5];
          const text = item.str;
          
          if (lastY !== y && lastY !== -1) {
            pageText += '\n';
          }
          
          pageText += text;
          lastY = y;
        });
        
        pageText = pageText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
        
        pageText = pageText.replace(
          /(ARTÍCULO|ARTICULO)(\s+[A-Z]+\.?)/gi,
          '\n$1$2'
        );
        
        pageText = pageText.replace(/^\n+/, '');
        
        if (pageNum > 1) {
          fullText += '\n\n';
        }
        
        fullText += `${'═'.repeat(10)}\n`;
        fullText += ` PÁGINA ${pageNum}\n`;
        fullText += `${'═'.repeat(10)}\n`;
        fullText += '\n';
        fullText += pageText;
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error);
      throw new Error('No se pudo leer el contenido del PDF');
    }
  };

  const handleUploadPDFdirect = async (filePDF) => {
    try {
      setLoadingPDF(true);
      setPdfProgress(0);

      // 🆕 Create URL for PDF viewer
      const fileUrl = URL.createObjectURL(filePDF);
      setCurrentPdfUrl(fileUrl);
      setCurrentPdfName(filePDF.name);

      const pdfText = await extractTextFromPDF(filePDF);

      if (!pdfText || pdfText.trim() === '') {
        showErrorMsg('No se pudo extraer texto del PDF. El archivo puede estar vacío o contener solo imágenes.');
        return;
      }

      let updatedHistoric = [...historicTextIA];
      let currentPosition = currentHistoricIAPosition;

      if (updatedHistoric.length === 0) {
        updatedHistoric = [{
          id: Date.now(),
          label: `PDF: ${filePDF.name.substring(0, 30)}${filePDF.name.length > 30 ? '...' : ''}`,
          contenido: []
        }];
        currentPosition = 0;
        setCurrentHistoricIAPosition(0);
      }

      const updatedConversation = {
        ...updatedHistoric[currentPosition],
        contenido: [...updatedHistoric[currentPosition].contenido]
      };
      
      updatedConversation.contenido.push({
        role: 'user',
        text: `📄 Archivo PDF cargado: ${filePDF.name} (${(filePDF.size / 1024 / 1024).toFixed(2)} MB)`,
        timestamp: new Date()
      });

      updatedConversation.contenido.push({
        role: 'assistant',
        text: pdfText,
        timestamp: new Date()
      });

      updatedHistoric[currentPosition] = updatedConversation;
      setHistoricTextIA(updatedHistoric);

      setTimeout(() => {
        const chatArea = document.querySelector('.overflow-y-auto.bg-gray-50');
        if (chatArea) {
          chatArea.scrollTop = chatArea.scrollHeight;
        }
      }, 100);

      setSelectedFile(null);
      setPdfProgress(100);

      console.log('✅ PDF procesado exitosamente');

    } catch (error) {
      console.error('Error al procesar PDF:', error);
      toast.error('Error al procesar el archivo PDF. Por favor, intenta nuevamente.', {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });
      
      let updatedHistoric = [...historicTextIA];
      
      if (updatedHistoric.length === 0) {
        updatedHistoric = [{
          id: Date.now(),
          label: 'Error al cargar PDF',
          contenido: []
        }];
        setCurrentHistoricIAPosition(0);
      }
      
      const currentPos = updatedHistoric.length === 0 ? 0 : currentHistoricIAPosition;
      const updatedConversation = {
        ...updatedHistoric[currentPos],
        contenido: [...updatedHistoric[currentPos].contenido]
      };

      updatedConversation.contenido.push({
        role: 'assistant',
        text: '❌ Error al procesar el archivo PDF. Por favor, verifica que el archivo no esté dañado e intenta nuevamente.',
        timestamp: new Date()
      });
      
      updatedHistoric[currentPos] = updatedConversation;
      setHistoricTextIA(updatedHistoric);

    } finally {
      setLoadingPDF(false);
    }
  };
  
  /**
   * Formatea la respuesta de Textract a estructura con tablas separadas
   * @param {Object} response - Respuesta de check_textract_status
   * @returns {Object} - Objeto con texto y tablas estructuradas
   */
  const formatTextractResponse = (response) => {
    try {
      if (!response || !response.data) {
        console.warn('formatTextractResponse: No hay datos en la respuesta');
        return {
          text: '⚠️ No se encontraron datos en la respuesta del servidor.',
          tables: [],
          summary: null
        };
      }

      const data = response.data;

      if (!data.text_content || !Array.isArray(data.text_content)) {
        console.warn('formatTextractResponse: text_content no es un array');
        return {
          text: '⚠️ No se pudo extraer texto del PDF.',
          tables: [],
          summary: null
        };
      }

      if (data.text_content.length === 0) {
        console.warn('formatTextractResponse: text_content está vacío');
        return {
          text: '⚠️ El documento no contiene texto extraíble.',
          tables: [],
          summary: null
        };
      }

      let formattedText = '';
      const allTables = [];

      // Procesar cada página
      data.text_content.forEach((page, pageIndex) => {
        // Separador de páginas
        if (pageIndex > 0) {
          formattedText += '\n\n' + '═'.repeat(50) + '\n';
        }
        
        formattedText += `📄 PÁGINA ${page.page_number}\n`;
        formattedText += '═'.repeat(50) + '\n\n';

        // Procesar contenido de la página
        if (page.content && Array.isArray(page.content)) {
          page.content.forEach((item) => {
            if (item.type === 'text' && item.text) {
              formattedText += item.text + '\n';
            } else if (item.type === 'table_reference') {
              formattedText += '\n📊 [TABLA - Ver abajo]\n\n';
            } else if (item.type === 'image_reference') {
              formattedText += '\n🖼️ ' + item.message + '\n\n';
            }
          });
        }

        // Recolectar tablas de esta página
        if (data.tables && Array.isArray(data.tables)) {
          const pageTables = data.tables.filter(t => t.page === page.page_number);
          allTables.push(...pageTables);
        }
      });

      // Agregar resumen
      let summaryText = '';
      if (data.summary) {
        summaryText = '\n\n' + '═'.repeat(50) + '\n';
        summaryText += '📊 RESUMEN DEL DOCUMENTO\n';
        summaryText += '═'.repeat(50) + '\n';
        summaryText += `Total de páginas: ${data.summary.pages || 0}\n`;
        summaryText += `Líneas de texto: ${data.summary.text_lines || 0}\n`;
        summaryText += `Tablas detectadas: ${data.summary.tables_count || 0}\n`;
        summaryText += `Imágenes detectadas: ${data.summary.images_count || 0}\n`;
        summaryText += `Formularios detectados: ${data.summary.forms_count || 0}\n`;
      }

      return {
        text: formattedText.trim() + summaryText,
        tables: allTables,
        summary: data.summary
      };

    } catch (error) {
      console.error('Error al formatear respuesta de Textract:', error);
      return {
        text: '❌ Error al procesar el texto extraído del PDF.',
        tables: [],
        summary: null
      };
    }
  };

  // 🆕 Función para análisis con Streaming (Localhost 8000)
  const handleUploadPDFStreaming = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.warning('Por favor selecciona un archivo PDF válido.', {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });
      return;
    }

    // 🆕 Crear URL del archivo para el visor PDF
    const fileUrl = URL.createObjectURL(file);
    setCurrentPdfUrl(fileUrl);
    setCurrentPdfName(file.name);

    setLoadingPDF(true);
    setPdfProgress(0);
    setProcessingStatusPDF('Iniciando análisis por streaming...');

    // Inicializar chat
    let updatedHistoric = [...historicTextIA];
    let currentPosition = currentHistoricIAPosition;

    if (updatedHistoric.length === 0) {
      updatedHistoric = [{
        id: Date.now(),
        label: `PDF Stream: ${file.name.substring(0, 30)}...`,
        contenido: []
      }];
      currentPosition = 0;
      setCurrentHistoricIAPosition(0);
    }

    const userMsgConversation = {
      ...updatedHistoric[currentPosition],
      contenido: [...updatedHistoric[currentPosition].contenido]
    };
    
    userMsgConversation.contenido.push({
      role: 'user',
      text: `📡 Analizando vía Streaming: ${file.name}`,
      timestamp: new Date()
    });
    
    // Mensaje inicial del asistente que iremos actualizando
    userMsgConversation.contenido.push({
      role: 'assistant',
      text: 'Conectando con el servidor de análisis...',
      timestamp: new Date(),
      streaming: true // Flag para indicar que se está generando
    });

    updatedHistoric[currentPosition] = userMsgConversation;
    setHistoricTextIA(updatedHistoric);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = await getToken();
      if (!token) throw new Error('No autenticado — token no encontrado');
      const iaBaseUrl = (window.__APP_CONFIG__?.api_url_ia || 'http://localhost:8000/').replace(/\/$/, '');
      const response = await fetch(`${iaBaseUrl}/analyze/pdf/stream`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body.getReader(); 
      const decoder = new TextDecoder(); 
      let fullResponseText = "";
      let obligationsFound = [];
      
      const processChunk = (chunk) => {
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '');
              const data = JSON.parse(jsonStr);
              
              console.log("Evento recibido:", data);
              
              if (data.event === 'start') {
                 fullResponseText += `🚀 Iniciando análisis de ${data.total_sections} secciones...`;
              } else if (data.event === 'obligation_detected') {
                 // 🆕 Extraer el artículo analizado y agregarlo al estado visual
                 const article = data.analysis;
                 
                 if (article) {
                    setArticles(prev => [...prev, { ...article, id_requisito: id_requisito_actual }]);
                    
                    fullResponseText += `\n\n📌 **${article.article_number} detectado:**\n`;
                    fullResponseText += `- ${article.description}\n`;
                    fullResponseText += `- Sujeto: ${article.subject}\n`;
                    fullResponseText += `- Prioridad: ${article.priority}`;
                 }
              } else if (data.event === 'complete') {
                 fullResponseText += `\n\n✅ **Análisis terminado**`;
                 // Cambiar a la pestaña de artículos al finalizar
                 setTabIndexArticle(0);
              } else if (data.message) {
                 fullResponseText += `\n${data.message}`;
              }
              
              // Actualizar el chat en tiempo real
              setHistoricTextIA(prev => {
                const newHistory = [...prev];
                const conv = { ...newHistory[currentPosition] };
                const msgs = [...conv.contenido];
                // Actualizar el último mensaje (el del asistente)
                msgs[msgs.length - 1] = {
                    ...msgs[msgs.length - 1],
                    text: fullResponseText || "Procesando...",
                };
                conv.contenido = msgs;
                newHistory[currentPosition] = conv;
                return newHistory;
              });

            } catch (e) {
              console.warn("Error parseando chunk JSON:", e);
            }
          }
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) { 
        const { value, done } = await reader.read(); 
        if (done) break; 
        
        const chunk = decoder.decode(value, { stream: true }); 
        processChunk(chunk);
      } 
      
      setProcessingStatusPDF('Completado');
      setPdfProgress(100);

    } catch (error) { 
      console.error("Error en streaming:", error);
      setProcessingStatusPDF('Error');
      
      setHistoricTextIA(prev => {
        const newHistory = [...prev];
        const conv = { ...newHistory[currentPosition] };
        const msgs = [...conv.contenido];
        msgs.push({
            role: 'assistant',
            text: `❌ Error de conexión: ${error.message}`,
            timestamp: new Date()
        });
        conv.contenido = msgs;
        newHistory[currentPosition] = conv;
        return newHistory;
      });

    } finally {
        setLoadingPDF(false);
        e.target.value = null;
    }
  };

  // 🆕 Manejador para análisis completo de PDF
  const handlePdfAnalysis = (data) => {
    console.log('PDF Analysis Event:', data);

    if (data.status === 'start') {
      setPdfAnalyzing(true);
      setPdfAnalysisMessage(data.message);
      setPdfArticlesDetected(0);
      setPdfAnalysisProgress(0);
      setTabIndexArticle(0); // Cambiar a tab "Lista"
    } else if (data.status === 'processing') {
      setPdfAnalysisMessage(data.message);
      if (data.totalSections) {
        // Configurar progreso basado en total de secciones
        setProgress({ current: 0, total: data.totalSections });
      }
    } else if (data.status === 'article_detected') {
      // Agregar artículo a la lista
      const article = data.article;
      setArticles(prev => [...prev, article]);
      setPdfArticlesDetected(data.totalDetected);
      setPdfAnalysisMessage(`📌 ${data.totalDetected} artículos detectados...`);
      
      // Actualizar progreso
      if (progress.total > 0) {
        setProgress(prev => ({ ...prev, current: data.totalDetected }));
      }
    } else if (data.status === 'complete') {
      setPdfAnalyzing(false);
      setPdfAnalysisMessage(data.message);
      setPdfAnalysisProgress(100);
      setProgress({ current: data.totalDetected, total: data.totalDetected });
      
      toast.success(`Análisis completado: ${data.totalDetected} artículos encontrados`, {
        position: 'top-right',
        containerId: 'analysis-regulation-container',
        autoClose: 5000
      });
    } else if (data.status === 'error') {
      setPdfAnalyzing(false);
      setPdfAnalysisMessage(data.message);
      
      toast.error('Error en el análisis del PDF', {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });
    }
  };

  // 🆕 Manejador para análisis de imagen desde PDFViewerComponent
  // Función simple para cargar PDF sin procesar con API
  const handleSimplePDFUpload = (file) => {
    if (!file) return;
    
    // Crear URL para el visor
    const fileUrl = URL.createObjectURL(file);
    setCurrentPdfUrl(fileUrl);
    setCurrentPdfName(file.name);
    
    // Cambiar a vista PDF
    setViewMode('pdf');
    
    showSuccessMsg(`PDF cargado: ${file.name}`);
  };

  const handleImageAnalysis = async (captureData) => {
    const { 
      imageBlobs,      // Array de blobs
      pageIndexes,     // Array de índices de páginas
      fileNames,       // Array de nombres de archivo
      dimensions,      // Array de dimensiones
      note_reference, 
      noteTitle, 
      noteDescription,
      totalImages
    } = captureData;
    
    console.log('📸 Iniciando análisis de imágenes capturadas:', {
      totalImages,
      pages: pageIndexes.map(p => p + 1),
      totalSize: `${(imageBlobs.reduce((sum, blob) => sum + blob.size, 0) / 1024).toFixed(2)} KB`
    });
    
    // Convertir todos los imageBlobs a base64 para almacenar en Redux
    const convertPromises = imageBlobs.map(blob => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    });
    
    const imagesBase64 = await Promise.all(convertPromises);
    
    // Actualizar el chat con mensaje inicial
    const updatedHistoric = [...historicTextIA];
    const currentPosition = currentHistoricIAPosition;
    
    const updatedConversation = {
      ...updatedHistoric[currentPosition],
      contenido: [...updatedHistoric[currentPosition].contenido]
    };
    
    // Agregar mensaje del usuario sobre la captura
    updatedConversation.contenido.push({
      role: 'user',
      text: `📸 Analizando ${totalImages} página${totalImages !== 1 ? 's' : ''} seleccionada${totalImages !== 1 ? 's' : ''} (páginas ${pageIndexes.map(p => p + 1).join(', ')})${noteTitle ? ` - ${noteTitle}` : ''}`,
      timestamp: new Date()
    });
    
    // Mensaje inicial del asistente
    updatedConversation.contenido.push({
      role: 'assistant',
      text: '🔍 Conectando con el servidor de análisis de imagen...',
      timestamp: new Date(),
      streaming: true
    });
    
    updatedHistoric[currentPosition] = updatedConversation;
    setHistoricTextIA(updatedHistoric);
    
    setLoading(true); // Activar skeleton loader
    setLoadingPDF(true);
    setTabIndexArticle(0); // Cambiar a la pestaña de artículos
    
    try {
      const formData = new FormData();
      
      // Agregar todas las imágenes con el mismo campo 'files'
      imageBlobs.forEach((blob, index) => {
        formData.append('files', blob, fileNames[index]);
      });
      
      if (note_reference) {
        formData.append('note_reference', note_reference);
      }
      
      const token = await getToken();
      if (!token) {
        throw new Error('No autenticado — token no encontrado');
      }

      const iaBaseUrl = (window.__APP_CONFIG__?.api_url_ia || 'http://localhost:8000/').replace(/\/$/, '');
      const response = await fetch(`${iaBaseUrl}/analyze/image/stream`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        throw new Error('Sesión expirada — vuelve a iniciar sesión');
      }

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponseText = '';
      let detectedElements = [];
      let totalImagesProcessed = 0;
      let sseBuffer = '';

      const processChunk = (chunk) => {
        sseBuffer += chunk;
        const lines = sseBuffer.split('\n\n');
        sseBuffer = lines.pop(); // conservar fragmento incompleto

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
              const jsonStr = line.replace('data: ', '').trim();
              const data = JSON.parse(jsonStr);
              
              console.log('📥 Evento recibido:', data.event, data);
              
              if (data.event === 'start') {
                fullResponseText = `🚀 Iniciando análisis de ${data.total_images || totalImages} imagen${data.total_images !== 1 ? 'es' : ''}...\n`;
                fullResponseText += `📋 Modo: ${data.processing_mode === 'sequential_context' ? 'Contexto secuencial (multi-página)' : 'Estándar'}\n\n`;
              } 
              else if (data.event === 'obligation_detected') {
                const analysis = data.analysis;
                
                // Agregar el artículo a la lista con TODAS las imágenes asociadas
                if (analysis) {
                  const articleWithImages = {
                    ...analysis,
                    id_requisito: id_requisito_actual,
                    _imagesBase64: imagesBase64,         // Array de base64
                    _noteTitle: noteTitle,
                    _noteDescription: noteDescription,
                    _pageIndexes: pageIndexes,           // Array de páginas origen
                    _totalImages: totalImages,
                    _noteReference: note_reference
                  };
                  setArticles(prev => [...prev, articleWithImages]);
                  
                  fullResponseText += `\n📌 **${analysis.number || analysis.type}${analysis.parent ? ` (hijo de ${analysis.parent})` : ''} detectado:**\n`;
                  fullResponseText += `   ${analysis.description}\n`;
                  fullResponseText += `   - Sujeto: ${analysis.subject || 'N/A'}\n`;
                  fullResponseText += `   - Prioridad: ${analysis.priority || 'N/A'}\n`;
                  fullResponseText += `   - Plazo: ${analysis.deadline || 'N/A'}\n`;
                  fullResponseText += `   - ID: ${analysis.id_process}\n`;
                  
                  detectedElements.push(analysis);
                }
              } 
              else if (data.event === 'complete') {
                const stats = data.stats || {};
                totalImagesProcessed = stats.total_images_processed || totalImages;
                
                fullResponseText += `\n\n✅ **Análisis completado**\n`;
                fullResponseText += `   - Total elementos: ${stats.total_elements || detectedElements.length}\n`;
                fullResponseText += `   - Imágenes procesadas: ${totalImagesProcessed}/${totalImages}\n`;
                fullResponseText += `   - Calidad de imagen: ${stats.image_quality || 'N/A'}\n`;
                fullResponseText += `   - Confianza: ${stats.confidence ? (stats.confidence * 100).toFixed(1) + '%' : 'N/A'}\n`;
              } 
              else if (data.event === 'fatal_error') {
                fullResponseText += `\n\n❌ **Error:** ${data.error}\n`;
              }
              
              // Actualizar el chat en tiempo real
              setHistoricTextIA(prev => {
                const newHistory = [...prev];
                const conv = { ...newHistory[currentPosition] };
                const msgs = [...conv.contenido];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  text: fullResponseText || "Procesando imágenes...",
                  streaming: data.event !== 'complete' && data.event !== 'fatal_error'
                };
                conv.contenido = msgs;
                newHistory[currentPosition] = conv;
                return newHistory;
              });
              
          } catch (e) {
            console.warn('⚠️ Error parseando evento SSE:', e);
          }
        }
      };
      
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        processChunk(chunk);
      }
      
      console.log(`✅ Análisis completado: ${detectedElements.length} elementos detectados de ${totalImagesProcessed} imágenes`);
      
      // Auto-scroll al final del chat
      setTimeout(() => {
        const chatArea = document.querySelector('.overflow-y-auto.bg-gray-50');
        if (chatArea) {
          chatArea.scrollTop = chatArea.scrollHeight;
        }
      }, 100);
      
      toast.success(`Análisis completado: ${detectedElements.length} elemento${detectedElements.length !== 1 ? 's' : ''} detectado${detectedElements.length !== 1 ? 's' : ''} de ${totalImagesProcessed} página${totalImagesProcessed !== 1 ? 's' : ''}`, {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });
      
    } catch (error) {
      console.error('❌ Error en análisis de imagen:', error);
      
      setHistoricTextIA(prev => {
        const newHistory = [...prev];
        const conv = { ...newHistory[currentPosition] };
        const msgs = [...conv.contenido];
        msgs[msgs.length - 1] = {
          ...msgs[msgs.length - 1],
          text: `❌ Error al analizar imágenes: ${error.message}`,
          streaming: false
        };
        conv.contenido = msgs;
        newHistory[currentPosition] = conv;
        return newHistory;
      });
      
      toast.error(`Error: ${error.message}`, {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });
    } finally {
      setLoading(false); // Desactivar skeleton loader
      setLoadingPDF(false);
    }
  };

  const handleUploadPDFNewAPI = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.warning('Por favor selecciona un archivo PDF válido.', {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });
      return;
    }

    if (!id_requisito_actual && storeModule === 'LegalMatriz') {
      toast.error('No hay un requisito seleccionado.', {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });
      return;
    }

    // 🆕 Crear URL del archivo para el visor PDF
    const fileUrl = URL.createObjectURL(file);
    setCurrentPdfUrl(fileUrl);
    setCurrentPdfName(file.name);

    setLoadingPDF(true);
    setPdfProgress(0);
    setProcessingStatusPDF('Iniciando subida...');
    
    // Resetear estados
    setArticles([]);
    setSelectedArticles([]);

    const formData = new FormData();
    formData.append('file', file);
    if (id_requisito_actual) {
      formData.append('id_requisito', id_requisito_actual);
    }

    // Inicializar chat con mensaje de usuario
    let updatedHistoric = [...historicTextIA];
    let currentPosition = currentHistoricIAPosition;

    if (updatedHistoric.length === 0) {
      updatedHistoric = [{
        id: Date.now(),
        label: `PDF: ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}`,
        contenido: []
      }];
      currentPosition = 0;
      setCurrentHistoricIAPosition(0);
    }

    const userMsgConversation = {
      ...updatedHistoric[currentPosition],
      contenido: [...updatedHistoric[currentPosition].contenido]
    };
    
    userMsgConversation.contenido.push({
      role: 'user',
      text: `📄 Procesando documento legal: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      timestamp: new Date()
    });
    
    updatedHistoric[currentPosition] = userMsgConversation;
    setHistoricTextIA(updatedHistoric);

    try {
      // PASO 1: SUBIR EL PDF
      setProcessingStatusPDF('Subiendo archivo...');
      
      const response = await axios.post(
        `${API_URL}message_center_api/legal_api/get_legal_pdf_data`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const { success, job_id } = response.data;

      if (!success || !job_id) {
        throw new Error(response.data.error || 'No se recibió un Job ID para el procesamiento.');
      }

      // Actualizar progreso: 10%
      setPdfProgress(10);
      setProcessingStatusPDF('PDF subido, procesando...');
      console.log(`✅ Paso 1 completado. Job ID: ${job_id}`);

      // PASO 2: CONSULTAR ESTADO DE TEXTRACT (POLLING)
      let textractComplete = false;
      const textractPollInterval = 3000; // 3 segundos

      while (!textractComplete) {
        await new Promise(resolve => setTimeout(resolve, textractPollInterval));

        const statusFormData = new FormData();
        statusFormData.append('job_id', job_id);

        const statusResponse = await axios.post(
          `${API_URL}message_center_api/legal_api/check_textract_status`,
          statusFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        const data = statusResponse.data;

        if (data.status === 'IN_PROGRESS') {
          // Actualizar progreso (10% a 40%)
          setPdfProgress(prev => {
             // Incrementar poco a poco hasta 40
             return prev < 40 ? prev + 5 : 40;
          });
          setProcessingStatusPDF(`Extrayendo texto... ${data.progress ? data.progress + '%' : ''}`);
        } else if (data.status === 'SUCCEEDED' || data.legal_processing_started === true) {
          textractComplete = true;
          setPdfProgress(40);
          setProcessingStatusPDF('Extracción completada, analizando contenido legal...');
          console.log('✅ Paso 2 completado. Textract finalizado.');
        } else if (data.status === 'FAILED') {
          throw new Error(data.error || 'Falló la extracción de texto (Textract).');
        }
      }

      // PASO 3: CONSULTAR ESTADO DE PROCESAMIENTO LEGAL (POLLING)
      let legalProcessComplete = false;
      const legalPollInterval = 5000; // 5 segundos
      let finalArticles = null;
      const pollingStartTime = Date.now();
      let longWaitWarningShown = false;

      while (!legalProcessComplete) {
        // Verificar si han pasado más de 15 minutos
        if (!longWaitWarningShown && (Date.now() - pollingStartTime > 15 * 60 * 1000)) {
            toast.info("El documento es muy grande, esto puede tardar más tiempo...", {
                position: 'top-right',
                autoClose: 10000,
                containerId: 'analysis-regulation-container'
            });
            longWaitWarningShown = true;
        }

        await new Promise(resolve => setTimeout(resolve, legalPollInterval));

        const statusFormData = new FormData();
        statusFormData.append('job_id', job_id);

        const statusResponse = await axios.post(
          `${API_URL}message_center_api/legal_api/check_legal_process_status`,
          statusFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        const data = statusResponse.data;
        const legalStatus = data.legal_processing?.status;
        const stage = data.legal_processing?.stage;

        if (legalStatus === 'FAILED') {
           throw new Error(data.legal_processing?.error || 'Falló el procesamiento legal.');
        }

        if (legalStatus === 'COMPLETED') {
          legalProcessComplete = true;
          setPdfProgress(100);
          setProcessingStatusPDF('Proceso completado');
          finalArticles = data.articles;
          console.log('✅ Paso 3 completado. Análisis legal finalizado.');
        } else {
          // Manejar estados intermedios
          if (stage === 'STAGE_2' || legalStatus === 'PREPROCESSING') {
             setPdfProgress(25);
             setProcessingStatusPDF('Limpiando texto...');
          } else if (stage === 'STAGE_3' || legalStatus === 'SEGMENTING') {
             setPdfProgress(40);
             const total = data.legal_processing?.total_segments || 0;
             setProcessingStatusPDF(`Identificando artículos (${total} encontrados)...`);
          } else if (stage === 'STAGE_4' || legalStatus === 'PROCESSING_BEDROCK') {
             setPdfProgress(65);
             const processed = data.legal_processing?.segments_processed || 0;
             const total = data.legal_processing?.total_segments || 0;
             setProcessingStatusPDF(`Analizando artículos (${processed}/${total})...`);
          } else if (stage === 'STAGE_5' || legalStatus === 'POSTPROCESSING') {
             setPdfProgress(95);
             setProcessingStatusPDF('Consolidando resultados...');
          } else {
             // Default progress increment if status is unknown but not failed
             setPdfProgress(prev => prev < 95 ? prev + 1 : 95);
          }
        }
      }

      // FIN DEL PROCESO EXITOSO
      if (finalArticles) {
        // Actualizar artículos en la vista
        const articlesWithRequisito = finalArticles.map(art => ({ 
          ...art, 
          id_requisito: id_requisito_actual 
        }));
        setArticles(articlesWithRequisito);
        
        // Agregar mensaje final al chat
        setHistoricTextIA(prev => {
          const newHistory = [...prev];
          if (!newHistory[currentPosition]) return prev;

          const finalConversation = {
            ...newHistory[currentPosition],
            contenido: [...newHistory[currentPosition].contenido]
          };

          finalConversation.contenido.push({
            role: 'assistant',
            text: `✅ Proceso completado exitosamente.\n\nSe han extraído y analizado ${finalArticles.length} artículos/obligaciones del documento. Puedes ver los detalles en la pestaña "Articles list".`,
            timestamp: new Date()
          });

          newHistory[currentPosition] = finalConversation;
          return newHistory;
        });

        toast.success(`Análisis completado: ${finalArticles.length} artículos encontrados`, {
          position: 'top-right',
          containerId: 'analysis-regulation-container'
        });
        
        // Cambiar a la pestaña de lista de artículos para que el usuario vea el resultado
        setTabIndexArticle(0);
      }

      setSelectedFile(null); 
      
      setTimeout(() => {
        const chatArea = document.querySelector('.overflow-y-auto.bg-gray-50');
        if (chatArea) {
          chatArea.scrollTop = chatArea.scrollHeight;
        }
      }, 100);

    } catch (error) {
      console.error('Error in PDF processing workflow:', error);
      setProcessingStatusPDF('Error');
      setPdfProgress(0);
      
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
      
      toast.error(`Error: ${errorMessage}`, {
        position: 'top-right',
        containerId: 'analysis-regulation-container'
      });

      setHistoricTextIA(prev => {
        const newHistory = [...prev];
        if (!newHistory[currentPosition]) return prev;

        const errorConversation = {
          ...newHistory[currentPosition],
          contenido: [...newHistory[currentPosition].contenido]
        };

        errorConversation.contenido.push({
          role: 'assistant',
          text: `❌ Error durante el procesamiento: ${errorMessage}`,
          timestamp: new Date()
        });
        
        newHistory[currentPosition] = errorConversation;
        return newHistory;
      });

    } finally {
      setLoadingPDF(false);
      e.target.value = null;
    }
  };

  const handleFilePDFChange = (e) => {
    const filePDF = e.target.files[0];
    
    if (filePDF && filePDF.type === 'application/pdf') {
      setSelectedFile(filePDF);
      handleUploadPDFdirect(filePDF);
    } else {
      alert('Por favor selecciona un archivo PDF válido.');
    }
  };

  const getCriticityColor = (level) => {
    switch (level) {
      case 'Alta':
        return 'error';
      case 'Media':
        return 'warning';
      case 'Baja':
        return 'success';
      default:
        return 'default';
    }
  };

  // Funciones auxiliares para manejo de jerarquía
  const getChildren = (parentId, articlesList) => {
    return articlesList.filter(art => art.parent === parentId);
  };

  const getChildrenIds = (parentId, articlesList) => {
    const children = getChildren(parentId, articlesList);
    let ids = children.map(child => child.id_process);
    children.forEach(child => {
      ids = [...ids, ...getChildrenIds(child.id_process, articlesList)];
    });
    return ids;
  };

  const buildHierarchicalList = (articlesList) => {
    // Primero ordenar por section_index
    const sorted = [...articlesList].sort((a, b) => {
      const indexA = a.section_index ?? Infinity;
      const indexB = b.section_index ?? Infinity;
      return indexA - indexB;
    });

    // Construir estructura jerárquica
    const result = [];
    const processedIds = new Set();

    const addArticleWithChildren = (article, level = 0) => {
      if (processedIds.has(article.id_process)) return;
      processedIds.add(article.id_process);
      
      result.push({ ...article, _level: level });
      
      // Agregar hijos inmediatamente después del padre
      const children = sorted.filter(art => 
        art.parent === article.id_process && !processedIds.has(art.id_process)
      );
      children.forEach(child => addArticleWithChildren(child, level + 1));
    };

    // Procesar artículos raíz (sin parent o parent vacío)
    sorted.forEach(article => {
      if (!article.parent || article.parent === '') {
        addArticleWithChildren(article, 0);
      }
    });

    return result;
  };

  const handleSelectArticle = (data) => {
    console.log("Selecting article:", data);
    setSelectedArticles((prev) => {
      const alreadySelected = prev.some((item) => item.id_process === data.id_process);
      if (alreadySelected) {
        // Deseleccionar artículo y sus hijos recursivamente
        const childIds = getChildrenIds(data.id_process, articles);
        return prev.filter((item) => item.id_process !== data.id_process && !childIds.includes(item.id_process));
      } else {
        // Seleccionar artículo y todos sus hijos recursivamente
        const children = getAllDescendants(data.id_process, articles);
        const toSelect = [data, ...children];
        // Evitar duplicados
        const existingIds = new Set(prev.map(item => item.id_process));
        const newSelections = toSelect.filter(item => !existingIds.has(item.id_process));
        return [...prev, ...newSelections];
      }
    });
  };

  const getAllDescendants = (parentId, articlesList) => {
    const children = getChildren(parentId, articlesList);
    let descendants = [...children];
    children.forEach(child => {
      descendants = [...descendants, ...getAllDescendants(child.id_process, articlesList)];
    });
    return descendants;
  };

  const isArticleSelected = (data) =>
    selectedArticles.some((item) => item.id_process === data.id_process);

  const handleSelectAllArticles = (event) => {
    if (event.target.checked) {
      setSelectedArticles(articles);
    } else {
      setSelectedArticles([]);
    }
  };

  const handleArticleDrop = (draggedArticle, targetArticle, position) => {
    setArticles((prevArticles) => {
      const updatedArticles = [...prevArticles];
      
      if (position === 'inside') {
        // Anidación: cambiar el parent del artículo arrastrado
        const articleIndex = updatedArticles.findIndex(art => art.id_process === draggedArticle.id_process);
        if (articleIndex !== -1) {
          updatedArticles[articleIndex] = {
            ...updatedArticles[articleIndex],
            parent: targetArticle.id_process
          };
        }
        showSuccessMsg(`Artículo movido dentro de "${targetArticle.article_number || targetArticle.number}"`);
      } else if (position === 'before' || position === 'after') {
        // Reordenamiento: cambiar section_index para colocar antes o después del target
        const targetIndex = updatedArticles.findIndex(art => art.id_process === targetArticle.id_process);
        const draggedIndex = updatedArticles.findIndex(art => art.id_process === draggedArticle.id_process);
        
        if (targetIndex !== -1 && draggedIndex !== -1) {
          const targetSectionIndex = updatedArticles[targetIndex].section_index || 0;
          
          // Mantener el mismo parent que el artículo objetivo (para que queden al mismo nivel)
          updatedArticles[draggedIndex] = {
            ...updatedArticles[draggedIndex],
            parent: updatedArticles[targetIndex].parent || '',
            section_index: position === 'before' ? targetSectionIndex - 0.5 : targetSectionIndex + 0.5
          };
          
          // Reindexar todos los elementos para mantener orden limpio
          const sortedArticles = [...updatedArticles].sort((a, b) => {
            const indexA = a.section_index ?? Infinity;
            const indexB = b.section_index ?? Infinity;
            return indexA - indexB;
          });
          
          // Asignar nuevos índices secuenciales
          sortedArticles.forEach((art, idx) => {
            const originalIndex = updatedArticles.findIndex(a => a.id_process === art.id_process);
            if (originalIndex !== -1) {
              updatedArticles[originalIndex] = {
                ...updatedArticles[originalIndex],
                section_index: idx
              };
            }
          });
          
          showSuccessMsg(`Artículo reordenado ${position === 'before' ? 'antes' : 'después'} de "${targetArticle.article_number || targetArticle.number}"`);
        }
      }
      
      return updatedArticles;
    });
  };

  const handleDeleteArticle = (articleToDelete) => {
    setArticles(prevArticles => {
      // Eliminar el artículo y todos sus descendientes
      const getAllDescendantIds = (parentId) => {
        const children = prevArticles.filter(art => art.parent === parentId);
        let ids = children.map(c => c.id_process);
        children.forEach(child => {
          ids = [...ids, ...getAllDescendantIds(child.id_process)];
        });
        return ids;
      };

      const idsToRemove = [articleToDelete.id_process, ...getAllDescendantIds(articleToDelete.id_process)];
      const filteredArticles = prevArticles.filter(art => !idsToRemove.includes(art.id_process));
      
      showSuccessMsg(`Artículo "${articleToDelete.article_number || articleToDelete.number}" eliminado${idsToRemove.length > 1 ? ` junto con ${idsToRemove.length - 1} hijo(s)` : ''}`);
      
      return filteredArticles;
    });

    // También remover de selección si estaba seleccionado
    setSelectedArticles(prevSelected => 
      prevSelected.filter(art => art.id_process !== articleToDelete.id_process)
    );
  };

  const areAllArticlesSelected = articles.length > 0 && selectedArticles.length === articles.length;

  const handleConfirmDelete = () => {
    const temporalList = legacyDataList.filter((_, i) => i !== deleteIndex);
    handleSetFilterItemValue(storeModule, 'article_data_list', temporalList);
    setConfirmOpen(false);
    setDeleteIndex(null);
  };
  // Helper function para renderizar contenido del tab 1 (Obligaciones guardadas)
  const renderTabContent1 = () => {
    if (loadingAIdata && legacyDataList.length === 0 && !dataError) {
      return (
        <>
          {[...Array(4)].map((_, index) => (
            <Box key={index} display="flex" flexDirection="row" gap={2} mb={4}>
              <Skeleton variant="circular" width={60} height={60} />
              <Skeleton variant="rounded" width="80%" height={60} />
            </Box>
          ))}
          <Typography variant="h6" align="center" color="gray">
            {t('loading_ai')}
          </Typography>
        </>
      );
    }

    if (legacyDataList.length > 0 && !dataError) {
      return (
        <List
          component="nav"
          sx={{
            width: '100%',
            border: '1px solid rgb(209, 208, 208)',
            borderRadius: '8px',
            padding: '0'
          }}
        >
          {legacyDataList.map((data, index) => (
            <Fragment key={index}>
              <ListItemButton disableRipple>
                <Checkbox
                  edge="start"
                  checked={isArticleSelected(data)}
                  tabIndex={-1}
                  disableRipple
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelectArticle(data)}
                  sx={{ mr: 0.5 }}
                />

                {openList[index] ? <ExpandLess onClick={() => toggleListOpen(index)} /> : <ExpandMore onClick={() => toggleListOpen(index)} />}

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexGrow={1}
                  sx={{ ml: 1 }}
                >
                  <ListItemText primary={data.requirement_name} />

                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteIndex(index);
                      setConfirmOpen(true);
                    }}
                    sx={{ color: 'gray', mr: 1 }}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <IconButton onClick={handleMenuOpen}>
                  <MoreVert />
                </IconButton>

              </ListItemButton>

              <Collapse in={!!openList[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton sx={{ pl: 4, marginBottom: 2 }} disableRipple>
                    <ListItemIcon>
                      <LabelImportant />
                    </ListItemIcon>

                    <Box display="flex" flexDirection="column" flexGrow={1} gap={1}>
                      <ListItemText
                        primary={`Descripción: ${data.requirement_description}`}
                        secondary={`Artículo: ${data.article_name}`}
                      />

                      <Box display="flex" alignItems="center" gap={2}>
                        {data?.date_of_enforcement && (
                          <Tooltip title="Expiration Date">
                            <Typography variant="body2">{data?.date_of_enforcement}</Typography>
                          </Tooltip>
                        )}
                      </Box>

                      <Box display="flex" alignItems="center" gap={2}>
                        <Tooltip title={t("Criticity")}>
                          <Chip
                            label={t(data["criticity"])}
                            color={getCriticityColor(data["criticity"])}
                            size="small"
                          />
                        </Tooltip>
                      </Box>

                      <Box display="flex" alignItems="center" gap={2}>
                        {data?.related_rule && (
                          <Tooltip title="Norma relacionada">
                            <Typography variant="body2">{data?.related_rule}</Typography>
                          </Tooltip>
                        )}
                      </Box>

                    </Box>
                  </ListItemButton>
                </List>
              </Collapse>

              <Divider />
            </Fragment>
          ))}
        </List>
      );
    }

    if (dataError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={2}
          m={2}
        >
          <ContentPasteOffIcon sx={{ fontSize: 100 }} />
          <Typography variant="h6" color="textSecondary">
            {t('Error loading data')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('emptyEventDesc')}
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={2}
        m={2}
      >
        <ContentPasteOffIcon sx={{ fontSize: 100 }} />
        <Typography variant="h6" color="textSecondary">
          {t('No data available')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('emptyEventDesc')}
        </Typography>
      </Box>
    );
  };

  // ==================== RETURN / JSX ====================
  return (
    <>
      <Box flex={1} pt={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            //gap: 2,
            width: '100%',
            //mt: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                width: '100%',
                //mt: 2,
              }}
            >
              {/* ===== COLUMNA 1 (IZQUIERDA) - Vista conmutable ===== */}
              <Box flex={6} pt={0}>
                <Box display="flex" flexDirection="column" gap={0}>

                  {/* 🆕 SELECTOR DE VISTA */}
                  <ViewModeSwitcher
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    pdfAvailable={!!currentPdfUrl}
                    onUploadPdf={handleSimplePDFUpload}
                    toolbarVisible={pdfToolbarVisible}
                    onToggleToolbar={() => setPdfToolbarVisible(!pdfToolbarVisible)}
                    showUploadButton={showActionButtons}
                  />

                  {/* VISTA PDF */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '800px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#fff'
                    }}
                  >
                    <PDFViewerComponent
                      pdfUrl={currentPdfUrl}
                      fileName={currentPdfName}
                      requisito_id={id_requisito_actual}
                      onImageAnalysis={handleImageAnalysis}
                      onPdfAnalysis={handlePdfAnalysis}
                      toolbarVisible={pdfToolbarVisible}
                    />
                  </Box>
                </Box>
              </Box>

              {/* ===== COLUMNA 2 (DERECHA) - Tabs ===== */}
              <Box
                sx={{
                  flex: 4,
                  borderLeft: '1px solid #ccc',
                  pl: 2,
                }}
              >
                <Box flex={1} pt={2}>
                  {/* TABS */}
                  <Tabs
                    value={tabIndexArticle}
                    onChange={(e, newValue) => setTabIndexArticle(newValue)}
                    className='mb-4'
                  >
                    <Tab label={t("list")} sx={{ display: showArticleTabs ? undefined : 'none' }} />
                    <Tab label={t("Artículos")} sx={{ display: showArticleTabs ? undefined : 'none' }} />
                    <Tab label={t("Chat norma")} />
                    <Tab label={t("Análisis ampliado")} />
                  </Tabs>

                  {/* ========== TAB 0: Articles list ========== */}
                  {tabIndexArticle === 0 && (
                    <>
                      <ProcessingProgressBar progress={progress} loading={loading} />

                      <ArticlesList
                        articles={articles}
                        selectedArticles={selectedArticles}
                        openList={openList}
                        loading={loading}
                        error={error}
                        metadata={metadata}
                        onToggleList={toggleListOpen}
                        onSelectArticle={handleSelectArticle}
                        onSelectAll={handleSelectAllArticles}
                        isArticleSelected={isArticleSelected}
                        onArticleDrop={handleArticleDrop}
                        onDeleteArticle={handleDeleteArticle}
                      />
                    </>
                  )}

                  {/* ========== TAB 1: Obligaciones ========== */}
                  {tabIndexArticle === 1 && (
                    <SelectedArticlesList
                      selectedArticles={selectedArticles}
                      openList={openList}
                      requisitoId={id_requisito_actual}
                      onToggleList={toggleListOpen}
                      onSelectArticle={handleSelectArticle}
                      onClearSelection={() => setSelectedArticles([])}
                      onArticleSaved={handleArticleSaved}
                      onArticleDrop={handleArticleDrop}
                      onCreateNewArticle={handleCreateNewArticle}
                    />
                  )}

                  {/* ========== TAB 2: Chat norma ========== */}
                  {tabIndexArticle === 2 && (
                    <ChatNormaTab
                      userText={userText}
                      setUserText={setUserText}
                      onSend={handleCustomQuery}
                      onClear={handleClearChatNorma}
                      loading={loadingQueryWithContext}
                      messages={historicTextIA[currentHistoricIAPosition]?.contenido || []}
                    />
                  )}

                  {/* ========== TAB 3: Análisis ampliado ========== */}
                  {tabIndexArticle === 3 && (
                    <>
                      <Typography variant="h6" color="primary" mb={2}>
                        Análisis en la base de conocimientos
                      </Typography>
                      <KnowledgeBaseTab
                        userText={userText2}
                        setUserText={setUserText2}
                        onSend={handleCustomQuery_knowledge_base}
                        loading={loadingKnowledgeBase}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <DeleteConfirmationDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={''}
        />
        <ToastContainer
          enableMultiContainer
          containerId="analysis-regulation-container"
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999999 }}
        />
      </Box>
    </>
  );
}