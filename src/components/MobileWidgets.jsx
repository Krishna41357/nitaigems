import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './MobileWidgets.css';

export default function MobileWidgets() {
  const location = useLocation();
  const [showWpPop, setShowWpPop] = useState(false);

  /* WhatsApp popup timer – unchanged */
  useEffect(() => {
    const t1 = setTimeout(() => setShowWpPop(true), 2000);
    const int = setInterval(() => setShowWpPop(true), 15000);
    return () => { clearTimeout(t1); clearInterval(int); };
  }, []);
  useEffect(() => {
    if (showWpPop) { const t = setTimeout(() => setShowWpPop(false), 3000); return () => clearTimeout(t); }
  }, [showWpPop]);

  const navItems = [
    { path: '/',         icon: 'fa-solid fa-house',       label: 'Home' },
    { path: '/products', icon: 'fa-solid fa-gem',         label: 'Products' },
    { path: '/cart',     icon: 'fa-solid fa-cart-shopping', label: 'Cart' },
    { path: '/orders',   icon: 'fa-solid fa-box',         label: 'Orders' },
  ];

  /* 👇  fragment returned – CSS already does position: fixed */
  return (
    <>
      {/* WhatsApp floating button + popup */}
      <div id="getbutton-wrapper">
        {showWpPop && (
          <div id="getbutton-popup" className="slide-in">
            👋 Need help? Chat with us!
          </div>
        )}
        <a
          id="getbutton-btn"
          href="https://wa.me/916350288120?text=Hello!%20I%20need%20help%20from%20your%20website."
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setShowWpPop(false)}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
          />
        </a>
      </div>

      {/* Mobile bottom nav – already fixed by CSS */}
      <nav id="mobile-bottom-nav">
        <ul>
          {navItems.map(({ path, icon, label }) => (
            <li key={path}>
              <a
                href={path}
                className={location.pathname === path ? 'active' : ''}
                aria-label={label}
              >
                <i className={icon} />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}