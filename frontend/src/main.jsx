import React from 'react';
import { createRoot } from 'react-dom/client'; // Importa createRoot
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // Crea el root

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
