import { IconButton, Tooltip } from '@mui/material';
import {
  PictureAsPdfRounded,
  AttachFileRounded,
  FormatListBulleted
} from '@mui/icons-material';

const FileUploadButtons = ({
  onStreamingUpload,
  onLocalUpload,
  onS3Upload,
  onArticlesAnalysis
}) => {
  return (
    <div className="w-[60px] flex flex-col items-center justify-start space-y-2">
      
      <input
        id="pdf-streaming-input"
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={onStreamingUpload}
      />

      <Tooltip 
        title="Adjuntar PDF (Streaming)" 
        sx={{
          '& .MuiTooltip-tooltip': {
            marginBottom: '8px',
            paddingTop: '60px',
          }
        }}
      >
        <label htmlFor="pdf-streaming-input" style={{ cursor: 'pointer' }}>
          <IconButton
            component="span"
            size="medium"
            className="text-gray-600 hover:text-green-600 !text-2xl"
          >
            <PictureAsPdfRounded fontSize="medium" />
          </IconButton>
        </label>
      </Tooltip>

      <input
        id="pdf-file-input"
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={onLocalUpload}
      />

      <Tooltip 
        title="Adjuntar archivo (local)" 
        sx={{
          '& .MuiTooltip-tooltip': {
            marginBottom: '8px',
            paddingTop: '60px',
          }
        }}
      >
        <label htmlFor="pdf-file-input" style={{ cursor: 'pointer' }}>
          <IconButton
            component="span"
            size="medium"
            className="text-gray-600 hover:text-blue-600 !text-2xl"
          >
            <AttachFileRounded fontSize="medium" />
          </IconButton>
        </label>
      </Tooltip>

      <input
        id="pdf-file-input-s3"
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={onS3Upload}
      />

      <Tooltip 
        title="Adjuntar PDF (S3 + Textract)" 
        sx={{
          '& .MuiTooltip-tooltip': {
            marginBottom: '8px',
            paddingTop: '60px',
          }
        }}
      >
        <label htmlFor="pdf-file-input-s3" style={{ cursor: 'pointer' }}>
          <IconButton
            component="span"
            size="medium"
            className="text-gray-600 hover:text-green-600 !text-2xl"
          >
            <PictureAsPdfRounded fontSize="medium" />
          </IconButton>
        </label>
      </Tooltip>

      <Tooltip title="Análisis de artículos">
        <IconButton
          size="medium"
          className="text-gray-600 hover:text-blue-600 !text-2xl"
          onClick={onArticlesAnalysis}
        >
          <FormatListBulleted fontSize="medium" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default FileUploadButtons;
