// src/pages/RegisterPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import '../components/auth/Auth.css';

const RegisterPage = () => {
    return (
        <div className="register-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card auth-card">
                            <div className="auth-header">
                                <h2>Rejoignez MediConnect</h2>
                                <p>Créez votre compte pour gérer vos rendez-vous et dossiers médicaux</p>
                            </div>
                            <div className="auth-body">
                                <RegisterForm />
                            </div>
                            <div className="auth-footer">
                                <p>
                                    Vous avez déjà un compte ?{' '}
                                    <Link to="/login">Se connecter</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;