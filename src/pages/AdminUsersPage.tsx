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
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full border bg-white dark:bg-gray-800 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              {/* <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">ID</th> */}
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Nom</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Prénom</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Email</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Pseudo</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Rôle</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Nb rendez-vous complétés</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(user => user.role !== 'admin').map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                {/* <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.id}</td> */}
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.lastName}</td>
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
