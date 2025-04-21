// src/pages/MedicalRecordsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';
import { Modal, Button, Form } from 'react-bootstrap';

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
    const [patients, setPatients] = useState([
        { id: 1, firstName: 'Jean', lastName: 'Dupont' },
        { id: 2, firstName: 'Pierre', lastName: 'Martin' },
        { id: 3, firstName: 'Marie', lastName: 'Lefèvre' }
    ]);

    useEffect(() => {
        const fetchMedicalRecords = async () => {
            if (!user || fetchAttempted) return;
            
            try {
                console.log("Chargement des dossiers médicaux pour", user.email);
                setLoading(true);
                setFetchAttempted(true);
                
                // Vérifier s'il y a des dossiers médicaux stockés dans localStorage
                const storedRecords = localStorage.getItem('user_medical_records');
                let userRecords = [];
                
                if (storedRecords) {
                    // Charger les dossiers médicaux depuis localStorage
                    try {
                        const parsedRecords = JSON.parse(storedRecords);
                        userRecords = parsedRecords;
                        console.log("Dossiers médicaux chargés depuis localStorage:", userRecords.length);
                    } catch (e) {
                        console.error("Erreur lors du parsing des dossiers médicaux stockés:", e);
                    }
                }
                
                if (userRecords.length === 0) {
                    // Si aucun dossier médical n'est stocké, utiliser les données fictives
                    // Déterminer l'endpoint en fonction du rôle de l'utilisateur
                    let endpoint;
                    if (user.role === 'DOCTOR') {
                        endpoint = '/api/v1/doctor/medical-records';
                    } else if (user.role === 'PATIENT') {
                        endpoint = '/api/v1/patient/medical-records';
                    } else {
                        endpoint = '/api/v1/medical-records'; // Endpoint par défaut
                    }
                    
                    // Utiliser des données fictives pour éviter les chargements infinis
                    setTimeout(() => {
                        // Données fictives pour le développement
                        const mockRecords = [
                            {
                                id: 1,
                                createdAt: new Date().toISOString(),
                                diagnosis: "Grippe saisonnière",
                                treatment: "Repos et paracétamol",
                                notes: "Le patient présente une légère fièvre et des courbatures. Surveillance recommandée pendant 3 jours.",
                                medicalImages: [
                                    { id: 1, url: 'https://via.placeholder.com/400x300?text=Radiographie+1', description: "Radiographie thoracique" },
                                    { id: 2, url: 'https://via.placeholder.com/400x300?text=Analyse+Sanguine', description: "Résultats analyse sanguine" }
                                ],
                                patient: { firstName: "Jean", lastName: "Dupont" },
                                doctor: { firstName: "Marie", lastName: "Martin" }
                            },
                            {
                                id: 2,
                                createdAt: new Date(Date.now() - 7*86400000).toISOString(), // il y a une semaine
                                diagnosis: "Contrôle annuel",
                                treatment: "Aucun traitement nécessaire",
                                notes: "Examen de routine. Aucune anomalie détectée.",
                                medicalImages: [],
                                patient: { firstName: "Pierre", lastName: "Durand" },
                                doctor: { firstName: "Marie", lastName: "Martin" }
                            }
                        ];
                        
                        setRecords(mockRecords);
                        // Stocker également dans localStorage
                        localStorage.setItem('user_medical_records', JSON.stringify(mockRecords));
                        
                        setLoading(false);
                        console.log("Dossiers médicaux chargés avec succès (données fictives)");
                    }, 1000);
                    
                    // Code pour appeler le backend (commenté pour le moment)
                    /*
                    const response = await axios.get(endpoint);
                    userRecords = response.data;
                    localStorage.setItem('user_medical_records', JSON.stringify(userRecords));
                    */
                } else {
                    // Utiliser les dossiers médicaux stockés
                    setRecords(userRecords);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des dossiers médicaux:", err);
                setError("Impossible de charger vos dossiers médicaux. Le serveur ne répond pas.");
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
    
    const handleSubmitNewRecord = (e) => {
        e.preventDefault();
        
        // Créer un nouvel objet de dossier médical
        const newRecordObj = {
            id: Date.now(), // ID unique basé sur le timestamp
            createdAt: new Date().toISOString(),
            diagnosis: newRecord.diagnosis,
            treatment: newRecord.treatment,
            notes: newRecord.notes,
            medicalImages: newRecord.imageFiles.map((file, index) => ({
                id: `img-${Date.now()}-${index}`,
                url: URL.createObjectURL(file),
                description: file.name
            })),
            patient: patients.find(p => p.id.toString() === newRecord.patientId.toString()),
            doctor: { firstName: user?.firstName || 'Dr.', lastName: user?.lastName || 'Médecin' }
        };
        
        // Ajouter au tableau des dossiers médicaux
        const updatedRecords = [...records, newRecordObj];
        setRecords(updatedRecords);
        
        // Stocker dans localStorage
        // Note: Les URLs d'objets créés avec URL.createObjectURL() sont valides uniquement
        // pour la session en cours, donc les images ne seront pas chargées correctement
        // après un rafraîchissement. Dans une application réelle, les images seraient
        // uploadées sur un serveur et les URLs stockées.
        localStorage.setItem('user_medical_records', JSON.stringify(updatedRecords));
        
        // Fermer la modale et réinitialiser le formulaire
        setShowNewModal(false);
        setNewRecord({
            patientId: '',
            diagnosis: '',
            treatment: '',
            notes: '',
            imageFiles: []
        });
        
        // Afficher un message de confirmation
        alert("Dossier médical créé avec succès!");
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
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>{user?.role === 'DOCTOR' ? 'Patient' : 'Médecin'}</th>
                                    <th>Diagnostic</th>
                                    <th>Images</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {user?.role === 'DOCTOR'
                                                ? `${record.patient?.firstName} ${record.patient?.lastName}`
                                                : `Dr. ${record.doctor?.lastName}`
                                            }
                                        </td>
                                        <td>{record.diagnosis}</td>
                                        <td>{record.medicalImages?.length || 0}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() => handleShowDetails(record)}
                                            >
                                                Consulter
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
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
                                            ? `${selectedRecord.patient?.firstName} ${selectedRecord.patient?.lastName}`
                                            : `Dr. ${selectedRecord.doctor?.firstName} ${selectedRecord.doctor?.lastName}`
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
                                                    <img 
                                                        src={image.url} 
                                                        alt={image.description || `Image ${index + 1}`}
                                                        className="img-fluid"
                                                    />
                                                    <div className="card-body">
                                                        <p className="card-text">{image.description || `Image ${index + 1}`}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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