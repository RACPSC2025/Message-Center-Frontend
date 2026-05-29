import { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import ChapterNode from './ChapterNode';
import ArticleRow from './ArticleRow';

const TitleNode = ({
  titulo,
  selectedArticles,
  editedArticles = {},
  onToggleArticle,
  onToggleParagraph,
  onOpenArticle,
  readOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const chapters = titulo.chapters ?? [];
  const orphans  = titulo.orphan_articles ?? [];

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        display="flex"
        alignItems="center"
        gap={0.5}
        sx={{ cursor: 'pointer', py: 0.4, px: 1, borderRadius: 1, '&:hover': { backgroundColor: '#EDF4F5' } }}
        onClick={() => setOpen((p) => !p)}
      >
        <IconButton size="small" sx={{ p: 0.25, color: '#929FBA' }}>
          {open ? <ExpandLess sx={{ fontSize: 15 }} /> : <ExpandMore sx={{ fontSize: 15 }} />}
        </IconButton>
        <Typography variant="caption" fontWeight={700} sx={{ flex: 1, color: '#285064', fontSize: '0.72rem' }}>
          {titulo.title}
        </Typography>
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ pl: 1.5 }}>
          {orphans.map((art) => (
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
          {chapters.map((ch, ci) => (
            <ChapterNode
              key={ch.title ?? ci}
              chapter={ch}
              selectedArticles={selectedArticles}
              editedArticles={editedArticles}
              onToggleArticle={onToggleArticle}
              onToggleParagraph={onToggleParagraph}
              onOpenArticle={onOpenArticle}
              readOnly={readOnly}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default TitleNode;
