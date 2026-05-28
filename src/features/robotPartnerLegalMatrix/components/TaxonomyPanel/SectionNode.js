import { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import ArticleRow from './ArticleRow';

const SectionNode = ({ section, selectedArticles, editedArticles = {}, onToggleArticle, onOpenArticle }) => {
  const [open, setOpen] = useState(true);
  // articles: { number, paragraphs? }[]
  const articles = section.articles ?? [];

  return (
    <Box sx={{ pl: 2, borderLeft: '2px solid #e3f2fd', ml: 1, mb: 0.5 }}>
      <Box
        display="flex"
        alignItems="center"
        gap={0.5}
        sx={{ cursor: 'pointer', py: 0.25 }}
        onClick={() => setOpen((p) => !p)}
      >
        <IconButton size="small" sx={{ p: 0.25 }}>
          {open ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />}
        </IconButton>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {section.title}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
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
              onOpenArticle={onOpenArticle}
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
