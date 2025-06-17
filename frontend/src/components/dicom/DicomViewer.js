import React, { useEffect, useRef, useState } from 'react';
import { 
  Typography, 
  IconButton, 
  Tooltip,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import TuneIcon from '@mui/icons-material/Tune';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import * as cornerstoneTools from 'cornerstone-tools';
import Hammer from 'hammerjs';
import cornerstoneMath from 'cornerstone-math';
import dicomService from '../../services/dicomService';
import './DicomViewer.css';

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;

// Initialise cornerstone-tools (once)
if (!cornerstoneTools.initialised) {
  cornerstoneTools.init();
  cornerstoneTools.initialised = true;
}

// Ajouter le header Authorization à chaque requête XHR de cornerstone
cornerstoneWADOImageLoader.configure({
  beforeSend: function (xhr) {
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  },
});

const DicomViewer = ({ instanceId }) => {
  const elementRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!instanceId) return;

    const element = elementRef.current;
    cornerstone.enable(element);

    // ----- cornerstone-tools setup -----
    cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
    cornerstoneTools.addToolState(element, 'stack', {
      currentImageIdIndex: 0,
      imageIds: [dicomService.getWadoImageId(instanceId)],
    });

    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
    cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
    cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);

    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 2 }); // right button pan
    cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 4 }); // middle button zoom
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 }); // left button window/level
    cornerstoneTools.setToolActive('StackScrollMouseWheel', {});

    const imageId = dicomService.getWadoImageId(instanceId);
    cornerstone.loadAndCacheImage(imageId).then((image) => {
      cornerstone.displayImage(element, image);
      cornerstone.fitToWindow(element);
    });

    const handleResize = () => {
      cornerstone.resize(element, true);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cornerstone.disable(element);
      window.removeEventListener('resize', handleResize);
    };
  }, [instanceId]);

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

  return (
    <div className="dicom-viewer-container">
      <div className="dicom-header">
        <Typography className="dicom-title">
          Visualisation DICOM
        </Typography>
      </div>

      <div className="dicom-image-container" ref={elementRef} style={{ width: '100%', height: '100%' }}>
        <div className="dicom-toolbar">
          <Tooltip title="Fenêtre/Niveau (gauche)">
            <IconButton className="toolbar-button">
              <TuneIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Pan (clic droit)">
            <IconButton className="toolbar-button">
              <PanToolAltIcon />
            </IconButton>
          </Tooltip>
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
