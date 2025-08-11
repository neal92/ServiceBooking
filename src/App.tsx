import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UserHome from './pages/UserHome';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Categories from './pages/Categories';
import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import BookService from './pages/BookService';
import ServiceDetail from './pages/ServiceDetail';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Page d'accueil publique */}
            <Route path="/" element={<Landing />} />
            <Route path="/book" element={<BookService />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
              <Route path="gestionusers" element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              } />

              {/* Route d'accueil pour les utilisateurs normaux */}
              <Route path="home" element={<UserHome />} />

              {/* Routes communes */}
              <Route path="appointments" element={<Appointments />} />
              {/* Page temporaire en attendant la reconstruction du calendrier */}
              <Route path="calendar" element={<Calendar />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;