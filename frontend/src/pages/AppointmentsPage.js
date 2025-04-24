// src/pages/AppointmentsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';
import { Modal, Button, Form } from 'react-bootstrap';

const AppointmentsPage = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchAttempted, setFetchAttempted] = useState(false);
    
    // États pour les modales
    const [showNewModal, setShowNewModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    
    // États pour le formulaire de nouveau rendez-vous
    const [newAppointment, setNewAppointment] = useState({
        date: '',
        time: '',
        reason: '',
        doctorId: '',
        patientId: ''
    });
    
    // Listes pour les dropdowns
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        // Fonction pour charger les médecins (pour les patients)
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('/api/v1/patient/doctors');
                setDoctors(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement des médecins:", error);
            }
        };

        // Fonction pour charger les patients (pour les médecins)
        const fetchPatients = async () => {
            try {
                const response = await axios.get('/api/v1/doctor/patients');
                setPatients(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement des patients:", error);
            }
        };

        // Charger la liste appropriée selon le rôle
        if (user?.role === 'DOCTOR') {
            fetchPatients();
        } else if (user?.role === 'PATIENT') {
            fetchDoctors();
        }
    }, [user?.role]);

    useEffect(() => {
        // Fonction pour charger les rendez-vous
        const fetchAppointments = async () => {
            if (!user) return;
            
            try {
                console.log("Chargement des rendez-vous pour", user.email);
                console.log("Token JWT:", localStorage.getItem('token'));
                setLoading(true);
                
                // Déterminer l'endpoint en fonction du rôle de l'utilisateur
                let endpoint;
                if (user.role === 'DOCTOR') {
                    endpoint = '/api/v1/doctor/appointments';
                } else if (user.role === 'PATIENT') {
                    endpoint = '/api/v1/patient/appointments';
                } else if (user.role === 'NURSE') {
                    endpoint = '/api/v1/nurse/appointments';
                } else {
                    endpoint = '/api/v1/appointments';
                }
                
                console.log("Endpoint utilisé:", endpoint);
                
                const response = await axios.get(endpoint);
                console.log("Réponse reçue:", response.data);
                setAppointments(response.data);
                setLoading(false);
                console.log("Rendez-vous chargés avec succès");
            } catch (err) {
                console.error("Erreur détaillée:", err.response || err);
                setError("Impossible de charger vos rendez-vous. Le serveur ne répond pas.");
                setLoading(false);
            }
        };

        // Charger les rendez-vous immédiatement
        if (user) {
            fetchAppointments();
        }
        
        // Mettre en place un rafraîchissement automatique toutes les 30 secondes
        const intervalId = setInterval(() => {
            if (user) {
                fetchAppointments();
            }
        }, 30000); // 30 secondes
        
        // Nettoyer l'intervalle lorsque le composant est démonté
        return () => clearInterval(intervalId);
    }, [user]);
    
    // Gestionnaires pour les modales
    const handleShowDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };
    
    const handleShowCancel = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };
    
    const handleNewAppointmentChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment({
            ...newAppointment,
            [name]: value
        });
    };
    
    const handleSubmitNewAppointment = async (e) => {
        e.preventDefault();
        
        try {
            // Créer un nouvel objet rendez-vous
            const appointmentDateTimeStr = `${newAppointment.date}T${newAppointment.time}:00`;
            const newAppointmentObj = {
                dateTime: new Date(appointmentDateTimeStr).toISOString(),
                reason: newAppointment.reason,
                status: "SCHEDULED",
                notes: ""
            };

            // Ajouter le champ approprié en fonction du rôle
            if (user.role === 'DOCTOR') {
                newAppointmentObj.patientId = parseInt(newAppointment.patientId);
                console.log("Médecin crée un rendez-vous pour le patient:", newAppointment.patientId);
            } else {
                newAppointmentObj.doctorId = parseInt(newAppointment.doctorId);
                console.log("Patient prend rendez-vous avec le médecin:", newAppointment.doctorId);
            }
            
            console.log("Envoi des données de rendez-vous:", newAppointmentObj);
            console.log("Token JWT:", localStorage.getItem('token'));
            
            // Déterminer l'endpoint en fonction du rôle
            const endpoint = user.role === 'DOCTOR' 
                ? '/api/v1/doctor/appointments' 
                : '/api/v1/patient/appointments';
            
            console.log("Endpoint utilisé pour la création:", endpoint);
            
            // Envoyer au backend
            const response = await axios.post(endpoint, newAppointmentObj);
            
            console.log("Réponse de création:", response.data);
            
            // Ajouter au tableau d'appointments
            const updatedAppointments = [...appointments, response.data];
            setAppointments(updatedAppointments);
            
            // Fermer la modale et réinitialiser le formulaire
            setShowNewModal(false);
            setNewAppointment({
                date: '',
                time: '',
                reason: '',
                doctorId: '',
                patientId: ''
            });
            
            // Afficher un message de confirmation
            alert("Rendez-vous créé avec succès!");
        } catch (error) {
            console.error("Erreur lors de la création du rendez-vous:", error);
            
            // Afficher des détails plus précis sur l'erreur
            if (error.response) {
                console.error("Statut de l'erreur:", error.response.status);
                console.error("Message d'erreur:", error.response.data);
                
                if (error.response.status === 403) {
                    alert("Erreur d'autorisation: Vous n'avez pas les permissions nécessaires pour créer ce rendez-vous. Vérifiez que votre session est active.");
                } else {
                    alert(`Erreur lors de la création du rendez-vous: ${error.response.data.message || 'Erreur inconnue'}`);
                }
            } else {
                alert("Erreur lors de la création du rendez-vous. Veuillez réessayer ou contacter l'administrateur.");
            }
        }
    };
    
    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;
        
        try {
            let endpoint;
            
            // Déterminer l'endpoint en fonction du rôle de l'utilisateur
            if (user.role === 'DOCTOR') {
                endpoint = `/api/v1/doctor/appointments/${selectedAppointment.id}/cancel`;
            } else if (user.role === 'PATIENT') {
                endpoint = `/api/v1/patient/appointments/${selectedAppointment.id}/cancel`;
            } else {
                throw new Error("Rôle non autorisé à annuler des rendez-vous");
            }
            
            console.log(`Annulation du rendez-vous par ${user.role}, ID:`, selectedAppointment.id);
            
            // Envoyer la demande d'annulation au serveur
            const response = await axios.post(endpoint);
            
            // Si la demande a réussi, mettre à jour l'affichage localement
            const updatedAppointments = appointments.map(app => 
                app.id === selectedAppointment.id ? response.data : app
            );
            
            setAppointments(updatedAppointments);
            setShowCancelModal(false);
            alert("Rendez-vous annulé avec succès!");
        } catch (error) {
            console.error("Erreur lors de l'annulation du rendez-vous:", error);
            alert("Erreur lors de l'annulation du rendez-vous. Veuillez réessayer.");
        }
    };

    // Afficher un spinner pendant le chargement
    if (loading && !error) {
        return (
            <div className="container mt-4">
                <h2>Mes rendez-vous</h2>
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
                <h2>Mes rendez-vous</h2>
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
            <h2>Mes rendez-vous</h2>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                    Nouveau rendez-vous
                </button>
            </div>

            {appointments.length > 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>{user?.role === 'DOCTOR' ? 'Patient' : 'Médecin'}</th>
                                    <th>Motif</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {appointments.map(appointment => (
                                    <tr key={appointment.id}>
                                        <td>{new Date(appointment.dateTime).toLocaleString()}</td>
                                        <td>
                                            {user?.role === 'DOCTOR'
                                                ? appointment.patientName || 'Patient non spécifié'
                                                : appointment.doctorName || 'Médecin non spécifié'
                                            }
                                        </td>
                                        <td>{appointment.reason}</td>
                                        <td>
                                            <span className={`badge ${
                                                appointment.status === 'SCHEDULED' ? 'bg-primary' :
                                                    appointment.status === 'COMPLETED' ? 'bg-success' : 'bg-danger'
                                            }`}>
                                                {appointment.status === 'SCHEDULED' ? 'Programmé' : 
                                                 appointment.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-info me-2"
                                                onClick={() => handleShowDetails(appointment)}
                                            >
                                                Détails
                                            </button>
                                            {appointment.status === 'SCHEDULED' && (
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleShowCancel(appointment)}
                                                >
                                                    Annuler
                                                </button>
                                            )}
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
                    Vous n'avez pas de rendez-vous programmés.
                </div>
            )}
            
            {/* Modal pour créer un nouveau rendez-vous */}
            <Modal show={showNewModal} onHide={() => setShowNewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nouveau rendez-vous</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitNewAppointment}>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="date"
                                value={newAppointment.date}
                                onChange={handleNewAppointmentChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Heure</Form.Label>
                            <Form.Control 
                                type="time" 
                                name="time"
                                value={newAppointment.time}
                                onChange={handleNewAppointmentChange}
                                required
                            />
                        </Form.Group>
                        
                        {/* Afficher le sélecteur de médecin pour les patients */}
                        {user?.role === 'PATIENT' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Médecin</Form.Label>
                                <Form.Select 
                                    name="doctorId"
                                    value={newAppointment.doctorId}
                                    onChange={handleNewAppointmentChange}
                                    required
                                >
                                    <option value="">Sélectionnez un médecin</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}
                        
                        {/* Afficher le sélecteur de patient pour les médecins */}
                        {user?.role === 'DOCTOR' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Patient</Form.Label>
                                <Form.Select 
                                    name="patientId"
                                    value={newAppointment.patientId}
                                    onChange={handleNewAppointmentChange}
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
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Motif</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                name="reason"
                                value={newAppointment.reason}
                                onChange={handleNewAppointmentChange}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => setShowNewModal(false)}>
                                Annuler
                            </Button>
                            <Button variant="primary" type="submit">
                                Créer le rendez-vous
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            
            {/* Modal pour afficher les détails d'un rendez-vous */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Détails du rendez-vous</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <div>
                            <p><strong>Date et heure:</strong> {new Date(selectedAppointment.dateTime).toLocaleString()}</p>
                            <p>
                                <strong>{user?.role === 'DOCTOR' ? 'Patient:' : 'Médecin:'}</strong> {
                                    user?.role === 'DOCTOR'
                                        ? selectedAppointment.patientName || 'Patient non spécifié'
                                        : selectedAppointment.doctorName || 'Médecin non spécifié'
                                }
                            </p>
                            <p><strong>Motif:</strong> {selectedAppointment.reason}</p>
                            <p>
                                <strong>Statut:</strong> 
                                <span className={`badge ms-2 ${
                                    selectedAppointment.status === 'SCHEDULED' ? 'bg-primary' :
                                        selectedAppointment.status === 'COMPLETED' ? 'bg-success' : 'bg-danger'
                                }`}>
                                    {selectedAppointment.status === 'SCHEDULED' ? 'Programmé' : 
                                     selectedAppointment.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                                </span>
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Modal pour confirmer l'annulation d'un rendez-vous */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer l'annulation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Êtes-vous sûr de vouloir annuler ce rendez-vous ?</p>
                    {selectedAppointment && (
                        <div className="alert alert-info">
                            <p><strong>Date et heure:</strong> {new Date(selectedAppointment.dateTime).toLocaleString()}</p>
                            <p><strong>Motif:</strong> {selectedAppointment.reason}</p>
                        </div>
                    )}
                    <p>Cette action ne peut pas être annulée.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Ne pas annuler
                    </Button>
                    <Button variant="danger" onClick={handleCancelAppointment}>
                        Confirmer l'annulation
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AppointmentsPage;