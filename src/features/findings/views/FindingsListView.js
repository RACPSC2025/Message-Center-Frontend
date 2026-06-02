import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  Refresh,
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
  Add,
  FileDownload,
  Upload,
  TableChart
} from '@mui/icons-material';
import FindingCard from '../components/FindingCard';
import FindingDetailDrawer from '../components/FindingDetailDrawer';
import NewFindingDrawer from '../components/NewFindingDrawer';
import FiveWhysDrawer from '../components/FiveWhysDrawer';
import CauseAnalysisDrawer from '../components/CauseAnalysisDrawer';
import ChangeHistoryDrawer from '../components/ChangeHistoryDrawer';
import FollowUpDrawer from '../components/FollowUpDrawer';
import SpeedDialComponent from '../../../components/SpeedDialComponent';
import { fetchFindings } from '../../../stores/findings/fetchFindingsSlice';
import { selectAppliedFilterModel } from '../../../stores/filterSlice';
import { downloadReporteExcel, downloadPlantillaExcel } from '../utils/excel';
import { downloadFichaPdf } from '../utils/pdf';

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50, 100];

const FindingsListView = () => {
  const dispatch = useDispatch();

  const { data: allFindings = [], loading } = useSelector((state) => state.findings || {});
  const sidebarFilters = useSelector((state) => selectAppliedFilterModel(state, 'findings'));

  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFinding, setSelectedFinding] = useState(null);

  // Drawers (Formularios)
  const [followUpDrawerOpen, setFollowUpDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [fiveWhysDrawerOpen, setFiveWhysDrawerOpen] = useState(false);
  const [causeAnalysisDrawerOpen, setCauseAnalysisDrawerOpen] = useState(false);
  const [changeHistoryDrawerOpen, setChangeHistoryDrawerOpen] = useState(false);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [newFindingDrawerOpen, setNewFindingDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [findingToDelete, setFindingToDelete] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const gridRef = useRef(null);

  const speedDialActions = [
    {
      icon: <Add />,
      name: 'Nuevo Hallazgo'
    }
  ];

  // Cargar todos los hallazgos una sola vez
  const loadAllFindings = useCallback(() => {
    dispatch(fetchFindings({ page: 1, limit: 99999 }));
  }, [dispatch]);

  useEffect(() => {
    loadAllFindings();
  }, [loadAllFindings]);

  // Reiniciar paginación al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [sidebarFilters]);

  // Filtrado client-side
  const filteredFindings = useMemo(() => {
    let result = allFindings;

    const keyword = sidebarFilters?.filter_keywords;
    if (keyword) {
      const q = keyword.toLowerCase();
      result = result.filter((f) => (f.brief_description || '').toLowerCase().includes(q));
    }

    const status = sidebarFilters?.filter_Status;
    if (status) {
      result = result.filter((f) => f.status === status);
    }

    const source = sidebarFilters?.filter_source_of_the_finding;
    if (source) {
      result = result.filter((f) => f.finding_source === source);
    }

    const person = sidebarFilters?.filter_person_registering;
    if (person) {
      result = result.filter((f) => f.reporting_person === person);
    }

    const dateFrom = sidebarFilters?.filter_start_date;
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((f) => new Date(f.created_at) >= from);
    }

    const dateTo = sidebarFilters?.filter_end_date;
    if (dateTo) {
      const to = new Date(dateTo);
      to.setDate(to.getDate() + 1);
      result = result.filter((f) => new Date(f.created_at) < to);
    }

    return result;
  }, [allFindings, sidebarFilters]);

  // Ordenar
  const sortedFindings = useMemo(() => {
    return [...filteredFindings].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredFindings, sortOrder]);

  // Paginación local
  const totalRecords = sortedFindings.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedFindings.slice(start, start + itemsPerPage);
  }, [sortedFindings, currentPage, itemsPerPage]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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

  const handleView = (finding) => {
    setSelectedFinding(finding);
    setDetailDrawerOpen(true);
  };
  const handleEdit = (finding) => console.log('Editar info completa:', finding.id);
  const handleFiveWhys = (finding) => {
    setSelectedFinding(finding);
    setFiveWhysDrawerOpen(true);
  };
  const handleCauseAnalysis = (finding) => {
    setSelectedFinding(finding);
    setCauseAnalysisDrawerOpen(true);
  };
  const handleChangeHistory = (finding) => {
    setSelectedFinding(finding);
    setChangeHistoryDrawerOpen(true);
  };
  const handleFollowUp = (finding) => {
    setSelectedFinding(finding);
    setFollowUpDrawerOpen(true);
  };
  const handleExportPdf = (finding) => downloadFichaPdf(finding);
  const handleDelete = (finding) => {
    setFindingToDelete(finding);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = () => {
    if (findingToDelete) {
      console.log('Eliminar hallazgo:', findingToDelete.id);
      // TODO: llamar endpoint de eliminación cuando esté disponible
      // await dispatch(deleteFinding(findingToDelete.id));
    }
    setDeleteDialogOpen(false);
    setFindingToDelete(null);
  };
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setFindingToDelete(null);
  };
  const handleUploadEvidence = (finding) => console.log('Subir evidencia:', finding.id);
  const handleRefresh = () => {
    loadAllFindings();
  };

  const handleNewFinding = () => {
    setOpenSpeedDial(false);
    setNewFindingDrawerOpen(true);
  };

  if (loading && allFindings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con controles superiores */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        {/* Izquierda: Contador */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.4,
              borderRadius: 2,
              bgcolor: '#fafbfc',
              border: '1px solid #e8ecf1'
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.78rem', fontWeight: 500 }}
            >
              Mostrando
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              sx={{ fontSize: '0.8rem' }}
            >
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalRecords)}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.78rem', fontWeight: 500 }}
            >
              de
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
              sx={{ fontSize: '0.8rem' }}
            >
              {totalRecords}
            </Typography>
          </Box>
        </Box>

        {/* Centro: Paginación */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            sx={{ minWidth: 32, height: 32, p: 0.5, borderRadius: 1 }}
          >
            <FirstPage fontSize="small" />
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{ minWidth: 32, height: 32, p: 0.5, borderRadius: 1 }}
          >
            <ChevronLeft fontSize="small" />
          </Button>

          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePageChange(pageNum)}
              sx={{
                minWidth: 32,
                height: 32,
                p: 0.5,
                borderRadius: 1,
                bgcolor: pageNum === currentPage ? 'primary.main' : 'transparent',
                color: pageNum === currentPage ? 'white' : 'primary.main',
                borderColor: pageNum === currentPage ? 'primary.main' : 'divider',
                fontSize: '0.8rem',
                fontWeight: pageNum === currentPage ? 600 : 400,
                '&:hover': {
                  bgcolor: pageNum === currentPage ? 'primary.dark' : 'action.hover'
                }
              }}
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{ minWidth: 32, height: 32, p: 0.5, borderRadius: 1 }}
          >
            <ChevronRight fontSize="small" />
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            sx={{ minWidth: 32, height: 32, p: 0.5, borderRadius: 1 }}
          >
            <LastPage fontSize="small" />
          </Button>

          {/* Items por página */}
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Mostrar</InputLabel>
            <Select value={itemsPerPage} label="Mostrar" onChange={handleItemsPerPageChange}>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Derecha: Orden, acciones y items por página */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Botón refrescar */}
          <IconButton
            onClick={handleRefresh}
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

          {/* Reporte Excel */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<TableChart />}
            onClick={downloadReporteExcel}
            sx={{ textTransform: 'none', borderRadius: 1, whiteSpace: 'nowrap' }}
          >
            Reporte Excel
          </Button>

          {/* Descargar Plantilla */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownload />}
            onClick={downloadPlantillaExcel}
            sx={{ textTransform: 'none', borderRadius: 1, whiteSpace: 'nowrap' }}
          >
            Descargar Plantilla
          </Button>

          {/* Importar Excel */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 1, whiteSpace: 'nowrap' }}
          >
            Importar Excel
          </Button>

          {/* Selector de orden */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Ordenar por fecha</InputLabel>
            <Select
              value={sortOrder}
              label="Ordenar por fecha"
              onChange={(e) => setSortOrder(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }
              }}
            >
              <MenuItem value="desc">
                <ArrowDownward sx={{ fontSize: 16, mr: 1 }} />
                Recientes
              </MenuItem>
              <MenuItem value="asc">
                <ArrowUpward sx={{ fontSize: 16, mr: 1 }} />
                Antiguos
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Grid de cards */}
      <Box
        ref={gridRef}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 2.5,
          p: 2,
          alignItems: 'start',
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto',
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
        {paginatedFindings.map((finding) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            onView={handleView}
            onEdit={handleEdit}
            onFiveWhys={handleFiveWhys}
            onCauseAnalysis={handleCauseAnalysis}
            onChangeHistory={handleChangeHistory}
            onExportPdf={handleExportPdf}
            onDelete={handleDelete}
            onUploadEvidence={handleUploadEvidence}
            onFollowUp={handleFollowUp}
          />
        ))}
      </Box>

      {/* Drawer de detalle */}
      <FindingDetailDrawer
        open={detailDrawerOpen}
        finding={selectedFinding}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedFinding(null);
        }}
      />

      {/* Drawer análisis de 5 porqués */}
      <FiveWhysDrawer
        open={fiveWhysDrawerOpen}
        finding={selectedFinding}
        onClose={() => {
          setFiveWhysDrawerOpen(false);
          setSelectedFinding(null);
        }}
      />

      {/* Drawer análisis de causas */}
      <CauseAnalysisDrawer
        open={causeAnalysisDrawerOpen}
        finding={selectedFinding}
        onClose={() => {
          setCauseAnalysisDrawerOpen(false);
          setSelectedFinding(null);
        }}
      />

      {/* Drawer historial de cambios */}
      <ChangeHistoryDrawer
        open={changeHistoryDrawerOpen}
        finding={selectedFinding}
        onClose={() => {
          setChangeHistoryDrawerOpen(false);
          setSelectedFinding(null);
        }}
      />

      {/* Drawer seguimientos */}
      <FollowUpDrawer
        open={followUpDrawerOpen}
        finding={selectedFinding}
        onClose={() => {
          setFollowUpDrawerOpen(false);
          setSelectedFinding(null);
        }}
      />

      {/* Drawer nuevo hallazgo */}
      <NewFindingDrawer
        open={newFindingDrawerOpen}
        onClose={() => setNewFindingDrawerOpen(false)}
        onSave={(values, cb) => {
          console.log('Nuevo hallazgo:', values);
          cb();
        }}
      />

      {/* Diálogo de importar Excel */}
      <Dialog open={importDialogOpen} onClose={() => { setImportDialogOpen(false); setImportFile(null); }}>
        <DialogTitle>Importar Excel</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Seleccione un archivo Excel (.xlsx) para importar los hallazgos.
          </DialogContentText>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: importFile ? 'primary.main' : '#c0c0c0',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: importFile ? '#f0f7ff' : '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: '#f0f7ff' }
            }}
            onClick={() => document.getElementById('excel-file-input').click()}
          >
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setImportFile(file);
              }}
            />
            {importFile ? (
              <>
                <Upload sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" fontWeight={600} color="primary.main">
                  {importFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(importFile.size / 1024).toFixed(1)} KB
                </Typography>
              </>
            ) : (
              <>
                <Upload sx={{ fontSize: 36, color: '#9e9e9e', mb: 1 }} />
                <Typography variant="body1" fontWeight={500} color="text.secondary">
                  Haga clic para seleccionar archivo
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  .xlsx o .xls
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setImportDialogOpen(false); setImportFile(null); }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!importFile}
            onClick={() => {
              console.log('Importar archivo:', importFile?.name);
              // TODO: procesar importación cuando esté disponible
              setImportDialogOpen(false);
              setImportFile(null);
            }}
          >
            Importar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación eliminar */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Eliminar hallazgo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de eliminar el hallazgo <strong>#{findingToDelete?.id}</strong> — {findingToDelete?.finding_source_name || 'Sin fuente'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* SpeedDial ( + ) - Nuevo Hallazgo*/}
      <SpeedDialComponent
        openSpeedDial={openSpeedDial}
        handleOpenSpeedDial={() => setOpenSpeedDial(true)}
        handleCloseSpeedDial={() => setOpenSpeedDial(false)}
        speedDialActions={speedDialActions}
        handleClick={handleNewFinding}
      />
    </Box>
  );
};

export default FindingsListView;
