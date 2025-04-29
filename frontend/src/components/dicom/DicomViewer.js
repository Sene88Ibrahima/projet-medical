import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const [imageSource, setImageSource] = useState(null);
  
  // États pour les manipulations d'image
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // S'assurer que le composant est monté
  useEffect(() => {
    console.log("DicomViewer monté, container:", viewerRef.current ? "disponible" : "non disponible");
    isMountedRef.current = true;
    
    // Nettoyer les événements et références lors du démontage
    return () => {
      console.log("DicomViewer démonté");
      isMountedRef.current = false;
      
      // Libérer l'URL de l'objet Blob si elle existe
      if (imageSource && imageSource.startsWith('blob:')) {
        URL.revokeObjectURL(imageSource);
      }
    };
  }, [imageSource]);
  
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

  const displayImage = useCallback((url, method) => {
    console.log(`Tentative d'affichage de l'image via méthode: ${method}, URL: ${url}`);
    
    // Vérifier si le composant est monté
    if (!isMountedRef.current) {
      console.warn("Abandon: composant déjà démonté");
      return;
    }
    
    // Fonction directe pour afficher l'image (plus de tentatives multiples)
    const renderImage = () => {
      const container = viewerRef.current;
      
      // Le conteneur devrait toujours être disponible grâce à notre structure DOM
      if (!container) {
        console.error("ERREUR CRITIQUE: Le conteneur est inexplicablement absent du DOM");
        setError("Erreur technique: conteneur d'affichage non disponible");
        setLoading(false);
        return;
      }

      console.log("Conteneur disponible! Dimensions:", container.offsetWidth, "x", container.offsetHeight);
      
      // Créer et configurer l'image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      // Définir tous les styles et attributs essentiels
      img.style.display = 'block';
      img.style.margin = 'auto';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.transition = 'all 0.3s ease';
      img.setAttribute('draggable', 'false');
      img.setAttribute('data-method', method);
      img.setAttribute('alt', 'Image DICOM');
      
      // Gérer le chargement réussi
      img.onload = () => {
        console.log(`Succès: image chargée (${method}), dimensions: ${img.width}x${img.height}`);
        
        // Vider le conteneur avant d'ajouter l'image
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        
        // Appliquer le zoom et la rotation
        img.style.transform = `scale(${zoom/100}) rotate(${rotation}deg)`;
        container.appendChild(img);
        
        // Mettre à jour l'état
        setImageSource(url);
        setInstance({
          width: img.width,
          height: img.height,
          method: method,
          loaded: true,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        setError(null);
        
        // Garantir la visibilité avec un délai
        setTimeout(() => {
          if (img.style.opacity !== '1') img.style.opacity = '1';
        }, 50);
      };
      
      // Gérer les erreurs de chargement
      img.onerror = (err) => {
        console.error(`Erreur de chargement (${method}):`, err);
        setError(`Impossible de charger l'image DICOM par la méthode ${method}. Le serveur a renvoyé une erreur.`);
        setLoading(false); // Toujours arrêter le chargement pour montrer l'erreur clairement
      };
      
      // Démarrer le chargement
      console.log(`Démarrage du chargement: ${url}`);
      img.src = url;
    };
    
    // Appeler directement la fonction de rendu
    renderImage();
  }, [zoom, rotation]);

  // Charger l'image lorsque l'ID d'instance change
  useEffect(() => {
    // Réinitialiser l'état
    setError(null);
    
    if (!instanceId) {
      console.log("Aucun ID d'instance fourni");
      setLoading(false);
      return;
    }
    
    // Démarrer le chargement
    setLoading(true);
    console.log("Chargement d'une nouvelle instance:", instanceId);
    
    // Libérer l'ancienne URL blob si nécessaire
    if (imageSource && imageSource.startsWith('blob:')) {
      URL.revokeObjectURL(imageSource);
      setImageSource(null);
    }
    
    // Extraire l'ID réel (gérer les cas où instanceId est un objet)
    const actualInstanceId = typeof instanceId === 'object' 
      ? (instanceId.ID || instanceId.id) 
      : instanceId;
    
    // Définir toutes les URLs possibles
    const imageUrl = `${window.location.origin}/api/v1/dicom/instances/${actualInstanceId}/image`;
    const fileUrl = `${window.location.origin}/api/v1/dicom/instances/${actualInstanceId}/file`;
    const previewUrl = `${window.location.origin}/api/v1/dicom/instances/${actualInstanceId}/preview`;
    
    // Mettre à jour les infos de débogage
    setDebugInfo({
      instanceId: actualInstanceId,
      imageUrl,
      fileUrl,
      previewUrl,
      loadAttempt: new Date().toISOString()
    });
    
    // Nouveau système de cascade avec gestion d'erreurs améliorée
    const loadSequence = async () => {
      // Méthode 1: Service DICOM (blob URL)
      try {
        console.log("Tentative 1: Utilisation du service DICOM via getInstanceImage...");
        const blobUrl = await dicomService.getInstanceImage(actualInstanceId);
        if (blobUrl) {
          displayImage(blobUrl, 'service');
          return; // Succès, arrêter ici
        }
      } catch (serviceError) {
        console.error("Erreur avec le service DICOM:", serviceError);
      }
      
      // Méthode 2: URL directe vers l'image
      console.log("Tentative 2: Chargement direct via imageUrl...");
      displayImage(imageUrl, 'direct');
    };
    
    loadSequence();
    
    // Cleanup lors du changement d'instance
    return () => {
      console.log("Nettoyage de l'ancienne instance");
      // Le nettoyage des blobs URL se fait au début du prochain effet
    };
  }, [instanceId, displayImage]);

  // Mettre à jour le zoom et la rotation sur les images chargées
  useEffect(() => {
    if (instance && viewerRef.current) {
      const img = viewerRef.current.querySelector('img');
      if (img) {
        img.style.transform = `scale(${zoom/100}) rotate(${rotation}deg)`;
      }
    }
  }, [zoom, rotation, instance, imageSource]);

  // Afficher le composant
  return (
    <Card elevation={3}>
      <CardContent>
        {/* Contenu à afficher uniquement si chargé ou erreur */}
        {(loading || error || instance || !instanceId) && (
          <Box sx={{ position: 'relative' }}>
            {/* Barre d'outils en haut */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1, 
                mb: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#f8f9fa'
              }}
            >
              <ButtonGroup variant="outlined" size="small">
                <Tooltip title="Zoom avant">
                  <IconButton onClick={handleZoomIn} disabled={!instance}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom arrière">
                  <IconButton onClick={handleZoomOut} disabled={!instance}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotation gauche">
                  <IconButton onClick={handleRotateLeft} disabled={!instance}>
                    <RotateLeftIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotation droite">
                  <IconButton onClick={handleRotateRight} disabled={!instance}>
                    <RotateRightIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Réinitialiser">
                  <IconButton onClick={handleReset} disabled={!instance}>
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Télécharger">
                  <IconButton onClick={handleDownload} disabled={!instanceId}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
              
              <Tooltip title="Informations de débogage">
                <IconButton 
                  onClick={() => setShowDebug(prev => !prev)} 
                  color={showDebug ? "primary" : "default"}
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
              
              {/* Slider de zoom */}
              <Box sx={{ width: 200, ml: 2, display: instance ? 'block' : 'none' }}>
                <Typography id="zoom-slider" gutterBottom variant="caption">
                  Zoom: {zoom}%
                </Typography>
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
            
            {/* Conteneur d'affichage de l'image */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 1, 
                mb: 2, 
                height: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative', // Important pour positionner les éléments enfants
                overflow: 'hidden' // Éviter débordement des images
              }}
            >
              {/* Zone de visualisation - TOUJOURS PRÉSENTE même avec loading/error */}
              <div 
                ref={viewerRef} 
                className="dicom-viewer-container" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  position: 'absolute', // Positionnement absolu pour garantir présence
                  top: 0,
                  left: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
              
              {/* Superposition des états (loading, error) par-dessus le container */}
              {loading && (
                <div style={{zIndex: 10, position: 'absolute', backgroundColor: 'rgba(255,255,255,0.7)'}}>
                  <CircularProgress />
                </div>
              )}
              
              {error && (
                <Alert severity="error" sx={{ width: '80%', zIndex: 10, position: 'absolute' }}>
                  {error}
                </Alert>
              )}
              
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
