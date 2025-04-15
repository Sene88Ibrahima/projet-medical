// src/pages/RegisterPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import '../components/auth/Auth.css'; // Importation du nouveau fichier CSS

const RegisterPage = () => {
    return (
        <div className="register-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-body">
                                <RegisterForm />

                                <div className="mt-4 text-center">
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
        </div>
    );
};

export default RegisterPage;