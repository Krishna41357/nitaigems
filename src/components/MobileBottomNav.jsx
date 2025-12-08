import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Gem, ShoppingCart, Package } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/products', icon: Gem, label: 'Products' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart' },
    { path: '/orders', icon: Package, label: 'Orders' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed left-0 right-0 bottom-0 bg-[#fdfcf9] shadow-[0_-2px_6px_rgba(0,0,0,0.08)] z-[99999] md:hidden">
      <div className="h-[70px] pb-[env(safe-area-inset-bottom)]">
        <ul className="h-full flex items-center justify-around m-0 p-0 list-none">
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path} className="flex-1 text-center">
              <button
                onClick={() => navigate(path)}
                className={`flex flex-col items-center justify-center w-full h-full py-2 transition-colors ${
                  isActive(path) ? 'text-[#b38e5d]' : 'text-[#d4b483]'
                }`}
                aria-label={label}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px]">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default MobileBottomNav;