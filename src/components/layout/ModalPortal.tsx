import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
}

/**
 * Composant qui utilise createPortal pour rendre les modales directement dans le body
 * afin d'éviter les problèmes de positionnement et de z-index
 */
const ModalPortal: React.FC<ModalPortalProps> = ({ children, isOpen }) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Vérifier si l'élément existe déjà
    let element = document.getElementById('modal-root');
    
    // S'il n'existe pas, le créer
    if (!element) {
      element = document.createElement('div');
      element.id = 'modal-root';
      document.body.appendChild(element);
    }
    
    setModalRoot(element);

    // Nettoyer lors du démontage du composant
    return () => {
      if (element?.parentNode && element.childNodes.length === 0) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  if (!isOpen || !modalRoot) return null;

  return createPortal(children, modalRoot);
};

export default ModalPortal;
