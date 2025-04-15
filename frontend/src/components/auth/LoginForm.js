// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Entrez votre email"
                    />
                </div>

                <div className="form-group mb-2">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Entrez votre mot de passe"
                    />
                </div>

                <Link to="/forgot-password" className="forgot-password">
                    Mot de passe oublié ?
                </Link>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Connexion...
                        </>
                    ) : 'Se connecter'}
                </button>
            </form>

            <div className="auth-divider mt-4">
                <span>ou</span>
            </div>

            <div className="social-login mt-4 text-center">
                <p className="mb-3">Se connecter avec</p>
                <div className="d-flex justify-content-center gap-3">
                    <button className="btn btn-outline-secondary">
                        <i className="fab fa-google me-2"></i>Google
                    </button>
                    <button className="btn btn-outline-secondary">
                        <i className="fab fa-facebook-f me-2"></i>Facebook
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;