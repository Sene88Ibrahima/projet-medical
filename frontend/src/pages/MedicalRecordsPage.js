// src/pages/MedicalRecordsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MedicalRecordsPage = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchAttempted, setFetchAttempted] = useState(false);
    
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
                let endpoint;
                if (user.role === 'DOCTOR') {
                    endpoint = '/api/v1/doctor/medical-records';
                } else if (user.role === 'PATIENT') {
                    endpoint = '/api/v1/patient/medical-records';
                } else {
                    endpoint = '/api/v1/medical-records';
                }
                
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
                    
                    const uploadResponse = await axios.post('/api/v1/doctor/dicom/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log("Réponse du téléversement:", uploadResponse.data);
                    
                    uploadedImages.push({
                        orthancInstanceId: uploadResponse.data.id,
                        imageType: file.type,
                        description: file.name
                    });
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
        <div className="container mt-4">
            <h2>Dossiers médicaux</h2>

            {user?.role === 'DOCTOR' && (
                <div className="d-flex justify-content-end mb-3">
                    <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                        Nouveau dossier médical
                    </button>
                </div>
            )}

            {records.length > 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Diagnostic</th>
                                        <th>Traitement</th>
                                        <th>Date de création</th>
                                        <th>Images</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.patientName}</td>
                                            <td>{record.diagnosis}</td>
                                            <td>{record.treatment}</td>
                                            <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                                            <td>{record.imageCount}</td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(record.id)}
                                                    className="me-2"
                                                >
                                                    Voir
                                                </Button>
                                                {user?.role === 'DOCTOR' && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteRecord(record.id)}
                                                    >
                                                        Supprimer
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info">
                    Aucun dossier médical disponible.
                </div>
            )}
            
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
                                Vous pouvez sélectionner plusieurs fichiers.
                            </Form.Text>
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => setShowNewModal(false)}>
                                Annuler
                            </Button>
                            <Button variant="primary" type="submit">
                                Créer le dossier médical
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            
            {/* Modal pour afficher les détails d'un dossier médical */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Détails du dossier médical</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRecord && (
                        <div>
                            <div className="mb-3">
                                <h5>Informations générales</h5>
                                <p><strong>Date de création:</strong> {new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                                <p>
                                    <strong>{user?.role === 'DOCTOR' ? 'Patient:' : 'Médecin:'}</strong> {
                                        user?.role === 'DOCTOR'
                                            ? selectedRecord.patientName
                                            : selectedRecord.doctorName
                                    }
                                </p>
                            </div>
                            
                            <div className="mb-3">
                                <h5>Diagnostic médical</h5>
                                <p>{selectedRecord.diagnosis}</p>
                            </div>
                            
                            {selectedRecord.treatment && (
                                <div className="mb-3">
                                    <h5>Traitement prescrit</h5>
                                    <p>{selectedRecord.treatment}</p>
                                </div>
                            )}
                            
                            {selectedRecord.notes && (
                                <div className="mb-3">
                                    <h5>Notes</h5>
                                    <p>{selectedRecord.notes}</p>
                                </div>
                            )}
                            
                            {selectedRecord.medicalImages && selectedRecord.medicalImages.length > 0 && (
                                <div className="mb-3">
                                    <h5>Images médicales</h5>
                                    <div className="row">
                                        {selectedRecord.medicalImages.map((image, index) => (
                                            <div className="col-md-6 mb-3" key={image.id || index}>
                                                <div className="card">
                                                    <div className="card-body">
                                                        <p className="card-text">{image.description || `Image ${index + 1}`}</p>
                                                        {image.orthancInstanceId && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => window.open(`/patients/${selectedRecord.patientId}/dicom/${image.orthancInstanceId}`, '_blank')}
                                                            >
                                                                Visualiser l'image DICOM
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Section des images DICOM avec visualiseur intégré */}
                            {selectedRecord && selectedRecord.patient && (
                                <div className="mb-3">
                                    <h5>Visualisation des images DICOM</h5>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="dicom-viewer-container">
                                                <iframe 
                                                    src={`http://localhost:8042/app/explorer.html#patient?patientId=${selectedRecord.patient.id}`}
                                                    title="Visualiseur DICOM"
                                                    className="dicom-viewer"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MedicalRecordsPage;