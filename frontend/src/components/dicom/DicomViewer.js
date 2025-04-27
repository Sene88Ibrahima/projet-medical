import React, { useEffect, useRef, useState } from 'react';
import dicomService from '../../services/dicomService';
import './DicomViewer.css';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneTools from 'cornerstone-tools';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

// Configuration de Cornerstone
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

// Configuration de l'adaptateur d'image WADO
cornerstoneWADOImageLoader.configure({
  beforeSend: function(xhr) {
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
  }
});

// Configuration du chargement des images
cornerstoneWADOImageLoader.webWorkerManager.initialize({
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true,
});

const DicomViewer = ({ instanceId, onAnnotationChange }) => {
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [instance, setInstance] = useState(null);
  const [error, setError] = useState(null);
  const [viewportState, setViewportState] = useState({
    scale: 1,
    translation: { x: 0, y: 0 },
    voi: { windowWidth: 400, windowCenter: 40 },
    rotation: 0,
    hflip: false,
    vflip: false
  });

  // Initialiser Cornerstone lors du montage du composant
  useEffect(() => {
    if (viewerRef.current) {
      cornerstone.enable(viewerRef.current);
      
      // Initialiser les outils de Cornerstone
      cornerstoneTools.init();
      
      // Ajouter les outils nécessaires
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
      cornerstoneTools.addTool(cornerstoneTools.PanTool);
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
      cornerstoneTools.addTool(cornerstoneTools.LengthTool);
      cornerstoneTools.addTool(cornerstoneTools.AngleTool);
      cornerstoneTools.addTool(cornerstoneTools.RectangleRoiTool);
      cornerstoneTools.addTool(cornerstoneTools.EllipticalRoiTool);
    }

    return () => {
      // Nettoyage lors du démontage du composant
      if (viewerRef.current) {
        cornerstone.disable(viewerRef.current);
      }
    };
  }, []);

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
        
        // Utiliser l'ID correct de l'instance (peut être instanceId ou instance.ID)
        const actualInstanceId = typeof instanceId === 'object' ? (instanceId.ID || instanceId.id) : instanceId;
        
        console.log("Chargement de l'image pour l'instance:", actualInstanceId);
        
        // Essayer de charger l'image avec l'URL DICOM directe
        try {
          // Configurer le loader WADO pour utiliser notre token JWT
          const token = localStorage.getItem('token');
          cornerstoneWADOImageLoader.configure({
            beforeSend: function(xhr) {
              if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
              }
            }
          });
          
          // Définir un gestionnaire d'erreur pour le chargement des images
          cornerstone.events.addEventListener('cornerstoneimageloadfailed', function(event) {
            console.error('Image load failed:', event);
          });
          
          // Créer une URL pour l'image
          const wadoUrl = dicomService.getInstanceFileUrl(actualInstanceId);
          console.log("URL WADO pour l'image DICOM:", wadoUrl);
          
          // Essayer de charger l'image directement (sans wadouri:)
          const image = await cornerstone.loadImage(wadoUrl);
          console.log("Image chargée avec succès:", image);
          
          cornerstone.displayImage(viewerRef.current, image);
          
          // Activer l'outil de zoom par défaut
          cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
          
          setInstance({ id: actualInstanceId });
        } catch (loadError) {
          console.error("Erreur lors du chargement direct de l'image:", loadError);
          
          // Essayer avec l'URL d'image standard comme fallback
          try {
            const imageUrl = dicomService.getInstanceImageUrl(actualInstanceId);
            console.log("Tentative avec l'URL d'image standard:", imageUrl);
            const image = await cornerstone.loadImage(imageUrl);
            cornerstone.displayImage(viewerRef.current, image);
            setInstance({ id: actualInstanceId });
          } catch (imageError) {
            console.error("Erreur avec l'URL d'image standard:", imageError);
            throw imageError;
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'image DICOM:", err);
        setError("Impossible de charger l'image. Veuillez réessayer ultérieurement.");
      } finally {
        setLoading(false);
      }
    };

    loadAndDisplayImage();
  }, [instanceId]);

  // Fonctions de manipulation d'image
  const handleZoom = (factor) => {
    if (!viewerRef.current) return;
    
    const viewport = cornerstone.getViewport(viewerRef.current);
    viewport.scale *= factor;
    cornerstone.setViewport(viewerRef.current, viewport);
    
    setViewportState(prev => ({
      ...prev,
      scale: viewport.scale
    }));
  };

  const handleRotation = (angle) => {
    if (!viewerRef.current) return;
    
    const viewport = cornerstone.getViewport(viewerRef.current);
    viewport.rotation += angle;
    cornerstone.setViewport(viewerRef.current, viewport);
    
    setViewportState(prev => ({
      ...prev,
      rotation: viewport.rotation
    }));
  };

  const handleWindowLevel = (width, center) => {
    if (!viewerRef.current) return;
    
    const viewport = cornerstone.getViewport(viewerRef.current);
    viewport.voi.windowWidth = width;
    viewport.voi.windowCenter = center;
    cornerstone.setViewport(viewerRef.current, viewport);
    
    setViewportState(prev => ({
      ...prev,
      voi: { windowWidth: width, windowCenter: center }
    }));
  };

  const activateTool = (toolName) => {
    cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
  };

  // Fonction pour capturer les annotations
  const captureAnnotation = () => {
    if (!viewerRef.current || !instanceId) return;
    
    // Récupérer les annotations actuelles
    const toolState = cornerstoneTools.getToolState(viewerRef.current);
    
    // Créer un objet d'annotation
    const annotation = {
      instanceId,
      toolState: JSON.stringify(toolState),
      timestamp: new Date().toISOString()
    };
    
    // Notifier le composant parent
    if (onAnnotationChange) {
      onAnnotationChange(annotation);
    }
  };

  return (
    <div className="dicom-viewer">
      {loading ? (
        <div className="dicom-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement de l'image...</span>
          </div>
        </div>
      ) : error ? (
        <div className="dicom-error">{error}</div>
      ) : !instance ? (
        <div className="dicom-placeholder">
          <p>Sélectionnez une image à visualiser</p>
        </div>
      ) : (
        <div className="dicom-container">
          {/* Zone de visualisation DICOM */}
          <div 
            ref={viewerRef} 
            className="dicom-image-container"
            style={{ width: '100%', height: '500px' }}
          />

          {/* Contrôles */}
          <div className="dicom-controls mt-3">
            <div className="btn-toolbar" role="toolbar">
              <div className="btn-group me-2" role="group">
                <button className="btn btn-outline-primary" onClick={() => handleZoom(1.1)}>
                  <i className="fas fa-search-plus"></i> Zoom +
                </button>
                <button className="btn btn-outline-primary" onClick={() => handleZoom(0.9)}>
                  <i className="fas fa-search-minus"></i> Zoom -
                </button>
              </div>
              
              <div className="btn-group me-2" role="group">
                <button className="btn btn-outline-primary" onClick={() => handleRotation(90)}>
                  <i className="fas fa-redo"></i> Rotation 90°
                </button>
                <button className="btn btn-outline-primary" onClick={() => handleRotation(-90)}>
                  <i className="fas fa-undo"></i> Rotation -90°
                </button>
              </div>
              
              <div className="btn-group me-2" role="group">
                <button className="btn btn-outline-primary" onClick={() => activateTool('Pan')}>
                  <i className="fas fa-arrows-alt"></i> Déplacer
                </button>
                <button className="btn btn-outline-primary" onClick={() => activateTool('Wwwc')}>
                  <i className="fas fa-adjust"></i> Contraste
                </button>
              </div>
              
              <div className="btn-group" role="group">
                <button className="btn btn-outline-primary" onClick={() => activateTool('Length')}>
                  <i className="fas fa-ruler"></i> Mesure
                </button>
                <button className="btn btn-outline-primary" onClick={() => activateTool('Angle')}>
                  <i className="fas fa-ruler-combined"></i> Angle
                </button>
                <button className="btn btn-outline-primary" onClick={() => activateTool('RectangleRoi')}>
                  <i className="far fa-square"></i> Rectangle
                </button>
                <button className="btn btn-outline-primary" onClick={() => activateTool('EllipticalRoi')}>
                  <i className="far fa-circle"></i> Ellipse
                </button>
              </div>
            </div>
            
            <button 
              className="btn btn-success mt-2" 
              onClick={captureAnnotation}
              disabled={!instance}
            >
              <i className="fas fa-save"></i> Enregistrer les annotations
            </button>
          </div>
          
          {/* Informations sur l'image */}
          <div className="dicom-info mt-3">
            <h5>Informations DICOM</h5>
            <div className="row">
              <div className="col-md-6">
                <p><strong>ID d'instance:</strong> {instanceId}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Échelle:</strong> {viewportState.scale.toFixed(2)}</p>
                <p><strong>Rotation:</strong> {viewportState.rotation}°</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DicomViewer;
