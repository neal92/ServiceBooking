// filepath: c:\Users\adrie\OneDrive\Documents\Perso\ServiceBooking\src\main.tsx
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
