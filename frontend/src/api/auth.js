// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/auth';
const BASE_URL = 'http://localhost:8080/api/v1';

// Pour éviter les redirections en boucle
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Créer une instance axios avec la configuration de base
const instance = axios.create({
    baseURL: 'http://localhost:8080', // URL de base de l'API
    timeout: 10000, // Timeout de 10 secondes
    headers: {
        'Content-Type': 'application/json',
    }
});

// Ajouter un intercepteur pour les requêtes
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Ajouter un intercepteur pour les réponses
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Le serveur a répondu avec un code d'erreur
            console.error('Erreur de réponse:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                method: error.config.method,
                url: error.config.url,
                headers: error.config.headers
            });

            // Si le token est expiré ou invalide (401)
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            // Si c'est une erreur d'autorisation (403)
            if (error.response.status === 403) {
                console.error('Erreur d\'autorisation (403): Vous n\'avez pas les permissions nécessaires.');
                console.error('URL demandée:', error.config.url);
                console.error('Headers:', error.config.headers);
            }
        } else if (error.request) {
            // La requête a été faite mais pas de réponse
            console.error('Pas de réponse du serveur:', error.request);
        } else {
            // Erreur lors de la configuration de la requête
            console.error('Erreur de configuration:', error.message);
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
            
            // Configurer axios avec le nouveau token
            instance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
            
            // Configurer axios avec le nouveau token
            instance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    } catch (error) {
        console.error("Erreur d'inscription:", error);
        throw new Error(error.response?.data?.message || 'Échec de l\'inscription');
    }
};

export const validateToken = async () => {
    try {
        console.log("Validation du token en cours...");
        const response = await instance.get('/auth/validate-token');
        console.log("Token validé avec succès");
        return response.data;
    } catch (error) {
        console.error('Erreur de validation du token:', error);
        throw new Error('Token invalide');
    }
};

export const getCurrentUser = async () => {
    try {
        console.log("Récupération des données utilisateur en cours...");
        const response = await instance.get('/users/me');
        console.log("Données utilisateur récupérées avec succès");
        return response.data;
    } catch (error) {
        console.error('Erreur de récupération des données utilisateur:', error);
        throw new Error('Impossible de récupérer les données utilisateur');
    }
};

export const logout = async () => {
    try {
        console.log("Déconnexion en cours...");
        // Appel optionnel au backend pour invalider le token côté serveur si nécessaire
        // const response = await instance.post('/auth/logout');
        
        // Nettoyer localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // Nettoyer les headers d'axios
        delete instance.defaults.headers.common['Authorization'];
        
        console.log("Déconnexion réussie");
        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw new Error('Erreur lors de la déconnexion');
    }
};

// Fonction utilitaire pour vérifier si l'utilisateur est authentifié
export const isUserAuthenticated = () => {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    console.log("Vérification d'authentification (API):", isAuth);
    return isAuth;
};

export default instance;