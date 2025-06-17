// src/components/admin/UserActionsDropdown.js
import React from 'react';
import { FaTrash, FaUserSlash, FaUserCheck } from 'react-icons/fa';

const UserActionsDropdown = ({ user, onSuspend, onActivate, onDelete }) => {
    const isSuspended = user.status === 'SUSPENDED';

    return (
        <div className="dropdown">
            <button
                className="btn btn-secondary btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                data-bs-display="static"
                aria-expanded="false"
                onClick={e => e.stopPropagation()}
            >
                Actions
            </button>
            <ul className="dropdown-menu">
                {isSuspended ? (
                    <li>
                        <button className="dropdown-item" onClick={() => onActivate(user.id)}>
                            <FaUserCheck className="me-2" /> Activer
                        </button>
                    </li>
                ) : (
                    <li>
                        <button className="dropdown-item" onClick={() => onSuspend(user.id)}>
                            <FaUserSlash className="me-2" /> Suspendre
                        </button>
                    </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <button className="dropdown-item text-danger" onClick={() => onDelete(user.id)}>
                        <FaTrash className="me-2" /> Supprimer
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default UserActionsDropdown;
