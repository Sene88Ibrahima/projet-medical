// src/pages/MedicalRecordsPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';

const MedicalRecordsPage = () => {
    const { currentUser } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMedicalRecords = async () => {
            try {
                setLoading(true);
                const endpoint = currentUser?.role === 'DOCTOR'
                    ? '/medical-records/doctor'
                    : '/medical-records/patient';

                const response = await axios.get(endpoint);
                setRecords(response.data);
            } catch (err) {
                console.error("Erreur lors du chargement des dossiers médicaux:", err);
                setError("Impossible de charger vos dossiers médicaux");
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchMedicalRecords();
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
            <h2>Dossiers médicaux</h2>

            {currentUser?.role === 'DOCTOR' && (
                <div className="d-flex justify-content-end mb-3">
                    <button className="btn btn-primary">Nouveau dossier médical</button>
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
                                    <th>{currentUser?.role === 'DOCTOR' ? 'Patient' : 'Médecin'}</th>
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
                                            {currentUser?.role === 'DOCTOR'
                                                ? `${record.patient?.firstName} ${record.patient?.lastName}`
                                                : `Dr. ${record.doctor?.lastName}`
                                            }
                                        </td>
                                        <td>{record.diagnosis}</td>
                                        <td>{record.medicalImages?.length || 0}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-info">Consulter</button>
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
        </div>
    );
};

export default MedicalRecordsPage;