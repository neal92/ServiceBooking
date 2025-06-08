const fetch = require('node-fetch');

async function testAvatar() {
  try {
    // Essayer de récupérer un avatar prédéfini
    const avatarUrl = 'http://localhost:5000/avatars/avatar1.svg';
    console.log(Tentative de récupération de l'avatar: );
    
    const response = await fetch(avatarUrl);
    if (!response.ok) {
      console.error(Erreur lors de la récupération de l'avatar:  );
    } else {
      const content = await response.text();
      console.log(Avatar récupéré avec succès, taille:  caractères);
      console.log(Type de contenu: );
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
}

testAvatar();
