import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Button, 
  ButtonGroup, 
  Slider, 
  Paper, 
  Card, 
  CardContent,
  Grid,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import dicomService from '../../services/dicomService';
import './DicomViewer.css';

const DicomViewer = ({ instanceId, onAnnotationChange }) => {
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [instance, setInstance] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  
  // États pour les manipulations d'image
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // Fonctions de manipulation d'image
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };
  
  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };
  
  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };
  
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };
  
  const handleDownload = () => {
    if (!instanceId) return;
    
    const actualInstanceId = typeof instanceId === 'object' ? (instanceId.ID || instanceId.id) : instanceId;
    const downloadUrl = `${window.location.origin}/api/v1/dicom/instances/${actualInstanceId}/file`;
    
    // Créer un lien temporaire et déclencher le téléchargement
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `dicom_image_${actualInstanceId}.dcm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Charger et afficher l'image lorsque instanceId change
  useEffect(() => {
    if (!instanceId || !viewerRef.current) {
      setLoading(false);
      return;
    }

    const loadAndDisplayImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser l'ID correct de l'instance
        const actualInstanceId = typeof instanceId === 'object' ? (instanceId.ID || instanceId.id) : instanceId;
        
        console.log("Chargement de l'image pour l'instance:", actualInstanceId);
        
        // URL directe de l'image JPEG
        const imageUrl = `${window.location.origin}/api/v1/dicom/instances/${actualInstanceId}/image`;
        console.log("URL de l'image:", imageUrl);
        
        // URL alternative pour le fichier DICOM brut
        const fileUrl = `${window.location.origin}/api/v1/dicom/instances/${actualInstanceId}/file`;
        console.log("URL du fichier DICOM:", fileUrl);
        
        // URL de prévisualisation
        const previewUrl = `${window.location.origin}/api/v1/dicom/instances/${actualInstanceId}/preview`;
        console.log("URL de prévisualisation:", previewUrl);
        
        // Mettre à jour les informations de débogage
        setDebugInfo({
          instanceId: actualInstanceId,
          imageUrl: imageUrl,
          fileUrl: fileUrl,
          previewUrl: previewUrl,
          timestamp: new Date().toISOString()
        });
        
        // Fonction pour charger l'image
        const loadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            img.onload = function() {
              console.log(`Image chargée avec succès depuis ${url}, dimensions:`, img.width, "x", img.height);
              resolve(img);
            };
            
            img.onerror = function(err) {
              console.error(`Erreur lors du chargement de l'image depuis ${url}:`, err);
              reject(err);
            };
            
            img.src = url;
          });
        };
        
        // Utiliser le service DICOM pour récupérer l'image
        try {
          console.log("Utilisation du service DICOM pour récupérer l'image...");
          const imageObjectUrl = await dicomService.getInstanceImage(actualInstanceId);
          
          // Charger l'image à partir de l'URL de l'objet
          const img = await loadImage(imageObjectUrl);
          
          // Afficher l'image dans le conteneur
          const container = viewerRef.current;
          if (container) {
            container.innerHTML = '';
            
            // Appliquer le zoom et la rotation
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.transform = `scale(${zoom / 100}) rotate(${rotation}deg)`;
            img.style.transition = 'transform 0.3s ease';
            
            container.appendChild(img);
            setInstance({ width: img.width, height: img.height });
            setLoading(false);
          }
        } catch (serviceError) {
          console.error("Erreur avec le service DICOM:", serviceError);
          
          // Méthode de secours: essayer de charger directement l'image
          try {
            console.log("Tentative de chargement direct de l'image JPEG...");
            
            const img = await loadImage(imageUrl);
            
            // Afficher l'image dans le conteneur
            const container = viewerRef.current;
            container.innerHTML = '';
            
            // Appliquer le zoom et la rotation
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.transform = `scale(${zoom / 100}) rotate(${rotation}deg)`;
            img.style.transition = 'transform 0.3s ease';
            
            container.appendChild(img);
            setInstance({ width: img.width, height: img.height });
            setLoading(false);
          } catch (directError) {
            console.error("Échec du chargement direct de l'image:", directError);
            
            // Dernière tentative: essayer la prévisualisation
            try {
              console.log("Tentative de chargement de la prévisualisation...");
              const img = await loadImage(previewUrl);
              
              // Afficher l'image dans le conteneur
              const container = viewerRef.current;
              container.innerHTML = '';
              
              // Appliquer le zoom et la rotation
              img.style.maxWidth = '100%';
              img.style.maxHeight = '100%';
              img.style.transform = `scale(${zoom / 100}) rotate(${rotation}deg)`;
              img.style.transition = 'transform 0.3s ease';
              
              container.appendChild(img);
              setInstance({ width: img.width, height: img.height });
              setLoading(false);
            } catch (previewError) {
              console.error("Échec du chargement de la prévisualisation:", previewError);
              throw new Error("Impossible de charger l'image DICOM. Essayez un autre format ou vérifiez l'ID de l'instance.");
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'image:", error);
        setError(`Erreur: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadAndDisplayImage();
  }, [instanceId, zoom, rotation]);
  
  // Appliquer les transformations à l'image quand zoom ou rotation changent
  useEffect(() => {
    if (instance && instance.width && viewerRef.current) {
      const img = viewerRef.current.querySelector('img');
      if (img) {
        img.style.transform = `scale(${zoom / 100}) rotate(${rotation}deg)`;
      }
    }
  }, [zoom, rotation, instance]);

  return (
    <Card elevation={3} sx={{ width: '100%', mb: 3, overflow: 'visible' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
          Visualiseur d'images médicales DICOM
          <Tooltip title="Afficher/masquer les informations de débogage">
            <IconButton size="small" sx={{ ml: 1 }} onClick={() => setShowDebug(!showDebug)}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            {/* Contrôles de manipulation d'image */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <ButtonGroup variant="contained" size="small">
                    <Button onClick={handleZoomIn} startIcon={<ZoomInIcon />}>Zoom +</Button>
                    <Button onClick={handleZoomOut} startIcon={<ZoomOutIcon />}>Zoom -</Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <ButtonGroup variant="contained" size="small">
                    <Button onClick={handleRotateLeft} startIcon={<RotateLeftIcon />}>Rotation G</Button>
                    <Button onClick={handleRotateRight} startIcon={<RotateRightIcon />}>Rotation D</Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={handleReset} 
                    startIcon={<RestartAltIcon />}
                  >
                    Réinitialiser
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleDownload} 
                    startIcon={<DownloadIcon />}
                    disabled={!instanceId}
                  >
                    Télécharger DICOM
                  </Button>
                </Grid>
              </Grid>
              
              {/* Affichage du niveau de zoom */}
              <Box sx={{ mt: 2, px: 1 }}>
                <Typography variant="body2" gutterBottom>Zoom: {zoom}%</Typography>
                <Slider
                  value={zoom}
                  min={50}
                  max={200}
                  step={5}
                  onChange={(e, newValue) => setZoom(newValue)}
                  aria-labelledby="zoom-slider"
                  size="small"
                />
              </Box>
            </Paper>
            
            {/* Conteneur de l'image */}
            <Paper 
              elevation={2} 
              sx={{ 
                width: '100%', 
                height: '500px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
                position: 'relative'
              }}
            >
              <Box 
                ref={viewerRef} 
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              />
              
              {!instance && !loading && !error && (
                <Typography variant="body1" color="text.secondary">
                  Sélectionnez une image à visualiser
                </Typography>
              )}
            </Paper>
            
            {/* Informations sur l'image */}
            {instance && (
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle2" gutterBottom>Informations sur l'image</Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <Typography variant="body2">Dimensions: {instance.width || '?'} x {instance.height || '?'} px</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">Zoom: {zoom}%</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">Rotation: {rotation}°</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            {/* Section de débogage */}
            {showDebug && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Informations de débogage</Typography>
                <Typography variant="body2">Instance ID: {debugInfo.instanceId || instanceId}</Typography>
                <Typography variant="body2">URL de l'image: {debugInfo.imageUrl}</Typography>
                <Typography variant="body2">URL du fichier DICOM: {debugInfo.fileUrl}</Typography>
                <Typography variant="body2">URL de prévisualisation: {debugInfo.previewUrl}</Typography>
                <Typography variant="body2">Horodatage: {debugInfo.timestamp}</Typography>
                <Typography variant="body2">État: {loading ? 'Chargement' : error ? 'Erreur' : instance ? 'Image chargée' : 'Aucune image'}</Typography>
              </Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DicomViewer;
