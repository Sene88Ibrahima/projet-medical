// src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PATIENT' // Le rôle est fixé à PATIENT et n'est plus modifiable
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        try {
            // Approche directe plus simple
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            console.log('Registration successful');
            
            // Attendre un court instant pour s'assurer que tout est traité
            setTimeout(() => {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const { dashboardUrl, role } = JSON.parse(storedUser);
                    const target = dashboardUrl || {
                        PATIENT: '/dashboard/patient',
                        DOCTOR: '/dashboard/doctor',
                        NURSE: '/dashboard/nurse',
                        ADMIN: '/dashboard/admin',
                    }[role] || '/dashboard';
                    window.location.href = target;
                } else {
                    window.location.href = '/dashboard';
                }
            }, 500);
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.message || 'Échec de l\'inscription. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label htmlFor="firstName">Prénom</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="Votre prénom"
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label htmlFor="lastName">Nom</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="Votre nom"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="votre@email.com"
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="Mot de passe (6 caractères minimum)"
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="Confirmez votre mot de passe"
                    />
                </div>

                {/* Le sélecteur de rôle a été supprimé car seuls les patients peuvent s'inscrire librement */}
                <div className="alert alert-info mb-3">
                    Vous vous inscrivez en tant que patient. Les comptes médecin, infirmier et administrateur sont créés uniquement par l'administration.
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary w-100 mt-3"
                    disabled={isLoading}
                >
                    {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;