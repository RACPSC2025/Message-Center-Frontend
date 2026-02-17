// src/components/Findings/FindingsCardViewList.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
  Button,
  Modal,
  Backdrop,
  Fade
} from '@mui/material';
import {
  Delete,
  Lock,
  LockOpen,
  Settings,
  Visibility,
  ChevronLeft,
  ChevronRight,
  Flag,
  Refresh,
  Close,
  HelpOutline,
  Psychology,
  Filter5
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { ReactComponent as EditSquare } from '../../assets/icons/edit-square.svg';

// Componente para el carrusel de imágenes con modal
const ImageCarousel = ({ images = [], findingId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const hasImages = images && images.length > 0;
  const displayImages = hasImages ? images : [];

  const handleImageChange = (newIndex, e) => {
    if (e) e.stopPropagation();
    
    setIsTransitioning(true);
    setImageError(false);
    
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setIsTransitioning(false);
    }, 150); // Duración de la transición
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === 0 ? displayImages.length - 1 : currentImageIndex - 1;
    handleImageChange(newIndex);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === displayImages.length - 1 ? 0 : currentImageIndex + 1;
    handleImageChange(newIndex);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (hasImages && !imageError) {
      setModalOpen(true);
    }
  };

  const handleCloseModal = (e) => {
    if (e) e.stopPropagation();
    setModalOpen(false);
  };

  const handleModalPrevious = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === 0 ? displayImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
  };

  const handleModalNext = (e) => {
    e.stopPropagation();
    const newIndex = currentImageIndex === displayImages.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
  };

  // Cerrar modal al hacer clic en el backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal(e);
    }
  };

  const currentImage = displayImages[currentImageIndex];
  const thumbnailUrl = currentImage?.thumbnail_url || currentImage?.url;
  const fullImageUrl = currentImage?.url;

  return (
    <>
      {/* Card Image */}
      <Box
        sx={{
          position: 'relative',
          height: 240,
          bgcolor: '#e0e0e0',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: hasImages ? 'pointer' : 'default'
        }}
        onClick={handleImageClick}
      >
        {hasImages && !imageError ? (
          <>
            <Box
              component="img"
              src={thumbnailUrl}
              alt={currentImage?.old_name || `Finding ${findingId}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.2s, opacity 0.3s',
                opacity: isTransitioning ? 0.3 : 1,
                transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              onError={(e) => {
                console.error('❌ Error loading thumbnail:', thumbnailUrl);
                setImageError(true);
              }}
            />

            {displayImages.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevious}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.95)'
                    },
                    zIndex: 2
                  }}
                  size="small"
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.95)'
                    },
                    zIndex: 2
                  }}
                  size="small"
                >
                  <ChevronRight />
                </IconButton>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 0.5,
                    zIndex: 2
                  }}
                >
                  {displayImages.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: index === currentImageIndex 
                          ? 'white' 
                          : 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s'
                      }}
                    />
                  ))}
                </Box>
              </>
            )}

            {/* Contador de imágenes */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                zIndex: 2
              }}
            >
              {currentImageIndex + 1} / {displayImages.length}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              textAlign: 'center',
              px: 2
            }}
          >
            <Typography variant="body2">
              {hasImages ? 'Error al cargar imagen' : 'Sin imágenes'}
            </Typography>
            {imageError && currentImage?.old_name && (
              <Typography variant="caption" sx={{ mt: 1 }}>
                {currentImage.old_name}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Modal para imagen completa - ESTILO ACTUALIZADO */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { bgcolor: 'rgba(0, 0, 0, 0.85)' }
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              height: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
            onClick={handleBackdropClick}
          >
            {/* Contenedor de la imagen con marco blanco */}
            <Box
              sx={{
                position: 'relative',
                maxWidth: '100%',
                maxHeight: '100%',
                bgcolor: 'white',
                p: 2,
                borderRadius: 1,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Imagen */}
              <Box
                component="img"
                src={fullImageUrl}
                alt={currentImage?.old_name}
                sx={{
                  maxWidth: 'calc(90vw - 32px)',
                  maxHeight: 'calc(90vh - 120px)',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />

              {/* Info de la imagen - debajo de la imagen */}
              <Box
                sx={{
                  mt: 2,
                  textAlign: 'center',
                  borderTop: '1px solid #e0e0e0',
                  pt: 2
                }}
              >
                <Typography variant="body2" color="text.primary" fontWeight="medium">
                  {currentImage?.old_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Imagen {currentImageIndex + 1} de {displayImages.length}
                </Typography>
              </Box>

              {/* Botón cerrar - esquina inferior derecha */}
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.85)'
                  }
                }}
                size="small"
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Navegación en modal - FUERA del marco blanco */}
            {displayImages.length > 1 && (
              <>
                <IconButton
                  onClick={handleModalPrevious}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)'
                    }
                  }}
                >
                  <ChevronLeft sx={{ fontSize: 40 }} />
                </IconButton>

                <IconButton
                  onClick={handleModalNext}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)'
                    }
                  }}
                >
                  <ChevronRight sx={{ fontSize: 40 }} />
                </IconButton>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

// ... CompactPagination (sin cambios)
const CompactPagination = ({ currentPage, totalPages, onPageChange, onRefresh }) => {
  const [goToPage, setGoToPage] = useState('');

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(null, pageNum);
      setGoToPage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap'
      }}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(null, 1)}
        disabled={currentPage === 1}
        sx={{ minWidth: 40, px: 1, height: 32 }}
      >
        {'<<'}
      </Button>

      {getPageNumbers().map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === currentPage ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onPageChange(null, pageNum)}
          sx={{
            minWidth: 40,
            px: 1,
            height: 32,
            bgcolor: pageNum === currentPage ? 'primary.main' : 'transparent',
            color: pageNum === currentPage ? 'white' : 'primary.main'
          }}
        >
          {pageNum}
        </Button>
      ))}

      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(null, totalPages)}
        disabled={currentPage === totalPages}
        sx={{ minWidth: 40, px: 1, height: 32 }}
      >
        {'>>'}
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          Ir a
        </Typography>
        <TextField
          size="small"
          value={goToPage}
          onChange={(e) => setGoToPage(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ 
            width: 60,
            '& .MuiInputBase-root': {
              height: 32
            }
          }}
          type="number"
          inputProps={{
            min: 1,
            max: totalPages,
            style: { textAlign: 'center', padding: '4px 8px' }
          }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleGoToPage}
          sx={{ minWidth: 40, px: 2, height: 32 }}
        >
          Ir
        </Button>
      </Box>

      <IconButton
        onClick={onRefresh}
        color="primary"
        size="small"
        sx={{
          border: 1,
          borderColor: 'primary.main',
          borderRadius: '50%',
          width: 32,
          height: 32
        }}
      >
        <Refresh fontSize="small" />
      </IconButton>
    </Box>
  );
};

// Funciones de utilidad (sin cambios)
const getStatusColor = (status) => {
  const statusNum = parseInt(status) || 0;
  
  switch (statusNum) {
    case 1: return 'rgb(251, 146, 60)';
    case 2: return 'rgb(250, 204, 21)';
    case 3: return 'rgb(101, 163, 13)';
    default: return 'rgb(156, 163, 175)';
  }
};

const getRiskColor = (riskLevel) => {
  const risk = parseInt(riskLevel) || 0;
  
  if (risk === 0) return 'rgb(156, 163, 175)';
  if (risk > 15) return 'rgb(239, 68, 68)';
  if (risk >= 8) return 'rgb(251, 146, 60)';
  return 'rgb(101, 163, 13)';
};

const getRiskLabel = (riskLevel) => {
  const risk = parseInt(riskLevel) || 0;
  
  if (risk === 0) return 'Riesgo: not_evaluated';
  if (risk > 15) return 'Riesgo: Alto';
  if (risk >= 8) return 'Riesgo: Medio';
  return 'Riesgo: Bajo';
};

const getStatusLabel = (status) => {
  const statusNum = parseInt(status) || 0;
  
  const labels = {
    1: 'Abierto',
    2: 'En Proceso',
    3: 'Cerrado',
    0: 'Desconocido'
  };
  return labels[statusNum] || 'Desconocido';
};

const truncateText = (text, maxLength = 100) => {
  if (!text) return 'N/A';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Componente principal (actualizado botón de editar)
function FindingsCardViewList({
  findings = [],
  loading = false,
  pagination = {},
  currentPage = 1,
  onCardClick = () => {},
  onPageChange = () => {},
  onRefresh = () => {}
}) {
  const { total = 0, total_pages: totalPages = 1 } = pagination;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!findings || findings.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          gap: 2
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No se encontraron hallazgos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Intenta ajustar los filtros de búsqueda
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2.5,
            px: 2,
            py: 1.5,
            bgcolor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            Listado
          </Typography>
        
          <Typography variant="body2" color="text.secondary">
            Total registros: {total}
          </Typography>

          <IconButton
            onClick={onRefresh}
            size="small"
            sx={{
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              '&:hover': { 
                bgcolor: '#f5f5f5',
                borderColor: 'primary.main'
              }
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 3,
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: '#f5f5f5'
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: '#c0c0c0',
              borderRadius: '4px',
              '&:hover': {
                bgcolor: '#a0a0a0'
              }
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'flex-start'
            }}
          >
            {findings.map((finding) => {
              const statusColor = getStatusColor(finding.status);
              const riskLevel = finding.risk_analysis?.nivel_riesgo || 0;
              const riskColor = getRiskColor(riskLevel);
              const isLocked = parseInt(finding.status) === 3;

              return (
                <Card
                  key={finding.id}
                  sx={{
                    width: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 2,
                      py: 1,
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {finding.id} | {finding.finding_source_name || ''}
                    </Typography>
                    {isLocked ? (
                      <Lock sx={{ fontSize: 18, color: 'text.secondary' }} />
                    ) : (
                      <LockOpen sx={{ fontSize: 18, color: 'text.secondary' }} />
                    )}
                  </Box>

                  <ImageCarousel
                    images={finding.attachments || []}
                    findingId={finding.id}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      px: 2,
                      py: 1,
                      bgcolor: 'white',
                      justifyContent: 'center'
                    }}
                  >
                    <Chip
                      label={getStatusLabel(finding.status)}
                      size="small"
                      sx={{
                        bgcolor: statusColor,
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                    <Chip
                      label={getRiskLabel(riskLevel)}
                      size="small"
                      sx={{
                        bgcolor: riskColor,
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>

                  <Divider
                    sx={{
                      height: 5,
                      bgcolor: statusColor,
                      border: 'none'
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1, minHeight: 200, p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 60,
                          bgcolor: '#f5f5f5',
                          borderRadius: 1,
                          py: 1
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">
                          {finding.created_at ? dayjs(finding.created_at).format('DD') : '--'}
                        </Typography>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
                          {finding.created_at ? dayjs(finding.created_at).format('MMM') : '---'}
                        </Typography>
                        <Typography variant="caption">
                          {finding.created_at ? dayjs(finding.created_at).format('YYYY') : '----'}
                        </Typography>
                      </Box>

                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            finding
                          </Typography>
                          <Typography variant="body2">
                            {finding.finding_type_name || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            reported_by:
                          </Typography>
                          <Typography variant="body2">
                            {finding.reporter_name || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            location:
                          </Typography>
                          <Typography variant="body2">
                            {finding.region_name || 'N/A'} - {finding.country_name || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Descripción:
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {truncateText(finding.brief_description || finding.que_what, 80)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1,
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {finding.action_plans_count || 0} Plan de acción
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {/* 1. Botón Ver - Abre tab Detalles en modo VIEW */}
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('👁️ Ver hallazgo:', finding.id, '- Mode: view, Tab: 0 (Detalles)');
                            onCardClick(finding, 'view', 0);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* 2. Botón Editar - Abre tab Detalles en modo EDIT */}
                      <Tooltip title={isLocked ? 'Cerrado - No editable' : 'Editar'}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={isLocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('✏️ Editar hallazgo:', finding.id, '- Mode: edit, Tab: 0 (Detalles)');
                              onCardClick(finding, 'edit', 0);
                            }}
                            sx={{
                              color: isLocked ? 'action.disabled' : 'primary.main',
                              '& svg': {
                                width: 20,
                                height: 20
                              }
                            }}
                          >
                            <SvgIcon component={EditSquare} inheritViewBox />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* 3. Botón Análisis de causas - Abre tab 1 */}
                      <Tooltip title="Análisis de causas">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('🧠 Análisis de causas hallazgo:', finding.id, '- Mode: view, Tab: 1');
                            onCardClick(finding, 'view', 1);
                          }}
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* 4. Botón 5 Porqués - Abre tab 2 */}
                      <Tooltip title="Análisis 5 Porqués">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('5️⃣ 5 Porqués hallazgo:', finding.id, '- Mode: view, Tab: 2');
                            onCardClick(finding, 'view', 2);
                          }}
                        >
                          <Filter5 fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* 5. Botón Eliminar */}
                      <Tooltip title={isLocked ? 'Cerrado - No eliminable' : 'Eliminar'}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={isLocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('🗑️ Eliminar hallazgo:', finding.id);
                              onCardClick(finding, 'delete', 0);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export { CompactPagination };
export default FindingsCardViewList;