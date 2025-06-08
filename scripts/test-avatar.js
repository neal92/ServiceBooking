const https = require('https');
const fs = require('fs');
const path = require('path');

// URL d'un seul avatar pour tester
const avatarUrl = 'https://api.dicebear.com/7.x/shapes/svg?seed=Felix&backgroundColor=effeff';
const outputFile = path.join(__dirname, '..', 'public', 'avatars', 'test-avatar.svg');

console.log('Début du téléchargement...');
console.log('URL:', avatarUrl);
console.log('Destination:', outputFile);

const file = fs.createWriteStream(outputFile);
https.get(avatarUrl, response => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Avatar téléchargé avec succès !');
    });
}).on('error', err => {
    fs.unlink(outputFile, () => {});
    console.error('Erreur lors du téléchargement:', err.message);
});
