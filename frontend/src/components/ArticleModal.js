import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Button,
  ImageList,
  ImageListItem,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import articleService from '../services/articleService';
import { useState } from 'react';
import ShareDialog from './ShareDialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import dicomService from '../services/dicomService';

/**
 * ArticleModal – full-screen modal showing a medical article with the template look-and-feel.
 *
 * Required props:
 *   open       : boolean   – whether the dialog is open
 *   onClose    : () => void
 *   article    : {
 *                  id,title,content,createdAt,authorName?,authorId?,pdfUrl?,imageIds?:string[],
 *                  specialty?, views?, likes?
 *                }
 */
const ArticleModal = ({ open, onClose, article }) => {
  

    const [likeCount, setLikeCount] = useState(article?.likeCount ?? 0);
  const [shareOpen, setShareOpen] = useState(false);

  if (!article) return null;
  

  const {
    title,
    content,
    createdAt,
    authorName,
    pdfUrl,
    imageIds = [],
    specialty = 'Radiologie',
    views = 0,
  } = article;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box
        sx={{
          px: 3,
          py: 2,
          background: 'linear-gradient(90deg, #2644ff 0%, #6b37ff 100%)',
          color: '#fff',
          position: 'relative',
        }}
      >
        <Chip
          label={specialty}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 600, mr: 2 }}
        />
        <Typography component="span" sx={{ mr: 3 }}>
          👁️ {views}
        </Typography>
        <Typography component="span">❤️ {likeCount}</Typography>

        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="body2">👩‍⚕️ {authorName || 'Dr. —'}</Typography>
          <Typography variant="body2">📅 {new Date(createdAt).toLocaleDateString()}</Typography>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', minHeight: 600 }}>
        {/* LEFT – main article */}
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          {/* SUMMARY */}
          {article.summary && (
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: 'rgba(38,68,255,0.06)',
                p: 2,
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                Résumé
              </Typography>
              <Typography variant="body2">{article.summary}</Typography>
            </Box>
          )}

          {/* CONTENT */}
          <Typography sx={{ whiteSpace: 'pre-line', mb: 3 }}>{content}</Typography>

          {/* IMAGES */}
          {imageIds.length > 0 && (
            <>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Chip icon={<VisibilityIcon />} label="Images médicales associées" sx={{ fontWeight: 500 }} />
                <Chip
                  label={`${imageIds.length} image(s)`}
                  size="small"
                  sx={{ bgcolor: '#e6d8ff', color: '#6b37ff' }}
                />
              </Stack>

              <ImageList cols={3} gap={8} rowHeight={160}>
                {imageIds.map((oid, idx) => (
                  <ImageListItem key={`${oid}-${idx}`} sx={{ cursor: 'pointer' }}>
                    <img
                      src={dicomService.getInstanceImageUrl
                        ? dicomService.getInstanceImageUrl(oid)
                        : `/api/v1/dicom/instances/${oid}/preview`}
                      alt={oid}
                      loading="lazy"
                      style={{ borderRadius: 4, width: '100%', height: '100%', objectFit: 'cover' }}
                      onClick={() => window.open(`/patients/dicom/${oid}`, '_blank')}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </>
          )}
        </Box>

        {/* RIGHT – sidebar actions */}
        <Divider orientation="vertical" flexItem />
        <Box
          sx={{
            width: 260,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Button variant="outlined" startIcon={<FavoriteBorderIcon />} onClick={async () => {try { const {count}= await articleService.like(article.id); setLikeCount(count);} catch(e){console.error(e);}}}>{`Aimer (${likeCount})`}</Button>
          <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => setShareOpen(true)}>Partager</Button>
          {pdfUrl && (
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} href={pdfUrl} target="_blank">
              Télécharger PDF
            </Button>
          )}
        </Box>
      </DialogContent>
    <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} onConfirm={(ids)=> articleService.share(article.id, ids)} />
    </Dialog>
  );
};

export default ArticleModal;
