// src/components/common/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    
    // Utiliser directement l'état du contexte d'authentification
    const isAuthenticated = !!user;
    
    console.log("Navbar: état d'authentification =", isAuthenticated, "utilisateur =", user?.email || 'non défini');
    
    const handleLogout = () => {
        console.log("Déconnexion initiée depuis Navbar");
        logout();
        // Utiliser window.location.href pour un rechargement complet après déconnexion
        window.location.href = '/login';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    MediConnect
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Accueil
                            </Link>
                        </li>

                        {isAuthenticated && user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">
                                        Tableau de bord
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="nav-link" to="/appointments">
                                        Rendez-vous
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="nav-link" to="/medical-records">
                                        Dossiers médicaux
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="nav-link" to="/messages">
                                        Messages
                                    </Link>
                                </li>

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {user?.firstName || ''} {user?.lastName || ''}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">
                                                Mon profil
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                Déconnexion
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Connexion
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Inscription
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;