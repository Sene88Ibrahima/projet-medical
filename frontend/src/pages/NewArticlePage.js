 // Redirect to cleaned page
export { default } from './NewArticlePageClean';
/*
export { default } from './NewArticlePageClean';
// duplicate export commented



 NewArticlePageClean;

// duplicate export commented

 from 'react';
 { Container, Paper } from '@mui/material';
 { useNavigate } from 'react-router-dom';
 ArticleForm from '../components/ArticleForm';

const NewArticlePage = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <ArticleForm
          onSuccess={(article) => navigate('/articles')}
          onCancel={() => navigate('/articles')}
        />
      </Paper>
    </Container>
  );
};

export default NewArticlePage; */
  const navigate = useNavigate();
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <ArticleForm
          onSuccess={(art) => navigate('/articles')}
          onCancel={() => navigate('/articles')}
 {
  Container,
  Paper,
  TextField,
  Button,
  Stack,
  Box,
  UploadFileIcon,
  
} from '@mui/material';




// duplicate removed () => {
  
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageIds, setImageIds] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('authorId', user?.id);
    if (imageIds.trim()) {
      imageIds.split(',').forEach((id) => formData.append('imageIds', id.trim()));
    }
    if (pdfFile) {
      formData.append('pdfFile', pdfFile);
    }

    try {
      setSubmitting(true);
      const created = await articleService.create(formData);
      navigate('/articles');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <ArticleForm onSuccess={(art) => navigate('/articles')} onCancel={() => navigate('/articles')} />
            <TextField
              label="Titre"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Contenu"
              fullWidth
              required
              multiline
              minRows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <TextField
              label="IDs d'images Orthanc (séparés par des virgules)"
              fullWidth
              value={imageIds}
              onChange={(e) => setImageIds(e.target.value)}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              {pdfFile ? pdfFile.name : 'Joindre un PDF'}
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                type="submit"
                disabled={submitting}
              >
                Publier
              </Button>
              <Button variant="outlined" onClick={() => navigate('/articles')}>
                Annuler
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

 NewArticlePage;
