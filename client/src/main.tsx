import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// App.css silindi: hiçbir yerden import edilmiyordu ve içindeki kurallar
// tanımsız CSS değişkenlerine (--accent, --border, --text-h, --social-bg,
// --shadow) dayanan Vite başlangıç şablonundan kalmaydı.

const root = document.getElementById('root');
if (!root) throw new Error('#root bulunamadı. index.html kontrol edin.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
