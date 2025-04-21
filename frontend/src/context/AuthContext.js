// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../api/auth';
import axiosInstance from '../api/auth';

const AuthContext = createContext(null);

// Fonctions utilitaires pour l'authentification - déplacées hors du provider pour être réutilisables
const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        // Définir le token dans les headers Axios pour toutes les futures requêtes
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
};

// Vérification globale d'authentification utilisable par tous les composants
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return !!token && !!userStr;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Initialisation de l'état d'authentification
    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                if (token && storedUser) {
                    // Définir le token pour les requêtes
                    setAuthToken(token);
                    
                    // Restaurer l'utilisateur
                    setUser(JSON.parse(storedUser));
                    
                    // Vérifier la validité du token avec le backend
                    try {
                        const response = await axiosInstance.get('/api/v1/auth/validate-token');
                        if (response.status === 200) {
                            console.log('Token validé avec succès');
                        }
                    } catch (err) {
                        console.error('Token invalide, déconnexion...');
                        // Nettoyage en cas de token invalide
                        handleLogout();
                    }
                }
            } catch (error) {
                console.error('Erreur d\'initialisation de l\'authentification:', error);
                handleLogout();
            } finally {
                setLoading(false);
            }
        };
        
        initAuth();
    }, []);
    
    // Fonction pour gérer la connexion
    const handleLogin = async (email, password) => {
        setLoading(true);
        setAuthError(null);
        
        try {
            const response = await loginUser({ email, password });
            
            // Stocker le token JWT
            if (response && response.token) {
                setAuthToken(response.token);
                
                // Préparer et stocker les données utilisateur
                const userData = {
                    id: response.id || '',
                    email: email,
                    firstName: response.firstName || '',
                    lastName: response.lastName || '',
                    role: response.role || 'PATIENT'
                };
                
                // Stocker l'utilisateur dans localStorage et le state
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('isAuthenticated', 'true');
                setUser(userData);
                
                console.log('Authentification réussie:', userData);
                return { success: true, data: userData };
            } else {
                throw new Error('Token manquant dans la réponse');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setAuthError(error.message || 'Échec de connexion');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    
    // Fonction pour gérer l'inscription
    const handleRegister = async (userData) => {
        setLoading(true);
        setAuthError(null);
        
        try {
            const response = await registerUser(userData);
            
            // Stocker le token JWT
            if (response && response.token) {
                setAuthToken(response.token);
                
                // Préparer et stocker les données utilisateur
                const userToStore = {
                    id: response.id || '',
                    email: userData.email,
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    role: userData.role || 'PATIENT'
                };
                
                // Stocker l'utilisateur dans localStorage et le state
                localStorage.setItem('user', JSON.stringify(userToStore));
                localStorage.setItem('isAuthenticated', 'true');
                setUser(userToStore);
                
                console.log('Inscription réussie:', userToStore);
                return { success: true, data: userToStore };
            } else {
                throw new Error('Token manquant dans la réponse');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            setAuthError(error.message || 'Échec d\'inscription');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    
    // Fonction pour gérer la déconnexion
    const handleLogout = () => {
        // Supprimer le token des headers
        setAuthToken(null);
        
        // Nettoyer localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // Réinitialiser l'état
        setUser(null);
        
        console.log('Déconnexion réussie');
    };
    
    // Données et fonctions exposées par le contexte
    const contextValue = {
        user,
        loading,
        error: authError,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout
    };
    
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};