import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import { getAuthHeader } from '../../utils/authUtils';

/**
 * Composant pour télécharger des images DICOM pour un patient spécifique.
 * 
 * @param {Object} props - Props du composant
 * @param {Function} props.onUploadSuccess - Fonction appelée après un téléchargement réussi
 */
const DicomPatientUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Charger la liste des patients au chargement du composant
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        
        const response = await axios.get('http://localhost:8080/api/v1/users/patients', {
          headers: getAuthHeader()
        });
        
        setPatients(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des patients:", err);
        setError("Impossible de charger la liste des patients");
      } finally {
        setLoadingPatients(false);
      }
    };
    
    fetchPatients();
  }, []);

  // Gérer la sélection de fichier
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  // Gérer la sélection de patient
  const handlePatientChange = (event) => {
    setSelectedPatientId(event.target.value);
    setError(null);
    setSuccess(false);
  };

  // Gérer la description
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  // Gérer le téléchargement du fichier DICOM
  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier DICOM");
      return;
    }
    
    if (!selectedPatientId) {
      setError("Veuillez sélectionner un patient");
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', selectedPatientId);
      formData.append('description', description || "Image DICOM");
      
      // Envoyer le fichier au serveur Orthanc via notre API
      const response = await axios.post(
        'http://localhost:8080/api/v1/dicom/upload',
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Notification de succès
      setSuccess(true);
      setFile(null);
      setDescription('');
      
      // Réinitialiser le champ de fichier
      const fileInput = document.getElementById('dicom-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Appeler le callback de succès si fourni
      if (onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      console.error("Erreur lors du téléchargement du fichier DICOM:", err);
      setError(`Échec du téléchargement: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Télécharger une image DICOM pour un patient
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button onClick={() => setError(null)} color="inherit" size="small">
              Fermer
            </Button>
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Image DICOM téléchargée avec succès!
            <Button onClick={() => setSuccess(false)} color="inherit" size="small">
              Fermer
            </Button>
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {/* Sélection du patient */}
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" disabled={uploading || loadingPatients}>
              <InputLabel id="patient-select-label">Patient</InputLabel>
              <Select
                labelId="patient-select-label"
                id="patient-select"
                value={selectedPatientId}
                onChange={handlePatientChange}
                label="Patient"
              >
                <MenuItem value="">
                  <em>Sélectionnez un patient</em>
                </MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </MenuItem>
                ))}
              </Select>
              {loadingPatients && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="caption">Chargement des patients...</Typography>
                </Box>
              )}
            </FormControl>
          </Grid>
          
          {/* Description de l'image */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Description (optionnelle)"
              value={description}
              onChange={handleDescriptionChange}
              disabled={uploading}
              placeholder="Entrez une description pour cette image"
            />
          </Grid>
          
          {/* Sélection du fichier */}
          <Grid item xs={12}>
            <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center' }}>
              <input
                accept=".dcm,.dicom,application/dicom"
                id="dicom-file-input"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <label htmlFor="dicom-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={uploading}
                >
                  Sélectionner un fichier DICOM
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Fichier sélectionné: {file.name}
                </Typography>
              )}
            </Box>
          </Grid>
          
          {/* Bouton de téléchargement */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!file || !selectedPatientId || uploading}
            >
              {uploading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                  Téléchargement en cours...
                </>
              ) : (
                'Télécharger l\'image DICOM'
              )}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DicomPatientUploader;
