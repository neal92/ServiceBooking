// MessagingController.js
// Contrôleur pour la gestion de la messagerie instantanée

const Message = require('../models/Message');
const messages = [];

module.exports = {
  // Récupérer les messages entre deux utilisateurs
  getMessages: (req, res) => {
    const { userId, otherId } = req.query;
    const chatMessages = messages.filter(
      msg => (msg.from === userId && msg.to === otherId) || (msg.from === otherId && msg.to === userId)
    );
    res.json(chatMessages);
  },

  // Envoyer un nouveau message
  sendMessage: (req, res) => {
    const { from, to, text } = req.body;
    if (!from || !to || !text) return res.status(400).json({ error: 'Missing fields' });
    const newMsg = new Message({
      id: Math.random().toString(36).slice(2),
      from,
      to,
      text,
      read: false,
      timestamp: Date.now(),
    });
    messages.push(newMsg);
    res.json(newMsg);
  },

  // Marquer les messages comme lus
  markAsRead: (req, res) => {
    const { userId, otherId } = req.body;
    messages.forEach(msg => {
      if (msg.from === otherId && msg.to === userId) {
        msg.read = true;
      }
    });
    res.json({ success: true });
  }
};
