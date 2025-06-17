// src/pages/ArticlesPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Chip,
  Avatar,
  IconButton,
  MenuItem,
  Select,
  InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import userService from '../services/userService';
import articleService from '../services/articleService';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [authors, setAuthors] = useState({}); // {id: 'Nom'}
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const artData = await articleService.getAll();
        setArticles(artData);

        const ids = [...new Set(artData.map((a) => a.authorId).filter(Boolean))];
        if (ids.length) {
          const results = await Promise.all(ids.map((id) => userService.getById(id).catch(() => null)));
          const map = {};
          ids.forEach((id, idx) => {
            const user = results[idx];
            if (user) {
              const fullName = `${user.lastName ?? ''} ${user.firstName ?? ''}`.trim();
              map[id] = fullName || 'Inconnu';
            }
          });
          setAuthors(map);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Tous' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <Box sx={{ backgroundColor: '#f4f8ff', minHeight: '100vh', py: 4 }}>
      <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Articles Médicaux
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Base de connaissances partagée par la communauté médicale
          </Typography>
        </Box>
        <Typography variant="h4">Articles médicaux</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/articles/new')}
        >
          Nouvel article
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Rechercher par titre, auteur ou mots-clés…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            sx: { backgroundColor: '#fff' },
            startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
          }}
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 120, backgroundColor: '#fff' }}
        >
          <MenuItem value="Tous">Tous</MenuItem>
          {[...new Set(articles.map((a) => a.category).filter(Boolean))].map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
         {filtered.length} article(s) trouvé(s)
       </Typography>

       <Grid container spacing={3}>
        {filtered.map((article) => (
          <Grid item xs={12} sm={6} md={4} key={article.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
                {article.category && (
                  <Chip label={article.category} size="small" color="primary" sx={{ position: 'absolute', top: 16, left: 16 }} />
                )}
              <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <VisibilityIcon fontSize="small" sx={{ opacity: 0.7 }} /> {article.views ?? 0}
                    <FavoriteBorderIcon fontSize="small" sx={{ ml: 2, opacity: 0.7 }} /> {article.likes ?? 0}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                  {article.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.content}
                </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <ImageIcon fontSize="small" sx={{ opacity: 0.6 }} />
                    <Typography variant="caption">{article.imageIds?.length ?? 0} image(s) médicale(s)</Typography>
                  </Box>
                </CardContent>
              <Box px={2} pb={1}>
                  {article.tags && article.tags.slice(0, 4).map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                <CardActions sx={{ pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{(authors[article.authorId] ?? article.authorName ?? 'A')[0]}</Avatar>
                    <Typography variant="caption">Dr. {authors[article.authorId] ?? article.authorName ?? 'Inconnu'}</Typography>
                    <Typography variant="caption" color="text.secondary">· {new Date(article.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Button size="small" variant="contained" onClick={() => navigate(`/articles/${article.id}`)}>
                  Consulter
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
    </Box>
  );
};

export default ArticlesPage;
