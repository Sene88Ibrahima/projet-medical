// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, validateToken } from '../api/auth';
import axiosInstance from '../api/auth';

const AuthContext = createContext(null);

// Fonctions utilitaires pour l'authentification - déplacées hors du provider pour être réutilisables
const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        // Définir le token dans les headers Axios pour toutes les futures requêtes
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log("Token défini dans les headers Axios:", token.substring(0, 10) + "...");
    } else {
        localStorage.removeItem('token');
        delete axiosInstance.defaults.headers.common['Authorization'];
        console.log("Token supprimé des headers Axios");
    }
};

// Vérification globale d'authentification utilisable par tous les composants
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const isAuth = !!token && !!userStr;
    console.log("Vérification isAuthenticated():", isAuth);
    return isAuth;
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
                
                console.log("Initialisation de l'authentification:", {
                    hasToken: !!token,
                    hasUser: !!storedUser
                });
                
                if (token && storedUser) {
                    // Définir le token pour les requêtes
                    setAuthToken(token);
                    
                    // Restaurer l'utilisateur
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    console.log("Utilisateur restauré depuis localStorage:", parsedUser.email);
                    
                    // IMPORTANT: Ne pas faire de validation immédiate du token
                    // La validation peut échouer temporairement pour diverses raisons
                    // et nous ne voulons pas déconnecter l'utilisateur inutilement
                }
            } catch (error) {
                console.error('Erreur d\'initialisation de l\'authentification:', error);
                // Ne pas se déconnecter automatiquement, juste logger l'erreur
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
            console.log("Tentative de connexion pour:", email);
            const response = await loginUser({ email, password });
            
            // Stocker le token JWT
            if (response && response.token) {
                console.log("Token reçu après connexion");
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
                console.error('Token manquant dans la réponse');
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
            console.log("Tentative d'inscription pour:", userData.email);
            const response = await registerUser(userData);
            
            // Stocker le token JWT
            if (response && response.token) {
                console.log("Token reçu après inscription");
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
                console.error('Token manquant dans la réponse');
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
        console.log("Déconnexion initiée");
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
    
    // Fonction pour mettre à jour les données utilisateur
    const handleUpdateUserData = async (updatedUserData) => {
        try {
            setLoading(true);
            
            // Dans une application réelle, vous feriez un appel API ici
            // Exemple:
            // const response = await axiosInstance.put('/api/users/profile', updatedUserData);
            
            // Pour l'instant, mettons simplement à jour les données localement
            console.log("Mise à jour des données utilisateur:", updatedUserData);
            
            // Mettre à jour localStorage
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            
            // Mettre à jour l'état
            setUser(updatedUserData);
            
            return { success: true, data: updatedUserData };
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            setAuthError(error.message || 'Échec de la mise à jour du profil');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    
    // Données et fonctions exposées par le contexte
    const contextValue = {
        user,
        loading,
        error: authError,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUserData: handleUpdateUserData
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