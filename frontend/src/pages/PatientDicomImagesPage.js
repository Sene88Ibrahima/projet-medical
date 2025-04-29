import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper
} from '@mui/material';
import { ArrowBack, Visibility, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import DicomPatientUploader from '../components/dicom/DicomPatientUploader';
import DicomImageViewer from '../components/dicom/DicomImageViewer';
import axios from 'axios';
import { getAuthHeader } from '../utils/authUtils';

/**
 * Page pour gérer les images DICOM d'un patient spécifique.
 */
const PatientDicomImagesPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États
  const [patient, setPatient] = useState(null);
  const [dicomImages, setDicomImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Vérifier si l'utilisateur est un médecin ou un administrateur
  const canEditImages = user && (user.role === 'DOCTOR' || user.role === 'ADMIN');

  // Charger les données du patient et ses images DICOM
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les informations du patient
        const patientResponse = await axios.get(`http://localhost:8080/api/v1/users/${patientId}`, {
          headers: getAuthHeader()
        });
        setPatient(patientResponse.data);
        
        // Récupérer les images DICOM du patient
        const imagesResponse = await axios.get(`http://localhost:8080/api/v1/dicom/patient/${patientId}`, {
          headers: getAuthHeader()
        });
        setDicomImages(imagesResponse.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(`Impossible de charger les données: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId]);

  // Gérer le téléchargement réussi d'une nouvelle image
  const handleUploadSuccess = (newImage) => {
    setDicomImages(prev => [...prev, newImage]);
  };

  // Gérer l'ouverture du visualiseur d'image
  const handleOpenViewer = (image) => {
    setSelectedImage(image);
    setViewerOpen(true);
  };

  // Gérer la fermeture du visualiseur d'image
  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedImage(null);
  };

  // Gérer la suppression d'une image
  const handleDeleteImage = async (imageId) => {
    if (!canEditImages) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/dicom/${imageId}`, {
          headers: getAuthHeader()
        });
        
        // Mettre à jour la liste des images
        setDicomImages(prev => prev.filter(img => img.id !== imageId));
        
        // Si l'image supprimée était sélectionnée, fermer le visualiseur
        if (selectedImage && selectedImage.id === imageId) {
          handleCloseViewer();
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'image:", err);
        setError(`Impossible de supprimer l'image: ${err.message}`);
      }
    }
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1">
          Images DICOM - {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`}
        </Typography>
      </Box>
      
      {/* Message d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={() => setError(null)} color="inherit" size="small">
            Fermer
          </Button>
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Informations du patient */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du patient
              </Typography>
              {patient ? (
                <Box>
                  <Typography><strong>Nom:</strong> {patient.lastName}</Typography>
                  <Typography><strong>Prénom:</strong> {patient.firstName}</Typography>
                  <Typography><strong>Email:</strong> {patient.email}</Typography>
                  <Typography><strong>Téléphone:</strong> {patient.phoneNumber || 'Non renseigné'}</Typography>
                  <Typography><strong>Date de naissance:</strong> {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Non renseignée'}</Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">Informations non disponibles</Typography>
              )}
            </CardContent>
          </Card>
          
          {/* Uploader d'images DICOM */}
          {canEditImages && (
            <Box sx={{ mt: 3 }}>
              <DicomPatientUploader onUploadSuccess={handleUploadSuccess} />
            </Box>
          )}
        </Grid>
        
        {/* Liste des images DICOM */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Images DICOM disponibles
              </Typography>
              
              {dicomImages.length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography color="text.secondary">
                    Aucune image DICOM disponible pour ce patient.
                  </Typography>
                </Paper>
              ) : (
                <List>
                  {dicomImages.map((image) => (
                    <React.Fragment key={image.id}>
                      <ListItem>
                        <ListItemText
                          primary={image.description || 'Image sans titre'}
                          secondary={
                            <React.Fragment>
                              <Typography variant="body2" component="span" color="text.secondary">
                                Ajoutée le {new Date(image.createdAt).toLocaleString()}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                ID: {image.orthancInstanceId}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleOpenViewer(image)}>
                            <Visibility />
                          </IconButton>
                          {canEditImages && (
                            <IconButton edge="end" onClick={() => handleDeleteImage(image.id)}>
                              <Delete />
                            </IconButton>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Visualiseur d'image */}
      {viewerOpen && selectedImage && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <Box sx={{ width: '100%', maxWidth: 1000, maxHeight: '90vh', overflow: 'auto' }}>
            <DicomImageViewer instanceId={selectedImage.orthancInstanceId} onClose={handleCloseViewer} />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default PatientDicomImagesPage;
