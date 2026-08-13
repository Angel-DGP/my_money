import React from 'react'; // HMR refresh
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { pingServerWarmup } from './shared/hooks/useServerWarmup';

// Start warming up backend immediately in the background on page load
pingServerWarmup();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
