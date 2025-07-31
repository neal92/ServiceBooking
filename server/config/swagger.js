const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ServiceBooking API',
      version: '1.0.0',
      description: 'API de gestion des rendez-vous pour ServiceBooking',
      contact: {
        name: 'ServiceBooking Team',
        email: 'contact@servicebooking.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur'
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              description: 'Rôle de l\'utilisateur'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du compte'
            }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique du rendez-vous'
            },
            clientFname: {
              type: 'string',
              description: 'Nom du client'
            },
            clientEmail: {
              type: 'string',
              format: 'email',
              description: 'Email du client'
            },
            clientPhone: {
              type: 'string',
              description: 'Téléphone du client'
            },
            serviceId: {
              type: 'integer',
              description: 'ID du service réservé'
            },
            serviceName: {
              type: 'string',
              description: 'Nom du service'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date du rendez-vous (YYYY-MM-DD)'
            },
            time: {
              type: 'string',
              description: 'Heure du rendez-vous (HH:MM)'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
              description: 'Statut du rendez-vous'
            },
            notes: {
              type: 'string',
              description: 'Notes additionnelles'
            },
            createdBy: {
              type: 'string',
              enum: ['client', 'admin'],
              description: 'Créé par client ou admin'
            },
            price: {
              type: 'number',
              description: 'Prix du service'
            },
            duration: {
              type: 'integer',
              description: 'Durée en minutes'
            }
          }
        },
        Service: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique du service'
            },
            name: {
              type: 'string',
              description: 'Nom du service'
            },
            description: {
              type: 'string',
              description: 'Description du service'
            },
            price: {
              type: 'number',
              description: 'Prix du service'
            },
            duration: {
              type: 'integer',
              description: 'Durée en minutes'
            },
            categoryId: {
              type: 'integer',
              description: 'ID de la catégorie'
            },
            color: {
              type: 'string',
              description: 'Couleur pour l\'affichage'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de la catégorie'
            },
            name: {
              type: 'string',
              description: 'Nom de la catégorie'
            },
            description: {
              type: 'string',
              description: 'Description de la catégorie'
            },
            color: {
              type: 'string',
              description: 'Couleur pour l\'affichage'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Chemins vers les fichiers contenant les annotations
};

const specs = swaggerJSDoc(options);
module.exports = specs;
