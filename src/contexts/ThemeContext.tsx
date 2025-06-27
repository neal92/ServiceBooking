import React, { createContext, useState, useContext, useEffect } from 'react';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // Récupérer la préférence depuis localStorage lors de l'initialisation
        const savedMode = localStorage.getItem('darkMode');

        // Si une préférence existe, l'utiliser
        if (savedMode !== null) {
            return savedMode === 'true';
        }

        // Sinon, détecter la préférence du système
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Appliquer le mode sombre au document HTML
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Sauvegarder la préférence dans localStorage
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    // Écouter les changements de préférence du système
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            // Ne mettre à jour que si l'utilisateur n'a pas de préférence explicite
            if (localStorage.getItem('darkMode') === null) {
                setDarkMode(e.matches);
            }
        };

        // Écouter les changements
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        // Fallback pour les anciens navigateurs
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('darkMode', newMode.toString());
            return newMode;
        });
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme doit être utilisé dans un ThemeProvider');
    }

    return context;
};
