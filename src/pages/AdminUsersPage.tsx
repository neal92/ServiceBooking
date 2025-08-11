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
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">ID</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Nom</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Prénom</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Email</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Pseudo</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Rôle</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-gray-700 dark:text-gray-200">Nb rendez-vous complétés</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.id}</td>
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.lastName}</td>
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.firstName}</td>
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.email}</td>
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.pseudo || '-'}</td>
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.role}</td>
                <td className="py-2 px-4 border dark:border-gray-700 text-gray-900 dark:text-gray-100">{user.total_rendezvous ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsersPage;
