import { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import ArticleRow from './ArticleRow';

const SectionNode = ({
  section,
  selectedArticles,
  editedArticles = {},
  onToggleArticle,
  onToggleParagraph,
  onOpenArticle,
  readOnly = false,
}) => {
  const [open, setOpen] = useState(true);
  const articles = section.articles ?? [];

  return (
    <Box sx={{ pl: 2, borderLeft: `2px solid #EDF4F5`, ml: 1, mb: 0.5 }}>
      <Box
        display="flex"
        alignItems="center"
        gap={0.5}
        sx={{ cursor: 'pointer', py: 0.25, '&:hover': { backgroundColor: '#EFF7F9', borderRadius: 1 } }}
        onClick={() => setOpen((p) => !p)}
      >
        <IconButton size="small" sx={{ p: 0.25, color: '#929FBA' }}>
          {open ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />}
        </IconButton>
        <Typography variant="caption" fontWeight={600} sx={{ color: '#285064' }}>
          {section.title}
        </Typography>
        <Typography variant="caption" sx={{ ml: 0.5, color: '#929FBA', fontSize: '0.65rem' }}>
          ({section.article_count ?? articles.length})
        </Typography>
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ pl: 1.5 }}>
          {articles.map((art) => (
            <ArticleRow
              key={art.number}
              art={art}
              selectedArticles={selectedArticles}
              editedArticles={editedArticles}
              onToggleArticle={onToggleArticle}
              onToggleParagraph={onToggleParagraph}
              onOpenArticle={onOpenArticle}
              readOnly={readOnly}
            />
          ))}
          {articles.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ pl: 1 }}>
              {section.article_count > 0 ? `${section.article_count} artículos` : 'Sin artículos'}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SectionNode;
