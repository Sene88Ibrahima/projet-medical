/**
 * Utilitaires pour la gestion de l'authentification.
 */

/**
 * Récupère les en-têtes d'authentification avec le token JWT.
 * 
 * @returns {Object} En-têtes d'authentification
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Vérifie si l'utilisateur est authentifié.
 * 
 * @returns {boolean} true si l'utilisateur est authentifié, false sinon
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique.
 * 
 * @param {string} role - Rôle à vérifier
 * @returns {boolean} true si l'utilisateur a le rôle spécifié, false sinon
 */
export const hasRole = (role) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === role;
};

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés.
 * 
 * @param {Array<string>} roles - Liste des rôles à vérifier
 * @returns {boolean} true si l'utilisateur a l'un des rôles spécifiés, false sinon
 */
export const hasAnyRole = (roles) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return roles.includes(user.role);
};
