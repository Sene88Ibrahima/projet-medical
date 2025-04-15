// src/pages/AppointmentsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';

const AppointmentsPage = () => {
    const { currentUser } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const endpoint = currentUser?.role === 'DOCTOR'
                    ? '/appointments/doctor'
                    : '/appointments/patient';

                const response = await axios.get(endpoint);
                setAppointments(response.data);
            } catch (err) {
                console.error("Erreur lors du chargement des rendez-vous:", err);
                setError("Impossible de charger vos rendez-vous");
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchAppointments();
        }
    }, [currentUser]);

    if (loading) {
        return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Mes rendez-vous</h2>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary">Nouveau rendez-vous</button>
            </div>

            {appointments.length > 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>{currentUser?.role === 'DOCTOR' ? 'Patient' : 'Médecin'}</th>
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
                                            {currentUser?.role === 'DOCTOR'
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
                                                    {appointment.status}
                                                </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-info me-2">Détails</button>
                                            {appointment.status === 'SCHEDULED' && (
                                                <button className="btn btn-sm btn-outline-danger">Annuler</button>
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
        </div>
    );
};

export default AppointmentsPage;