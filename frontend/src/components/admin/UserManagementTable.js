// src/components/admin/UserManagementTable.js
import React, { useEffect, useState } from 'react';
import {
    getAllUsers,
    suspendUser,
    activateUser,
    deleteUser
} from '../../api/admin';
import { FaSpinner } from 'react-icons/fa';
import UserActionsDropdown from './UserActionsDropdown';

const UserManagementTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            setUsers(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des utilisateurs:', err);
            setError(err.response?.data?.message || 'Erreur de chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSuspend = async (id) => {
        if (!window.confirm('Confirmer la suspension de cet utilisateur ?')) return;
        try {
            await suspendUser(id);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suspension');
        }
    };

    const handleActivate = async (id) => {
        try {
            await activateUser(id);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'activation');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) return;
        try {
            await deleteUser(id);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <FaSpinner className="fa-spin" /> Chargement des utilisateurs...
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-striped align-middle table-admin">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id} className={user.status === 'SUSPENDED' ? 'table-warning' : ''}>
                            <td>{index + 1}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.status}</td>
                            <td>
                                <UserActionsDropdown
                                    user={user}
                                    onSuspend={handleSuspend}
                                    onActivate={handleActivate}
                                    onDelete={handleDelete}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementTable;
