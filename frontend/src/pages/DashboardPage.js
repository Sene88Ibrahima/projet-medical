// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';
import './DashboardPage.css';

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
// Modifiez la fonction fetchDashboardData dans DashboardPage.js
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Récupérer les données selon le rôle
                if (currentUser?.role === 'DOCTOR') {
                    try {
                        const [appointmentsRes, statsRes, messagesRes] = await Promise.allSettled([
                            axios.get('/appointments/doctor/today'),
                            axios.get('/stats/doctor'),
                            axios.get('/messages/unread')
                        ]);

                        // Traiter uniquement les promesses résolues
                        setAppointments(appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : []);
                        setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : {});
                        setMessages(messagesRes.status === 'fulfilled' ? messagesRes.value.data : []);
                    } catch (err) {
                        console.log('Erreur spécifique au médecin:', err);
                        // Initialiser avec des données vides
                        setAppointments([]);
                        setStats({});
                        setMessages([]);
                    }
                } else if (currentUser?.role === 'PATIENT') {
                    // Code similaire pour PATIENT
                }
            } catch (err) {
                console.log('Erreur lors du chargement des données:', err);
                setError('Impossible de charger les données du tableau de bord');
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    if (loading) {
        return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    // Affichage pour PATIENT
    if (currentUser?.role === 'PATIENT') {
        return (
            <div className="dashboard container mt-4">
                <h2>Bienvenue, {currentUser.firstName}</h2>
                <div className="row mt-4">
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white d-flex justify-content-between">
                                <h5 className="mb-0">Prochains rendez-vous</h5>
                                <Link to="/appointments" className="btn btn-sm btn-light">Voir tous</Link>
                            </div>
                            <div className="card-body">
                                {appointments.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {appointments.slice(0, 3).map(appointment => (
                                            <li key={appointment.id} className="list-group-item">
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <strong>Dr. {appointment.doctor.lastName}</strong>
                                                        <p className="mb-0 text-muted">{appointment.reason}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="badge bg-info">{new Date(appointment.dateTime).toLocaleDateString()}</span>
                                                        <p className="mb-0">{new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center my-3">Aucun rendez-vous à venir</p>
                                )}
                                <div className="mt-3">
                                    <Link to="/appointments/new" className="btn btn-outline-primary btn-sm">
                                        Prendre rendez-vous
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-success text-white d-flex justify-content-between">
                                <h5 className="mb-0">Messages récents</h5>
                                <Link to="/messages" className="btn btn-sm btn-light">Voir tous</Link>
                            </div>
                            <div className="card-body">
                                {messages.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {messages.slice(0, 3).map(message => (
                                            <li key={message.id} className="list-group-item">
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <strong>De: Dr. {message.sender.lastName}</strong>
                                                        <p className="mb-0">{message.content.substring(0, 50)}...</p>
                                                    </div>
                                                    <small className="text-muted">{new Date(message.sentAt).toLocaleDateString()}</small>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center my-3">Aucun message non lu</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">Mes dossiers médicaux</h5>
                            </div>
                            <div className="card-body">
                                {records.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Médecin</th>
                                                <th>Diagnostic</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {records.map(record => (
                                                <tr key={record.id}>
                                                    <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                                                    <td>Dr. {record.doctor.lastName}</td>
                                                    <td>{record.diagnosis}</td>
                                                    <td>
                                                        <Link to={`/medical-records/${record.id}`} className="btn btn-sm btn-outline-info">
                                                            Détails
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center my-3">Aucun dossier médical disponible</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage pour DOCTOR
    if (currentUser?.role === 'DOCTOR') {
        return (
            <div className="dashboard container mt-4">
                <h2>Bienvenue, Dr. {currentUser.lastName}</h2>

                <div className="row mt-4">
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Consultations d'aujourd'hui</h5>
                            </div>
                            <div className="card-body">
                                {appointments.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {appointments.map(appointment => (
                                            <li key={appointment.id} className="list-group-item">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{appointment.patient.firstName} {appointment.patient.lastName}</strong>
                                                        <p className="mb-0 text-muted">{appointment.reason}</p>
                                                    </div>
                                                    <div className="text-right">
                            <span className="badge bg-primary">
                              {new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                                                        <div className="btn-group mt-2">
                                                            <Link to={`/appointments/${appointment.id}`} className="btn btn-sm btn-outline-primary">
                                                                Détails
                                                            </Link>
                                                            <Link to={`/medical-records/new?patient=${appointment.patient.id}`} className="btn btn-sm btn-outline-success">
                                                                Dossier
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center my-3">Aucune consultation aujourd'hui</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-warning text-dark">
                                <h5 className="mb-0">Messages non lus ({messages.length})</h5>
                            </div>
                            <div className="card-body">
                                {messages.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {messages.slice(0, 5).map(message => (
                                            <li key={message.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{message.sender.firstName} {message.sender.lastName}</strong>
                                                    <p className="mb-0">{message.content.substring(0, 50)}...</p>
                                                </div>
                                                <Link to={`/messages/${message.id}`} className="btn btn-sm btn-outline-warning">Lire</Link>
                                            </li>
                                        ))}
                                        <li className="list-group-item text-center">
                                            <Link to="/messages" className="btn btn-link">Voir tous les messages</Link>
                                        </li>
                                    </ul>
                                ) : (
                                    <p className="text-center my-3">Aucun message non lu</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">Actions rapides</h5>
                            </div>
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-md-4 mb-3">
                                        <Link to="/appointments/calendar" className="btn btn-lg btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center">
                                            <i className="fas fa-calendar-alt fa-2x mb-2"></i>
                                            <span>Planning</span>
                                        </Link>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <Link to="/medical-records/new" className="btn btn-lg btn-outline-success w-100 h-100 d-flex flex-column justify-content-center">
                                            <i className="fas fa-file-medical fa-2x mb-2"></i>
                                            <span>Nouveau dossier</span>
                                        </Link>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <Link to="/messages/new" className="btn btn-lg btn-outline-warning w-100 h-100 d-flex flex-column justify-content-center">
                                            <i className="fas fa-envelope fa-2x mb-2"></i>
                                            <span>Nouveau message</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage pour ADMIN
    if (currentUser?.role === 'ADMIN') {
        return (
            <div className="dashboard container mt-4">
                <h2>Administration système</h2>

                <div className="row mt-4">
                    <div className="col-md-4 mb-4">
                        <div className="card bg-primary text-white">
                            <div className="card-body text-center">
                                <h5 className="card-title">Total utilisateurs</h5>
                                <p className="display-4">{stats.totalUsers || 0}</p>
                                <div className="small mt-2">
                                    <span className="mr-3">Patients: {stats.patientCount || 0}</span>
                                    <span>Médecins: {stats.doctorCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div className="card bg-success text-white">
                            <div className="card-body text-center">
                                <h5 className="card-title">Rendez-vous aujourd'hui</h5>
                                <p className="display-4">{stats.todayAppointments || 0}</p>
                                <div className="small mt-2">
                                    Total: {stats.totalAppointments || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div className="card bg-info text-white">
                            <div className="card-body text-center">
                                <h5 className="card-title">Dossiers médicaux</h5>
                                <p className="display-4">{stats.totalRecords || 0}</p>
                                <div className="small mt-2">
                                    Images: {stats.totalImages || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-secondary text-white">
                                <h5 className="mb-0">Activité récente</h5>
                            </div>
                            <div className="card-body">
                                {stats.recentActivity ? (
                                    <ul className="list-group list-group-flush">
                                        {stats.recentActivity.map((activity, index) => (
                                            <li key={index} className="list-group-item">
                                                <div className="d-flex justify-content-between">
                                                    <div>{activity.description}</div>
                                                    <small className="text-muted">{new Date(activity.timestamp).toLocaleString()}</small>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center my-3">Aucune activité récente</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-dark text-white">
                                <h5 className="mb-0">Actions système</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    <Link to="/admin/users" className="btn btn-outline-primary mb-2">
                                        Gestion utilisateurs
                                    </Link>
                                    <Link to="/admin/stats" className="btn btn-outline-info mb-2">
                                        Statistiques détaillées
                                    </Link>
                                    <Link to="/admin/settings" className="btn btn-outline-dark mb-2">
                                        Paramètres système
                                    </Link>
                                    <button className="btn btn-outline-warning mb-2">
                                        Maintenance
                                    </button>
                                    <button className="btn btn-outline-danger">
                                        Sauvegarde
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <div>Chargement...</div>;
};

export default DashboardPage;