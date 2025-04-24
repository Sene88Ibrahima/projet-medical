import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserMd, FaUser, FaUserCog, FaEnvelope, FaPhone, FaIdCard, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from '../api/auth';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                // Dans une application réelle, vous feriez un appel API ici
                // Pour l'instant, nous utilisons les données de l'utilisateur connecté
                setProfileData(user);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement du profil:", err);
                setError("Impossible de charger les informations de profil");
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Row>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="text-center">
                            <div className="avatar-container mb-3">
                                {profileData?.role === 'DOCTOR' ? (
                                    <div className="avatar-icon doctor">
                                        <FaUserMd size={50} />
                                    </div>
                                ) : profileData?.role === 'ADMIN' ? (
                                    <div className="avatar-icon admin">
                                        <FaUserCog size={50} />
                                    </div>
                                ) : (
                                    <div className="avatar-icon patient">
                                        <FaUser size={50} />
                                    </div>
                                )}
                            </div>

                            <h3 className="mb-1">
                                {profileData?.role === 'DOCTOR' ? 'Dr. ' : ''}
                                {profileData?.firstName} {profileData?.lastName}
                            </h3>

                            <Badge bg={
                                profileData?.role === 'DOCTOR' ? 'success' : 
                                (profileData?.role === 'ADMIN' ? 'danger' : 'info')
                            } className="mb-3">
                                {profileData?.role}
                            </Badge>
                            
                            <div className="d-grid gap-2">
                                <Link to="/profile/edit" className="btn btn-primary">
                                    Modifier mon profil
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="mb-3">Contact</h5>
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <FaEnvelope className="me-2 text-secondary" />
                                    <small className="text-muted">Email</small>
                                </div>
                                <div>{profileData?.email}</div>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <FaPhone className="me-2 text-secondary" />
                                    <small className="text-muted">Téléphone</small>
                                </div>
                                <div>{profileData?.phoneNumber || 'Non renseigné'}</div>
                            </div>

                            <div>
                                <div className="d-flex align-items-center mb-2">
                                    <FaMapMarkerAlt className="me-2 text-secondary" />
                                    <small className="text-muted">Adresse</small>
                                </div>
                                <div>{profileData?.address || 'Non renseignée'}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h5 className="mb-4">Informations personnelles</h5>
                            
                            <Row className="mb-3">
                                <Col sm={6}>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaIdCard className="me-2 text-secondary" />
                                        <small className="text-muted">Identifiant</small>
                                    </div>
                                    <div>{profileData?.id}</div>
                                </Col>
                                
                                <Col sm={6}>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaCalendar className="me-2 text-secondary" />
                                        <small className="text-muted">Date d'inscription</small>
                                    </div>
                                    <div>{new Date(profileData?.createdAt || Date.now()).toLocaleDateString('fr-FR')}</div>
                                </Col>
                            </Row>

                            {profileData?.role === 'DOCTOR' && (
                                <>
                                    <h5 className="mt-4 mb-3">Informations professionnelles</h5>
                                    <Row>
                                        <Col sm={6}>
                                            <div className="d-flex align-items-center mb-2">
                                                <small className="text-muted">Spécialité</small>
                                            </div>
                                            <div>{profileData?.specialty || 'Non renseignée'}</div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="d-flex align-items-center mb-2">
                                                <small className="text-muted">Numéro RPPS</small>
                                            </div>
                                            <div>{profileData?.licenseNumber || 'Non renseigné'}</div>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {profileData?.role === 'PATIENT' && (
                                <>
                                    <h5 className="mt-4 mb-3">Informations médicales</h5>
                                    <Row>
                                        <Col sm={6}>
                                            <div className="d-flex align-items-center mb-2">
                                                <small className="text-muted">Date de naissance</small>
                                            </div>
                                            <div>{profileData?.birthDate ? new Date(profileData.birthDate).toLocaleDateString('fr-FR') : 'Non renseignée'}</div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="d-flex align-items-center mb-2">
                                                <small className="text-muted">Numéro de sécurité sociale</small>
                                            </div>
                                            <div>{profileData?.socialSecurityNumber || 'Non renseigné'}</div>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    {profileData?.role === 'DOCTOR' && (
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h5 className="mb-3">Statistiques</h5>
                                <Row>
                                    <Col sm={4}>
                                        <div className="stat-box bg-light p-3 text-center rounded">
                                            <h3 className="mb-1">0</h3>
                                            <div className="text-muted">Patients</div>
                                        </div>
                                    </Col>
                                    <Col sm={4}>
                                        <div className="stat-box bg-light p-3 text-center rounded">
                                            <h3 className="mb-1">0</h3>
                                            <div className="text-muted">Rendez-vous ce mois</div>
                                        </div>
                                    </Col>
                                    <Col sm={4}>
                                        <div className="stat-box bg-light p-3 text-center rounded">
                                            <h3 className="mb-1">0</h3>
                                            <div className="text-muted">Messages non lus</div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {profileData?.role === 'PATIENT' && (
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h5 className="mb-3">Résumé médical</h5>
                                <p className="text-muted">
                                    Aucune information médicale disponible. Veuillez contacter votre médecin traitant pour plus d'informations.
                                </p>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
