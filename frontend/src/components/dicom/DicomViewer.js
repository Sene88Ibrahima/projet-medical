import React, { useEffect, useRef, useState } from 'react';
import dicomService from '../../services/dicomService';
import './DicomViewer.css';

// Pour l'instant, nous utiliserons un composant simple mais prêt à intégrer Cornerstone.js
// Une fois que les dépendances sont installées, ce composant pourra être étendu
const DicomViewer = ({ instanceId, onAnnotationChange }) => {
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [instance, setInstance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!instanceId) {
      setLoading(false);
      return;
    }

    const loadInstance = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dicomService.getInstance(instanceId);
        setInstance(data);
        
        // Dans une implémentation réelle avec Cornerstone.js, ici nous initialiserions
        // la visualisation de l'image DICOM
      } catch (err) {
        console.error("Erreur lors du chargement de l'instance DICOM:", err);
        setError("Impossible de charger l'image. Veuillez réessayer ultérieurement.");
      } finally {
        setLoading(false);
      }
    };

    loadInstance();
  }, [instanceId]);

  // Fonctions de manipulation d'image qui seront implémentées avec Cornerstone.js
  const handleZoom = (factor) => {
    console.log(`Zoom de facteur ${factor}`);
    // Avec Cornerstone: cornerstone.zoom(viewerRef.current, factor);
  };

  const handlePan = (dx, dy) => {
    console.log(`Pan de ${dx}, ${dy}`);
    // Avec Cornerstone: cornerstone.pan(viewerRef.current, {x: dx, y: dy});
  };

  const handleWindowLevel = (width, center) => {
    console.log(`Changement de fenêtrage à largeur=${width}, centre=${center}`);
    // Avec Cornerstone: cornerstone.setViewport(viewerRef.current, {...viewport, voi: {windowWidth: width, windowCenter: center}});
  };

  const handleRotation = (angle) => {
    console.log(`Rotation de ${angle} degrés`);
    // Avec Cornerstone: cornerstone.setViewport(viewerRef.current, {...viewport, rotation: angle});
  };

  // Annotation (sera implémentée avec cornerstoneTools)
  const addAnnotation = (type, data) => {
    console.log(`Ajout d'une annotation de type ${type} avec données:`, data);
    if (onAnnotationChange) {
      onAnnotationChange({
        type,
        data,
        instanceId,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="dicom-viewer">
      {loading ? (
        <div className="dicom-loading">Chargement de l'image...</div>
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
          >
            {/* Placeholder en attendant l'intégration complète de Cornerstone.js */}
            <div className="dicom-placeholder-image">
              <p>Image DICOM sélectionnée: {instanceId}</p>
              <p>Pour une implémentation complète, nous utiliserons Cornerstone.js</p>
            </div>
          </div>

          {/* Contrôles basiques */}
          <div className="dicom-controls">
            <button onClick={() => handleZoom(1.1)}>Zoom +</button>
            <button onClick={() => handleZoom(0.9)}>Zoom -</button>
            <button onClick={() => handleRotation(90)}>Rotation 90°</button>
            <button onClick={() => handlePan(10, 0)}>Pan Droite</button>
            <button onClick={() => handlePan(-10, 0)}>Pan Gauche</button>
            <button onClick={() => handlePan(0, 10)}>Pan Bas</button>
            <button onClick={() => handlePan(0, -10)}>Pan Haut</button>
            <button onClick={() => addAnnotation('length', {start: {x: 100, y: 100}, end: {x: 200, y: 200}})}>
              Ajouter Mesure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DicomViewer;
