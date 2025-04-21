// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Forcer le stockage d'un état d'authentification même avant l'appel à l'API
            localStorage.setItem('isAuthenticated', 'true');
            
            // Approche directe avec authentification
            const userData = await login(email, password);
            console.log('Login successful:', userData);
            
            // Garantir que les données utilisateur sont dans localStorage
            const userInfo = {
                email: email,
                firstName: userData?.firstName || 'Utilisateur',
                lastName: userData?.lastName || '',
                role: userData?.role || 'PATIENT'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            
            // Pour le débogage - afficher tous les éléments dans le localStorage
            console.log("Authentification réussie, token:", localStorage.getItem('token'));
            console.log('LocalStorage après login:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`${key}: ${localStorage.getItem(key)}`);
            }
            
            // Redirection directe sans setTimeout pour éviter les problèmes
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
            // Nettoyer les drapeaux d'authentification en cas d'échec
            localStorage.removeItem('isAuthenticated');
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
                        placeholder="votre@email.com"
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-control"
                        placeholder="Votre mot de passe"
                    />
                </div>

                <div className="d-flex justify-content-end mb-3">
                    <Link to="/forgot-password" className="text-decoration-none">
                        Mot de passe oublié ?
                    </Link>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                >
                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;