import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'zoom' | 'slideBottom';
  className?: string;
}

const PageTransition = ({ 
  children, 
  type = 'fade', 
  className = '' 
}: PageTransitionProps) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Reset the animation when the route changes
  useEffect(() => {
    setIsVisible(false);
    
    // Small delay to ensure the animation plays
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Determine which animation class to use based on the type prop
  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (type) {
      case 'slide':
        return 'animate-slideIn-right';
      case 'slideBottom':
        return 'animate-slideIn-bottom';
      case 'zoom':
        return 'animate-zoomIn';
      case 'fade':
      default:
        return 'animate-fadeIn';
    }
  };
  
  return (
    <div className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;
