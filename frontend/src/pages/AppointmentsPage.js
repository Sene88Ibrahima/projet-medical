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
        doctorId: ''
    });
    
    // Liste fictive de médecins (pour le dropdown)
    const [doctors, setDoctors] = useState([
        { id: 1, firstName: 'Marie', lastName: 'Martin' },
        { id: 2, firstName: 'Jean', lastName: 'Dupont' },
        { id: 3, firstName: 'Sophie', lastName: 'Lefèvre' }
    ]);

    useEffect(() => {
        // Fonction pour charger les rendez-vous
        const fetchAppointments = async () => {
            if (!user || fetchAttempted) return;
            
            try {
                console.log("Chargement des rendez-vous pour", user.email);
                setLoading(true);
                setFetchAttempted(true);
                
                // Vérifier s'il y a des rendez-vous stockés dans localStorage
                const storedAppointments = localStorage.getItem('user_appointments');
                let userAppointments = [];
                
                if (storedAppointments) {
                    // Charger les rendez-vous depuis localStorage
                    try {
                        const parsedAppointments = JSON.parse(storedAppointments);
                        userAppointments = parsedAppointments;
                        console.log("Rendez-vous chargés depuis localStorage:", userAppointments.length);
                    } catch (e) {
                        console.error("Erreur lors du parsing des rendez-vous stockés:", e);
                    }
                }
                
                if (userAppointments.length === 0) {
                    // Si aucun rendez-vous n'est stocké, utiliser les données fictives
                    // Déterminer l'endpoint en fonction du rôle de l'utilisateur
                    let endpoint;
                    if (user.role === 'DOCTOR') {
                        endpoint = '/api/v1/doctor/appointments';
                    } else if (user.role === 'PATIENT') {
                        endpoint = '/api/v1/patient/appointments';
                    } else if (user.role === 'NURSE') {
                        endpoint = '/api/v1/nurse/appointments';
                    } else {
                        endpoint = '/api/v1/appointments'; // Endpoint par défaut
                    }
                    
                    // Simuler un délai pour le chargement
                    setTimeout(() => {
                        // Données fictives pour le développement
                        const mockAppointments = [
                            {
                                id: 1,
                                dateTime: new Date().toISOString(),
                                reason: "Consultation générale",
                                status: "SCHEDULED",
                                patient: { firstName: "Jean", lastName: "Dupont" },
                                doctor: { firstName: "Marie", lastName: "Martin" }
                            },
                            {
                                id: 2,
                                dateTime: new Date(Date.now() + 86400000).toISOString(), // demain
                                reason: "Suivi traitement",
                                status: "SCHEDULED",
                                patient: { firstName: "Pierre", lastName: "Durand" },
                                doctor: { firstName: "Marie", lastName: "Martin" }
                            }
                        ];
                        
                        setAppointments(mockAppointments);
                        // Stocker également dans localStorage
                        localStorage.setItem('user_appointments', JSON.stringify(mockAppointments));
                        
                        setLoading(false);
                        console.log("Rendez-vous chargés avec succès (données fictives)");
                    }, 1000);
                    
                    // Code pour appeler le backend (commenté pour le moment)
                    /*
                    const response = await axios.get(endpoint);
                    userAppointments = response.data;
                    localStorage.setItem('user_appointments', JSON.stringify(userAppointments));
                    */
                } else {
                    // Utiliser les rendez-vous stockés
                    setAppointments(userAppointments);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des rendez-vous:", err);
                setError("Impossible de charger vos rendez-vous. Le serveur ne répond pas.");
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user, fetchAttempted]);
    
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
    
    const handleSubmitNewAppointment = (e) => {
        e.preventDefault();
        
        // Créer un nouvel objet rendez-vous
        const appointmentDateTimeStr = `${newAppointment.date}T${newAppointment.time}:00`;
        const newAppointmentObj = {
            id: Date.now(), // ID unique basé sur le timestamp
            dateTime: new Date(appointmentDateTimeStr).toISOString(),
            reason: newAppointment.reason,
            status: "SCHEDULED",
            patient: { firstName: user.firstName, lastName: user.lastName },
            doctor: doctors.find(d => d.id.toString() === newAppointment.doctorId.toString())
        };
        
        // Ajouter au tableau d'appointments
        const updatedAppointments = [...appointments, newAppointmentObj];
        setAppointments(updatedAppointments);
        
        // Stocker dans localStorage
        localStorage.setItem('user_appointments', JSON.stringify(updatedAppointments));
        
        // Fermer la modale et réinitialiser le formulaire
        setShowNewModal(false);
        setNewAppointment({
            date: '',
            time: '',
            reason: '',
            doctorId: ''
        });
        
        // Afficher un message de confirmation
        alert("Rendez-vous créé avec succès!");
    };
    
    const handleCancelAppointment = () => {
        if (!selectedAppointment) return;
        
        // Mettre à jour le statut dans le tableau
        const updatedAppointments = appointments.map(app => 
            app.id === selectedAppointment.id ? {...app, status: "CANCELLED"} : app
        );
        
        setAppointments(updatedAppointments);
        
        // Mettre à jour localStorage
        localStorage.setItem('user_appointments', JSON.stringify(updatedAppointments));
        
        setShowCancelModal(false);
        
        // Afficher un message de confirmation
        alert("Rendez-vous annulé avec succès!");
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
                                                ? `${appointment.patient?.firstName} ${appointment.patient?.lastName}`
                                                : `Dr. ${appointment.doctor?.lastName}`
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
                                        ? `${selectedAppointment.patient?.firstName} ${selectedAppointment.patient?.lastName}`
                                        : `Dr. ${selectedAppointment.doctor?.firstName} ${selectedAppointment.doctor?.lastName}`
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