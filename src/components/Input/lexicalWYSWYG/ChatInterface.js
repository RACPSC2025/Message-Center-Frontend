import React, { useState, useRef } from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  IconButton,
  Divider,
  Tooltip,
  Paper,
  Snackbar,
  Chip,
  Typography,
  Box,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  AddRounded, 
  ChatRounded, 
  DeleteOutlineRounded,
  EditRounded,
  CheckRounded,
  ContentCopyRounded,
  SourceRounded,
  TableChart,
  ExpandMore,
  ExpandLess,
  Download
} from '@mui/icons-material';

// 🆕 Componente interno para renderizar tablas
const TableMessage = ({ table, tableIndex, isExpanded, onToggle }) => {
  if (!table || !table.headers) {
    return null;
  }

  // Función para exportar tabla a CSV
  const exportToCSV = () => {
    const rows = [
      table.headers.map(h => h.text || ''),
      ...(table.body || []).map(row => row.map(cell => cell.text || ''))
    ];
    
    const csvContent = rows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabla-${table.table_id || tableIndex + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ my: 2 }}>
      {/* Header de la tabla con botón de colapsar */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ 
          mb: 1,
          p: 1.5,
          backgroundColor: '#f5f5f5',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#eeeeee' },
          transition: 'background-color 0.2s ease'
        }}
        onClick={onToggle}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small" sx={{ p: 0 }}>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          
          <TableChart color="primary" fontSize="small" />
          
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            Tabla #{table.table_id || tableIndex + 1}
          </Typography>
          
          <Chip 
            label={`Página ${table.page}`} 
            size="small" 
            variant="outlined"
            sx={{ height: '20px', fontSize: '11px' }}
          />
          
          {table.confidence && (
            <Chip 
              label={`${Math.round(table.confidence)}%`} 
              size="small" 
              color={table.confidence > 90 ? 'success' : 'warning'}
              sx={{ height: '20px', fontSize: '11px' }}
            />
          )}
        </Box>

        {/* Botón de exportar */}
        <Tooltip title="Exportar a CSV">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              exportToCSV();
            }}
            sx={{
              '&:hover': { 
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: '#2196f3'
              }
            }}
          >
            <Download fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contenido de la tabla (colapsable) */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <TableContainer 
          component={Paper} 
          elevation={2}
          sx={{ 
            maxWidth: '100%',
            overflowX: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: '0 0 8px 8px',
            // 🆕 Scroll horizontal mejorado
            '&::-webkit-scrollbar': {
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#bdbdbd',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#9e9e9e'
              }
            }
          }}
        >
          <Table 
            size="small" 
            sx={{ 
              minWidth: 300,
              // Asegurar que la tabla no se comprima
              tableLayout: 'auto'
            }}
          >
            {/* Headers */}
            {table.headers && table.headers.length > 0 && (
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  {table.headers.map((header, idx) => (
                    <TableCell 
                      key={idx}
                      sx={{ 
                        fontWeight: 'bold',
                        borderBottom: '2px solid #2196f3',
                        padding: '12px 16px',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#fafafa',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }}
                      rowSpan={header.row_span || 1}
                      colSpan={header.col_span || 1}
                    >
                      {header.text || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            )}

            {/* Body */}
            <TableBody>
              {table.body && table.body.length > 0 ? (
                table.body.map((row, rowIdx) => (
                  <TableRow 
                    key={rowIdx}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': { backgroundColor: '#f0f0f0' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {row.map((cell, cellIdx) => (
                      <TableCell 
                        key={cellIdx}
                        sx={{ 
                          padding: '10px 16px',
                          borderBottom: '1px solid #e0e0e0',
                          whiteSpace: 'nowrap',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        rowSpan={cell.row_span || 1}
                        colSpan={cell.col_span || 1}
                        title={cell.text} // Tooltip con texto completo
                      >
                        {cell.text || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={table.headers?.length || 1} 
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Sin datos
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Información adicional */}
        <Box display="flex" gap={1} mt={1} px={1}>
          {table.rows && table.cols && (
            <>
              <Chip 
                label={`${table.rows} filas`} 
                size="small" 
                variant="outlined"
                sx={{ height: '20px', fontSize: '11px' }}
              />
              <Chip 
                label={`${table.cols} columnas`} 
                size="small" 
                variant="outlined"
                sx={{ height: '20px', fontSize: '11px' }}
              />
            </>
          )}
          
          {table.confidence && (
            <Chip 
              label={`Confianza: ${Math.round(table.confidence)}%`} 
              size="small" 
              color={table.confidence > 90 ? 'success' : table.confidence > 70 ? 'warning' : 'error'}
              variant="outlined"
              sx={{ height: '20px', fontSize: '11px' }}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

function ChatInterface({ 
  children,
  historicTextIA,
  setHistoricTextIA,
  currentHistoricIAPosition,
  setCurrentHistoricIAPosition,
  hideConversationList = false
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ y: 0 });
  const [expandedTables, setExpandedTables] = useState({}); // 🆕 Estado para tablas colapsables
  const chatEndRef = useRef(null);
  const chatAreaRef = useRef(null);

  // 🆕 Toggle para expandir/colapsar tablas
  const toggleTable = (messageIndex, tableIndex) => {
    const key = `${messageIndex}-${tableIndex}`;
    setExpandedTables(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Función para scroll manual
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Crear nueva conversación
  const handleNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      label: `Conversación ${historicTextIA.length + 1}`,
      contenido: []
    };
    setHistoricTextIA([...historicTextIA, newConversation]);
    setCurrentHistoricIAPosition(historicTextIA.length);
  };

  // Eliminar conversación
  const handleDeleteConversation = (index) => {
    if (historicTextIA.length > 1) {
      const newHistoric = historicTextIA.filter((_, i) => i !== index);
      setHistoricTextIA(newHistoric);
      if (currentHistoricIAPosition >= newHistoric.length) {
        setCurrentHistoricIAPosition(newHistoric.length - 1);
      }
    }
  };

  // Iniciar edición de título
  const handleStartEditTitle = (index, currentTitle) => {
    setEditingIndex(index);
    setEditingTitle(currentTitle);
  };

  // Guardar título editado
  const handleSaveTitle = (index) => {
    if (editingTitle.trim()) {
      const updatedHistoric = [...historicTextIA];
      updatedHistoric[index].label = editingTitle.trim();
      setHistoricTextIA(updatedHistoric);
    }
    setEditingIndex(null);
    setEditingTitle('');
  };

  // Cancelar edición de título
  const handleCancelEditTitle = () => {
    setEditingIndex(null);
    setEditingTitle('');
  };

  // Manejar cambios en el texto editable
  const handleContentChange = (messageIndex, e) => {
    const newText = e.currentTarget.textContent || '';
    
    if (newText !== historicTextIA[currentHistoricIAPosition].contenido[messageIndex].text) {
      const updatedHistoric = [...historicTextIA];
      updatedHistoric[currentHistoricIAPosition].contenido[messageIndex].text = newText;
      setHistoricTextIA(updatedHistoric);
    }
  };

  // Prevenir salto de línea con Enter (opcional)
  const handleKeyDown = (e) => {
    // Si quieres que Enter inserte salto de línea, comenta estas líneas
    // if (e.key === 'Enter' && !e.shiftKey) {
    //   e.preventDefault();
    // }
  };

  // Función para copiar texto al portapapeles
  const handleCopyText = async (messageIndex) => {
    try {
      const textToCopy = historicTextIA[currentHistoricIAPosition].contenido[messageIndex].text;
      await navigator.clipboard.writeText(textToCopy);
      setSnackbarOpen(true);
      console.log('✅ Texto copiado al portapapeles');
    } catch (error) {
      console.error('❌ Error al copiar texto:', error);
      alert('No se pudo copiar el texto. Por favor, inténtalo nuevamente.');
    }
  };

  // Cerrar notificación
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Manejar movimiento del mouse - seguir posición Y
  const handleMouseMove = (e, messageIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    const buttonHeight = 32;
    const maxY = rect.height - buttonHeight;
    const constrainedY = Math.min(Math.max(y - buttonHeight / 2, 0), maxY);
    
    setCursorPosition({ y: constrainedY });
    setHoveredMessageIndex(messageIndex);
  };

  // Manejar cuando el mouse sale del mensaje
  const handleMouseLeave = () => {
    setHoveredMessageIndex(null);
  };

  const currentConversation = historicTextIA[currentHistoricIAPosition];

  return (
    <div className="flex h-screen">
      {/* Sidebar izquierdo - Lista de conversaciones (condicional) */}
      {!hideConversationList && (
        <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
          {/* Header del sidebar */}
          <div className="p-4 border-b border-gray-300 bg-white">
            <Tooltip title="Nueva conversación">
              <IconButton
                onClick={handleNewConversation}
                size="small"
                sx={{ 
                  backgroundColor: '#2196f3', 
                  color: 'white',
                  '&:hover': { backgroundColor: '#1976d2' },
                  width: '40px',
                  height: '40px'
                }}
              >
                <AddRounded />
              </IconButton>
            </Tooltip>
          </div>

          {/* Lista de conversaciones */}
          <List className="flex-grow overflow-y-auto p-2">
            {historicTextIA.map((conversation, index) => (
              <ListItem
                key={conversation.id}
                disablePadding
                className="mb-2"
                secondaryAction={
                  <div className="flex gap-1">
                    {editingIndex === index ? (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleSaveTitle(index)}
                        sx={{ color: '#4caf50' }}
                      >
                        <CheckRounded fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditTitle(index, conversation.label);
                        }}
                      >
                        <EditRounded fontSize="small" />
                      </IconButton>
                    )}
                    {historicTextIA.length > 1 && (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(index);
                        }}
                      >
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                }
              >
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleSaveTitle(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveTitle(index);
                      } else if (e.key === 'Escape') {
                        handleCancelEditTitle();
                      }
                    }}
                    autoFocus
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  <ListItemButton
                    selected={currentHistoricIAPosition === index}
                    onClick={() => setCurrentHistoricIAPosition(index)}
                    sx={{
                      borderRadius: '8px',
                      borderLeft: currentHistoricIAPosition === index ? '4px solid #2196f3' : '4px solid transparent',
                      '&.Mui-selected': {
                        backgroundColor: '#e3f2fd',
                        '&:hover': { backgroundColor: '#bbdefb' }
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ChatRounded 
                      className="mr-3" 
                      fontSize="small"
                      sx={{
                        color: currentHistoricIAPosition === index ? '#2196f3' : '#757575'
                      }}
                    />
                    <ListItemText
                      primary={conversation.label}
                      secondary={`${conversation.contenido.length} mensajes`}
                      primaryTypographyProps={{ 
                        fontSize: '14px',
                        fontWeight: 400,
                        color: currentHistoricIAPosition === index ? '#1976d2' : 'inherit',
                        sx: { 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          pr: 6,
                          textDecoration: currentHistoricIAPosition === index ? 'underline' : 'none',
                          textDecorationColor: currentHistoricIAPosition === index ? '#2196f3' : 'transparent',
                          textDecorationThickness: '2px',
                          textUnderlineOffset: '3px'
                        }
                      }}
                      secondaryTypographyProps={{ 
                        fontSize: '12px',
                        color: currentHistoricIAPosition === index ? '#1976d2' : 'inherit'
                      }}
                    />
                  </ListItemButton>
                )}
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {/* Área principal - Chat e Input */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Área de historial de chat */}
        <div 
          ref={chatAreaRef}
          className="flex-grow overflow-y-auto bg-gray-50 p-6"
          style={{
            maxHeight: '400px'
          }}
        >
          <div className="w-full">
            {/* Header de la conversación actual (condicional) */}
            {!hideConversationList && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentConversation?.label}
                </h2>
              </div>
            )}

            {/* Mensajes del chat */}
            {currentConversation?.contenido.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <ChatRounded sx={{ fontSize: 60, opacity: 0.3 }} />
                <p className="mt-4 text-lg">Carga un documento PDF</p>
              </div>
            ) : (
              currentConversation?.contenido.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div 
                    className="relative group max-w-[90%]"
                    onMouseMove={(e) => handleMouseMove(e, index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Paper
                      elevation={1}
                      className={`p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {/* Texto del mensaje (editable) */}
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentChange(index, e)}
                        onKeyDown={handleKeyDown}
                        className="text-sm focus:outline-none"
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          minHeight: '20px'
                        }}
                      >
                        {message.text}
                      </div>
                      
                      {/* 🆕 Renderizar tablas si existen */}
                      {message.tables && message.tables.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.12)' }} />
                          
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <TableChart color="primary" />
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              📊 Tablas extraídas ({message.tables.length})
                            </Typography>
                          </Box>
                          
                          {message.tables.map((table, tableIdx) => {
                            const key = `${index}-${tableIdx}`;
                            return (
                              <TableMessage 
                                key={key} 
                                table={table} 
                                tableIndex={tableIdx}
                                isExpanded={expandedTables[key] || false}
                                onToggle={() => toggleTable(index, tableIdx)}
                              />
                            );
                          })}
                        </Box>
                      )}

                      {/* Mostrar fuentes si existen */}
                      {message.sources && message.sources.length > 0 && (
                        <Box mt={2} p={1.5} bgcolor="rgba(255,255,255,0.15)" borderRadius={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <SourceRounded 
                              sx={{ 
                                fontSize: '16px', 
                                color: message.role === 'user' ? '#fff' : '#666' 
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              fontWeight="bold"
                              sx={{ 
                                color: message.role === 'user' ? '#fff' : '#666' 
                              }}
                            >
                              📚 Fuentes consultadas:
                            </Typography>
                          </Box>
                          
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {message.sources.slice(0, 3).map((source, idx) => {
                              const fileName = source.metadata?.['x-amz-bedrock-kb-source-uri']?.split('/').pop() 
                                || source.location?.uri?.split('/').pop()
                                || `Fuente ${idx + 1}`;
                              
                              return (
                                <Chip
                                  key={idx}
                                  label={fileName}
                                  size="small"
                                  icon={<SourceRounded sx={{ fontSize: '14px !important' }} />}
                                  sx={{
                                    height: '24px',
                                    fontSize: '11px',
                                    backgroundColor: message.role === 'user' 
                                      ? 'rgba(255,255,255,0.2)' 
                                      : 'rgba(0,0,0,0.08)',
                                    color: message.role === 'user' ? '#fff' : '#333',
                                    '& .MuiChip-icon': {
                                      color: message.role === 'user' ? '#fff' : '#666'
                                    },
                                    '&:hover': {
                                      backgroundColor: message.role === 'user' 
                                        ? 'rgba(255,255,255,0.3)' 
                                        : 'rgba(0,0,0,0.12)'
                                    }
                                  }}
                                />
                              );
                            })}
                            
                            {message.sources.length > 3 && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : '#999',
                                  fontSize: '10px',
                                  fontStyle: 'italic'
                                }}
                              >
                                +{message.sources.length - 3} fuentes más
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Mostrar sessionId si existe (opcional - para debug) */}
                      {message.sessionId && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            mt: 1,
                            opacity: 0.5,
                            fontSize: '10px',
                            color: message.role === 'user' ? '#fff' : '#666'
                          }}
                        >
                          Session: {message.sessionId.substring(0, 8)}...
                        </Typography>
                      )}
                      
                      {/* Timestamp */}
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </Paper>
                    
                    {/* Botones de acción que siguen el cursor en Y */}
                    {hoveredMessageIndex === index && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: `${cursorPosition.y}px`,
                          right: '-10px',
                          transition: 'top 0.1s ease-out',
                          display: 'flex',
                          gap: '4px',
                          zIndex: 10
                        }}
                      >
                        {/* Botón Copiar */}
                        <Tooltip title="Copiar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(index);
                            }}
                            sx={{
                              backgroundColor: 'white',
                              boxShadow: 2,
                              width: '32px',
                              height: '32px',
                              '&:hover': { 
                                backgroundColor: '#e3f2fd',
                                color: '#2196f3',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ContentCopyRounded sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Botón Editar */}
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: 'white',
                              boxShadow: 2,
                              width: '32px',
                              height: '32px',
                              '&:hover': { 
                                backgroundColor: '#fff3e0',
                                color: '#ff9800',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditRounded sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <Divider />

        {/* Área de input - Tu contenido existente */}
        <div className="p-4 bg-white border-t border-gray-200">
          {children}
        </div>
      </div>

      {/* Snackbar para notificación de copiado */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="✅ Texto copiado al portapapeles"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}

export default ChatInterface;