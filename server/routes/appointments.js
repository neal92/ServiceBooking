const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Récupérer tous les rendez-vous
 *     description: Récupère la liste complète des rendez-vous (généralement pour les admins)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Liste des rendez-vous récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET all appointments (pour admin)
router.get('/', appointmentController.getAllAppointments);

/**
 * @swagger
 * /appointments/client:
 *   get:
 *     summary: Récupérer les rendez-vous d'un client
 *     description: Récupère les rendez-vous associés à l'email d'un client spécifique
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email du client
 *     responses:
 *       200:
 *         description: Rendez-vous du client récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Email manquant
 *       500:
 *         description: Erreur serveur
 */
// GET appointments by client email
router.get('/client', appointmentController.getClientAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Récupérer un rendez-vous par ID
 *     description: Récupère les détails d'un rendez-vous spécifique
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Rendez-vous non trouvé
 *       500:
 *         description: Erreur serveur
 */
// GET appointment by id
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments/check/{date}/{time}:
 *   get:
 *     summary: Vérifier la disponibilité
 *     description: Vérifie si un créneau est disponible à une date et heure données
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date au format YYYY-MM-DD
 *       - in: path
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *         description: Heure au format HH:MM
 *     responses:
 *       200:
 *         description: Disponibilité vérifiée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: True si le créneau est disponible
 *       400:
 *         description: Date ou heure manquante
 *       500:
 *         description: Erreur serveur
 */
// GET check availability for date and time
router.get('/check/:date/:time', appointmentController.checkAvailability);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Créer un nouveau rendez-vous
 *     description: Crée un nouveau rendez-vous (généralement par un client)
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - clientEmail
 *               - clientPhone
 *               - serviceId
 *               - date
 *               - time
 *             properties:
 *               clientName:
 *                 type: string
 *                 description: Nom du client
 *               clientEmail:
 *                 type: string
 *                 format: email
 *                 description: Email du client
 *               clientPhone:
 *                 type: string
 *                 description: Téléphone du client
 *               serviceId:
 *                 type: integer
 *                 description: ID du service
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date du rendez-vous
 *               time:
 *                 type: string
 *                 description: Heure du rendez-vous
 *               notes:
 *                 type: string
 *                 description: Notes additionnelles
 *     responses:
 *       201:
 *         description: Rendez-vous créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID du nouveau rendez-vous
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
// POST create new appointment
router.post('/', appointmentController.createAppointment);

/**
 * @swagger
 * /appointments/admin:
 *   post:
 *     summary: Créer un rendez-vous (Admin)
 *     description: Crée un rendez-vous directement confirmé par un admin
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - clientEmail
 *               - clientPhone
 *               - serviceId
 *               - date
 *               - time
 *             properties:
 *               clientName:
 *                 type: string
 *               clientEmail:
 *                 type: string
 *                 format: email
 *               clientPhone:
 *                 type: string
 *               serviceId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rendez-vous créé avec succès par l'admin
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// POST create appointment by admin (already confirmed)
router.post('/admin', appointmentController.createAppointmentByAdmin);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Mettre à jour un rendez-vous
 *     description: Met à jour les informations d'un rendez-vous existant
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *               clientEmail:
 *                 type: string
 *                 format: email
 *               clientPhone:
 *                 type: string
 *               serviceId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, in-progress, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rendez-vous mis à jour avec succès
 *       404:
 *         description: Rendez-vous non trouvé
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer un rendez-vous
 *     description: Supprime définitivement un rendez-vous
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous à supprimer
 *     responses:
 *       200:
 *         description: Rendez-vous supprimé avec succès
 *       404:
 *         description: Rendez-vous non trouvé
 *       500:
 *         description: Erreur serveur
 */
// PUT update appointment
router.put('/:id', appointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'un rendez-vous
 *     description: Met à jour uniquement le statut d'un rendez-vous
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, in-progress, completed, cancelled]
 *                 description: Nouveau statut du rendez-vous
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *       400:
 *         description: Statut invalide
 *       404:
 *         description: Rendez-vous non trouvé
 *       500:
 *         description: Erreur serveur
 */
// PATCH update appointment status
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// DELETE appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
