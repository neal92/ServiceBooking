// Controller pour retourner uniquement les utilisateurs admin
const User = require('../models/user');

exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    const admins = users.filter(u => u.role === 'admin');
    res.json({ users: admins });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des administrateurs.' });
  }
};
