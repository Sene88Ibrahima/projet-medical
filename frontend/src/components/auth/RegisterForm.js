// src/components/auth/RegisterForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PATIENT' // Par défaut
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

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

        // Validation du mot de passe
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setIsLoading(true);

        try {
            // Exclure confirmPassword
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Échec de l\'inscription');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-form-container">
            <h2>Rejoignez MediConnect</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
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
                        <div className="form-group">
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

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="exemple@email.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="form-control"
                        minLength="6"
                        placeholder="Minimum 6 caractères"
                    />
                </div>

                <div className="form-group">
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

                <div className="form-group">
                    <label htmlFor="role">Vous êtes</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="PATIENT">Patient</option>
                        <option value="DOCTOR">Médecin</option>
                    </select>
                </div>

                <div className="form-check mb-4">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="termsCheck"
                        required
                    />
                    <label className="form-check-label" htmlFor="termsCheck">
                        J'accepte les <a href="/terms">conditions d'utilisation</a> et la <a href="/privacy">politique de confidentialité</a>
                    </label>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Inscription...
                        </>
                    ) : 'Créer mon compte'}
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;