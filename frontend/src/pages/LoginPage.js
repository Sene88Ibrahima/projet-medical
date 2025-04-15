// src/pages/LoginPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import '../components/auth/Auth.css';

const LoginPage = () => {
    return (
        <div className="login-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card auth-card">
                            <div className="auth-header">
                                <h2>Bienvenue sur MediConnect</h2>
                                <p>Connectez-vous pour accéder à votre espace personnel</p>
                            </div>
                            <div className="auth-body">
                                <LoginForm />
                            </div>
                            <div className="auth-footer">
                                <p>
                                    Vous n'avez pas de compte ?{' '}
                                    <Link to="/register">Créer un compte</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;