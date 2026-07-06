import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TelegramProvider } from './context/TelegramContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <TelegramProvider>
        <App />
      </TelegramProvider>
    </LanguageProvider>
  </React.StrictMode>
);
