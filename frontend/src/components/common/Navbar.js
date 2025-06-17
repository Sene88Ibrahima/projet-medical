// src/components/common/Navbar.js
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaCog, FaSignOutAlt, FaUserMd, FaUserCog, FaUserNurse, FaHome, FaUsers } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    // Pour éviter les problèmes de rendu initial (user null), récupérons aussi l'utilisateur du localStorage
    const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    const currentUser = user || storedUser;
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Utiliser directement l'état du contexte d'authentification
    const isAuthenticated = !!currentUser;
    
    console.log("Navbar: état d'authentification =", isAuthenticated, "utilisateur =", currentUser?.email || 'non défini');
    
    // Initialiser manuellement le dropdown Bootstrap
    useEffect(() => {
        // Vérifier si le script Bootstrap est chargé
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            // Si Bootstrap 5 est chargé
            if (window.bootstrap && window.bootstrap.Dropdown) {
                const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
                
                dropdownElementList.forEach(dropdownToggleEl => {
                    new window.bootstrap.Dropdown(dropdownToggleEl);
                });
            } 
            // Si jQuery et Bootstrap 4 sont chargés
            else if (window.$ && typeof window.$.fn.dropdown === 'function') {
                window.$('.dropdown-toggle').dropdown();
            }
            // Fallback pour les versions plus anciennes ou si bootstrap n'est pas chargé
            else if (dropdownRef.current) {
                dropdownRef.current.addEventListener('click', function() {
                    const dropdownMenu = this.nextElementSibling;
                    if (dropdownMenu) {
                        dropdownMenu.classList.toggle('show');
                    }
                });
                
                // Fermer le dropdown au clic à l'extérieur
                document.addEventListener('click', function(event) {
                    if (!dropdownRef.current?.contains(event.target)) {
                        const dropdownMenu = dropdownRef.current?.nextElementSibling;
                        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
                            dropdownMenu.classList.remove('show');
                        }
                    }
                });
            }
        }
    }, []);
    
    const handleLogout = () => {
        console.log("Déconnexion initiée depuis Navbar");
        logout();
        // Rediriger vers la page d'accueil après déconnexion
        window.location.href = '/';
    };

    const handleEditProfile = () => {
        navigate('/profile/edit');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Déterminer le lien du tableau de bord en fonction du rôle
    const getDashboardLink = () => {
        if (!currentUser) return '/dashboard';
        
        switch (currentUser.role) {
            case 'ADMIN':
                return '/dashboard/admin';
            case 'DOCTOR':
                return '/dashboard/doctor';
            case 'NURSE':
                return '/dashboard/nurse';
            case 'PATIENT':
                return '/dashboard/patient';
            default:
                return '/dashboard';
        }
    };

    // Obtenir l'icône correspondant au rôle de l'utilisateur
    const getUserIcon = () => {
        if (!currentUser) return <FaUser />;
        
        switch (currentUser.role) {
            case 'ADMIN':
                return <FaUserCog />;
            case 'DOCTOR':
                return <FaUserMd />;
            case 'NURSE':
                return <FaUserNurse />;
            default:
                return <FaUser />;
        }
    };

    return (
        <nav className="navbar navbar-expand navbar-light bg-light shadow-sm">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <FaHome className="me-2" />
                    DiagnoPlus
                </Link>

                

                <div className="navbar-collapse flex-grow-1 justify-content-end" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Accueil
                            </Link>
                        </li>

                        {isAuthenticated && currentUser ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to={getDashboardLink()}>
                                        Tableau de bord
                                    </Link>
                                </li>

                                {/* Articles for specific roles */}
                                {currentUser.role === 'DOCTOR' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/articles">
                                            Articles
                                        </Link>
                                    </li>
                                )}
                                {currentUser.role === 'ADMIN' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/admin/articles">
                                            Les Articles
                                        </Link>
                                    </li>
                                )}

                                {currentUser.role !== 'ADMIN' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/appointments">
                                            Rendez-vous
                                        </Link>
                                    </li>
                                )}

                                {currentUser.role === 'ADMIN' ? (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/admin/medical-records">
                                            Dossiers médicaux
                                        </Link>
                                    </li>
                                ) : (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/medical-records">
                                            Dossiers médicaux
                                        </Link>
                                    </li>
                                )}

                                {currentUser.role !== 'ADMIN' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/messages">
                                            Messages
                                        </Link>
                                    </li>
                                )}

                                {currentUser.role === 'ADMIN' && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/admin/users">
                                            <FaUsers className="me-1" /> Utilisateurs
                                        </Link>
                                    </li>
                                )}

                                {/* Menu déroulant utilisateur */}
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle user-dropdown"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        ref={dropdownRef}
                                    >
                                        <span className="user-icon me-1">
                                            {getUserIcon()}
                                        </span>
                                        {currentUser?.firstName || ''} {currentUser?.lastName || ''}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">
                                                <FaUser className="me-2" /> Mon profil
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={handleEditProfile}
                                            >
                                                <FaCog className="me-2" /> Modifier mon profil
                                            </button>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item text-danger"
                                                onClick={handleLogout}
                                            >
                                                <FaSignOutAlt className="me-2" /> Déconnexion
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                                
                                {/* Bouton de déconnexion visible sur les petits écrans */}
                                <li className="nav-item d-lg-none mt-2">
                                    <button
                                        className="btn btn-outline-danger w-100"
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt className="me-2" /> Déconnexion
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} to="/login">
                                        Connexion
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`} to="/register">
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