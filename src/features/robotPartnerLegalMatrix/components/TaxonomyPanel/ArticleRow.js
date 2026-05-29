import { Box, Checkbox, Typography, Tooltip } from '@mui/material';
import { EditNoteRounded } from '@mui/icons-material';

// Extrae el label corto del identifier: "PARÁGRAFO." o "PARÁGRAFO 1" o "PARÁGRAFO ÚNICO"
// El resto es texto del párrafo — se usa como preview
function splitParaIdentifier(identifier = '') {
  // Intentar extraer solo la etiqueta ("PARÁGRAFO ÚNICO", "PARÁGRAFO 1", "PARÁGRAFO.")
  const match = identifier.match(/^(PARÁGRAFO[.\s]*(ÚNICO|\d+)?\.?)\s*/i);
  if (match) {
    const label = match[0].trim().replace(/\.$/, '');   // "PARÁGRAFO ÚNICO" | "PARÁGRAFO 1"
    const preview = identifier.slice(match[0].length).trim();
    return { label: label || 'PARÁGRAFO', preview };
  }
  // Sin patrón reconocible: truncar a 60 chars como label
  return {
    label: identifier.length > 60 ? `${identifier.slice(0, 60)}…` : identifier,
    preview: '',
  };
}

// art: { number: string, paragraphs?: { identifier: string, content?: string }[] }
// selectedArticles: { articleId, paragraphId?: string, editedContent }[]
const ArticleRow = ({
  art,
  selectedArticles,
  editedArticles = {},
  onToggleArticle,
  onToggleParagraph,
  onOpenArticle,
  readOnly = false,
}) => {
  const artId    = art.number;
  const paragraphs = art.paragraphs ?? [];
  const hasEdit  = Boolean(editedArticles[artId]);

  const isArticleSelected = selectedArticles.some(
    (a) => a.articleId === artId && !a.paragraphId,
  );

  const isParagraphSelected = (pid) =>
    selectedArticles.some((a) => a.articleId === artId && a.paragraphId === pid);

  return (
    <Box>
      {/* ── Artículo ─────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={0.5} sx={{ py: 0.15 }}>
        {!readOnly && (
          <Checkbox
            size="small"
            checked={isArticleSelected}
            onChange={() => onToggleArticle(artId)}
            sx={{ p: 0.25, color: '#19AABB', '&.Mui-checked': { color: '#19AABB' } }}
          />
        )}
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{
            cursor: readOnly ? 'default' : 'pointer',
            color: '#285064',
            '&:hover': !readOnly ? { color: '#19AABB', textDecoration: 'underline' } : {},
          }}
          onClick={() => !readOnly && onOpenArticle(artId)}
        >
          Art. {artId}
        </Typography>
        {hasEdit && !readOnly && (
          <Tooltip title="Tiene edición guardada localmente">
            <EditNoteRounded sx={{ fontSize: 13, color: '#D6CB6F' }} />
          </Tooltip>
        )}
      </Box>

      {/* ── PARÁGRAFOS ───────────────────────────────────────────────── */}
      {paragraphs.length > 0 && (
        <Box sx={{ pl: readOnly ? 1.5 : 4.5, pb: 0.5 }}>
          {paragraphs.map((p) => {
            const { label, preview } = splitParaIdentifier(p.identifier);
            // Texto de preview: preferir lo que viene después del label en identifier,
            // sino usar content. Evitar duplicar si son iguales.
            const bodyText = preview || (p.content !== p.identifier ? p.content : '') || '';
            const truncated = bodyText.length > 110 ? `${bodyText.slice(0, 110)}…` : bodyText;

            return (
              <Box
                key={p.identifier}
                display="flex"
                alignItems="flex-start"
                gap={0.5}
                sx={{
                  py: 0.3,
                  pl: 0.75,
                  mb: 0.25,
                  borderLeft: '2px solid #19AABB',
                  backgroundColor: '#EFF7F9',
                  borderRadius: '0 4px 4px 0',
                }}
              >
                {!readOnly && (
                  <Checkbox
                    size="small"
                    checked={isParagraphSelected(p.identifier)}
                    onChange={() => onToggleParagraph(artId, p.identifier, p.content ?? p.identifier)}
                    sx={{ p: 0.25, mt: '-1px', color: '#19AABB', '&.Mui-checked': { color: '#19AABB' } }}
                  />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#285064', fontWeight: 700, fontSize: '0.7rem', display: 'block' }}
                  >
                    ↳ {label}
                  </Typography>
                  {truncated && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#2B303B', fontSize: '0.67rem', display: 'block', opacity: 0.72, lineHeight: 1.4 }}
                    >
                      {truncated}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ArticleRow;
