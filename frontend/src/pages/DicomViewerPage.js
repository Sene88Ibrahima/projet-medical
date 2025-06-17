import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DicomViewer from '../components/dicom/DicomViewer';
import MedicalReportPanel from '../components/dicom/MedicalReportPanel';
import dicomService from '../services/dicomService';
import './DicomViewerPage.css';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Alert,
  Box,
  Fade,
  Button
} from '@mui/material';
import ReportModal from '../components/dicom/ReportModal';

const DicomViewerPage = () => {
  const { patientId, studyId, instanceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  
  // Charger les études DICOM
  useEffect(() => {
    const loadStudies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les IDs d'études bruts
        const studyIds = await dicomService.getStudyIds(patientId);
        
        if (studyIds.length === 0) {
          setError("Aucune étude DICOM trouvée pour ce patient");
          setLoading(false);
          return;
        }
        
        // Récupérer les détails complets des études (si nécessaire)
        const studiesData = await Promise.all(
          studyIds.map(async (id) => {
            try {
              const studyDetails = await dicomService.getStudy(id);
              return studyDetails;
            } catch (error) {
              console.error(`Erreur lors de la récupération des détails de l'étude ${id}:`, error);
              return { id: id, ID: id };
            }
          })
        );
        
        setStudies(studiesData);
        
        // Si un ID d'étude est fourni dans l'URL, sélectionner cette étude
        if (studyId) {
          const study = studiesData.find(s => s.id === studyId || s.ID === studyId);
          if (study) {
            handleStudySelect(study);
          } else {
            setSelectedInstance({ id: studyId });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des études:", error);
        setError(`Erreur lors du chargement des études: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadStudies();
  }, [patientId, studyId]);

  // Quand une étude est sélectionnée, mettre à jour l'URL et charger les séries
  useEffect(() => {
    if (!selectedStudy) {
      return;
    }
    
    const studyId = selectedStudy.ID || selectedStudy.id;
    
    if (studyId) {
      if (patientId) {
        navigate(`/patients/${patientId}/dicom/${studyId}`, { replace: true });
      }
      
      const fetchSeries = async () => {
        if (selectedStudy.series && selectedStudy.series.length > 0) {
          if (!selectedSeries) {
            const firstSeries = selectedStudy.series[0];
            setSelectedSeries(firstSeries);
          }
          return;
        }

        try {
          const seriesData = await dicomService.getStudy(studyId);
          
          if (seriesData && seriesData.Series && seriesData.Series.length > 0) {
            setSelectedStudy(prev => ({
              ...prev,
              series: seriesData.Series
            }));
            
            const firstSeries = seriesData.Series[0];
            setSelectedSeries(firstSeries);
          } else {
            setSelectedSeries(null);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des séries:", err);
          setError("Impossible de charger les séries pour cette étude.");
        }
      };
      
      fetchSeries();
    }
  }, [selectedStudy, patientId, navigate]);

  // Quand une série est sélectionnée, charger les instances
  useEffect(() => {
    let isMounted = true;
    
    if (!selectedSeries) {
      return;
    }
    
    const seriesId = selectedSeries.ID || selectedSeries.id;
    
    if (selectedSeries.instances && selectedSeries.instances.length > 0) {
      if (!selectedInstance) {
        const firstInstance = selectedSeries.instances[0];
        setSelectedInstance(firstInstance);
      }
      return;
    }
    
    if (seriesId) {
      const fetchInstances = async () => {
        try {
          const seriesDetails = await dicomService.getSeries(seriesId);
          
          if (!isMounted) return;
          
          if (seriesDetails && seriesDetails.Instances && seriesDetails.Instances.length > 0) {
            setSelectedSeries(prev => ({
              ...prev,
              instances: seriesDetails.Instances
            }));
            
            const firstInstance = seriesDetails.Instances[0];
            setSelectedInstance(firstInstance);
          }
        } catch (err) {
          if (!isMounted) return;
          console.error("Erreur lors du chargement des instances:", err);
          setError("Impossible de charger les images pour cette série.");
        }
      };
      
      fetchInstances();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedSeries]);

  const handleStudySelect = (study) => {
    setSelectedStudy(study);
    setSelectedSeries(null);
    setSelectedInstance(null);
    
    if (!study.series || study.series.length === 0) {
      setSelectedInstance({ id: study.id || study.ID });
    }
  };

  const handleSeriesSelect = (series) => {
    setSelectedSeries(series);
    setSelectedInstance(null);
  };

  const handleInstanceSelect = (instance) => {
    setSelectedInstance(instance);
  };

  const handleAnnotationChange = (annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  const handleSaveReport = async (reportData) => {
    try {
      // Ici, vous devrez implémenter l'appel API pour sauvegarder le rapport
      await dicomService.saveReport(reportData);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du rapport:", error);
      throw error;
    }
  };

  return (
    <div className="dicom-viewer-page">
      <Container maxWidth={false} disableGutters sx={{ mt: 2, mb: 2, px: 2 }}>
        <Fade in={error != null} timeout={300}>
          <div>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} className="alert-fade">
                {error}
              </Alert>
            )}
          </div>
        </Fade>

        {/* Section principal: flex layout */}
        <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 120px)' }}>
          {/* Liste des études */}
          <Paper elevation={3} className="study-list-paper" sx={{ p: 2, display: 'flex', flexDirection: 'column', width: 260, overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Études DICOM
            </Typography>
            
            {loading ? (
              <Box className="loading-container">
                <CircularProgress className="loading-spinner" />
              </Box>
            ) : (
              <List>
                {studies.map((study) => (
                  <React.Fragment key={study.ID || study.id}>
                    <ListItem 
                      button 
                      className={`study-item ${selectedStudy?.ID === study.ID || selectedStudy?.id === study.id ? 'selected' : ''}`}
                      onClick={() => handleStudySelect(study)}
                    >
                      <ListItemText 
                        primary={study.StudyDescription || 'Étude sans description'} 
                        secondary={`Date: ${study.StudyDate || 'Non spécifiée'}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          {/* Dicom Viewer */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Paper elevation={3} className="dicom-viewer-container" sx={{ p: 0, width: '100%', height: '100%' }}>
              <DicomViewer 
                instanceId={selectedInstance ? (selectedInstance.orthanc_instance_id || selectedInstance.ID || selectedInstance.id) : null}
                onAnnotationChange={handleAnnotationChange}
              />
            </Paper>
          </Box>

          {/* Rapport médical */}
          <Paper elevation={3} className="report-container" sx={{ p: 0, width: 340, position: 'sticky', top: 16, height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <MedicalReportPanel
              instanceId={selectedInstance ? (selectedInstance.orthanc_instance_id || selectedInstance.ID || selectedInstance.id) : null}
              onSave={handleSaveReport}
            />
            <Button variant="contained" onClick={() => setReportOpen(true)} fullWidth sx={{ mt: 1 }}>
              Plein écran
            </Button>
          </Paper>
        </Box>
      </Container>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        instanceId={selectedInstance ? (selectedInstance.orthanc_instance_id || selectedInstance.ID || selectedInstance.id) : null}
        onSave={handleSaveReport}
      />
    </div>
  );
};

export default DicomViewerPage;
