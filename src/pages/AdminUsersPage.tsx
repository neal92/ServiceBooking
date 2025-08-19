import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  pseudo?: string;
  avatar?: string;
  total_rendezvous?: number;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    pseudo: '',
    role: 'client',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Correction : s'assurer que response.data est bien un tableau
        const userList = Array.isArray(response.data) ? response.data : response.data.users || [];
        setUsers(userList);
      } catch (err: any) {
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const [showDeletedPopup, setShowDeletedPopup] = useState(false);
  // Ajoute la fonction de suppression
  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setConfirmUser(user || null);
  };

  const confirmDelete = async () => {
    if (!confirmUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/auth/users/${confirmUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('[AdminUsersPage] Suppression utilisateur:', res.data);
      setUsers(users.filter(u => u.id !== confirmUser.id));
      setConfirmUser(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('[AdminUsersPage] Erreur suppression:', err.response?.data || err.message);
      } else {
        console.error('[AdminUsersPage] Erreur suppression:', err);
      }
      setError('Erreur lors de la suppression de l’utilisateur');
      setConfirmUser(null);
    }
  };

  const cancelDelete = () => setConfirmUser(null);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded font-semibold shadow transition-all"
          onClick={() => setShowAddModal(true)}
        >
          Ajouter
        </button>
      </div>
  <div className="my-8"></div>

      {/* Modal d'ajout utilisateur - step by step */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => { setShowAddModal(false); setFormStep(0); setFormError(null); setFormData({ firstName: '', email: '', password: '', pseudo: '', role: 'client' }); }}>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-6 text-blue-700 dark:text-blue-300">Inscription nouvel utilisateur</h2>
            {formError && <div className="mb-4 text-red-600 text-sm">{formError}</div>}
            <form onSubmit={async e => {
              e.preventDefault();
              setFormError(null);
              if (formStep === 0) {
                if (!formData.firstName) {
                  setFormError('Le prénom est obligatoire.');
                  return;
                }
                setFormStep(1);
                return;
              }
              if (formStep === 1) {
                if (!formData.email) {
                  setFormError('L\'email est obligatoire.');
                  return;
                }
                // Création utilisateur directement
                try {
                  const token = localStorage.getItem('token');
                  const payload = {
                    firstName: formData.firstName || '',
                    lastName: '', // toujours chaîne vide, jamais le prénom
                    email: formData.email || '',
                    pseudo: '',
                    password: 'admin123',
                    role: 'user',
                  };
                  const res = await axios.post('/api/auth/register', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setUsers([...users, res.data]);
                  setShowAddModal(false);
                  setFormStep(0);
                  setFormData({ firstName: '', email: '', password: '', pseudo: '', role: 'client' });
                } catch (err) {
                  // Cast en AxiosError pour accéder à response.data
                  const error = err as any;
                  if (error?.response?.data) {
                    setFormError(
                      error.response.data.message ||
                      (error.response.data.errors ? JSON.stringify(error.response.data.errors) : "Erreur lors de l'inscription.")
                    );
                  } else {
                    setFormError("Erreur lors de l'inscription.");
                  }
                }
              }
            }}>
              {/* Prénom */}
              {formStep === 0 && (
                <>
                  <input type="text" placeholder="Prénom *" className="w-full px-3 py-2 border rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} required />
                  <button type="submit" className="mt-6 w-full py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">Suivant</button>
                </>
              )}
              {/* Email */}
              {formStep === 1 && (
                <>
                  <input type="email" placeholder="Email *" className="w-full px-3 py-2 border rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
                  <button type="submit" className="mt-6 w-full py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-800 transition-colors">Créer l'utilisateur</button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="mb-8"></div>
          <table className="min-w-full border bg-white dark:bg-gray-800 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                {/* <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">ID</th> */}
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Prénom</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Email</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Pseudo</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Rôle</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Nb rendez-vous complétés</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => user.role !== 'admin').map((user, idx) => (
                <tr key={user.id ? user.id : idx} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.firstName}</td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.email}</td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.pseudo || '-'}</td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.role}</td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.total_rendezvous ?? 0}</td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-center">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Pop-up de confirmation */}
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Êtes-vous sûr de vouloir supprimer {confirmUser.email} ?</h2>
            <div className="flex justify-end gap-2">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                onClick={confirmDelete}
              >
                Oui, supprimer
              </button>
              <button
                className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded font-semibold"
                onClick={cancelDelete}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
