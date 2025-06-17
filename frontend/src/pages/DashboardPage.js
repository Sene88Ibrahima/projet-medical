// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isAuthenticated } from '../context/AuthContext';
import axios from '../api/auth';
import { FaCalendarAlt, FaUserMd, FaUser, FaClipboardList, FaEnvelope, FaChartBar, FaExclamationTriangle, FaRegClock } from 'react-icons/fa';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Navigation SPA sans rechargement complet
    const handleNavigation = (path) => {
        navigate(path);
    };
    
    // Effet pour vérifier l'authentification à chaque chargement du dashboard
    useEffect(() => {
        if (!isAuthenticated()) {
            console.error("Tentative d'accès au dashboard sans authentification");
            window.location.href = '/login';
            return;
        }
        
        console.log("Authentification vérifiée pour le dashboard");
        
        // Charger les données du dashboard
        fetchDashboardData();
    }, []);
    
    // Fonction pour récupérer les données du dashboard
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Récupérer les données utilisateur du localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                throw new Error("Données utilisateur non disponibles");
            }
            
            const userData = JSON.parse(userStr);
            const userRole = userData.role;
            
            console.log(`Chargement des données du dashboard pour le rôle: ${userRole}`);
            
            try {
                if (userRole === 'PATIENT') {
                    // Récupérer les rendez-vous du patient
                    const appointmentsResponse = await axios.get('/api/v1/patient/appointments');
                    setAppointments(appointmentsResponse.data);
                    
                    // Récupérer les messages du patient (ici nous utilisons le premier médecin disponible)
                    const doctorsResponse = await axios.get('/api/v1/patient/doctors');
                    const messagesData = [];
                    
                    // Si des médecins sont disponibles, récupérer la conversation avec le premier
                    if (doctorsResponse.data && doctorsResponse.data.length > 0) {
                        const firstDoctorId = doctorsResponse.data[0].id;
                        const messagesResponse = await axios.get(`/api/v1/patient/messages/${firstDoctorId}`);
                        messagesData.push(...messagesResponse.data);
                    }
                    
                    setMessages(messagesData);
                    
                    // Récupérer les dossiers médicaux du patient
                    const recordsResponse = await axios.get('/api/v1/patient/medical-records');
                    setRecords(recordsResponse.data);
                    
                    // Statistiques du patient
                    setStats({
                        totalDoctors: doctorsResponse.data ? doctorsResponse.data.length : 0,
                        totalAppointments: appointmentsResponse.data ? appointmentsResponse.data.length : 0,
                        totalRecords: recordsResponse.data ? recordsResponse.data.length : 0,
                        upcomingAppointments: appointmentsResponse.data ? 
                            appointmentsResponse.data.filter(app => app.status === 'CONFIRMED' || app.status === 'PENDING').length : 0
                    });
                } 
                else if (userRole === 'DOCTOR') {
                    // Récupérer les rendez-vous du médecin
                    const appointmentsResponse = await axios.get('/api/v1/doctor/appointments');
                    setAppointments(appointmentsResponse.data);
                    
                    // Récupérer les patients du médecin
                    const patientsResponse = await axios.get('/api/v1/doctor/patients');
                    const messagesData = [];
                    
                    // Si des patients sont disponibles, récupérer la conversation avec le premier
                    if (patientsResponse.data && patientsResponse.data.length > 0) {
                        const firstPatientId = patientsResponse.data[0].id;
                        const messagesResponse = await axios.get(`/api/v1/doctor/messages/${firstPatientId}`);
                        messagesData.push(...messagesResponse.data);
                    }
                    
                    setMessages(messagesData);
                    
                    // Récupérer les dossiers médicaux du médecin
                    const recordsResponse = await axios.get('/api/v1/doctor/medical-records');
                    setRecords(recordsResponse.data);
                    
                    // Pour les statistiques, comme il n'y a pas d'endpoint spécifique, 
                    // nous utilisons les données disponibles pour construire des stats
                    setStats({
                        totalPatients: patientsResponse.data ? patientsResponse.data.length : 0,
                        totalAppointments: appointmentsResponse.data ? appointmentsResponse.data.length : 0,
                        pendingAppointments: appointmentsResponse.data ? 
                            appointmentsResponse.data.filter(app => app.status === 'PENDING').length : 0,
                        totalRecords: recordsResponse.data ? recordsResponse.data.length : 0,
                        unreadMessages: messagesData ? 
                            messagesData.filter(msg => !msg.read && msg.senderId !== userData.id).length : 0
                    });
                }
                else if (userRole === 'ADMIN') {
                    // Récupérer tous les utilisateurs pour admin
                    const usersResponse = await axios.get('/api/v1/admin/users');
                    
                    // Créer des données d'aperçu pour le tableau de bord admin
                    if (usersResponse.data) {
                        const doctors = usersResponse.data.filter(user => user.role === 'DOCTOR');
                        const patients = usersResponse.data.filter(user => user.role === 'PATIENT');
                        
                        // Récupérer les statistiques du tableau de bord admin
                        try {
                            const statsResponse = await axios.get('/api/v1/admin/stats');
                            setStats(statsResponse.data);
                        } catch (statsError) {
                            console.error("Erreur lors de la récupération des statistiques:", statsError);
                            // Créer des statistiques à partir des données utilisateur disponibles
                            setStats({
                                totalUsers: usersResponse.data.length,
                                totalDoctors: doctors.length,
                                totalPatients: patients.length,
                                // Valeurs par défaut pour les autres statistiques
                                totalAppointments: 0,
                                totalMessages: 0,
                                totalRecords: 0
                            });
                        }
                        
                        setAppointments([]);
                        setMessages([]);
                        setRecords(usersResponse.data);
                    }
                }
            } catch (apiError) {
                console.error("Erreur API lors de la récupération des données:", apiError);
                
                // En cas d'erreur d'API, afficher un message d'erreur spécifique 
                setError(`Erreur de communication avec le serveur: ${apiError.message || 'Veuillez réessayer ultérieurement'}`);
            }
            
        } catch (err) {
            console.error("Erreur lors du chargement des données du dashboard:", err);
            setError("Impossible de charger les données du tableau de bord. Veuillez réessayer ultérieurement.");
        } finally {
            setLoading(false);
        }
    };
    
    // Si le composant est en cours de chargement
    if (loading) {
        return (
            <div className="dashboard-container container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2">Chargement de votre tableau de bord...</p>
                </div>
            </div>
        );
    }
    
    // Si une erreur s'est produite
    if (error) {
        return (
            <div className="dashboard-container container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Erreur!</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">
                        <button 
                            className="btn btn-outline-danger" 
                            onClick={fetchDashboardData}
                        >
                            Réessayer
                        </button>
                    </p>
                </div>
            </div>
        );
    }
    
    // Récupérer les informations utilisateur
    const userStr = localStorage.getItem('user');
    let userName = "Utilisateur";
    let userRole = "";
    
    if (userStr) {
        try {
            const userData = JSON.parse(userStr);
            userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "Utilisateur";
            userRole = userData.role || "";
        } catch (e) {
            console.error("Erreur lors de la récupération des données utilisateur:", e);
        }
    }
    
    // Formater la date pour l'affichage
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Date non spécifiée';
        
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateStr;
        }
    };
    
    // Obtenir le texte pour le statut de rendez-vous
    const getStatusText = (status) => {
        switch(status) {
            case 'CONFIRMED': return 'Confirmé';
            case 'PENDING': return 'En attente';
            case 'CANCELLED': return 'Annulé';
            case 'COMPLETED': return 'Terminé';
            default: return status || 'En attente';
        }
    };
    
    return (
        <div className="dashboard-container container mt-5">
            <h2 className="mb-4">Tableau de bord</h2>
            
            <div className="user-welcome mb-4">
                <h3>Bienvenue, {userName}</h3>
                <p className="text-muted">{userRole === 'PATIENT' ? 'Patient' : userRole === 'DOCTOR' ? 'Médecin' : userRole === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
            
            {/* Statistiques principales */}
            <div className="row stats-summary mb-4">
                {userRole === 'PATIENT' && (
                    <>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaCalendarAlt className="stats-icon text-primary mb-2" />
                                    <h3>{stats.upcomingAppointments || 0}</h3>
                                    <p className="text-muted mb-0">Rendez-vous à venir</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaUserMd className="stats-icon text-success mb-2" />
                                    <h3>{stats.totalDoctors || 0}</h3>
                                    <p className="text-muted mb-0">Médecins</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaClipboardList className="stats-icon text-info mb-2" />
                                    <h3>{stats.totalRecords || 0}</h3>
                                    <p className="text-muted mb-0">Dossiers médicaux</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaEnvelope className="stats-icon text-warning mb-2" />
                                    <h3>{messages.length || 0}</h3>
                                    <p className="text-muted mb-0">Messages</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {userRole === 'DOCTOR' && (
                    <>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaUser className="stats-icon text-primary mb-2" />
                                    <h3>{stats.totalPatients || 0}</h3>
                                    <p className="text-muted mb-0">Patients</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaCalendarAlt className="stats-icon text-success mb-2" />
                                    <h3>{stats.totalAppointments || 0}</h3>
                                    <p className="text-muted mb-0">Rendez-vous</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaRegClock className="stats-icon text-warning mb-2" />
                                    <h3>{stats.pendingAppointments || 0}</h3>
                                    <p className="text-muted mb-0">En attente</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaEnvelope className="stats-icon text-danger mb-2" />
                                    <h3>{stats.unreadMessages || 0}</h3>
                                    <p className="text-muted mb-0">Non lus</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {userRole === 'ADMIN' && (
                    <>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaUser className="stats-icon text-primary mb-2" />
                                    <h3>{stats.totalUsers || 0}</h3>
                                    <p className="text-muted mb-0">Utilisateurs</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaUserMd className="stats-icon text-success mb-2" />
                                    <h3>{stats.totalDoctors || 0}</h3>
                                    <p className="text-muted mb-0">Médecins</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaCalendarAlt className="stats-icon text-info mb-2" />
                                    <h3>{stats.totalAppointments || 0}</h3>
                                    <p className="text-muted mb-0">Rendez-vous</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 text-center border-0 shadow-sm">
                                <div className="card-body">
                                    <FaChartBar className="stats-icon text-warning mb-2" />
                                    <h3>{stats.totalRecords || 0}</h3>
                                    <p className="text-muted mb-0">Dossiers</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <div className="row">
                {/* Premier panneau - Rendez-vous */}
                <div className="col-md-4 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                {userRole === 'PATIENT' ? 'Mes rendez-vous' : 
                                 userRole === 'DOCTOR' ? 'Prochaines consultations' : 
                                 'Rendez-vous récents'}
                            </h5>
                            <button 
                                className="btn btn-sm btn-primary" 
                                onClick={() => handleNavigation('/appointments')}
                            >
                                Voir tout
                            </button>
                        </div>
                        <div className="card-body">
                            {appointments.length > 0 ? (
                                <ul className="list-group">
                                    {appointments.slice(0, 5).map((appointment, index) => (
                                        <li key={index} className="list-group-item border-0 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>
                                                        {appointment.title || 
                                                        (userRole === 'PATIENT' ? 'Consultation avec ' + (appointment.doctorName || 'Dr.') : 
                                                        'Patient: ' + (appointment.patientName || 'N/A'))}
                                                    </strong>
                                                    <p className="mb-0 text-muted small">
                                                        {formatDate(appointment.date || appointment.appointmentDate || appointment.scheduledTime)}
                                                    </p>
                                                </div>
                                                <span className={`badge ${
                                                    appointment.status === 'CONFIRMED' ? 'bg-success' : 
                                                    appointment.status === 'PENDING' ? 'bg-warning' : 
                                                    appointment.status === 'CANCELLED' ? 'bg-danger' : 
                                                    'bg-secondary'}`}>
                                                    {getStatusText(appointment.status)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <FaExclamationTriangle className="mb-2" size={24} />
                                    <p>Aucun rendez-vous à afficher</p>
                                    {userRole !== 'ADMIN' && (
                                        <button 
                                            className="btn btn-sm btn-outline-primary" 
                                            onClick={() => handleNavigation('/appointments')}
                                        >
                                            {userRole === 'PATIENT' ? 'Prendre rendez-vous' : 'Gérer les rendez-vous'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Deuxième panneau - Messages ou Utilisateurs */}
                <div className="col-md-4 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                {userRole === 'ADMIN' ? 'Utilisateurs récents' : 'Messages récents'}
                            </h5>
                            <button 
                                className="btn btn-sm btn-primary" 
                                onClick={() => handleNavigation(userRole === 'ADMIN' ? '/admin/users' : '/messages')}
                            >
                                Voir tout
                            </button>
                        </div>
                        <div className="card-body">
                            {userRole !== 'ADMIN' ? (
                                <>
                                    {messages.length > 0 ? (
                                        <ul className="list-group">
                                            {messages.slice(0, 5).map((message, index) => (
                                                <li key={index} className="list-group-item border-0 border-bottom">
                                                    <div>
                                                        <div className="d-flex justify-content-between">
                                                            <strong>{message.senderName || message.sender || 'Inconnu'}</strong>
                                                            <small className="text-muted">
                                                                {formatDate(message.sentAt || message.timestamp)}
                                                            </small>
                                                        </div>
                                                        <p className="mb-0">{message.content ? 
                                                            (message.content.length > 50 ? 
                                                            `${message.content.substring(0, 50)}...` : message.content) : 'Aucun contenu'}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <FaEnvelope className="mb-2" size={24} />
                                            <p>Aucun message à afficher</p>
                                            <button 
                                                className="btn btn-sm btn-outline-primary" 
                                                onClick={() => handleNavigation('/messages')}
                                            >
                                                Envoyer un message
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {records.length > 0 ? (
                                        <ul className="list-group">
                                            {records.slice(0, 5).map((user, index) => (
                                                <li key={index} className="list-group-item border-0 border-bottom">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <strong>{user.firstName} {user.lastName}</strong>
                                                            <p className="mb-0 text-muted small">
                                                                {user.role || 'Utilisateur'} {user.email && `- ${user.email}`}
                                                            </p>
                                                        </div>
                                                        <span className={`badge ${
                                                            user.role === 'DOCTOR' ? 'bg-success' : 
                                                            user.role === 'ADMIN' ? 'bg-danger' : 
                                                            user.role === 'PATIENT' ? 'bg-info' : 
                                                            'bg-secondary'}`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <FaUser className="mb-2" size={24} />
                                            <p>Aucun utilisateur à afficher</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Troisième panneau - Contenu spécifique au rôle */}
                <div className="col-md-4 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                {userRole === 'PATIENT' ? 'Mes dossiers médicaux' : 
                                 userRole === 'DOCTOR' ? 'Mes patients' : 
                                 'Activité système'}
                            </h5>
                            {userRole === 'PATIENT' && (
                                <button 
                                    className="btn btn-sm btn-primary" 
                                    onClick={() => handleNavigation('/medical-records')}
                                >
                                    Voir tout
                                </button>
                            )}
                            {userRole === 'DOCTOR' && (
                                <button 
                                    className="btn btn-sm btn-primary" 
                                    onClick={() => handleNavigation('/doctor/patients')}
                                >
                                    Voir tout
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {userRole === 'PATIENT' && (
                                <>
                                    {records.length > 0 ? (
                                        <ul className="list-group">
                                            {records.slice(0, 5).map((record, index) => (
                                                <li key={index} className="list-group-item border-0 border-bottom">
                                                    <div>
                                                        <div className="d-flex justify-content-between">
                                                            <strong>{record.title || 'Dossier'}</strong>
                                                            <small className="text-muted">{formatDate(record.date || record.createdAt)}</small>
                                                        </div>
                                                        <p className="mb-0 text-muted small">{record.doctorName || record.doctor || 'Médecin non spécifié'}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <FaClipboardList className="mb-2" size={24} />
                                            <p>Aucun dossier médical à afficher</p>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {userRole === 'DOCTOR' && (
                                <>
                                    {records.length > 0 ? (
                                        <ul className="list-group">
                                            {records.slice(0, 5).map((record, index) => (
                                                <li key={index} className="list-group-item border-0 border-bottom">
                                                    <div>
                                                        <strong>{record.patientName || record.patient || 'Patient'}</strong>
                                                        <p className="mb-0 text-muted small">
                                                            {record.title || 'Dossier'} - {formatDate(record.date || record.createdAt)}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <FaClipboardList className="mb-2" size={24} />
                                            <p>Aucun dossier médical à afficher</p>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {userRole === 'ADMIN' && (
                                <div className="admin-activity">
                                    <div className="list-group">
                                        <div className="list-group-item border-0 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Médecins</span>
                                                <strong>{stats.totalDoctors || 0}</strong>
                                            </div>
                                        </div>
                                        <div className="list-group-item border-0 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Patients</span>
                                                <strong>{stats.totalPatients || 0}</strong>
                                            </div>
                                        </div>
                                        <div className="list-group-item border-0 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Rendez-vous aujourd'hui</span>
                                                <strong>{stats.todayAppointments || 0}</strong>
                                            </div>
                                        </div>
                                        <div className="list-group-item border-0 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Messages aujourd'hui</span>
                                                <strong>{stats.todayMessages || 0}</strong>
                                            </div>
                                        </div>
                                        <div className="list-group-item border-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Dernière connexion</span>
                                                <strong>{stats.lastLogin ? formatDate(stats.lastLogin) : 'N/A'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;