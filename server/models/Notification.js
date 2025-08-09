const db = require('../config/db');

const Notification = {
  async create(notificationData) {
    // Crée une notification globale (sans user_id)
    const { type, title, message, related_id, related_type, created_by } = notificationData;
    const query = `
      INSERT INTO notifications (type, title, message, related_id, related_type, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      type, title, message, related_id, related_type, created_by
    ]);
    return result.insertId;
  },

  async createForAllUsers(serviceData, action, createdBy) {
    // Crée une notification globale puis la lie à tous les utilisateurs (y compris le créateur)
    let usersQuery = 'SELECT id FROM users';
    const [users] = await db.execute(usersQuery);
    const actionMessages = {
      created: {
        title: 'Nouvelle prestation disponible',
        message: `La prestation "${serviceData.name}" a été ajoutée`
      },
      updated: {
        title: 'Prestation modifiée',
        message: `La prestation "${serviceData.name}" a été modifiée`
      },
      deleted: {
        title: 'Prestation supprimée',
        message: `La prestation "${serviceData.name}" a été supprimée`
      }
    };
    const { title, message } = actionMessages[action];
    // 1. Créer la notification globale
    const notificationId = await Notification.create({
      type: 'service',
      title,
      message,
      related_id: serviceData.id,
      related_type: 'service',
      created_by: createdBy || (users[0] ? users[0].id : null)
    });
    // 2. Lier à chaque utilisateur
    for (const user of users) {
      await db.execute(
        'INSERT INTO notification_users (notification_id, user_id, is_read) VALUES (?, ?, 0)',
        [notificationId, user.id]
      );
    }
    return notificationId;
  },

  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    // Sécurise les paramètres
    const safeLimit = Math.max(1, Number.parseInt(limit) || 20);
    const safePage = Math.max(1, Number.parseInt(page) || 1);
    const offset = (safePage - 1) * safeLimit;
    let query = `
      SELECT n.*, nu.is_read, nu.read_at
      FROM notifications n
      JOIN notification_users nu ON nu.notification_id = n.id
      WHERE nu.user_id = ?
    `;
    const queryParams = [userId];
    if (unreadOnly === true || unreadOnly === 'true') query += ' AND nu.is_read = 0';
    // Injecte LIMIT/OFFSET directement dans la requête pour éviter le bug
    query += ` ORDER BY n.created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`;
    try {
      const [notifications] = await db.execute(query, queryParams);
      return notifications;
    } catch (error) {
      console.error('Erreur SQL getUserNotifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notification_users
      SET is_read = 1, read_at = CURRENT_TIMESTAMP
      WHERE notification_id = ? AND user_id = ?
    `;
    const [result] = await db.execute(query, [notificationId, userId]);
    return result.affectedRows > 0;
  },

  async markAllAsRead(userId) {
    const query = `
      UPDATE notification_users
      SET is_read = 1, read_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND is_read = 0
    `;
    const [result] = await db.execute(query, [userId]);
    return result.affectedRows;
  },

  async delete(notificationId, userId) {
    // Supprime le lien pour l'utilisateur, pas la notification globale
    const query = 'DELETE FROM notification_users WHERE notification_id = ? AND user_id = ?';
    const [result] = await db.execute(query, [notificationId, userId]);
    return result.affectedRows > 0;
  }
};

module.exports = Notification;
