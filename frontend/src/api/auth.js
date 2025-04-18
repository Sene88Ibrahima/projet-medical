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
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/authenticate`, credentials);
        // Stocker le token immédiatement
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Échec de la connexion');
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        // Stocker le token immédiatement
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Échec de l\'inscription');
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    } catch (error) {
        throw new Error('Impossible de récupérer les données utilisateur');
    }
};

export default axiosInstance;