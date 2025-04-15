// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Si un token existe, vérifier si l'utilisateur est authentifié
        const verifyUser = async () => {
            if (token) {
                try {
                    const userData = await getCurrentUser();
                    setCurrentUser(userData);
                } catch (err) {
                    // Token invalide ou expiré
                    localStorage.removeItem('token');
                    setToken(null);
                    setError('Session expirée, veuillez vous reconnecter');
                }
            }
            setLoading(false);
        };

        verifyUser();
    }, [token]);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loginUser({ email, password });
            localStorage.setItem('token', response.token);
            setToken(response.token);
            setCurrentUser({
                firstName: response.firstName,
                lastName: response.lastName,
                email: response.email,
                role: response.role
            });
            return response;
        } catch (err) {
            setError(err.message || 'Échec de la connexion');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await registerUser(userData);
            localStorage.setItem('token', response.token);
            setToken(response.token);
            setCurrentUser({
                firstName: response.firstName,
                lastName: response.lastName,
                email: response.email,
                role: response.role
            });
            return response;
        } catch (err) {
            setError(err.message || 'Échec de l\'inscription');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        token,
        loading,
        error,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};