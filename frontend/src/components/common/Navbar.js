// src/components/common/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
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
                    data-toggle="collapse"
                    data-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Accueil
                            </Link>
                        </li>

                        {currentUser ? (
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
                                        data-toggle="dropdown"
                                    >
                                        {currentUser.firstName} {currentUser.lastName}
                                    </a>
                                    <div className="dropdown-menu">
                                        <Link className="dropdown-item" to="/profile">
                                            Mon profil
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item"
                                            onClick={handleLogout}
                                        >
                                            Déconnexion
                                        </button>
                                    </div>
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