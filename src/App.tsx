import * as React from 'react';
import Messaging from './components/messaging/Messaging';
import { useAuth } from './contexts/AuthContext';
import { User } from './types';
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


function MessagingButtonAndModal({ usersList }: { usersList: User[] }) {
  const { user } = useAuth();
  const [showMessaging, setShowMessaging] = React.useState(false);
  return (
    <>
      {user && (
        <button
          className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
          onClick={() => setShowMessaging(true)}
          type="button"
          style={{ position: 'fixed', bottom: 32, right: 32 }}
        >
          {/* Icône enveloppe */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <polyline points="3,7 12,13 21,7" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      )}
      {showMessaging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex items-center justify-center w-full h-full">
            <div className="relative mx-auto">
              <div className="absolute -top-6 right-0">
                <button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full p-2 shadow flex items-center justify-center" onClick={() => setShowMessaging(false)} aria-label="Fermer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" stroke="currentColor" />
                    <line x1="6" y1="18" x2="18" y2="6" strokeWidth="2" stroke="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="mb-4 text-center text-2xl font-bold text-blue-700 dark:text-blue-300">Messagerie</div>
              <Messaging usersList={usersList} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const [usersList, setUsersList] = React.useState<User[]>([]);

  React.useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem('token');
      let url = '/api/auth/users';
      // Si le user n'est pas admin, on récupère seulement les admins
      try {
        // On récupère le user depuis le localStorage
        const userStr = localStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) : null;
        if (userObj && userObj.role !== 'admin') {
          url = '/api/auth/users/admins';
        }
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const userList = Array.isArray(data) ? data : data.users || [];
        setUsersList(userList);
      } catch (err) {
        setUsersList([]);
      }
    }
    fetchUsers();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <>
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
                </ProtectedRoute>
              }>
                {/* Redirection basée sur le rôle */}
                <Route index element={<RoleBasedRedirect />} />
                {/* Routes pour les administrateurs */}
                <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="services" element={<AdminRoute><Services /></AdminRoute>} />
                <Route path="categories" element={<AdminRoute><Categories /></AdminRoute>} />
                <Route path="gestionusers" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
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
            <MessagingButtonAndModal usersList={usersList} />
          </>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
