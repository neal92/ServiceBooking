import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import LandingSimple from './LandingSimple';
import Login from './pages/Login';
import Register from './pages/Register';

function AppMinimal() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingSimple />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Page non trouvée</h1>
                  <a href="/" className="text-blue-600 hover:underline">Retour à l'accueil</a>
                </div>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default AppMinimal;
