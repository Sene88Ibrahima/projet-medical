import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  CircularProgress, 
  Typography, 
  IconButton, 
  Tooltip,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import dicomService from '../../services/dicomService';
import './DicomViewer.css';

const DicomViewer = ({ instanceId }) => {
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageSource, setImageSource] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const isMountedRef = useRef(true);
  const currentImageRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (imageSource && imageSource.startsWith('blob:')) {
        URL.revokeObjectURL(imageSource);
      }
    };
  }, [imageSource]);

  const updateImageTransform = useCallback(() => {
    if (currentImageRef.current) {
      currentImageRef.current.style.transform = `scale(${zoom/100}) rotate(${rotation}deg)`;
    }
  }, [zoom, rotation]);

  const handleZoomIn = () => {
    setZoom(prev => {
      const newZoom = Math.min(prev + 10, 200);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 10, 50);
      return newZoom;
    });
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

  // Mettre à jour les transformations quand zoom ou rotation changent
  useEffect(() => {
    updateImageTransform();
  }, [zoom, rotation, updateImageTransform]);

  const displayImage = useCallback((url) => {
    if (!isMountedRef.current || !viewerRef.current) return;

    const container = viewerRef.current;
    
    if (currentImageRef.current && currentImageRef.current.parentNode === container) {
      container.removeChild(currentImageRef.current);
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.style.cssText = `
      display: block;
      margin: auto;
      max-width: 100%;
      max-height: 100%;
      transition: all 0.3s ease;
      transform: scale(${zoom/100}) rotate(${rotation}deg);
    `;
    
    img.className = 'dicom-image';
    img.setAttribute('draggable', 'false');
    img.setAttribute('alt', 'Image DICOM');
    
    img.onload = () => {
      if (!isMountedRef.current) return;
      container.appendChild(img);
      currentImageRef.current = img;
      setImageSource(url);
      setLoading(false);
      setError(null);
    };
    
    img.onerror = () => {
      if (!isMountedRef.current) return;
      setError("Impossible de charger l'image DICOM");
      setLoading(false);
    };
    
    img.src = url;
  }, [zoom, rotation]);

  useEffect(() => {
    if (!instanceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (imageSource && imageSource.startsWith('blob:')) {
      URL.revokeObjectURL(imageSource);
      setImageSource(null);
    }

    const actualInstanceId = typeof instanceId === 'object' 
      ? (instanceId.ID || instanceId.id) 
      : instanceId;

    const loadImage = async () => {
      try {
        const blobUrl = await dicomService.getInstanceImage(actualInstanceId);
        if (blobUrl) {
          displayImage(blobUrl);
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setError("Erreur lors du chargement de l'image");
        setLoading(false);
      }
    };

    loadImage();
  }, [instanceId, displayImage, imageSource]);

  return (
    <div className="dicom-viewer-container">
      <div className="dicom-header">
        <Typography className="dicom-title">
          Visualisation DICOM
        </Typography>
      </div>

      <div className="dicom-image-container" ref={viewerRef}>
        {loading && !currentImageRef.current && (
          <div className="dicom-loading">
            <CircularProgress />
            <Typography>
              Chargement de l'image...
            </Typography>
          </div>
        )}

        {error && (
          <div className="dicom-error">
            <Typography>
              {error}
            </Typography>
          </div>
        )}

        <div className="dicom-toolbar">
          <Tooltip title="Zoom +">
            <IconButton onClick={handleZoomIn} className="toolbar-button">
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom -">
            <IconButton onClick={handleZoomOut} className="toolbar-button">
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotation gauche">
            <IconButton onClick={handleRotateLeft} className="toolbar-button">
              <RotateLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotation droite">
            <IconButton onClick={handleRotateRight} className="toolbar-button">
              <RotateRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Réinitialiser">
            <IconButton onClick={handleReset} className="toolbar-button">
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;
