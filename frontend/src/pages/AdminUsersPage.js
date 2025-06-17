// src/pages/AdminUsersPage.js
import React from 'react';
import '../components/admin/admin.css';
import CreateUserForm from '../components/admin/CreateUserForm';
import UserManagementTable from '../components/admin/UserManagementTable';

const AdminUsersPage = () => {
    return (
        <div className="container-fluid admin-page py-3">
            <h2>Gestion des utilisateurs</h2>
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <CreateUserForm />
                </div>
                <div className="col-lg-8">
                    <UserManagementTable />
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
