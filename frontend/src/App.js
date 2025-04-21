// src/App.js
import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import MessagesPage from './pages/MessagesPage';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';

// Styles
import './App.css';

// Fonction globale de vérification d'authentification
// DÉSACTIVÉ TEMPORAIREMENT POUR DÉBLOQUER L'APPLICATION
const isAuthenticated = () => {
  // EN MODE DÉVELOPPEMENT, TOUJOURS RETOURNER TRUE
  console.log("Vérification d'authentification désactivée en mode développement");
  return true;
  
  // Code normal à restaurer une fois le problème résolu
  /*
  const token = localStorage.getItem('token');
  console.log("Vérification d'authentification, token:", token ? "présent" : "absent");
  return !!token;
  */
};

// PrivateRoute component - VERSION SIMPLIFIÉE POUR LE DÉVELOPPEMENT
const PrivateRoute = ({ children }) => {
  // TOUJOURS AFFICHER LE CONTENU EN MODE DÉVELOPPEMENT
  console.log("PrivateRoute: Mode développement - accès autorisé");
  return children;
  
  // Code normal à restaurer une fois le problème résolu
  /*
  const auth = isAuthenticated();
  console.log("PrivateRoute: auth =", auth);
  
  if (!auth) {
    console.log("Non authentifié, redirection vers login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("Authentifié, affichage du contenu protégé");
  return children;
  */
};

// RoleBasedRoute component - VERSION SIMPLIFIÉE POUR LE DÉVELOPPEMENT
const RoleBasedRoute = ({ roles, children }) => {
  // TOUJOURS AFFICHER LE CONTENU EN MODE DÉVELOPPEMENT
  console.log("RoleBasedRoute: Mode développement - accès autorisé");
  return children;
  
  // Code normal à restaurer une fois le problème résolu
  /*
  const userDataStr = localStorage.getItem('currentUser');
  let userRole = null;
  
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      userRole = userData.role;
      console.log("RoleBasedRoute: rôle détecté =", userRole);
    } catch (e) {
      console.error("Erreur lors du parsing des données utilisateur:", e);
    }
  }
  
  if (!userRole) {
    console.log("Aucun rôle trouvé, redirection vers dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  if (!roles.includes(userRole)) {
    console.log(`Rôle ${userRole} non autorisé pour cette route, redirection vers dashboard`);
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log(`Rôle ${userRole} autorisé, affichage du contenu protégé`);
  return children;
  */
};

function App() {
  // INFO DE DÉBOGAGE
  console.log("App chargée, localStorage contient:", {
    token: localStorage.getItem('token'),
    currentUser: localStorage.getItem('currentUser'),
    isAuthenticated: localStorage.getItem('isAuthenticated')
  });
  
  // MODE DÉVELOPPEMENT - FORCER L'AUTHENTIFICATION
  // ⚠️ À RETIRER EN PRODUCTION ⚠️
  useEffect(() => {
    // Forcer un token fictif pour le développement
    if (!localStorage.getItem('token')) {
      console.log("⚠️ DÉVELOPPEMENT: Création d'un token fictif pour débloquer l'application");
      localStorage.setItem('token', 'dev-token-12345');
      localStorage.setItem('isAuthenticated', 'true');
      
      // Simuler un utilisateur
      const fakeUser = {
        firstName: 'Utilisateur',
        lastName: 'Test',
        email: 'dev@test.com',
        role: 'MEDECIN'
      };
      localStorage.setItem('currentUser', JSON.stringify(fakeUser));
    }
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            {/* PANNEAU DE DÉBOGAGE - Visible en mode développement */}
            <div style={{ padding: '10px', background: '#ffeeee', margin: '10px', borderRadius: '5px' }}>
              <h5>Mode Développement</h5>
              <p>Authentification simulée pour débloquer l'application</p>
              <p>Token: {localStorage.getItem('token') || 'Non défini'}</p>
              <p>Utilisateur: {localStorage.getItem('currentUser') || 'Non défini'}</p>
            </div>
            
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    <AppointmentsPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/medical-records"
                element={
                  <PrivateRoute>
                    <MedicalRecordsPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <MessagesPage />
                  </PrivateRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;