import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { useFloodStore } from './store/useFloodStore';

if (typeof window !== 'undefined') {
  (window as any).useFloodStore = useFloodStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
