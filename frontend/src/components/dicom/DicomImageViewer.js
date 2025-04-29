import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress, Alert, Box, Grid } from '@mui/material';
import dicomService from '../../services/dicomService';
import './DicomViewer.css';

/**
 * Composant pour afficher une image DICOM.
 * 
 * @param {Object} props - Props du composant
 * @param {string} props.instanceId - ID de l'instance DICOM à afficher
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture du visualiseur
 */
const DicomImageViewer = ({ instanceId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const viewerRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // États pour les manipulations d'image
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // S'assurer que le composant est monté
    isMountedRef.current = true;
    
    // Nettoyer les références lors du démontage
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!instanceId) return;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer l'image depuis le service DICOM
        const url = await dicomService.getInstanceImage(instanceId);
        
        // Vérifier si le composant est toujours monté avant de mettre à jour l'état
        if (isMountedRef.current) {
          setImageUrl(url);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'image DICOM:", err);
        
        // Vérifier si le composant est toujours monté avant de mettre à jour l'état
        if (isMountedRef.current) {
          setError(`Impossible de charger l'image DICOM: ${err.message}`);
          setLoading(false);
        }
      }
    };

    loadImage();
  }, [instanceId]);

  // Gérer le zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  // Gérer la rotation
  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  // Réinitialiser les transformations
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
    <Card elevation={3} className="dicom-viewer-card">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Visualiseur DICOM</Typography>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Fermer
          </Button>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            <Grid item>
              <Button variant="outlined" onClick={handleZoomIn} title="Zoom avant">
                +
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleZoomOut} title="Zoom arrière">
                -
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleRotateLeft} title="Rotation gauche">
                ↺
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleRotateRight} title="Rotation droite">
                ↻
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={handleReset} title="Réinitialiser">
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <Box 
          sx={{ 
            position: 'relative', 
            height: '400px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Conteneur pour l'image DICOM */}
          <div 
            ref={viewerRef} 
            className="dicom-viewer-container" 
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Image DICOM" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }} 
              />
            )}
          </div>
          
          {/* Overlay de chargement */}
          {loading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <CircularProgress />
            </Box>
          )}
          
          {/* Message d'erreur */}
          {error && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: 2
              }}
            >
              <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DicomImageViewer;
