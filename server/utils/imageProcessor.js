const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Configuration des tailles d'images pour les services
 */
const IMAGE_CONFIGS = {
  services: {
    // Image principale pour les cartes de services
    main: {
      width: 400,
      height: 300,
      quality: 85,
      format: 'jpeg'
    },
    // Thumbnail pour les listes compactes
    thumbnail: {
      width: 150,
      height: 150,
      quality: 80,
      format: 'jpeg'
    }
  },
  categories: {
    main: {
      width: 300,
      height: 200,
      quality: 85,
      format: 'jpeg'
    }
  }
};

/**
 * Redimensionne et optimise une image
 * @param {Buffer} imageBuffer - Buffer de l'image source
 * @param {Object} config - Configuration de redimensionnement
 * @returns {Promise<Buffer>} - Buffer de l'image redimensionnée
 */
async function resizeImage(imageBuffer, config) {
  try {
    let sharpInstance = sharp(imageBuffer);

    // Redimensionnement avec conservation du ratio
    sharpInstance = sharpInstance.resize(config.width, config.height, {
      fit: 'cover', // Coupe l'image pour remplir exactement les dimensions
      position: 'center' // Centre l'image lors du recadrage
    });

    // Conversion au format souhaité avec qualité
    if (config.format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ 
        quality: config.quality,
        progressive: true // JPEG progressif pour un chargement plus fluide
      });
    } else if (config.format === 'png') {
      sharpInstance = sharpInstance.png({ 
        quality: config.quality,
        compressionLevel: 6
      });
    } else if (config.format === 'webp') {
      sharpInstance = sharpInstance.webp({ 
        quality: config.quality 
      });
    }

    return await sharpInstance.toBuffer();
  } catch (error) {
    throw new Error(`Erreur lors du redimensionnement de l'image: ${error.message}`);
  }
}

/**
 * Traite et sauvegarde une image de service avec plusieurs tailles
 * @param {Object} file - Fichier uploadé (express-fileupload)
 * @param {string} serviceId - ID du service
 * @param {string} uploadsDir - Répertoire de destination
 * @returns {Promise<Object>} - Informations sur les fichiers créés
 */
async function processServiceImage(file, serviceId, uploadsDir) {
  try {
    const originalBuffer = file.data;
    const baseFilename = `service_${serviceId}_${Date.now()}`;
    const results = {};

    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Image principale
    const mainConfig = IMAGE_CONFIGS.services.main;
    const mainBuffer = await resizeImage(originalBuffer, mainConfig);
    const mainFilename = `${baseFilename}_main.${mainConfig.format}`;
    const mainPath = path.join(uploadsDir, mainFilename);
    
    fs.writeFileSync(mainPath, mainBuffer);
    results.main = {
      filename: mainFilename,
      path: mainPath,
      size: mainBuffer.length,
      dimensions: `${mainConfig.width}x${mainConfig.height}`
    };

    // Thumbnail
    const thumbConfig = IMAGE_CONFIGS.services.thumbnail;
    const thumbBuffer = await resizeImage(originalBuffer, thumbConfig);
    const thumbFilename = `${baseFilename}_thumb.${thumbConfig.format}`;
    const thumbPath = path.join(uploadsDir, thumbFilename);
    
    fs.writeFileSync(thumbPath, thumbBuffer);
    results.thumbnail = {
      filename: thumbFilename,
      path: thumbPath,
      size: thumbBuffer.length,
      dimensions: `${thumbConfig.width}x${thumbConfig.height}`
    };

    return {
      success: true,
      originalSize: file.size,
      processedImages: results,
      mainImage: mainFilename // Nom du fichier principal à sauvegarder en base
    };

  } catch (error) {
    console.error(`❌ Erreur lors du traitement de l'image pour le service ${serviceId}:`, error);
    throw new Error(`Erreur lors du traitement de l'image: ${error.message}`);
  }
}

/**
 * Traite et sauvegarde une image de catégorie
 * @param {Object} file - Fichier uploadé (express-fileupload)
 * @param {string} categoryId - ID de la catégorie
 * @param {string} uploadsDir - Répertoire de destination
 * @returns {Promise<Object>} - Informations sur le fichier créé
 */
async function processCategoryImage(file, categoryId, uploadsDir) {
  try {
    const originalBuffer = file.data;
    const config = IMAGE_CONFIGS.categories.main;
    const filename = `category_${categoryId}_${Date.now()}.${config.format}`;
    const filePath = path.join(uploadsDir, filename);

    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Redimensionner et sauvegarder
    const resizedBuffer = await resizeImage(originalBuffer, config);
    fs.writeFileSync(filePath, resizedBuffer);

    return {
      success: true,
      filename: filename,
      originalSize: file.size,
      processedSize: resizedBuffer.length,
      dimensions: `${config.width}x${config.height}`,
      path: filePath
    };

  } catch (error) {
    throw new Error(`Erreur lors du traitement de l'image de catégorie: ${error.message}`);
  }
}

/**
 * Supprime les fichiers d'images associés à un service
 * @param {string} imageFilename - Nom du fichier principal
 * @param {string} uploadsDir - Répertoire des uploads
 */
function deleteServiceImages(imageFilename, uploadsDir) {
  try {
    // Extraire le nom de base du fichier
    const baseName = imageFilename.replace('_main.jpeg', '').replace('_main.jpg', '');
    
    // Supprimer l'image principale et le thumbnail
    const mainPath = path.join(uploadsDir, imageFilename);
    const thumbPath = path.join(uploadsDir, `${baseName}_thumb.jpeg`);
    
    if (fs.existsSync(mainPath)) {
      fs.unlinkSync(mainPath);
    }
    
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression des images: ${error.message}`);
  }
}

/**
 * Obtient les informations sur une image (dimensions, taille, etc.)
 * @param {string} imagePath - Chemin vers l'image
 * @returns {Promise<Object>} - Métadonnées de l'image
 */
async function getImageInfo(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = fs.statSync(imagePath);
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      density: metadata.density
    };
  } catch (error) {
    throw new Error(`Erreur lors de la lecture des métadonnées: ${error.message}`);
  }
}

module.exports = {
  processServiceImage,
  processCategoryImage,
  deleteServiceImages,
  getImageInfo,
  IMAGE_CONFIGS,
  resizeImage
};
