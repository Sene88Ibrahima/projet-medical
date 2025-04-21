// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/auth';
const BASE_URL = 'http://localhost:8080/api/v1';

// Créer une instance d'axios avec la configuration par défaut
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token aux requêtes
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log("Ajout du token d'authentification à la requête");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse (notamment les erreurs 401)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // MODIFICATION: Ne pas rediriger automatiquement pour le moment
        // Cela peut causer des redirections en boucle
        console.error("Erreur API:", error);
        
        // Si erreur 401 (non autorisé), on log l'erreur mais on ne fait pas de redirection automatique
        if (error.response && error.response.status === 401) {
            console.error("Erreur d'authentification 401 détectée");
            // On ne supprime pas le token pour le moment pour des fins de débogage
            console.log("Token actuel:", localStorage.getItem('token'));
            
            // Commenté pour éviter les redirections en boucle
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            // localStorage.removeItem('isAuthenticated');
            
            // Ne pas rediriger automatiquement
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const loginUser = async (credentials) => {
    try {
        console.log("Tentative de connexion avec:", credentials.email);
        const response = await axios.post(`${API_URL}/authenticate`, credentials);
        console.log("Réponse de connexion:", response.data);
        
        // Stocker le token immédiatement
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log("Token stocké dans localStorage");
        } else {
            console.warn("Aucun token reçu dans la réponse");
        }
        return response.data;
    } catch (error) {
        console.error("Erreur de connexion:", error);
        throw new Error(error.response?.data?.message || 'Échec de la connexion');
    }
};

export const registerUser = async (userData) => {
    try {
        console.log("Tentative d'inscription avec:", userData.email);
        const response = await axios.post(`${API_URL}/register`, userData);
        console.log("Réponse d'inscription:", response.data);
        
        // Stocker le token immédiatement
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log("Token stocké dans localStorage après inscription");
        }
        return response.data;
    } catch (error) {
        console.error("Erreur d'inscription:", error);
        throw new Error(error.response?.data?.message || 'Échec de l\'inscription');
    }
};

export const validateToken = async () => {
    try {
        const response = await axiosInstance.get('/auth/validate-token');
        return response.data;
    } catch (error) {
        console.error('Erreur de validation du token:', error);
        throw new Error('Token invalide');
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    } catch (error) {
        console.error('Erreur de récupération des données utilisateur:', error);
        throw new Error('Impossible de récupérer les données utilisateur');
    }
};

export const logout = async () => {
    try {
        // Appel optionnel au backend pour invalider le token côté serveur si nécessaire
        // const response = await axiosInstance.post('/auth/logout');
        
        // Nettoyer localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // Nettoyer les headers d'axios
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw new Error('Erreur lors de la déconnexion');
    }
};

// Fonction utilitaire pour vérifier si l'utilisateur est authentifié
export const isUserAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export default axiosInstance;