import { useState } from 'react';
import { Box, Typography, Collapse, IconButton, Chip } from '@mui/material';
import { ExpandMore, ExpandLess, FolderOpenRounded, FolderRounded } from '@mui/icons-material';
import SectionNode from './SectionNode';
import ArticleRow from './ArticleRow';

const ChapterNode = ({
  chapter,
  selectedArticles,
  editedArticles = {},
  onToggleArticle,
  onToggleParagraph,
  onOpenArticle,
  readOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const sections = chapter.sections ?? [];
  const orphans  = chapter.orphan_articles ?? [];
  const totalArticles =
    orphans.length +
    sections.reduce((sum, s) => sum + (s.article_count ?? s.articles?.length ?? 0), 0);

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        display="flex"
        alignItems="center"
        gap={0.75}
        sx={{ cursor: 'pointer', py: 0.5, px: 1, borderRadius: 1, '&:hover': { backgroundColor: '#EDF4F5' } }}
        onClick={() => setOpen((p) => !p)}
      >
        <IconButton size="small" sx={{ p: 0.25, color: '#929FBA' }}>
          {open ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
        </IconButton>
        {open
          ? <FolderOpenRounded sx={{ fontSize: 16, color: '#19AABB' }} />
          : <FolderRounded     sx={{ fontSize: 16, color: '#19AABB' }} />}
        <Typography variant="caption" fontWeight={700} sx={{ flex: 1, color: '#285064' }}>
          {chapter.title}
        </Typography>
        <Chip
          label={totalArticles}
          size="small"
          sx={{ height: 16, fontSize: 10, backgroundColor: '#EDF4F5', color: '#285064' }}
        />
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ pl: 1 }}>
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
          {sections.map((sec, si) => (
            <SectionNode
              key={sec.title ?? si}
              section={sec}
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

export default ChapterNode;
