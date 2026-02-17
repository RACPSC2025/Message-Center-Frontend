import { Fragment, useState, useMemo } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { 
  ExpandLess, 
  ExpandMore, 
  DragIndicator, 
  Visibility, 
  Image as ImageIcon,
  Close,
  ArrowBack,
  ArrowForward,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';
import { useTranslation } from 'react-i18next';

const ArticlesList = ({
  articles,
  selectedArticles,
  openList,
  loading,
  error,
  metadata,
  onToggleList,
  onSelectArticle,
  onSelectAll,
  isArticleSelected,
  onArticleDrop,
  onDeleteArticle
}) => {
  const { t } = useTranslation();
  const [draggedArticle, setDraggedArticle] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'before', 'after', 'inside'
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null); // Cambiado para soportar múltiples imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Índice del carrusel
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  // Construir lista jerárquica ordenada
  const hierarchicalArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    // Ordenar por section_index
    const sorted = [...articles].sort((a, b) => {
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
  }, [articles]);

  const areAllArticlesSelected = articles.length > 0 && selectedArticles.length === articles.length;

  // Handlers de drag & drop
  const handleDragStart = (e, article) => {
    setDraggedArticle(article);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, article) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedArticle || draggedArticle.id_process === article.id_process) return;
    
    // Calcular posición del mouse relativa al elemento
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const elementHeight = rect.height;
    const upperThreshold = elementHeight * 0.25; // 25% superior
    const lowerThreshold = elementHeight * 0.75; // 75% inferior
    
    let position = 'inside'; // Por defecto, anidar
    
    if (mouseY < upperThreshold) {
      position = 'before'; // Colocar antes del elemento
    } else if (mouseY > lowerThreshold) {
      position = 'after'; // Colocar después del elemento
    }
    
    setDropTarget(article.id_process);
    setDropPosition(position);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
    setDropPosition(null);
  };

  const handleDrop = (e, targetArticle) => {
    e.preventDefault();
    if (draggedArticle && draggedArticle.id_process !== targetArticle.id_process) {
      onArticleDrop(draggedArticle, targetArticle, dropPosition);
    }
    setDraggedArticle(null);
    setDropTarget(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedArticle(null);
    setDropTarget(null);
    setDropPosition(null);
  };

  // Handlers para imagen y navegación
  const handleShowImage = (article) => {
    // Soportar tanto imagen única (_imageBase64) como múltiples (_imagesBase64)
    const images = article._imagesBase64 || (article._imageBase64 ? [article._imageBase64] : []);
    
    if (images.length > 0) {
      setSelectedImageData({
        images: images,
        title: article._noteTitle || article.article_number || article.number,
        description: article._noteDescription || article.description,
        pageIndexes: article._pageIndexes || [article._pageIndex],
        totalImages: article._totalImages || images.length
      });
      setCurrentImageIndex(0);
      setImageModalOpen(true);
    }
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImageData(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedImageData && currentImageIndex < selectedImageData.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleViewNote = (article) => {
    if (article.note_reference) {
      // Convertir note_reference a número para buscar la nota
      const noteId = parseInt(article.note_reference);
      
      // Emitir evento personalizado para que PDFViewerComponent lo maneje
      const event = new CustomEvent('navigate-to-note', {
        detail: {
          noteId: noteId,
          pageIndex: article._pageIndex
        }
      });
      window.dispatchEvent(event);
      
      console.log('Navegando a nota:', noteId, 'Página:', article._pageIndex);
    }
  };

  const handleRequestDelete = (article) => {
    setArticleToDelete(article);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (articleToDelete && onDeleteArticle) {
      onDeleteArticle(articleToDelete);
    }
    setDeleteConfirmOpen(false);
    setArticleToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setArticleToDelete(null);
  };

  if (!loading && articles.length === 0 && !error) {
    return (
      <Box mt={3} textAlign="center" py={4}>
        <ContentPasteOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          No se han procesado artículos aún
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Usa el botón Análisis para procesar un documento
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="warning" onClose={() => {}}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {metadata && !loading && (
        <Box mt={2} mb={2}>
          <Chip 
            label={`${metadata.totalBlocks} bloques procesados`} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`~${metadata.tokenEstimate} tokens estimados`} 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
        </Box>
      )}

      {loading && articles.length === 0 && (
        <Box mt={2}>
          {/* Versión minimalista de carga */}
          <Box 
            display="flex" 
            flexDirection="column"
            alignItems="center" 
            justifyContent="center" 
            py={8}
            gap={2}
          >
            <CircularProgress 
              size={48} 
              thickness={4} 
              sx={{
                color: '#2196f3',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }}
            />
            <Typography variant="body2" color="primary" fontWeight="medium">
              Procesando imagen con IA...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Los artículos aparecerán en tiempo real
            </Typography>
          </Box>

          {/* Código anterior comentado - Skeleton loader detallado */}
          {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Skeleton variant="rectangular" width={180} height={32} sx={{ borderRadius: 1 }} />
              <Chip 
                label="Analizando con IA..." 
                size="small" 
                color="info" 
                icon={<CircularProgress size={12} />}
              />
            </Box>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              p: 2,
              backgroundColor: '#fafafa'
            }}
          >
            <Box display="flex" flexDirection="column" gap={2}>
              {[1, 2, 3].map((item) => (
                <Box 
                  key={item}
                  sx={{
                    p: 2,
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${item * 0.2}s`,
                    '@keyframes pulse': {
                      '0%, 100%': {
                        opacity: 1,
                      },
                      '50%': {
                        opacity: 0.6,
                      },
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 2, ml: 'auto' }} />
                  </Box>
                  <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="75%" height={20} />
                  <Box display="flex" gap={1} mt={1.5}>
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
                  </Box>
                </Box>
              ))}
            </Box>

            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              gap={2} 
              mt={3}
              p={2}
              sx={{
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                border: '1px dashed #2196f3'
              }}
            >
              <CircularProgress size={20} thickness={4} />
              <Typography variant="body2" color="primary" fontWeight="medium">
                Procesando imagen con IA... Los artículos aparecerán en tiempo real
              </Typography>
            </Box>
          </Paper> */}
        </Box>
      )}

      {articles.length > 0 && (
        <Box mt={2} display="flex" flexDirection="column" gap={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">
                {t('processed_articles')} ({articles.length})
              </Typography>
            </Box>
            
            {loading && (
              <Chip 
                label="Procesando..." 
                size="small" 
                color="info" 
                icon={<CircularProgress size={12} />}
              />
            )}
            
            {selectedArticles.length > 0 && (
              <Chip 
                label={`${selectedArticles.length} seleccionados`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Box display="flex" alignItems="center" ml={1} mb={1}>
            <Checkbox
              checked={areAllArticlesSelected}
              onChange={onSelectAll}
              inputProps={{ 'aria-label': t('select_all') }}
            />
            <Typography variant="body2">{t('select_all')}</Typography>
          </Box>

          <Divider />
          
          <List
            component="nav"
            sx={{
              width: '100%',
              border: '1px solid rgb(209, 208, 208)',
              borderRadius: '8px',
              padding: '0',
              maxHeight: '600px',
              maxWidth: '550px',
              overflowY: 'auto'
            }}
          >
            {hierarchicalArticles.map((art, idx) => {
              const level = art._level || 0;
              const leftPadding = level * 20; // 20px por nivel de anidación
              const isDropTarget = dropTarget === art.id_process;
              const isDragging = draggedArticle?.id_process === art.id_process;

              // Estilos según la posición de drop
              let dropIndicatorStyle = {};
              if (isDropTarget && dropPosition) {
                if (dropPosition === 'before') {
                  dropIndicatorStyle = {
                    borderTop: '3px solid #2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.08)'
                  };
                } else if (dropPosition === 'after') {
                  dropIndicatorStyle = {
                    borderBottom: '3px solid #2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.08)'
                  };
                } else if (dropPosition === 'inside') {
                  dropIndicatorStyle = {
                    backgroundColor: '#e3f2fd',
                    borderLeft: '4px solid #2196f3'
                  };
                }
              }

              return (
                <Fragment key={art.id_process}>
                  <ListItemButton
                    draggable
                    onDragStart={(e) => handleDragStart(e, art)}
                    onDragOver={(e) => handleDragOver(e, art)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, art)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onToggleList(idx)}
                    disableRipple
                    sx={{
                      paddingLeft: `${16 + leftPadding}px`,
                      opacity: isDragging ? 0.5 : 1,
                      ...dropIndicatorStyle,
                      transition: 'all 0.2s ease',
                      cursor: draggedArticle ? 'grabbing' : 'grab',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: isDropTarget 
                          ? (dropPosition === 'inside' ? '#bbdefb' : 'rgba(33, 150, 243, 0.12)') 
                          : '#f5f5f5'
                      }
                    }}
                  >
                    <DragIndicator 
                      sx={{ 
                        mr: 1, 
                        color: 'text.disabled',
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' }
                      }} 
                    />

                    <Checkbox
                      edge="start"
                      checked={isArticleSelected(art)}
                      tabIndex={-1}
                      disableRipple
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => onSelectArticle(art)}
                      sx={{ mr: 1 }}
                    />

                    {openList[idx] ? <ExpandLess /> : <ExpandMore />}

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      flexGrow={1}
                      sx={{ ml: 1 }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {art.number || art.article_number || `#${idx + 1}`}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap className='max-w-[250px]'>
                            {art.description?.substring(0, 60)}
                            {art.description?.length > 60 ? '...' : ''}
                          </Typography>
                        }
                      />

                      <Box display="flex" alignItems="center" gap={1}>
                        {art.note_reference && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewNote(art);
                            }}
                            sx={{ minWidth: 'auto' }}
                          >
                            Ver
                          </Button>
                        )}

                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestDelete(art);
                          }}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'rgba(211, 47, 47, 0.08)' 
                            } 
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        {art.priority && (
                          <Chip
                            label={art.priority}
                            color={
                              art.priority === 'Alta' ? 'error' :
                              art.priority === 'Media' ? 'warning' : 'success'
                            }
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                </ListItemButton>

                <Collapse in={!!openList[idx]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 6, pb: 2 }}>
                      <Box display="flex" flexDirection="column" gap={2} width="100%">
                        
                        {art.description && (
                          <Box>
                            <Typography variant="caption" fontWeight="bold" color="primary">
                              Descripción de la obligación:
                            </Typography>
                            <Typography variant="body2" mt={0.5}>
                              {art.complete_description || art.description} 
                            </Typography>
                          </Box>
                        )}

                        {art.subject && (
                          <Box>
                            <Typography variant="caption" fontWeight="bold" color="primary">
                              Sujeto obligado:
                            </Typography>
                            <Typography variant="body2" mt={0.5}>
                              {art.subject}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" gap={2} flexWrap="wrap">
                          {art.deadline && (
                            <Box>
                              <Typography variant="caption" fontWeight="bold" color="primary">
                                Plazo:
                              </Typography>
                              <Typography variant="body2">
                                {art.deadline}
                              </Typography>
                            </Box>
                          )}

                          {art.priority && (
                            <Box>
                              <Typography variant="caption" fontWeight="bold" color="primary">
                                Prioridad:
                              </Typography>
                              <Chip
                                label={art.priority}
                                color={
                                  art.priority === 'Alta' ? 'error' :
                                  art.priority === 'Media' ? 'warning' : 'success'
                                }
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          )}

                          {art.prob_task && (
                            <Box>
                              <Typography variant="caption" fontWeight="bold" color="primary">
                                Confianza:
                              </Typography>
                              <Typography variant="body2">
                                {Math.round(art.prob_task * 100)}%
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Botones de acción */}
                        <Box display="flex" gap={1} mt={2}>
                          {(art._imageBase64 || art._imagesBase64) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<ImageIcon />}
                              onClick={() => handleShowImage(art)}
                            >
                              Mostrar imagen{art._imagesBase64?.length > 1 ? 's' : ''}
                              {art._imagesBase64?.length > 1 && ` (${art._imagesBase64.length})`}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </ListItemButton>
                  </List>
                </Collapse>

                <Divider />
              </Fragment>
            );
            })}
          </List>
        </Box>
      )}

      {/* Dialog para mostrar imagen(es) con carrusel */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <ImageIcon color="primary" />
              <Typography variant="h6">
                {selectedImageData?.title || 'Imagen del artículo'}
              </Typography>
              {selectedImageData?.totalImages > 1 && (
                <Chip 
                  label={`${selectedImageData.totalImages} páginas`}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
            <IconButton onClick={handleCloseImageModal} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedImageData?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedImageData.description}
            </Typography>
          )}

          {selectedImageData?.images && selectedImageData.images.length > 0 && (
            <>
              {/* Imagen actual */}
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
                  overflow: 'auto',
                  maxHeight: '70vh'
                }}
              >
                <img
                  src={selectedImageData.images[currentImageIndex]}
                  alt={`${selectedImageData.title} - Página ${currentImageIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </Box>

              {/* Navegación del carrusel (si hay múltiples imágenes) */}
              {selectedImageData.images.length > 1 && (
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <IconButton 
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0}
                    color="primary"
                  >
                    <ArrowBack />
                  </IconButton>
                  
                  <Box textAlign="center">
                    <Typography variant="body2" fontWeight="medium">
                      Página {currentImageIndex + 1} de {selectedImageData.images.length}
                    </Typography>
                    {selectedImageData.pageIndexes && selectedImageData.pageIndexes[currentImageIndex] !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        📄 PDF página: {selectedImageData.pageIndexes[currentImageIndex] + 1}
                      </Typography>
                    )}
                  </Box>
                  
                  <IconButton 
                    onClick={handleNextImage}
                    disabled={currentImageIndex === selectedImageData.images.length - 1}
                    color="primary"
                  >
                    <ArrowForward />
                  </IconButton>
                </Box>
              )}

              {/* Thumbnails si hay múltiples imágenes */}
              {selectedImageData.images.length > 1 && (
                <Box 
                  display="flex" 
                  gap={1} 
                  justifyContent="center"
                  sx={{ mt: 2, flexWrap: 'wrap' }}
                >
                  {selectedImageData.images.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      sx={{
                        width: 60,
                        height: 60,
                        border: idx === currentImageIndex ? '3px solid' : '1px solid',
                        borderColor: idx === currentImageIndex ? 'primary.main' : 'grey.300',
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: idx === currentImageIndex ? 1 : 0.6,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <img 
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseImageModal} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
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
            <WarningIcon color="warning" />
            <Typography variant="h6">
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de que deseas eliminar este artículo?
          </Typography>
          {articleToDelete && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {articleToDelete.article_number || articleToDelete.number}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {articleToDelete.description?.substring(0, 100)}
                {articleToDelete.description?.length > 100 ? '...' : ''}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancelDelete} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArticlesList;
