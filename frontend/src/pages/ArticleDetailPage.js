// src/pages/ArticleDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleModal from '../components/ArticleModal';
import articleService from '../services/articleService';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await articleService.getById(id);
        setArticle(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  if (!article) return null;

  return (
    <ArticleModal open={true} article={article} onClose={() => navigate('/articles')} />
  );
};

export default ArticleDetailPage;
/* LEGACY CODE START
import {
  Container,
  Typography,
  Chip,
  Stack,
  ImageList,
  ImageListItem,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import articleService from '../services/articleService';
import dicomService from '../services/dicomService';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await articleService.getById(id);
        setArticle(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [id]);


  if (!article) return null;

  return (
    <ArticleModal open={true} article={article} onClose={() => navigate('/articles')} />
  );
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {article.title}
      </Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <Chip label={`Auteur ID: ${article.authorId}`} />
        <Chip label={new Date(article.createdAt).toLocaleDateString()} />
      </Stack>

      {article.pdfUrl && (
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          href={article.pdfUrl}
          target="_blank"
          sx={{ mb: 2 }}
        >
          Voir le PDF
        </Button>
      )}

      {/* legacy code removed * / sx={{ whiteSpace: 'pre-line', mb: 3 }}>{article.content}</Typography>

      {article.imageIds && article.imageIds.length > 0 && (
        <>
          {/* legacy code removed * / variant="h6" mb={1}>
            Images associées
          </Typography>
          <ImageList cols={3} gap={8} rowHeight={160}>
            {article.imageIds.map((oid, index) => (
              <ImageListItem key={`${oid}-${index}`}>
                <img
                  src={dicomService.getInstanceImageUrl
                    ? dicomService.getInstanceImageUrl(oid)
                    : `/api/v1/dicom/instances/${oid}/preview`}
                  alt={oid}
                  loading="lazy"
                />
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  onClick={() => window.open(`/patients/dicom/${oid}`, '_blank')}
                >
                  <VisibilityIcon />
                </IconButton>
              </ImageListItem>
            ))}
          </ImageList>
        </>
      )}
    
  );
};

export default ArticleDetailPage;
*/
