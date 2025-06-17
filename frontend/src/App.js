// src/App.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MedicalInfoPage from './pages/MedicalInfoPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import MessagesPage from './pages/MessagesPage';
import ArticlesPage from './pages/ArticlesPage';
import NewArticlePage from './pages/NewArticlePageClean';
import ArticleDetailPage from './pages/ArticleDetailPage';
import DicomViewerPage from './pages/DicomViewerPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import PatientDicomImagesPage from './pages/PatientDicomImagesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminArticlesPage from './pages/AdminArticlesPage';
import AdminMedicalRecordsPage from './pages/AdminMedicalRecordsPage';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';

// Styles
import './App.css';

// PrivateRoute component - Utilise directement le contexte d'authentification
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
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
  
  // Rediriger les patients vers le formulaire médical s'ils ne l'ont pas encore complété
  if (user && user.role === 'PATIENT' && !user.medicalInfoCompleted && location.pathname !== '/medical-info') {
    return <Navigate to="/medical-info" replace />;
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

// DashboardRedirect component - redirige vers l'URL de dashboard spécifique au rôle
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Utiliser l'URL fournie par le backend si disponible, sinon mapper par rôle
  const target = user.dashboardUrl || {
    PATIENT: '/dashboard/patient',
    DOCTOR: '/dashboard/doctor',
    NURSE: '/dashboard/nurse',
    ADMIN: '/dashboard/admin',
  }[user.role] || '/dashboard';
  return <Navigate to={target} replace />;
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

              {/* Formulaire infos médicales (patient) */}
              <Route path="/medical-info" element={<PrivateRoute><MedicalInfoPage /></PrivateRoute>} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardRedirect />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard/patient"
                element={
                  <RoleBasedRoute roles={['PATIENT']}>
                    <DashboardPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/dashboard/doctor"
                element={
                  <RoleBasedRoute roles={['DOCTOR']}>
                    <DashboardPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/dashboard/nurse"
                element={
                  <RoleBasedRoute roles={['NURSE']}>
                    <DashboardPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <RoleBasedRoute roles={['ADMIN']}>
                    <DashboardPage />
                  </RoleBasedRoute>
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
              
              <Route
                path="/articles"
                element={<PrivateRoute><ArticlesPage /></PrivateRoute>}
              />
              <Route
                path="/articles/new"
                element={<RoleBasedRoute roles={['DOCTOR']}> <NewArticlePage /> </RoleBasedRoute>}
              />
              <Route
                path="/articles/:id"
                element={<PrivateRoute><ArticleDetailPage /></PrivateRoute>}
              />

              {/* Profil routes */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/profile/edit"
                element={
                  <PrivateRoute>
                    <EditProfilePage />
                  </PrivateRoute>
                }
              />

              {/* Routes DICOM - accessibles uniquement aux médecins */}
              <Route
                path="/patients/:patientId/dicom"
                element={
                  <RoleBasedRoute roles={['DOCTOR', 'ADMIN', 'NURSE']}>
                    <PatientDicomImagesPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/patients/:patientId/dicom/:studyId"
                element={
                  <RoleBasedRoute roles={['DOCTOR', 'ADMIN']}>
                    <DicomViewerPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/dicom-viewer/:instanceId"
                element={
                  <RoleBasedRoute roles={['DOCTOR', 'ADMIN', 'NURSE']}>
                    <DicomViewerPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/dicom-viewer/study/:studyId"
                element={
                  <RoleBasedRoute roles={['DOCTOR', 'ADMIN', 'NURSE']}>
                    <DicomViewerPage />
                  </RoleBasedRoute>
                }
              />

              {/* Admin - gestion des utilisateurs */}
              <Route
                path="/admin/users"
                element={
                  <RoleBasedRoute roles={['ADMIN']}>
                    <AdminUsersPage />
                  </RoleBasedRoute>
                }
              />

              {/* Admin - gestion des articles */}
              <Route
                path="/admin/articles"
                element={
                  <RoleBasedRoute roles={['ADMIN']}>
                    <AdminArticlesPage />
                  </RoleBasedRoute>
                }
              />

              {/* Admin - gestion des dossiers médicaux */}
              <Route
                path="/admin/medical-records"
                element={
                  <RoleBasedRoute roles={['ADMIN']}>
                    <AdminMedicalRecordsPage />
                  </RoleBasedRoute>
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