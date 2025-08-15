// messaging.js
// Routes pour la messagerie instantanée

const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messagingController');

// Récupérer les messages entre deux utilisateurs
router.get('/messages', messagingController.getMessages);

// Envoyer un message
router.post('/messages', messagingController.sendMessage);

// Marquer les messages comme lus
router.post('/messages/read', messagingController.markAsRead);

module.exports = router;
