const Notification = require('../models/Notification');

const notificationController = {
  async createNotification(req, res) {
    try {
      const id = await Notification.create(req.body);
      res.json({ success: true, notificationId: id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la notification' });
    }
  },

  async createServiceNotificationForAll(serviceData, action, createdBy) {
    return Notification.createForAllUsers(serviceData, action, createdBy);
  },

  async getUserNotifications(req, res) {
    try {
      const notifications = await Notification.getUserNotifications(req.user.id, req.query);
      res.json({ success: true, notifications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des notifications' });
    }
  },

  async markAsRead(req, res) {
    try {
      const ok = await Notification.markAsRead(req.params.notificationId, req.user.id);
      if (!ok) return res.status(404).json({ success: false, message: 'Notification non trouvée' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors du marquage de la notification' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const count = await Notification.markAllAsRead(req.user.id);
      res.json({ success: true, count });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors du marquage des notifications' });
    }
  },

  async deleteNotification(req, res) {
    try {
      const ok = await Notification.delete(req.params.notificationId, req.user.id);
      if (!ok) return res.status(404).json({ success: false, message: 'Notification non trouvée' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la notification' });
    }
  }
};

module.exports = notificationController;
