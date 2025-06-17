// src/pages/MedicalRecordsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import {
  FolderOpen as FolderIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  AccessTime as TimeIcon,
  Event as DateIcon,
  Person as PersonIcon,
  Add as AddIcon
} from '@mui/icons-material';
import './MedicalRecordsPage.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, IconButton, Chip, Stack, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import { Close as CloseIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon, PictureAsPdf as PictureAsPdfIcon, Edit as EditIcon } from '@mui/icons-material';
import dicomService from '../services/dicomService';

const MedicalRecordsPage = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchAttempted, setFetchAttempted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // États pour les modales
    const [showNewModal, setShowNewModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    
    // États pour le formulaire de nouveau dossier médical
    const [newRecord, setNewRecord] = useState({
        patientId: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        imageFiles: []
    });
    
    // Liste fictive de patients (pour le dropdown)
    const [patients, setPatients] = useState([]);

    // État et gestionnaires pour la boîte de dialogue de détails
    // Tabs removed – details shown in single view
    const [detailsFullScreen, setDetailsFullScreen] = useState(false);

    

    const handleToggleFullScreen = () => {
        setDetailsFullScreen(prev => !prev);
    };

    const handleExportPdf = () => {
        window.print();
    };

    const navigate = useNavigate();

    useEffect(() => {
        // Fonction pour charger les patients
        const fetchPatients = async () => {
            try {
                const response = await axios.get('/api/v1/doctor/patients');
                setPatients(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement des patients:", error);
            }
        };

        if (user?.role === 'DOCTOR') {
            fetchPatients();
        }
    }, [user]);

    useEffect(() => {
        const fetchMedicalRecords = async () => {
            if (!user || fetchAttempted) return;
            
            try {
                console.log("Chargement des dossiers médicaux pour", user.email);
                setLoading(true);
                setFetchAttempted(true);
                
                // Déterminer l'endpoint en fonction du rôle de l'utilisateur
                let baseEndpoint;
                if (user.role === 'DOCTOR') {
                    baseEndpoint = '/api/v1/doctor';
                } else if (user.role === 'NURSE') {
                    baseEndpoint = '/api/v1/nurse';
                } else if (user.role === 'PATIENT') {
                    baseEndpoint = '/api/v1/patient';
                } else {
                    baseEndpoint = '/api/v1';
                }
                
                const endpoint = `${baseEndpoint}/medical-records`;
                
                console.log("Endpoint utilisé:", endpoint);
                const response = await axios.get(endpoint);
                console.log("Réponse reçue:", response.data);
                setRecords(response.data);
                setLoading(false);
                console.log("Dossiers médicaux chargés avec succès");
            } catch (err) {
                console.error("Erreur détaillée:", err.response || err);
                if (err.response?.status === 403) {
                    setError("Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.");
                } else if (err.response?.status === 401) {
                    setError("Votre session a expiré. Veuillez vous reconnecter.");
                    // Rediriger vers la page de connexion
                    window.location.href = '/login';
                } else {
                    setError("Impossible de charger vos dossiers médicaux. Veuillez réessayer plus tard.");
                }
                setLoading(false);
            }
        };

        fetchMedicalRecords();
    }, [user, fetchAttempted]);
    
    // Gestionnaires pour les modales
    const handleShowDetails = (record) => {
        setSelectedRecord(record);
        setShowDetailsModal(true);
    };
    
    const handleNewRecordChange = (e) => {
        const { name, value } = e.target;
        setNewRecord({
            ...newRecord,
            [name]: value
        });
    };
    
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewRecord({
            ...newRecord,
            imageFiles: files
        });
    };
    
    const handleSubmitNewRecord = async (e) => {
        e.preventDefault();
        
        try {
            console.log("Début de la création du dossier médical");
            console.log("Données du formulaire:", newRecord);
            
            // Téléverser les fichiers DICOM s'il y en a
            const uploadedImages = [];
            if (newRecord.imageFiles.length > 0) {
                console.log("Début du téléversement des fichiers DICOM");
                for (const file of newRecord.imageFiles) {
                    console.log("Téléversement du fichier:", file.name);
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('patientId', newRecord.patientId);
                    
                    const uploadResponse = await axios.post('/api/v1/dicom/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log("Réponse du téléversement:", uploadResponse.data);
                    console.log("Structure complète de la réponse:", JSON.stringify(uploadResponse.data));
                    
                    // Vérifier que la réponse contient un ID valide (accepter à la fois ID et id)
                    const instanceId = uploadResponse.data.ID || uploadResponse.data.id;
                    if (instanceId) {
                        uploadedImages.push({
                            orthancInstanceId: instanceId,
                            imageType: file.type || 'application/dicom',
                            description: file.name
                        });
                    } else {
                        console.error("Erreur: ID d'instance manquant dans la réponse", uploadResponse.data);
                    }
                }
                console.log("Fin du téléversement des fichiers DICOM");
            }
            
            // Créer le dossier médical avec les images
            const medicalRecordData = {
                patientId: newRecord.patientId,
                diagnosis: newRecord.diagnosis,
                treatment: newRecord.treatment,
                notes: newRecord.notes,
                medicalImages: uploadedImages
            };
            
            console.log("Données à envoyer au serveur:", medicalRecordData);
            
            const response = await axios.post('/api/v1/doctor/medical-records', medicalRecordData);
            console.log("Réponse du serveur:", response.data);
            
            // Mettre à jour l'état local
            const updatedRecords = [...records, response.data];
            setRecords(updatedRecords);
            console.log("État local mis à jour avec le nouveau dossier");
            
            // Fermer la modale et réinitialiser le formulaire
            setShowNewModal(false);
            setNewRecord({
                patientId: '',
                diagnosis: '',
                treatment: '',
                notes: '',
                imageFiles: []
            });
            console.log("Formulaire réinitialisé et modale fermée");
            
            alert("Dossier médical créé avec succès!");
        } catch (error) {
            console.error("Erreur détaillée lors de la création du dossier médical:", error);
            console.error("Réponse du serveur:", error.response?.data);
            console.error("Status:", error.response?.status);
            alert("Erreur lors de la création du dossier médical. Veuillez réessayer.");
        }
    };

    const handleViewDetails = async (recordId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/doctor/medical-records/${recordId}`);
            setSelectedRecord(response.data);
            setShowDetailsModal(true);
        } catch (err) {
            console.error("Erreur lors de la récupération des détails:", err);
            setError("Impossible de charger les détails du dossier médical.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecord = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier médical ?')) {
            try {
                await axios.delete(`/api/v1/doctor/medical-records/${id}`);
                setRecords(records.filter(record => record.id !== id));
                alert('Dossier médical supprimé avec succès');
            } catch (error) {
                console.error("Erreur lors de la suppression du dossier médical:", error);
                alert("Erreur lors de la suppression du dossier médical");
            }
        }
    };

    const handleViewRecord = (recordId) => {
        handleViewDetails(recordId);  // Appeler la fonction existante pour voir les détails
    };

    const handleViewImages = async (recordId) => {
        try {
            // Récupérer les détails du dossier médical pour obtenir l'ID de l'instance DICOM
            const response = await axios.get(`/api/v1/medical-records/${recordId}`);
            const record = response.data;
            
            // Vérifier si le dossier a des images médicales
            if (record.medicalImages && record.medicalImages.length > 0) {
                // Utiliser le premier ID d'instance DICOM disponible
                const firstImage = record.medicalImages[0];
                const dicomInstanceId = firstImage.orthancInstanceId;
                
                if (dicomInstanceId) {
                    // Rediriger vers la page du visualiseur DICOM avec l'ID de l'instance
                    navigate(`/patients/${record.patientId}/dicom/${dicomInstanceId}`);
                } else {
                    alert("Aucun ID d'instance DICOM trouvé pour cette image.");
                }
            } else {
                alert("Aucune image DICOM n'est associée à ce dossier médical.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des images:", error);
            alert("Erreur lors de l'accès aux images DICOM. Veuillez réessayer.");
        }
    };

    const filteredRecords = records.filter((record) =>
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Afficher un spinner pendant le chargement
    if (loading && !error) {
        return (
            <div className="container mt-4">
                <h2>Dossiers médicaux</h2>
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Afficher un message d'erreur si le chargement a échoué
    if (error) {
        return (
            <div className="container mt-4">
                <h2>Dossiers médicaux</h2>
                <div className="alert alert-danger mt-3">
                    <h4 className="alert-heading">Erreur de chargement</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">Veuillez réessayer plus tard ou contacter le support technique.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="medical-records-page">
            <Container maxWidth="lg">
                <div className="page-header">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Dossiers Médicaux
                    </Typography>
                </div>

                <div className="search-bar">
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Rechercher un dossier médical..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-field"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>

                {loading ? (
                    <div className="loading-container">
                        <CircularProgress className="loading-spinner" />
                    </div>
                ) : (
                    <div className="records-container">
                        <Grid container spacing={3}>
                            {filteredRecords.map((record) => (
                                <Grid item xs={12} sm={6} md={4} key={record.id}>
                                    <Paper className="record-card">
                                        <div className="record-card-content">
                                            <div className="record-header">
                                                <FolderIcon className="record-icon" />
                                                <div>
                                                    <Typography className="record-title">
                                                        {record.patientName}
                                                    </Typography>
                                                    <div className="record-info">
                                                        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <PersonIcon fontSize="small" />
                                                            ID: {record.patientId}
                                                        </Typography>
                                                        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <DateIcon fontSize="small" />
                                                            Date: {new Date(record.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <TimeIcon fontSize="small" />
                                                            Dernière mise à jour: {new Date(record.updatedAt).toLocaleDateString()}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="record-actions">
                                                <Button
                                                    variant="contained"
                                                    className="action-button view-button"
                                                    onClick={() => handleViewRecord(record.id)}
                                                    startIcon={<ViewIcon />}
                                                >
                                                    Détails
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    className="action-button images-button"
                                                    onClick={() => handleViewImages(record.id)}
                                                    startIcon={<ImageIcon />}
                                                    disabled={!record.medicalImages || record.medicalImages.length === 0}
                                                >
                                                    Images
                                                </Button>
                                            </div>

                                            <div className={`status-chip ${record.status === 'active' ? 'status-active' : 'status-completed'}`}>
                                                {record.status === 'active' ? 'En cours' : 'Terminé'}
                                            </div>
                                        </div>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                )}

                {/* Bouton flottant pour ajouter un nouveau dossier médical */}
                {user?.role === 'DOCTOR' && (
                    <Tooltip title="Nouveau dossier médical" placement="left">
                        <Fab 
                            color="primary" 
                            className="add-record-button"
                            onClick={() => setShowNewModal(true)}
                            sx={{
                                position: 'fixed',
                                bottom: 32,
                                right: 32,
                                zIndex: 1000
                            }}
                        >
                            <AddIcon />
                        </Fab>
                    </Tooltip>
                )}
            </Container>

            {/* Modal pour créer un nouveau dossier médical */}
            <Modal show={showNewModal} onHide={() => setShowNewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Nouveau dossier médical</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitNewRecord}>
                        <Form.Group className="mb-3">
                            <Form.Label>Patient</Form.Label>
                            <Form.Select 
                                name="patientId"
                                value={newRecord.patientId}
                                onChange={handleNewRecordChange}
                                required
                            >
                                <option value="">Sélectionnez un patient</option>
                                {patients.map(patient => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.firstName} {patient.lastName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Diagnostic</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="diagnosis"
                                value={newRecord.diagnosis}
                                onChange={handleNewRecordChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Traitement</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="treatment"
                                value={newRecord.treatment}
                                onChange={handleNewRecordChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                name="notes"
                                value={newRecord.notes}
                                onChange={handleNewRecordChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Images médicales</Form.Label>
                            <Form.Control 
                                type="file" 
                                multiple
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                Vous pouvez sélectionner plusieurs fichiers DICOM.
                            </Form.Text>
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button 
                                variant="outlined" 
                                onClick={() => setShowNewModal(false)}
                                sx={{ mr: 1 }}
                            >
                                Annuler
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                type="submit"
                            >
                                Créer le dossier médical
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            
            {/* Dialog détaillé du dossier médical (MUI) */}
<Dialog
    open={showDetailsModal}
    onClose={() => setShowDetailsModal(false)}
    fullScreen={detailsFullScreen}
    maxWidth="md"
    PaperProps={{ sx: { width: detailsFullScreen ? '100%' : 720, maxHeight: '90vh', border: '4px solid #90caf9', boxShadow: 8 } }}
>
    {selectedRecord && (
        <>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'common.white' }}>
                <Typography variant="h6">Détails du dossier médical</Typography>
                <Box>
                    <IconButton onClick={handleToggleFullScreen} size="large" sx={{ color: 'common.white' }}>
                        {detailsFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                    <IconButton onClick={() => setShowDetailsModal(false)} size="large" sx={{ color: 'common.white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>

                <Box sx={{ p: 3, maxHeight: detailsFullScreen ? 'calc(100vh - 160px)' : 600, overflowY: 'auto' }}>
                    
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ bgcolor:'#F5F7FA', p:2, borderRadius:2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb:1 }}>Informations générales</Typography>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="subtitle2" sx={{ fontWeight:'bold', color:'primary.main' }}>Date de création</Typography>
                                        <Typography>{new Date(selectedRecord.createdAt).toLocaleDateString()}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="subtitle2" sx={{ fontWeight:'bold', color:'primary.main' }}>{user?.role === 'DOCTOR' ? 'Patient' : 'Médecin'}</Typography>
                                        <Typography fontWeight="bold">{user?.role === 'DOCTOR' ? selectedRecord.patientName : selectedRecord.doctorName}</Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                            
                            

                            {selectedRecord.diagnosis && (
                            <Paper elevation={0} sx={{ bgcolor: '#ffebee', p:2, borderRadius:2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb:1 }}>Diagnostic médical</Typography>
                                <Typography>{selectedRecord.diagnosis}</Typography>
                            </Paper>
                                
                            )}

                            {selectedRecord.treatment && (
                            <Paper elevation={0} sx={{ bgcolor: '#e8f5e9', p:2, borderRadius:2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb:1 }}>Traitement prescrit</Typography>
                                <Typography>{selectedRecord.treatment}</Typography>
                            </Paper>
                            )}

                            {selectedRecord.notes && (
                            <Paper elevation={0} sx={{ bgcolor: '#fffde7', p:2, borderRadius:2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb:1 }}>Notes</Typography>
                                <Typography>{selectedRecord.notes}</Typography>
                            </Paper>
                            )}
                        </Stack>
                    
                        {selectedRecord.medicalImages && selectedRecord.medicalImages.length > 0 && (
                        <>
                            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                                Images médicales ({selectedRecord.medicalImages.length})
                            </Typography>
                            <ImageList cols={detailsFullScreen ? 4 : 3} gap={8} rowHeight={160}>
                                {selectedRecord.medicalImages.map((image, index) => (
                                    <ImageListItem key={image.id || index}>
                                        <img
                                            src={dicomService.getInstanceImageUrl ? dicomService.getInstanceImageUrl(image.orthancInstanceId) : `/api/v1/dicom/instances/${image.orthancInstanceId}/preview`}
                                            alt={image.description || `Image ${index + 1}`}
                                            loading="lazy"
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                        <ImageListItemBar
                                            title={image.description || `Image ${index + 1}`}
                                            sx={{ '.MuiImageListItemBar-title': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                            actionIcon={
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() => window.open(`/patients/${selectedRecord.patientId}/dicom/${image.orthancInstanceId}`, '_blank')}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            }
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button variant="contained" onClick={() => setShowDetailsModal(false)} sx={{ backgroundColor: 'grey.300', color: 'grey.900', textTransform: 'none', px: 3, '&:hover': { backgroundColor: 'grey.400' } }}>Fermer</Button>
                <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={handleExportPdf} sx={{ textTransform: 'none', px: 3, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}>Exporter PDF</Button>
                {user?.role === 'DOCTOR' && (
                    <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => navigate(`/doctor/medical-records/${selectedRecord.id}/edit`)} sx={{ textTransform: 'none', px: 3 }}>
                        Modifier
                    </Button>
                )}
            </DialogActions>
        </>
    )}
</Dialog>

</div>
);
};



export default MedicalRecordsPage;
