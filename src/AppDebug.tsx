import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
// Test 5: Importer les vrais composants
import Login from './pages/Login';
import Register from './pages/Register';

function AppDebug() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    ServiceBooking - Debug Mode
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Test 5: Router + Providers + Vrais composants
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg shadow">
                      <h2 className="text-lg font-semibold mb-2">Page d'accueil</h2>
                      <p className="text-gray-600">Route "/" - Test réussi ✅</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <a 
                        href="/login" 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Tester /login
                      </a>
                      <a 
                        href="/register" 
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Tester /register
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/login" element={
              <div className="min-h-screen bg-gray-100">
                <div className="text-center p-4 bg-white rounded-lg m-4">
                  <h2 className="text-xl mb-4">Test 5A: Composant Login réel</h2>
                  <p className="text-gray-600 mb-4">Test du vrai composant Login.tsx</p>
                </div>
                <Login />
              </div>
            } />
            <Route path="/register" element={
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Page d'Inscription - Test
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">
                    Route "/register" fonctionne ✅
                  </p>
                  <a 
                    href="/" 
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            } />
            <Route path="/app" element={
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Route /app - Test
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">
                    Redirection depuis Login réussie ✅
                  </p>
                  <p className="text-gray-500 mb-4">
                    Login.tsx redirige automatiquement vers /app quand l'utilisateur est connecté
                  </p>
                  <a 
                    href="/" 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default AppDebug;
