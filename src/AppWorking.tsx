import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UserHome from './pages/UserHome';
import LoginSimple from './pages/LoginSimple';
import RegisterSimple from './pages/RegisterSimple';
import Services from './pages/Services';
import Categories from './pages/Categories';
import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Landing from './pages/Landing';

function AppWorking() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Page d'accueil publique */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginSimple />} />
            <Route path="/register" element={<RegisterSimple />} />
            
            {/* Routes protégées */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>}>
              {/* Redirection basée sur le rôle */}
              <Route index element={<RoleBasedRedirect />} />

              {/* Routes pour les administrateurs */}
              <Route path="dashboard" element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } />
              <Route path="services" element={
                <AdminRoute>
                  <Services />
                </AdminRoute>
              } />
              <Route path="categories" element={
                <AdminRoute>
                  <Categories />
                </AdminRoute>
              } />
              <Route path="appointments" element={
                <AdminRoute>
                  <Appointments />
                </AdminRoute>
              } />

              {/* Routes pour tous les utilisateurs authentifiés */}
              <Route path="profile" element={<Profile />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="home" element={<UserHome />} />
            </Route>

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default AppWorking;
