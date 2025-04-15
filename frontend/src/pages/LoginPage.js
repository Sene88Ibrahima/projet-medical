// src/pages/LoginPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
    return (
        <div className="login-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body p-5">
                                <LoginForm />

                                <div className="mt-4 text-center">
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
        </div>
    );
};

export default LoginPage;