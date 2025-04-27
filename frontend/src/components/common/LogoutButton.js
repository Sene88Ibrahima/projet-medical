import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

/**
 * Composant de bouton de déconnexion réutilisable
 * @param {Object} props - Propriétés du composant
 * @param {string} props.variant - Variante du bouton (outline, solid)
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.iconOnly - Afficher uniquement l'icône
 * @param {string} props.size - Taille du bouton (sm, md, lg)
 */
const LogoutButton = ({ 
    variant = 'outline', 
    className = '', 
    iconOnly = false,
    size = 'md'
}) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        console.log("Déconnexion initiée depuis LogoutButton");
        logout();
        // Rediriger vers la page d'accueil après déconnexion
        window.location.href = '/';
    };

    // Déterminer les classes CSS en fonction des props
    const getButtonClasses = () => {
        let classes = 'btn ';
        
        // Variante
        classes += variant === 'outline' 
            ? 'btn-outline-danger ' 
            : 'btn-danger ';
        
        // Taille
        if (size === 'sm') classes += 'btn-sm ';
        if (size === 'lg') classes += 'btn-lg ';
        
        // Classes additionnelles
        classes += className;
        
        return classes;
    };

    return (
        <button
            className={getButtonClasses()}
            onClick={handleLogout}
            title="Déconnexion"
        >
            <FaSignOutAlt className={iconOnly ? '' : 'me-2'} />
            {!iconOnly && 'Déconnexion'}
        </button>
    );
};

export default LogoutButton;
