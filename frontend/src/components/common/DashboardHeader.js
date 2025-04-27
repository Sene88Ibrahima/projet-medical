import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from './LogoutButton';
import { 
    FaUserMd, 
    FaUserCog, 
    FaUserNurse, 
    FaUser, 
    FaHome, 
    FaCalendarAlt, 
    FaFileAlt, 
    FaEnvelope 
} from 'react-icons/fa';

/**
 * Composant d'en-tête pour les tableaux de bord
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre du tableau de bord
 * @param {string} props.subtitle - Sous-titre optionnel
 */
const DashboardHeader = ({ title, subtitle }) => {
    const { user } = useAuth();

    // Obtenir l'icône correspondant au rôle de l'utilisateur
    const getUserIcon = () => {
        if (!user) return <FaUser />;
        
        switch (user.role) {
            case 'ADMIN':
                return <FaUserCog className="text-primary" />;
            case 'DOCTOR':
                return <FaUserMd className="text-primary" />;
            case 'NURSE':
                return <FaUserNurse className="text-primary" />;
            default:
                return <FaUser className="text-primary" />;
        }
    };

    return (
        <div className="dashboard-header bg-white shadow-sm p-3 mb-4 rounded">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h1 className="h3 mb-0 d-flex align-items-center">
                            {getUserIcon()}
                            <span className="ms-2">{title}</span>
                        </h1>
                        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-md-end mt-3 mt-md-0">
                            <div className="btn-group me-2">
                                <Link to="/" className="btn btn-outline-secondary btn-sm">
                                    <FaHome className="me-1" /> Accueil
                                </Link>
                                {user && (
                                    <>
                                        <Link to="/appointments" className="btn btn-outline-secondary btn-sm">
                                            <FaCalendarAlt className="me-1" /> Rendez-vous
                                        </Link>
                                        <Link to="/medical-records" className="btn btn-outline-secondary btn-sm">
                                            <FaFileAlt className="me-1" /> Dossiers
                                        </Link>
                                        <Link to="/messages" className="btn btn-outline-secondary btn-sm">
                                            <FaEnvelope className="me-1" /> Messages
                                        </Link>
                                    </>
                                )}
                            </div>
                            <LogoutButton size="sm" />
                        </div>
                    </div>
                </div>
                
                {user && (
                    <div className="user-info mt-2">
                        <small className="text-muted">
                            Connecté en tant que: <strong>{user.firstName} {user.lastName}</strong> ({user.role})
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHeader;
