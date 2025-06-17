// src/components/ArticleForm.js
import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Stack,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Typography,
  MenuItem,
  Grid,
  IconButton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import articleService from '../services/articleService';
import dicomService from '../services/dicomService';
import ImageIcon from '@mui/icons-material/Image';
import { useAuth } from '../context/AuthContext';

const specialties = [
  'Radiologie',
  'Cardiologie',
  'Neurologie',
  'Orthopédie',
  'Gastroentérologie',
  'Pneumologie',
];

const steps = ['Informations', 'Images & Publication'];

export default function ArticleForm({ onSuccess, onCancel }) {
  const { user } = useAuth();

  const [activeStep, setActiveStep] = useState(0);

  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [images, setImages] = useState([]); // {id, preview, filename}
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleImageSelection = async (files) => {
    const arrFiles = Array.from(files);
    for (const file of arrFiles) {
      try {
        setUploading(true);
        const res = await dicomService.uploadDicomFile(file);
        const instanceId = res?.ID || res?.id || res?.instanceId || res;
        setImages((prev) => [
          ...prev,
          {
            id: instanceId,
            filename: file.name,
            preview:
              file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : dicomService.getInstanceImageUrl(instanceId),
          },
        ]);
      } catch (err) {
        console.error('Upload échoué', err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', `${summary}\n\n${content}`);
    
    if (pdfFile) formData.append('pdfFile', pdfFile);
    images.forEach((img) => formData.append('imageIds', img.id));
    try {
      const created = await articleService.create(formData);
      if (onSuccess) onSuccess(created);
    } catch (err) {
      console.error(err);
    }
  };

  const isInfoValid = title && specialty && summary && content;

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Stack spacing={3}>
          <TextField
            label="Titre *"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            select
            label="Spécialité *"
            fullWidth
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {specialties.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Résumé *"
            multiline
            minRows={3}
            fullWidth
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <TextField
            label="Contenu *"
            multiline
            minRows={6}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Tags */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="Ajouter un mot-clé"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button onClick={addTag}><AddIcon /></Button>
          </Stack>
          <Box>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => removeTag(tag)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>

          {/* Report import / PDF */}
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
          >
            {pdfFile ? pdfFile.name : 'Importer un rapport (PDF)'}
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
          </Button>

          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="contained" disabled={!isInfoValid} onClick={handleNext}>
              Suivant
            </Button>
            <Button variant="outlined" onClick={onCancel}>Annuler</Button>
          </Stack>
        </Stack>
      )}

      {activeStep === 1 && (
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardHeader
              title="Images associées"
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  component="label"
                >
                  Ajouter
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".dcm,image/*"
                    onChange={(e) => handleImageSelection(e.target.files)}
                  />
                </Button>
              }
            />
            <CardContent>
              {images.length === 0 ? (
                <Typography color="text.secondary">Aucune image ajoutée</Typography>
              ) : (
                <Grid container spacing={2}>
                  {images.map((img) => (
                    <Grid item xs={12} sm={6} md={4} key={img.id}>
                      <Box position="relative" borderRadius={2} overflow="hidden">
                        {img.preview ? (
                          <img
                            src={img.preview}
                            alt={img.filename}
                            style={{ width: '100%', height: 140, objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            height={140}
                            bgcolor="grey.100"
                          >
                            <ImageIcon fontSize="large" color="disabled" />
                          </Box>
                        )}
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)' }}
                          onClick={() => setImages(images.filter((i) => i.id !== img.id))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" noWrap>{img.filename}</Typography>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleBack}>Précédent</Button>
            <Button variant="contained" disabled={uploading || images.length === 0} onClick={handleSubmit}>
              Publier
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
