const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Récupérer les notifications de l'utilisateur connecté
router.get('/', notificationController.getUserNotifications);

// Marquer une notification comme lue
router.patch('/:notificationId/read', notificationController.markAsRead);

// Marquer toutes les notifications comme lues
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Supprimer une notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
