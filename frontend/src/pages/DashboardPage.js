// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth, isAuthenticated } from '../context/AuthContext';
import axios from '../api/auth';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fonction de navigation directe pour éviter les redirections indésirables
    const handleNavigation = (path) => {
        window.location.href = path;
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
            
            // UTILISATION DE DONNÉES SIMULÉES POUR ÉVITER LES ERREURS API
            // Cela permet de contourner temporairement les problèmes d'API
            
            // Données simulées
            const mockAppointments = [
                { 
                    id: 1, 
                    title: 'Consultation générale', 
                    date: '28 Avril 2025', 
                    status: 'CONFIRMED',
                    doctor: 'Dr. Martin'
                },
                { 
                    id: 2, 
                    title: 'Contrôle annuel', 
                    date: '15 Mai 2025', 
                    status: 'PENDING',
                    doctor: 'Dr. Dupont'
                }
            ];
            
            const mockMessages = [
                {
                    id: 1,
                    sender: 'Dr. Martin',
                    content: 'Bonjour, veuillez apporter votre carnet de santé lors de votre prochain rendez-vous.',
                    date: '20 Avril 2025'
                },
                {
                    id: 2,
                    sender: 'Secrétariat médical',
                    content: 'Votre ordonnance est disponible à l\'accueil.',
                    date: '18 Avril 2025'
                }
            ];
            
            const mockRecords = [
                {
                    id: 1,
                    title: 'Résultats analyse sanguin',
                    doctor: 'Dr. Martin',
                    date: '15 Mars 2025'
                },
                {
                    id: 2,
                    title: 'Radiographie pulmonaire',
                    doctor: 'Dr. Legrand',
                    date: '28 Février 2025'
                }
            ];
            
            const mockStats = {
                totalUsers: 245,
                totalAppointments: 1204,
                totalMessages: 3570,
                totalRecords: 867
            };
            
            // Utiliser les données simulées au lieu d'appeler les API
            setAppointments(mockAppointments);
            setMessages(mockMessages);
            setRecords(mockRecords);
            setStats(mockStats);
            
            /*
            // CODE COMMENTÉ DES APPELS API RÉELS
            // À décommenter quand les endpoints seront disponibles
            
            if (userRole === 'PATIENT') {
                // Récupérer les rendez-vous du patient
                const appointmentsResponse = await axios.get('/api/v1/appointments/patient');
                setAppointments(appointmentsResponse.data);
                
                // Récupérer les messages du patient
                const messagesResponse = await axios.get('/api/v1/messages/patient');
                setMessages(messagesResponse.data);
                
                // Récupérer les dossiers médicaux du patient
                const recordsResponse = await axios.get('/api/v1/medical-records/patient');
                setRecords(recordsResponse.data);
            } 
            else if (userRole === 'DOCTOR') {
                // Récupérer les rendez-vous du médecin
                const appointmentsResponse = await axios.get('/api/v1/appointments/doctor');
                setAppointments(appointmentsResponse.data);
                
                // Récupérer les messages du médecin
                const messagesResponse = await axios.get('/api/v1/messages/doctor');
                setMessages(messagesResponse.data);
                
                // Récupérer les dossiers médicaux accessibles au médecin
                const recordsResponse = await axios.get('/api/v1/medical-records/doctor');
                setRecords(recordsResponse.data);
                
                // Statistiques spécifiques au médecin
                const statsResponse = await axios.get('/api/v1/stats/doctor');
                setStats(statsResponse.data);
            }
            else if (userRole === 'ADMIN') {
                // Récupérer les données administratives
                const adminDataResponse = await axios.get('/api/v1/admin/dashboard');
                const adminData = adminDataResponse.data;
                
                setAppointments(adminData.recentAppointments || []);
                setMessages(adminData.recentMessages || []);
                setStats(adminData.systemStats || {});
            }
            */
            
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
    
    return (
        <div className="dashboard-container container mt-5">
            <h2 className="mb-4">Tableau de bord</h2>
            
            <div className="user-welcome mb-4">
                <h3>Bienvenue, {userName}</h3>
                <p className="text-muted">{userRole === 'PATIENT' ? 'Patient' : userRole === 'DOCTOR' ? 'Médecin' : userRole === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
            
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Rendez-vous</h5>
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
                                        <li key={index} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{appointment.title || 'Rendez-vous'}</strong>
                                                    <p className="mb-0 text-muted">{appointment.date || 'Date non spécifiée'}</p>
                                                </div>
                                                <span className={`badge ${appointment.status === 'CONFIRMED' ? 'bg-success' : appointment.status === 'PENDING' ? 'bg-warning' : 'bg-danger'}`}>
                                                    {appointment.status || 'En attente'}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted">Aucun rendez-vous à afficher</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="col-md-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Messages</h5>
                            <button 
                                className="btn btn-sm btn-primary" 
                                onClick={() => handleNavigation('/messages')}
                            >
                                Voir tout
                            </button>
                        </div>
                        <div className="card-body">
                            {messages.length > 0 ? (
                                <ul className="list-group">
                                    {messages.slice(0, 5).map((message, index) => (
                                        <li key={index} className="list-group-item">
                                            <div>
                                                <strong>De: {message.sender || 'Inconnu'}</strong>
                                                <p className="mb-0">{message.content ? (message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content) : 'Aucun contenu'}</p>
                                                <small className="text-muted">{message.date || 'Date non spécifiée'}</small>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted">Aucun message à afficher</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="col-md-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                {userRole === 'PATIENT' ? 'Dossiers médicaux' : 
                                 userRole === 'DOCTOR' ? 'Patients récents' : 
                                 userRole === 'ADMIN' ? 'Statistiques' : 'Informations'}
                            </h5>
                            {userRole === 'PATIENT' && (
                                <button 
                                    className="btn btn-sm btn-primary" 
                                    onClick={() => handleNavigation('/medical-records')}
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
                                                <li key={index} className="list-group-item">
                                                    <div>
                                                        <strong>{record.title || 'Dossier'}</strong>
                                                        <p className="mb-0">{record.doctor || 'Médecin non spécifié'}</p>
                                                        <small className="text-muted">{record.date || 'Date non spécifiée'}</small>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-muted">Aucun dossier médical à afficher</p>
                                    )}
                                </>
                            )}
                            
                            {userRole === 'DOCTOR' && (
                                <>
                                    {records.length > 0 ? (
                                        <ul className="list-group">
                                            {records.slice(0, 5).map((record, index) => (
                                                <li key={index} className="list-group-item">
                                                    <div>
                                                        <strong>{record.patient || 'Patient'}</strong>
                                                        <p className="mb-0">{record.title || 'Dossier'}</p>
                                                        <small className="text-muted">{record.date || 'Date non spécifiée'}</small>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-muted">Aucun patient récent à afficher</p>
                                    )}
                                </>
                            )}
                            
                            {userRole === 'ADMIN' && (
                                <div className="stats-container">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <div className="p-3 border bg-light rounded">
                                                <h6>Utilisateurs</h6>
                                                <h3>{stats.totalUsers || 0}</h3>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-3 border bg-light rounded">
                                                <h6>Rendez-vous</h6>
                                                <h3>{stats.totalAppointments || 0}</h3>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-3 border bg-light rounded">
                                                <h6>Messages</h6>
                                                <h3>{stats.totalMessages || 0}</h3>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-3 border bg-light rounded">
                                                <h6>Dossiers</h6>
                                                <h3>{stats.totalRecords || 0}</h3>
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