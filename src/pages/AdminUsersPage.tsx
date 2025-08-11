import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Remplace par ton endpoint API réel
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-900 dark:text-white">Gestion des utilisateurs</h1>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-300">Chargement...</div>
        ) : (
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900/30">
                <th className="py-3 px-4 text-left text-blue-900 dark:text-white">ID</th>
                <th className="py-3 px-4 text-left text-blue-900 dark:text-white">Nom</th>
                <th className="py-3 px-4 text-left text-blue-900 dark:text-white">Email</th>
                <th className="py-3 px-4 text-left text-blue-900 dark:text-white">Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-200">{user.id}</td>
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-200">{user.name}</td>
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-200">{user.email}</td>
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-200">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
