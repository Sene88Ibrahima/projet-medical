// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../api/auth';
import axiosInstance from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier si un utilisateur est déjà connecté au chargement
        const initAuth = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    // Essayer de récupérer les informations de l'utilisateur
                    const response = await axiosInstance.get('/users/me');
                    setCurrentUser(response.data);
                } catch (error) {
                    // Token invalide ou expiré
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const userData = await loginUser({ email, password });
            setCurrentUser({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                role: userData.role
            });
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const register = async (registerData) => {
        try {
            const userData = await registerUser(registerData);
            setCurrentUser({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                role: userData.role
            });
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        loading,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};