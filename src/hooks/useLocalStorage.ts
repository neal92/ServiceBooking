import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Etat pour stocker notre valeur
  // On passe une fonction à useState pour qu'elle ne soit exécutée qu'une fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Récupérer depuis localStorage
      const item = window.localStorage.getItem(key);
      // Analyser le JSON stocké ou retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si une erreur se produit, retourner initialValue
      console.log(error);
      return initialValue;
    }
  });
  
  // Ecouter les changements dans d'autres onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          // Mettre à jour l'état local si le localStorage change
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Erreur lors du parsing de la valeur du stockage:', error);
        }
      }
    };
    
    // Ajouter un écouteur pour les événements de stockage
    window.addEventListener('storage', handleStorageChange);
    
    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);
  
  // Retourner la paire [valeur, fonction de mise à jour]
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à la valeur d'être une fonction
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Sauvegarder dans l'état
      setStoredValue(valueToStore);
      // Sauvegarder dans localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // En cas d'erreur
      console.log(error);
    }
  };
  
  return [storedValue, setValue];
}

export default useLocalStorage;
