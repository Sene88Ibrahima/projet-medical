import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Composant de garde d'authentification qui contrôle l'accès aux routes protégées
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants à afficher si l'authentification est valide
 * @param {string[]} props.allowedRoles - Rôles autorisés à accéder à cette route
 * @param {boolean} props.requireAuth - Si true, l'utilisateur doit être authentifié pour accéder
 * @param {boolean} props.guestOnly - Si true, seuls les utilisateurs non authentifiés peuvent accéder
 */
const AuthGuard = ({ 
    children, 
    allowedRoles = [], 
    requireAuth = true,
    guestOnly = false
}) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Journalisation pour le débogage
        console.log('AuthGuard - État actuel:', {
            isAuthenticated,
            userRole: user?.role,
            allowedRoles,
            requireAuth,
            guestOnly,
            path: location.pathname
        });
    }, [isAuthenticated, user, allowedRoles, requireAuth, guestOnly, location]);

    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    // Si la route est réservée aux invités et que l'utilisateur est connecté
    if (guestOnly && isAuthenticated) {
        // Rediriger vers le tableau de bord approprié en fonction du rôle
        const dashboardPath = getDashboardPathByRole(user?.role);
        return <Navigate to={dashboardPath} replace />;
    }

    // Si l'authentification est requise mais que l'utilisateur n'est pas connecté
    if (requireAuth && !isAuthenticated) {
        // Rediriger vers la page de connexion avec l'URL de retour
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle
    if (
        requireAuth && 
        isAuthenticated && 
        allowedRoles.length > 0 && 
        !allowedRoles.includes(user?.role)
    ) {
        // Rediriger vers le tableau de bord approprié pour son rôle
        const dashboardPath = getDashboardPathByRole(user?.role);
        return <Navigate to={dashboardPath} replace />;
    }

    // Si toutes les vérifications sont passées, afficher le contenu
    return <>{children}</>;
};

/**
 * Fonction utilitaire pour obtenir le chemin du tableau de bord en fonction du rôle
 */
const getDashboardPathByRole = (role) => {
    switch (role) {
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

export default AuthGuard;
