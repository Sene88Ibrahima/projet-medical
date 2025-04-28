import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DicomViewer from '../components/dicom/DicomViewer';
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
  TextField,
  Button
} from '@mui/material';

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
  const [report, setReport] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
  const [directInstanceId, setDirectInstanceId] = useState('');
  
  // Fonction pour mettre à jour les informations de débogage
  const updateDebugInfo = (info) => {
    console.log("Debug info:", info);
    setDebugInfo(prev => ({ ...prev, ...info }));
  };
  
  // Charger les études DICOM
  useEffect(() => {
    const loadStudies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les IDs d'études bruts
        const studyIds = await dicomService.getStudyIds(patientId);
        updateDebugInfo({ patientId, studiesCount: studyIds.length, studyIds });
        
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
              // Retourner un objet minimal avec l'ID
              return { id: id, ID: id };
            }
          })
        );
        
        setStudies(studiesData);
        updateDebugInfo({ 
          patientId, 
          studiesCount: studiesData.length, 
          studiesData,
          studyIds
        });
        
        // Si un ID d'étude est fourni dans l'URL, sélectionner cette étude
        if (studyId) {
          const study = studiesData.find(s => s.id === studyId || s.ID === studyId);
          if (study) {
            handleStudySelect(study);
          } else {
            // Si l'étude n'est pas trouvée, essayer de l'utiliser comme ID d'instance
            updateDebugInfo({ 
              action: "Utilisation du studyId comme instanceId", 
              studyId,
              error: "Étude non trouvée avec l'ID fourni",
              tryingDirectInstance: true,
              studyIdNotFound: studyId
            });
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
    
    // Utiliser l'ID correct (peut être id ou ID)
    const studyId = selectedStudy.ID || selectedStudy.id;
    updateDebugInfo({ action: "Étude sélectionnée", studyId });
    
    if (studyId) {
      // Mettre à jour l'URL sans recharger la page
      if (patientId) {
        navigate(`/patients/${patientId}/dicom/${studyId}`, { replace: true });
      }
      
      // Charger les séries pour cette étude
      const fetchSeries = async () => {
        try {
          console.log("Chargement des séries pour l'étude:", studyId);
          const seriesData = await dicomService.getStudy(studyId);
          
          console.log("Données de l'étude récupérées:", seriesData);
          updateDebugInfo({ 
            seriesCount: seriesData?.Series?.length || 0,
            seriesData: seriesData?.Series?.map(s => s.ID || s.id) || []
          });
          
          if (seriesData && seriesData.Series && seriesData.Series.length > 0) {
            console.log("Séries récupérées:", seriesData.Series);
            // Ajouter les séries à l'étude sélectionnée
            setSelectedStudy(prev => ({
              ...prev,
              series: seriesData.Series
            }));
            
            // Sélectionner la première série
            const firstSeries = seriesData.Series[0];
            updateDebugInfo({ selectedSeriesId: firstSeries.ID || firstSeries.id });
            setSelectedSeries(firstSeries);
          } else {
            console.log("Aucune série trouvée pour cette étude");
            updateDebugInfo({ warning: "Aucune série trouvée" });
            setSelectedSeries(null);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des séries:", err);
          updateDebugInfo({ error: `Erreur séries: ${err.message}` });
          setError("Impossible de charger les séries pour cette étude.");
        }
      };
      
      fetchSeries();
    }
  }, [selectedStudy, patientId, navigate]);

  // Quand une série est sélectionnée, charger les instances
  useEffect(() => {
    if (!selectedSeries) {
      return;
    }
    
    // Utiliser l'ID correct (peut être id ou ID)
    const seriesId = selectedSeries.ID || selectedSeries.id;
    updateDebugInfo({ action: "Série sélectionnée", seriesId });
    
    if (seriesId && !selectedSeries.instances) {
      const fetchInstances = async () => {
        try {
          console.log("Chargement des instances pour la série:", seriesId);
          const seriesDetails = await dicomService.getSeries(seriesId);
          
          console.log("Détails de la série récupérés:", seriesDetails);
          updateDebugInfo({ 
            instancesCount: seriesDetails?.Instances?.length || 0,
            instancesData: seriesDetails?.Instances?.map(i => i.ID || i.id) || []
          });
          
          if (seriesDetails && seriesDetails.Instances && seriesDetails.Instances.length > 0) {
            console.log("Instances récupérées:", seriesDetails.Instances);
            
            // Ajouter les instances à la série sélectionnée
            setSelectedSeries(prev => ({
              ...prev,
              instances: seriesDetails.Instances
            }));
            
            // Sélectionner la première instance
            const firstInstance = seriesDetails.Instances[0];
            updateDebugInfo({ 
              selectedInstanceId: firstInstance.ID || firstInstance.id,
              instanceDetails: firstInstance
            });
            setSelectedInstance(firstInstance);
          } else {
            console.log("Aucune instance trouvée pour cette série");
            updateDebugInfo({ warning: "Aucune instance trouvée" });
          }
        } catch (err) {
          console.error("Erreur lors du chargement des instances:", err);
          updateDebugInfo({ error: `Erreur instances: ${err.message}` });
          setError("Impossible de charger les images pour cette série.");
        }
      };
      
      fetchInstances();
    } else if (selectedSeries.instances && selectedSeries.instances.length > 0 && !selectedInstance) {
      // Si les instances sont déjà chargées mais aucune n'est sélectionnée
      const firstInstance = selectedSeries.instances[0];
      updateDebugInfo({ 
        action: "Sélection automatique de la première instance",
        selectedInstanceId: firstInstance.ID || firstInstance.id 
      });
      setSelectedInstance(firstInstance);
    }
  }, [selectedSeries]);

  // Fonction pour charger directement une instance DICOM
  const handleDirectInstanceLoad = () => {
    if (!directInstanceId.trim()) {
      alert("Veuillez entrer un ID d'instance valide");
      return;
    }
    
    updateDebugInfo({ action: "Chargement direct d'instance", directInstanceId });
    setSelectedInstance({ id: directInstanceId.trim() });
  };

  // Fonction pour tester avec des IDs d'études connus
  const testWithKnownStudyIds = () => {
    // IDs d'études connus d'après les logs du backend
    const knownStudyIds = [
      "3abaec0a-ebfaaa87-f830d52b-d62df074-6a692c12",
      "8a73b50a-7d6cfda8-a46add6d-9b169ca9-7f2f9b30"
    ];
    
    // Choisir un ID au hasard parmi les IDs connus
    const randomId = knownStudyIds[Math.floor(Math.random() * knownStudyIds.length)];
    
    updateDebugInfo({ 
      action: "Test avec ID d'étude connu", 
      testStudyId: randomId 
    });
    
    // Utiliser cet ID comme ID d'instance
    setDirectInstanceId(randomId);
    setSelectedInstance({ id: randomId });
  };

  // Gérer la sélection d'une étude
  const handleStudySelect = (study) => {
    console.log("Étude sélectionnée:", study);
    updateDebugInfo({ action: "Étude sélectionnée", studyId: study.id || study.ID });
    
    setSelectedStudy(study);
    setSelectedSeries(null);
    setSelectedInstance(null);
    
    // Si l'étude n'a pas de séries ou si les séries sont vides
    if (!study.series || study.series.length === 0) {
      // Essayer de charger directement l'étude comme une instance
      updateDebugInfo({ 
        action: "Utilisation de l'ID d'étude comme ID d'instance", 
        studyId: study.id || study.ID,
        reason: "Pas de séries disponibles"
      });
      setSelectedInstance({ id: study.id || study.ID });
    }
  };

  // Gérer la sélection d'une série
  const handleSeriesSelect = (series) => {
    console.log("Série sélectionnée:", series);
    updateDebugInfo({ action: "Série sélectionnée", seriesId: series.ID || series.id });
    setSelectedSeries(series);
    setSelectedInstance(null);
  };

  // Gérer la sélection d'une instance
  const handleInstanceSelect = (instance) => {
    console.log("Instance sélectionnée:", instance);
    updateDebugInfo({ 
      action: "Instance sélectionnée", 
      instanceId: instance.ID || instance.id,
      orthanc_instance_id: instance.orthanc_instance_id
    });
    setSelectedInstance(instance);
  };

  // Gérer les annotations
  const handleAnnotationChange = (annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  // Gérer le rapport médical
  const handleReportChange = (e) => {
    setReport(e.target.value);
  };

  // Sauvegarder le rapport médical
  const handleSaveReport = () => {
    // Ici, vous pouvez implémenter la logique pour sauvegarder le rapport
    // Par exemple, envoyer une requête API pour sauvegarder le rapport dans la base de données
    console.log("Rapport sauvegardé:", report);
    
    // Afficher un message de confirmation (à implémenter)
    alert("Rapport médical sauvegardé avec succès !");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
      <Typography variant="h4" gutterBottom>
        Visualiseur d'images médicales DICOM
      </Typography>
      
      {/* Panneau de chargement direct d'image - TOUJOURS VISIBLE */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Charger une image directement
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ID d'instance DICOM"
            variant="outlined"
            size="small"
            fullWidth
            value={directInstanceId}
            onChange={(e) => setDirectInstanceId(e.target.value)}
            placeholder="ex: aa044c9c-f0faa1ef-e2226f15-36a0d656-886729b2"
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleDirectInstanceLoad}
            fullWidth
          >
            Charger l'image
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={testWithKnownStudyIds}
            fullWidth
          >
            Tester avec un ID connu
          </Button>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Panneau de navigation */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Études DICOM
              </Typography>
              {studies.length === 0 ? (
                <Typography color="text.secondary">Aucune étude disponible</Typography>
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {studies.map((study, index) => (
                    <React.Fragment key={study.ID || study.id || `study-${index}`}>
                      <ListItem 
                        sx={{ cursor: 'pointer' }}
                        selected={selectedStudy && (selectedStudy.ID === study.ID || selectedStudy.id === study.id)}
                        onClick={() => handleStudySelect(study)}
                      >
                        <ListItemText 
                          primary={study.MainDicomTags?.StudyDescription || `Étude sans description ${index + 1}`} 
                          secondary={study.MainDicomTags?.StudyDate || 'Date inconnue'} 
                        />
                      </ListItem>
                      
                      {selectedStudy && (selectedStudy.ID === study.ID || selectedStudy.id === study.id) && selectedStudy.series && (
                        <List component="div" disablePadding>
                          {selectedStudy.series.map((series, seriesIndex) => (
                            <ListItem 
                              key={series.ID || series.id || `series-${seriesIndex}`}
                              sx={{ pl: 4, cursor: 'pointer' }}
                              selected={selectedSeries && (selectedSeries.ID === series.ID || selectedSeries.id === series.id)}
                              onClick={() => handleSeriesSelect(series)}
                            >
                              <ListItemText 
                                primary={series.MainDicomTags?.SeriesDescription || `Série ${series.MainDicomTags?.SeriesNumber || seriesIndex + 1}`} 
                                secondary={`${series.instances ? series.instances.length : 0} images`} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                      
                      {index < studies.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
          
          {/* Zone principale */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              {/* Visualiseur DICOM */}
              <Grid item xs={12}>
                <DicomViewer 
                  instanceId={selectedInstance ? (selectedInstance.orthanc_instance_id || selectedInstance.ID || selectedInstance.id) : null}
                  onAnnotationChange={handleAnnotationChange}
                />
                
                {/* Informations de débogage */}
                {Object.keys(debugInfo).length > 0 && (
                  <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" gutterBottom>Informations de débogage</Typography>
                    <pre style={{ fontSize: '0.8rem', overflowX: 'auto' }}>
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </Paper>
                )}
              </Grid>
              
              {/* Rapport médical */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Rapport médical
                  </Typography>
                  <textarea 
                    className="report-textarea"
                    value={report}
                    onChange={handleReportChange}
                    placeholder="Rédigez votre rapport médical ici..."
                    rows={6}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <button 
                      className="save-button"
                      onClick={handleSaveReport}
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#1976d2', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Sauvegarder le rapport
                    </button>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Annotations */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Annotations ({annotations.length})
                  </Typography>
                  {annotations.length === 0 ? (
                    <Typography color="text.secondary">
                      Aucune annotation. Utilisez les outils d'annotation pour en ajouter.
                    </Typography>
                  ) : (
                    <List>
                      {annotations.map((annotation, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={annotation.type === 'length' ? 'Mesure de distance' : annotation.type}
                            secondary={new Date(annotation.timestamp).toLocaleTimeString()}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DicomViewerPage;
