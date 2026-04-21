import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const root = document.getElementById('root')!;
const embedded = root.dataset.embedded === 'true';

createRoot(root).render(
  <StrictMode>
    <App embedded={embedded} />
  </StrictMode>,
);
