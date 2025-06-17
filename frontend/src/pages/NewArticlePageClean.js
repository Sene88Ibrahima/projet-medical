// src/pages/NewArticlePageClean.js
import React from 'react';
import { Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArticleForm from '../components/ArticleForm';

const NewArticlePage = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <ArticleForm
          onSuccess={() => navigate('/articles')}
          onCancel={() => navigate('/articles')}
        />
      </Paper>
    </Container>
  );
};

export default NewArticlePage;
