// src/App.js
import React from 'react';
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

// PrivateRoute component - Utilise directement le contexte d'authentification
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log("PrivateRoute: utilisateur =", user?.email || 'non authentifié', "loading =", loading);
  
  // Si chargement en cours, afficher un loader
  if (loading) {
    console.log("Authentification en cours de chargement...");
    return <Loading />;
  }
  
  // Vérifier si l'utilisateur est authentifié
  if (!user) {
    console.log("Non authentifié, redirection vers login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("Authentifié, affichage du contenu protégé");
  return children;
};

// RoleBasedRoute component
const RoleBasedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();
  console.log("RoleBasedRoute: utilisateur =", user?.email || 'non authentifié', "rôle =", user?.role || 'aucun');
  
  // Si chargement en cours, afficher un loader
  if (loading) {
    return <Loading />;
  }
  
  // Vérifier si l'utilisateur est authentifié
  if (!user) {
    console.log("Non authentifié, redirection vers login");
    return <Navigate to="/login" replace />;
  }
  
  // Vérifier si l'utilisateur a le rôle requis
  if (!roles.includes(user.role)) {
    console.log(`Rôle ${user.role} non autorisé pour cette route, redirection vers dashboard`);
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log(`Rôle ${user.role} autorisé, affichage du contenu protégé`);
  return children;
};

function App() {
  // INFO DE DÉBOGAGE
  console.log("App chargée, localStorage contient:", {
    token: localStorage.getItem('token') ? "présent" : "absent",
    user: localStorage.getItem('user') ? "présent" : "absent",
    isAuthenticated: localStorage.getItem('isAuthenticated')
  });
  
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
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