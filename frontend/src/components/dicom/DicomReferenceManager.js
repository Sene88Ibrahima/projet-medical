import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Typography,
  Alert,
  Paper
} from '@mui/material';
import { Delete, Visibility, Add } from '@mui/icons-material';
import medicalImageReferenceService from '../../services/medicalImageReferenceService';
import dicomService from '../../services/dicomService';
import DicomImageViewer from './DicomImageViewer';

/**
 * Composant pour gu00e9rer les ru00e9fu00e9rences d'images DICOM associu00e9es u00e0 un dossier mu00e9dical.
 * 
 * @param {Object} props - Props du composant
 * @param {number} props.medicalRecordId - ID du dossier mu00e9dical
 */
const DicomReferenceManager = ({ medicalRecordId }) => {
  // u00c9tats pour les ru00e9fu00e9rences d'images
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // u00c9tats pour l'ajout d'une nouvelle ru00e9fu00e9rence
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [availableStudies, setAvailableStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [description, setDescription] = useState('');
  const [addingReference, setAddingReference] = useState(false);
  
  // u00c9tats pour la visualisation d'une image
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedViewInstance, setSelectedViewInstance] = useState(null);
  
  // u00c9tats pour la suppression d'une ru00e9fu00e9rence
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState(null);

  // Charger les ru00e9fu00e9rences d'images au chargement du composant
  useEffect(() => {
    if (!medicalRecordId) return;
    
    const loadReferences = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await medicalImageReferenceService.getReferencesByMedicalRecordId(medicalRecordId);
        setReferences(data);
      } catch (err) {
        console.error("Erreur lors du chargement des ru00e9fu00e9rences d'images:", err);
        setError(`Impossible de charger les ru00e9fu00e9rences d'images: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadReferences();
  }, [medicalRecordId]);

  // Cache local pour les études, séries et instances
  const [studiesCache, setStudiesCache] = useState({});
  const [seriesCache, setSeriesCache] = useState({});
  const [instancesCache, setInstancesCache] = useState({});

  // Charger les études DICOM disponibles avec mise en cache
  const loadAvailableStudies = async () => {
    try {
      setLoading(true);
      
      // Vérifier si nous avons déjà des études dans le cache
      if (Object.keys(studiesCache).length > 0) {
        console.log('Utilisation du cache local pour les études DICOM');
        setAvailableStudies(Object.values(studiesCache));
        setLoading(false);
        return;
      }
      
      // Limiter à 10 études maximum pour éviter les boucles infinies
      const studyIds = await dicomService.getStudyIds();
      const limitedStudyIds = studyIds.slice(0, 10); // Limiter à 10 études maximum
      
      console.log(`Chargement de ${limitedStudyIds.length} études sur ${studyIds.length} disponibles`);
      
      const studiesData = await Promise.all(
        limitedStudyIds.map(async (id) => {
          try {
            // Vérifier si l'étude est dans le cache
            if (studiesCache[id]) {
              console.log(`Étude ${id} récupérée du cache local`);
              return studiesCache[id];
            }
            
            const study = await dicomService.getStudy(id);
            return study;
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails de l'étude ${id}:`, error);
            return { id, error: true };
          }
        })
      );
      
      // Mettre à jour le cache des études
      const newCache = { ...studiesCache };
      studiesData.forEach(study => {
        if (!study.error) {
          const studyId = study.ID || study.id;
          newCache[studyId] = study;
        }
      });
      setStudiesCache(newCache);
      
      setAvailableStudies(studiesData);
    } catch (err) {
      console.error("Erreur lors du chargement des études DICOM:", err);
      setError(`Impossible de charger les études DICOM: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'ouverture du dialogue d'ajout
  const handleOpenAddDialog = async () => {
    setShowAddDialog(true);
    // Charger les études seulement après l'ouverture du dialogue
    // pour éviter des requêtes inutiles
    await loadAvailableStudies();
  };

  // Gérer la fermeture du dialogue d'ajout
  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    setSelectedStudy(null);
    setSelectedSeries(null);
    setSelectedInstance(null);
    setDescription('');
  };

  // Gérer la sélection d'une étude
  const handleStudySelect = async (study) => {
    setSelectedStudy(study);
    setSelectedSeries(null);
    setSelectedInstance(null);
    
    try {
      const studyId = study.ID || study.id;
      
      // Vérifier si l'étude a déjà des séries chargées
      if (study.series && study.series.length > 0) {
        console.log(`Séries pour l'étude ${studyId} déjà chargées, utilisation du cache local`);
        // Utiliser les séries déjà chargées
        if (study.series.length > 0) {
          handleSeriesSelect(study.series[0]);
        }
        return;
      }
      
      // Vérifier si les séries sont dans le cache
      if (seriesCache[studyId]) {
        console.log(`Séries pour l'étude ${studyId} récupérées du cache local`);
        const cachedSeries = seriesCache[studyId];
        
        // Mettre à jour l'étude avec les séries du cache
        setSelectedStudy({ ...study, series: cachedSeries });
        
        // Sélectionner la première série si disponible
        if (cachedSeries.length > 0) {
          handleSeriesSelect(cachedSeries[0]);
        }
        return;
      }
      
      // Charger les séries de l'étude sélectionnée
      console.log(`Chargement des séries pour l'étude ${studyId} depuis le backend`);
      const studyDetails = await dicomService.getStudy(studyId);
      const series = studyDetails.Series || studyDetails.series || [];
      
      // Limiter le nombre de séries pour éviter les boucles infinies
      const limitedSeries = series.slice(0, 5); // Limiter à 5 séries maximum
      
      // Mettre à jour le cache des séries
      setSeriesCache(prev => ({
        ...prev,
        [studyId]: limitedSeries
      }));
      
      // Mettre à jour l'étude avec les séries
      setSelectedStudy({ ...study, series: limitedSeries });
      
      // Sélectionner la première série si disponible
      if (limitedSeries.length > 0) {
        handleSeriesSelect(limitedSeries[0]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des séries:", err);
      setError(`Impossible de charger les séries: ${err.message}`);
    }
  };

  // Gérer la sélection d'une série
  const handleSeriesSelect = async (series) => {
    setSelectedSeries(series);
    setSelectedInstance(null);
    
    try {
      const seriesId = series.ID || series.id;
      
      // Vérifier si la série a déjà des instances chargées
      if (series.instances && series.instances.length > 0) {
        console.log(`Instances pour la série ${seriesId} déjà chargées, utilisation du cache local`);
        // Sélectionner la première instance si disponible
        if (series.instances.length > 0) {
          setSelectedInstance(series.instances[0]);
        }
        return;
      }
      
      // Vérifier si les instances sont dans le cache
      if (instancesCache[seriesId]) {
        console.log(`Instances pour la série ${seriesId} récupérées du cache local`);
        const cachedInstances = instancesCache[seriesId];
        
        // Mettre à jour la série avec les instances du cache
        setSelectedSeries({ ...series, instances: cachedInstances });
        
        // Sélectionner la première instance si disponible
        if (cachedInstances.length > 0) {
          setSelectedInstance(cachedInstances[0]);
        }
        return;
      }
      
      // Charger les instances de la série sélectionnée
      console.log(`Chargement des instances pour la série ${seriesId} depuis le backend`);
      const seriesDetails = await dicomService.getSeries(seriesId);
      const instances = seriesDetails.Instances || seriesDetails.instances || [];
      
      // Limiter le nombre d'instances pour éviter les boucles infinies
      const limitedInstances = instances.slice(0, 10); // Limiter à 10 instances maximum
      
      // Mettre à jour le cache des instances
      setInstancesCache(prev => ({
        ...prev,
        [seriesId]: limitedInstances
      }));
      
      // Mettre à jour la série avec les instances
      setSelectedSeries({ ...series, instances: limitedInstances });
      
      // Sélectionner la première instance si disponible
      if (limitedInstances.length > 0) {
        setSelectedInstance(limitedInstances[0]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des instances:", err);
      setError(`Impossible de charger les instances: ${err.message}`);
    }
  };

  // Gu00e9rer l'ajout d'une ru00e9fu00e9rence d'image
  const handleAddReference = async () => {
    if (!selectedInstance) {
      setError("Veuillez su00e9lectionner une image DICOM");
      return;
    }
    
    try {
      setAddingReference(true);
      
      // Cru00e9er la ru00e9fu00e9rence d'image
      const newReference = {
        medicalRecordId,
        orthancInstanceId: selectedInstance.ID || selectedInstance.id,
        orthancSeriesId: selectedSeries ? (selectedSeries.ID || selectedSeries.id) : null,
        orthancStudyId: selectedStudy ? (selectedStudy.ID || selectedStudy.id) : null,
        description: description.trim() || "Image DICOM"
      };
      
      // Envoyer la ru00e9fu00e9rence au backend
      const createdReference = await medicalImageReferenceService.createReference(newReference);
      
      // Mettre u00e0 jour la liste des ru00e9fu00e9rences
      setReferences(prev => [...prev, createdReference]);
      
      // Fermer le dialogue
      handleCloseAddDialog();
    } catch (err) {
      console.error("Erreur lors de l'ajout de la ru00e9fu00e9rence d'image:", err);
      setError(`Impossible d'ajouter la ru00e9fu00e9rence d'image: ${err.message}`);
    } finally {
      setAddingReference(false);
    }
  };

  // Gu00e9rer l'ouverture du visualiseur d'image
  const handleOpenViewer = (instanceId) => {
    setSelectedViewInstance(instanceId);
    setViewerOpen(true);
  };

  // Gu00e9rer la fermeture du visualiseur d'image
  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedViewInstance(null);
  };

  // Gu00e9rer l'ouverture du dialogue de suppression
  const handleOpenDeleteDialog = (reference) => {
    setReferenceToDelete(reference);
    setDeleteDialogOpen(true);
  };

  // Gu00e9rer la fermeture du dialogue de suppression
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReferenceToDelete(null);
  };

  // Gu00e9rer la suppression d'une ru00e9fu00e9rence d'image
  const handleDeleteReference = async () => {
    if (!referenceToDelete) return;
    
    try {
      await medicalImageReferenceService.deleteReference(referenceToDelete.id);
      
      // Mettre u00e0 jour la liste des ru00e9fu00e9rences
      setReferences(prev => prev.filter(ref => ref.id !== referenceToDelete.id));
      
      // Fermer le dialogue
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Erreur lors de la suppression de la ru00e9fu00e9rence d'image:", err);
      setError(`Impossible de supprimer la ru00e9fu00e9rence d'image: ${err.message}`);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Images DICOM associu00e9es</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
          >
            Ajouter une image
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button onClick={() => setError(null)} color="inherit" size="small">
              Fermer
            </Button>
          </Alert>
        )}
        
        {loading && !showAddDialog ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : references.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography color="textSecondary">
              Aucune image DICOM associu00e9e u00e0 ce dossier mu00e9dical.
            </Typography>
          </Paper>
        ) : (
          <List>
            {references.map((reference) => (
              <React.Fragment key={reference.id}>
                <ListItem>
                  <ListItemText
                    primary={reference.description}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span" color="textSecondary">
                          Ajoutu00e9e le {new Date(reference.createdAt).toLocaleString()}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          ID: {reference.orthancInstanceId}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleOpenViewer(reference.orthancInstanceId)}>
                      <Visibility />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleOpenDeleteDialog(reference)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {/* Dialogue d'ajout d'une ru00e9fu00e9rence d'image */}
        <Dialog open={showAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
          <DialogTitle>Ajouter une image DICOM</DialogTitle>
          <DialogContent>
            <DialogContentText paragraph>
              Su00e9lectionnez une u00e9tude, une su00e9rie et une image DICOM u00e0 associer au dossier mu00e9dical.
            </DialogContentText>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {/* Su00e9lection de l'u00e9tude */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    u00c9tudes DICOM
                  </Typography>
                  <Paper variant="outlined" sx={{ height: 300, overflow: 'auto', p: 1 }}>
                    <List dense>
                      {availableStudies.map((study) => (
                        <ListItem
                          key={study.ID || study.id}
                          button
                          selected={selectedStudy && (selectedStudy.ID === study.ID || selectedStudy.id === study.id)}
                          onClick={() => handleStudySelect(study)}
                        >
                          <ListItemText
                            primary={study.MainDicomTags?.StudyDescription || `u00c9tude ${study.ID || study.id}`}
                            secondary={study.MainDicomTags?.StudyDate || 'Date inconnue'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                
                {/* Su00e9lection de la su00e9rie */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Su00e9ries
                  </Typography>
                  <Paper variant="outlined" sx={{ height: 300, overflow: 'auto', p: 1 }}>
                    {selectedStudy && selectedStudy.series && selectedStudy.series.length > 0 ? (
                      <List dense>
                        {selectedStudy.series.map((series) => (
                          <ListItem
                            key={series.ID || series.id}
                            button
                            selected={selectedSeries && (selectedSeries.ID === series.ID || selectedSeries.id === series.id)}
                            onClick={() => handleSeriesSelect(series)}
                          >
                            <ListItemText
                              primary={series.MainDicomTags?.SeriesDescription || `Su00e9rie ${series.ID || series.id}`}
                              secondary={`${series.instances ? series.instances.length : 0} images`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="textSecondary">
                          {selectedStudy ? 'Aucune su00e9rie disponible' : 'Su00e9lectionnez une u00e9tude'}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                
                {/* Su00e9lection de l'instance */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Images
                  </Typography>
                  <Paper variant="outlined" sx={{ height: 300, overflow: 'auto', p: 1 }}>
                    {selectedSeries && selectedSeries.instances && selectedSeries.instances.length > 0 ? (
                      <List dense>
                        {selectedSeries.instances.map((instance) => (
                          <ListItem
                            key={instance.ID || instance.id}
                            button
                            selected={selectedInstance && (selectedInstance.ID === instance.ID || selectedInstance.id === instance.id)}
                            onClick={() => setSelectedInstance(instance)}
                          >
                            <ListItemText
                              primary={`Image ${instance.IndexInSeries || 'DICOM'}`}
                              secondary={instance.ID || instance.id}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="textSecondary">
                          {selectedSeries ? 'Aucune image disponible' : 'Su00e9lectionnez une su00e9rie'}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                
                {/* Description de l'image */}
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Entrez une description pour cette image"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog} color="inherit">
              Annuler
            </Button>
            <Button
              onClick={handleAddReference}
              color="primary"
              variant="contained"
              disabled={!selectedInstance || addingReference}
            >
              {addingReference ? <CircularProgress size={24} /> : 'Ajouter'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Dialogue de suppression */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              u00cates-vous su00fbr de vouloir supprimer cette ru00e9fu00e9rence d'image ? Cette action est irru00e9versible.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="inherit">
              Annuler
            </Button>
            <Button onClick={handleDeleteReference} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Visualiseur d'image */}
        {viewerOpen && selectedViewInstance && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <Box sx={{ width: '100%', maxWidth: 1000, maxHeight: '90vh', overflow: 'auto' }}>
              <DicomImageViewer instanceId={selectedViewInstance} onClose={handleCloseViewer} />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DicomReferenceManager;
