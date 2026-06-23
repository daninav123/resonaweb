import React from 'react';
import ReactDOM from 'react-dom/client';
import { initGoogleAds, initMetaPixel } from '@resona/utils';
import App from './App';
import './index.css';

initGoogleAds();
initMetaPixel();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
