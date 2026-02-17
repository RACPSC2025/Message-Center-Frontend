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
  Button,
  Tooltip
} from '@mui/material';
import { 
  ExpandLess, 
  ExpandMore, 
  CheckCircle, 
  DragIndicator,
  ArticleRounded
} from '@mui/icons-material';
import { LabelImportant } from '@mui/icons-material';
import CreateArticleFromAnalysis from '../CreateArticleFromAnalysis';

const SelectedArticlesList = ({
  selectedArticles,
  openList,
  requisitoId,
  onToggleList,
  onSelectArticle,
  onClearSelection,
  onArticleSaved,
  onArticleDrop,
  onCreateNewArticle
}) => {
  const [draggedArticle, setDraggedArticle] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);

  // Construir lista jerárquica ordenada
  const hierarchicalArticles = useMemo(() => {
    if (!selectedArticles || selectedArticles.length === 0) return [];

    // Ordenar por section_index
    const sorted = [...selectedArticles].sort((a, b) => {
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
  }, [selectedArticles]);

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
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const elementHeight = rect.height;
    const upperThreshold = elementHeight * 0.25;
    const lowerThreshold = elementHeight * 0.75;
    
    let position = 'inside';
    
    if (mouseY < upperThreshold) {
      position = 'before';
    } else if (mouseY > lowerThreshold) {
      position = 'after';
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
      if (onArticleDrop) {
        onArticleDrop(draggedArticle, targetArticle, dropPosition);
      }
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

  if (selectedArticles.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        sx={{
          border: '2px dashed #e0e0e0',
          borderRadius: 2,
          backgroundColor: '#fafafa'
        }}
      >
        <LabelImportant sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No hay artículos seleccionados
        </Typography>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Selecciona artículos usando los checkboxes en la pestaña &ldquo;list&rdquo;
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Obligaciones Seleccionadas ({selectedArticles.length})
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={onClearSelection}
        >
          Limpiar selección
        </Button>
      </Box>

      {/* Botón para crear nuevo artículo */}
      <Box mb={2}>
        <Button
          variant="contained"
          //color="success"
          //startIcon={<LabelImportant />}
          color="info"
          startIcon={<ArticleRounded />}
          fullWidth
          onClick={() => {
            const uniqueId = Date.now() + Math.random();
            const newArticle = {
              id: uniqueId,
              id_process: uniqueId,
              number: '',
              article_number: '',
              description: '',
              complete_description: '',
              subject: '',
              parent: null,
              section_index: selectedArticles.length,
              _expanded: true,
              _isNew: true
            };
            if (onCreateNewArticle) {
              onCreateNewArticle(newArticle);
            }
          }}
        >
          Crear nuevo artículo
        </Button>
      </Box>

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
          const leftPadding = level * 20;
          const isDropTarget = dropTarget === art.id_process;
          const isDragging = draggedArticle?.id_process === art.id_process;

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
            <Fragment key={art.id_process || idx}>
              <ListItemButton
                draggable
                onDragStart={(e) => handleDragStart(e, art)}
                onDragOver={(e) => handleDragOver(e, art)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, art)}
                onDragEnd={handleDragEnd}
                onClick={() => onToggleList(`selected-${idx}`)}
                disableRipple
                sx={{
                  paddingLeft: `${16 + leftPadding}px`,
                  opacity: isDragging ? 0.5 : 1,
                  ...dropIndicatorStyle,
                  backgroundColor: (art.savedRequisitoIds && art.savedRequisitoIds.includes(requisitoId)) ? '#e3f2fd' : '#f0f9ff',
                  transition: 'all 0.2s ease',
                  cursor: draggedArticle ? 'grabbing' : 'grab',
                  '&:hover': {
                    backgroundColor: isDropTarget 
                      ? (dropPosition === 'inside' ? '#bbdefb' : 'rgba(33, 150, 243, 0.12)') 
                      : ((art.savedRequisitoIds && art.savedRequisitoIds.includes(requisitoId)) ? '#bbdefb' : '#e0f2fe')
                  },
                  borderBottom: (art.savedRequisitoIds && art.savedRequisitoIds.includes(requisitoId)) ? '2px solid #2196f3' : 'none'
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
                checked={true}
                tabIndex={-1}
                disableRipple
                onClick={(e) => e.stopPropagation()}
                onChange={() => onSelectArticle(art)}
                sx={{ mr: 1 }}
              />

              {openList[`selected-${idx}`] ? <ExpandLess /> : <ExpandMore />}

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexGrow={1}
                sx={{ ml: 1 }}
              >
                <ListItemText 
                  primary={
                    <Box display="flex" 
                    alignItems="center" 
                    //gap={1}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {/*art.article_number || art.number || `#${idx + 1}`*/}
                        {art.number || art.article_number || `#${idx + 1}`}
                      </Typography>
                      {(art.savedRequisitoIds && art.savedRequisitoIds.includes(requisitoId)) && (
                        <Tooltip title="Guardado">
                          <CheckCircle color="primary" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {art.description?.substring(0, 60)}
                      {art.description?.length > 60 ? '...' : ''}
                    </Typography>
                  }
                />

                {art.priority && (
                  <Chip
                    label={art.priority}
                    color={
                      art.priority === 'Alta' ? 'error' :
                      art.priority === 'Media' ? 'warning' : 'success'
                    }
                    size="small"
                    sx={{ mr: 1 }}
                  />
                )}
              </Box>
            </ListItemButton>

            <Collapse in={!!openList[`selected-${idx}`]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <Box 
                sx={{ 
                  //pl: 6, 
                  backgroundColor: '#fafafa', 
                  p: 1,
                  pt: 0,
                }}>
                  <Box display="flex" flexDirection="column" 
                  //gap={2} 
                  width="100%">
                    {/*
                    <Box>
                      <Typography variant="caption" fontWeight="bold" color="primary">
                        Descripción de la obligación:
                      </Typography>
                      <Typography variant="body2" mt={0.5}>
                        {art.complete_description || art.description} 
                      </Typography>
                    </Box>
                    */}

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

                    <Box display="flex" gap={3} flexWrap="wrap">
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
                    
                    <Box width="100%">
                      <CreateArticleFromAnalysis 
                        selectedArticles={[art]}
                        requisitoId={requisitoId}
                        onSuccess={() => onArticleSaved(idx)}
                        containerId="analysis-regulation-container"
                      />
                    </Box>

                  </Box>
                </Box>
              </List>
            </Collapse>

            <Divider />
          </Fragment>
        );
        })}
      </List>
    </>
  );
};

export default SelectedArticlesList;
