import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';          // ← we will add the CSS here (see §2)

/* ---------- tiny viewport-fix script ---------- */
function setRealVH() {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--1dvh', `${vh / 100}px`);
}
setRealVH();                                                 // first paint
window.visualViewport?.addEventListener('resize', setRealVH); // chrome hides/shows

/* ---------- mount ---------- */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);