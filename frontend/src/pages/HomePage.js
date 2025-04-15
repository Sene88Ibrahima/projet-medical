// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css'; // Importation du nouveau fichier CSS

const HomePage = () => {
    const { currentUser } = useAuth();

    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="container">
                    <h1>MediConnect</h1>
                    <p className="lead">
                        La plateforme innovante qui simplifie la relation médecin-patient et améliore votre expérience de santé
                    </p>

                    {!currentUser ? (
                        <div className="cta-buttons">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Connexion
                            </Link>
                            <Link to="/register" className="btn btn-outline-primary btn-lg">
                                Créer un compte
                            </Link>
                        </div>
                    ) : (
                        <div className="welcome-back">
                            <p>Bienvenue, {currentUser.firstName}!</p>
                            <Link to="/dashboard" className="btn btn-success btn-lg">
                                Accéder à mon tableau de bord
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="features-section">
                <div className="container">
                    <h2 className="text-center mb-5">Nos fonctionnalités</h2>

                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="feature-card">
                                <i className="fas fa-calendar-alt fa-3x mb-3"></i>
                                <h3>Gestion des rendez-vous</h3>
                                <p>
                                    Planifiez, modifiez ou annulez facilement vos consultations médicales en quelques clics.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="feature-card">
                                <i className="fas fa-file-medical fa-3x mb-3"></i>
                                <h3>Dossiers médicaux</h3>
                                <p>
                                    Accédez à vos dossiers médicaux et images diagnostiques en toute sécurité, n'importe où et n'importe quand.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="feature-card">
                                <i className="fas fa-comments fa-3x mb-3"></i>
                                <h3>Messagerie sécurisée</h3>
                                <p>
                                    Communiquez directement avec votre médecin ou vos patients via notre système de messagerie cryptée.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="how-it-works">
                <div className="container">
                    <h2 className="text-center mb-5">Comment ça marche</h2>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h4>Créez votre compte</h4>
                            <p>Inscrivez-vous en tant que patient ou médecin en quelques clics et sécurisez votre espace personnel.</p>
                        </div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <h4>Complétez votre profil</h4>
                            <p>Ajoutez vos informations médicales ou professionnelles pour personnaliser votre expérience.</p>
                        </div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <h4>Utilisez les services</h4>
                            <p>Prenez rendez-vous, accédez à vos dossiers ou communiquez avec vos professionnels de santé.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;