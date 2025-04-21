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

// Créer une instance d'axios avec la configuration par défaut
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    // Augmenter le timeout pour les environnements de dev
    timeout: 10000 // 10 secondes
});

// Intercepteur pour ajouter le token aux requêtes
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log(`Requête ${config.method?.toUpperCase()} vers ${config.url} avec token`);
        } else {
            console.log(`Requête ${config.method?.toUpperCase()} vers ${config.url} sans token`);
        }
        return config;
    },
    (error) => {
        console.error("Erreur dans l'intercepteur de requête:", error);
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse (notamment les erreurs 401)
axiosInstance.interceptors.response.use(
    (response) => {
        // Ajouter un log pour les réponses réussies
        console.log(`Réponse ${response.status} de ${response.config.url}`);
        return response;
    },
    (error) => {
        const originalRequest = error.config;
        console.error(`Erreur ${error.response?.status || 'réseau'} pour ${originalRequest?.url || 'une requête'}:`, error.message);
        
        // Si l'erreur est 401 et que la requête n'est pas déjà en cours de retry
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Vérifier si ce n'est pas déjà une requête de login/register
            const isAuthEndpoint = originalRequest.url && 
                (originalRequest.url.includes('/authenticate') || 
                 originalRequest.url.includes('/register'));
            
            if (isAuthEndpoint) {
                console.log("Erreur 401 sur un endpoint d'authentification - ne pas rediriger");
                return Promise.reject(error);
            }
            
            console.warn("Réponse 401 détectée - Session expirée");
            
            // Éviter les redirections multiples
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            // Marquer comme en cours de rafraîchissement
            originalRequest._retry = true;
            isRefreshing = true;
            
            // Nettoyer les données d'authentification
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            
            // On ne redirige qu'une seule fois avec un léger délai
            setTimeout(() => {
                console.log("Redirection vers la page de connexion après 401");
                processQueue(error);
                window.location.href = '/login';
                isRefreshing = false;
            }, 100);
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
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
        const response = await axiosInstance.get('/auth/validate-token');
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
        const response = await axiosInstance.get('/users/me');
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
        // const response = await axiosInstance.post('/auth/logout');
        
        // Nettoyer localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // Nettoyer les headers d'axios
        delete axiosInstance.defaults.headers.common['Authorization'];
        
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

export default axiosInstance;