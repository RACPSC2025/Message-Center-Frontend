import { useState } from "react";
import { Box, Link, Dialog, IconButton } from "@mui/material";
import InsertDriveFile from "@mui/icons-material/InsertDriveFile";
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

const AttachmentViewer = ({ attachment }) => {
  const [open, setOpen] = useState(false);

  if (!attachment || !attachment.url) return null;

  const fileUrl = attachment.url;
  const filename = fileUrl.split("/").pop().split("?")[0]; // limpiar querystring de S3
  const extension = filename.split(".").pop().toLowerCase();

  // Tipos soportados
  const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp"];
  const pdfExtensions = ["pdf"];
  const docExtensions = ["doc", "docx"];
  const excelExtensions = ["xls", "xlsx"];

  const isImage = imageExtensions.includes(extension);
  const isPdf = pdfExtensions.includes(extension);
  const isDoc = docExtensions.includes(extension);
  const isExcel = excelExtensions.includes(extension);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDownload = async () => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    
    // Limpieza
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
    // Fallback: abrir en nueva pestaña si falla el fetch
    window.open(fileUrl, '_blank');
  }
};

  return (
    <Box margin="10px 0">
      {isImage ? (
        <>
          {/* Miniatura de imagen */}
          <img
            src={fileUrl}
            alt={filename}
            style={{ 
              cursor: "pointer", 
              borderRadius: "4px", 
              objectFit: 'cover', 
              width: '150px', 
              height: '100px' 
            }}
            onClick={handleOpen}
          />

          {/* Modal estilo fancybox */}
          <Dialog open={open} onClose={handleClose} maxWidth="lg" PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}>
            {/* Barra de Herramientas Externa */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton onClick={handleDownload} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', mr: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                  <DownloadIcon />
              </IconButton>
              <IconButton onClick={handleClose} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                  <CloseIcon />
              </IconButton>
            </Box>
            {/* Contenedor de Imagen */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ background: "black", borderRadius: 2, overflow: 'hidden' }}
            >
              <img
                src={fileUrl}
                alt={filename}
                style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: 'contain' }}
              />
            </Box>
          </Dialog>
        </>
      ) : isPdf ? (
        <Box display="flex" alignItems="center" gap={1}>
          <InsertDriveFile color="primary" /> {/* PDF azul */}
          <Link href={fileUrl} target="_blank" color="primary" rel="noreferrer">
            {filename}
          </Link>
        </Box>
      ) : isDoc ? (
        <Box display="flex" alignItems="center" gap={1}>
          <InsertDriveFile color="primary" /> {/* Word azul */}
          <Link href={fileUrl} target="_blank" color="primary" rel="noreferrer">
            {filename}
          </Link>
        </Box>
      ) : isExcel ? (
        <Box display="flex" alignItems="center" gap={1}>
          <InsertDriveFile sx={{ color: "green.main" }} /> {/* Excel verde */}
          <Link href={fileUrl} target="_blank" sx={{ color: "green.main", textDecorationColor: "green.main" }} rel="noreferrer">
            {filename}
          </Link>
        </Box>
      ) : (
        // fallback para cualquier otro archivo
        <Box display="flex" alignItems="center" gap={1}>
          <InsertDriveFile />
          <Link href={fileUrl} target="_blank" rel="noreferrer">
            {filename}
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default AttachmentViewer;