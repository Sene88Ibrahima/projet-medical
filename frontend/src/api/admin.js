// src/api/admin.js
// Regroupe les appels API réservés à l'administrateur
// Toutes les requêtes utilisent l'instance axios déjà configurée avec le token
import instance from './auth';

export const getAllUsers = () => instance.get('/api/v1/admin/users');

export const getUsersByRole = (role) => instance.get(`/api/v1/admin/users/role/${role}`);

export const createUser = (data) => instance.post('/api/v1/admin/users', data);

export const updateUser = (id, data) => instance.put(`/api/v1/admin/users/${id}`, data);

export const deleteUser = (id) => instance.delete(`/api/v1/admin/users/${id}`);

// Envoyer un body vide pour éviter les erreurs 415 / 400 lorsque le Content-Type est JSON
export const suspendUser = (id) => instance.patch(`/api/v1/admin/users/${id}/suspend`, {});

export const activateUser = (id) => instance.patch(`/api/v1/admin/users/${id}/activate`, {});

export default {
    getAllUsers,
    getUsersByRole,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
};
