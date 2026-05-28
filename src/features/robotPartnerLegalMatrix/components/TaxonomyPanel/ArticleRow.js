import { useState } from 'react';
import { Box, Checkbox, Typography, Tooltip, Collapse } from '@mui/material';
import { EditNoteRounded, ExpandMore, ExpandLess } from '@mui/icons-material';

// art: { number: string, paragraphs?: { identifier: string, content?: string }[] }
const ArticleRow = ({ art, selectedArticles, editedArticles = {}, onToggleArticle, onOpenArticle }) => {
  const artId = art.number;
  const isSelected = selectedArticles.some((a) => a.articleId === artId);
  const hasEdit = Boolean(editedArticles[artId]);
  const paragraphs = art.paragraphs ?? [];
  const [paraOpen, setParaOpen] = useState(false);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={0.5} sx={{ py: 0.15 }}>
        <Checkbox
          size="small"
          checked={isSelected}
          onChange={() => onToggleArticle(artId)}
          sx={{ p: 0.25 }}
        />
        <Typography
          variant="caption"
          sx={{ cursor: 'pointer', color: '#1565c0', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => onOpenArticle(artId)}
        >
          Art. {artId}
        </Typography>
        {hasEdit && (
          <Tooltip title="Tiene edición guardada localmente">
            <EditNoteRounded sx={{ fontSize: 13, color: '#f57c00' }} />
          </Tooltip>
        )}
        {paragraphs.length > 0 && (
          <Tooltip title={paraOpen ? 'Ocultar parágrafos' : `${paragraphs.length} parágrafo(s)`}>
            <Box
              component="span"
              onClick={() => setParaOpen((p) => !p)}
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9e9e9e' }}
            >
              {paraOpen
                ? <ExpandLess sx={{ fontSize: 12 }} />
                : <ExpandMore sx={{ fontSize: 12 }} />}
            </Box>
          </Tooltip>
        )}
      </Box>

      {paragraphs.length > 0 && (
        <Collapse in={paraOpen} unmountOnExit>
          <Box sx={{ pl: 4.5, pb: 0.5 }}>
            {paragraphs.map((p) => (
              <Box key={p.identifier} sx={{ mb: 0.25 }}>
                <Typography variant="caption" sx={{ color: '#757575', fontStyle: 'italic', fontSize: 10 }}>
                  ↳ {p.identifier}
                </Typography>
                {p.content && (
                  <Typography variant="caption" sx={{ display: 'block', color: '#9e9e9e', fontSize: 10, pl: 1 }}>
                    {p.content.length > 120 ? `${p.content.slice(0, 120)}…` : p.content}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default ArticleRow;
