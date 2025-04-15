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

// PrivateRoute component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

// RoleBasedRoute component for doctor/patient/admin specific pages
const RoleBasedRoute = ({ roles, children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return currentUser && roles.includes(currentUser.role)
      ? children
      : <Navigate to="/dashboard" />;
};

function App() {
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