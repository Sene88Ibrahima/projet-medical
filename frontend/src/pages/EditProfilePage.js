import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaTimes } from 'react-icons/fa';
import axios from '../api/auth';

const EditProfilePage = () => {
    const { user, updateUserData } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        // Champs spécifiques au médecin
        specialty: '',
        licenseNumber: '',
        // Champs spécifiques au patient
        birthDate: '',
        socialSecurityNumber: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Initialiser le formulaire avec les données de l'utilisateur
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                // Champs spécifiques au médecin
                specialty: user.specialty || '',
                licenseNumber: user.licenseNumber || '',
                // Champs spécifiques au patient
                birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
                socialSecurityNumber: user.socialSecurityNumber || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Dans une application réelle, vous enverriez les données au backend
            // Pour l'instant, nous simulons la mise à jour
            
            console.log("Mise à jour du profil avec les données:", formData);
            
            // Simuler la mise à jour
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mise à jour du contexte d'authentification avec les nouvelles données
            if (updateUserData) {
                updateUserData({
                    ...user,
                    ...formData
                });
            }
            
            setSuccess(true);
            
            // Rediriger vers la page de profil après quelques secondes
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du profil:", err);
            setError("Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    if (loading && !formData.firstName) {
        return (
            <Container className="mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3">
                            <h4 className="mb-0">Modifier mon profil</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger">{error}</Alert>
                            )}
                            
                            {success && (
                                <Alert variant="success">
                                    Profil mis à jour avec succès! Vous allez être redirigé...
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Form.Group as={Col} sm={6} className="mb-3">
                                        <Form.Label>Prénom</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group as={Col} sm={6} className="mb-3">
                                        <Form.Label>Nom</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Téléphone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Adresse</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                {user?.role === 'DOCTOR' && (
                                    <>
                                        <h5 className="mt-4 mb-3">Informations professionnelles</h5>
                                        <Row>
                                            <Form.Group as={Col} sm={6} className="mb-3">
                                                <Form.Label>Spécialité</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="specialty"
                                                    value={formData.specialty}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group as={Col} sm={6} className="mb-3">
                                                <Form.Label>Numéro RPPS</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="licenseNumber"
                                                    value={formData.licenseNumber}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Row>
                                    </>
                                )}

                                {user?.role === 'PATIENT' && (
                                    <>
                                        <h5 className="mt-4 mb-3">Informations médicales</h5>
                                        <Row>
                                            <Form.Group as={Col} sm={6} className="mb-3">
                                                <Form.Label>Date de naissance</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="birthDate"
                                                    value={formData.birthDate}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group as={Col} sm={6} className="mb-3">
                                                <Form.Label>Numéro de sécurité sociale</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="socialSecurityNumber"
                                                    value={formData.socialSecurityNumber}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Row>
                                    </>
                                )}

                                <Form.Group as={Row} className="mt-4">
                                    <Col sm={{ span: 10, offset: 2 }}>
                                        <Button variant="secondary" onClick={handleCancel} className="me-2">
                                            <FaTimes className="me-1" /> Annuler
                                        </Button>
                                        <Button variant="primary" type="submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="me-1" /> Enregistrer
                                                </>
                                            )}
                                        </Button>
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EditProfilePage; 