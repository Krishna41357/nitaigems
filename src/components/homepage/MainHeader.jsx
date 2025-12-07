import React, { useState, useEffect, useRef } from 'react';
import { Heart, User, ShoppingCart, Search } from 'lucide-react';
import { useCart, useWishlist } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import UserLoginModal from '../../components/auth/UserLoginModal';
import { useNavigate, useLocation } from 'react-router-dom';

const MainHeader = ({ logoUrl = '../media/logo/logo.jpg', onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dropdownRef = useRef(null);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const isOnProductsPage = location.pathname.startsWith('/products');
      
      if (isOnProductsPage) {
        navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      }
      setShowMobileSearch(false);
    }
  };

  const handleNavigation = (path) => {
    if (path === '/cart') {
      navigate('/cart', { state: { from: location.pathname } });
      return;
    }

    navigate(path);
  };

  const handleUserAction = (action) => {
    setShowUserDropdown(false);

    switch (action) {
      case 'account':
        handleNavigation('/account');
        break;
      case 'orders':
        handleNavigation('/orders');
        break;
      case 'logout':
        logout();
        handleNavigation('/');
        break;
      case 'login':
        setShowLoginModal(true);
        break;
      case 'signup':
        handleNavigation('/signup');
        break;
      default:
        break;
    }
  };

  const iconColor = "#b8860b";
  const headerFont = "'Cinzel', 'Playfair Display', serif";

  return (
    <React.Fragment>
      {/* Wrapper div for header and dropdown */}
      <div className="sticky top-0 z-50 header-wrapper">
        <header
          style={{ fontFamily: headerFont }}
          className={`border-b bg-[#fbf6ef] border-transparent transition-shadow duration-200 relative ${
            isScrolled ? 'shadow-md' : ''
          }`}
        >
          <div className="max-w-6xl mx-auto border-none px-4">
            <div className="flex items-center justify-between h-16 md:h-22 gap-4 py-2">
              {/* Left Section - Logo */}
              <div className="flex items-center border-none p-0 m-0 w-auto h-auto">
                <button
                  onClick={() => handleNavigation('/')}
                  className="p-0 m-0 border-none bg-transparent flex items-center justify-center w-auto h-auto"
                  aria-label="Go to home"
                >
                  <img
                    src="./logo/logo.png"
                    alt="Logo"
                    className="h-10 md:h-20 w-32 p-4 object-cover bg-transparent"
                  />
                </button>
              </div>

              {/* Center Section - Search Bar */}
              <div className="flex flex-1 justify-center mx-6">
                <div className="w-full max-w-lg">
                  <form onSubmit={handleSearch} className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Search size={18} color={iconColor} strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                      placeholder="Search for jewellery, collections, stones..."
                      className="w-full pl-12 pr-4 py-2.5 bg-white/95 border border-[#efe6d9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#e9d6a1] focus:border-[#d4a055] text-sm text-[#3b1b12] placeholder-[#a88a60] shadow-sm"
                    />
                  </form>
                </div>
              </div>

              {/* Right Section - Icons */}
              <div className="flex items-center gap-4">
                {/* Wishlist */}
                <button
                  onClick={() => handleNavigation('/wishlist')}
                  className="p-2 bg-transparent relative group hover:scale-105 transition-transform"
                  aria-label="Wishlist"
                >
                  <Heart size={20} color={iconColor} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
                      {wishlistCount}
                    </span>
                  )}
                  <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3b1b12] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[60]">
                    Wishlist
                  </span>
                </button>

                {/* User Profile */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="p-2 bg-transparent relative group hover:scale-105 transition-transform"
                    aria-label="User account"
                  >
                    <User size={20} color={iconColor} strokeWidth={1.5} />
                    <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3b1b12] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[60]">
                      Account
                    </span>
                  </button>
                </div>

                {/* Cart */}
                <button
                  onClick={() => handleNavigation('/cart')}
                  className="p-2 bg-transparent relative group hover:scale-105 transition-transform"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart size={22} color={iconColor} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                  <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[60]">
                    Cart
                  </span>
                </button>
              </div>
            </div>
          </div>

          {showMobileSearch && (
            <div className="md:hidden bg-transparent border-b border-transparent px-4 py-3">
              <div className="relative flex items-center">
                <div className="absolute left-4">
                  <Search size={18} color="#000000" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Search for jewellery..."
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-black rounded-full focus:outline-none focus:ring-1 focus:ring-black text-sm text-black placeholder-gray-500"
                  autoFocus
                />
              </div>
            </div>
          )}
        </header>

        {/* User Dropdown - Outside header to avoid overflow restrictions */}
        {showUserDropdown && (
          <div
            style={{
              position: 'absolute',
              right: '4rem',
              top: '100%',
              zIndex: 100,
              marginTop: '0.5rem'
            }}
            className="w-48 bg-white border border-[#efe6d9] rounded-lg shadow-lg py-2 animate-fadeIn pointer-events-auto"
          >
            {isAuthenticated ? (
              <>
                {user && (
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => handleUserAction('account')}
                  className="w-full text-left bg-white text-black hover:border-none border-none px-4 py-2 hover:bg-gray-50 text-sm transition-colors"
                >
                  My Account
                </button>
                <button
                  onClick={() => handleUserAction('orders')}
                  className="w-full text-left px-4 py-2 bg-white text-black hover:border-none hover:bg-gray-50 text-sm transition-colors"
                >
                  My Orders
                </button>
                <button
                  onClick={() => handleUserAction('logout')}
                  className="w-full text-left px-4 py-2 border-none hover:border-none bg-red-100 hover:bg-[#fff4ee] text-sm text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleUserAction('login')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* User Login Modal */}
      <UserLoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        /* Hide vertical scrollbar while keeping functionality */
        .header-wrapper {
          overflow: visible;
        }

        /* Ensure header elements don't cause scrollbar */
        header {
          overflow: visible;
        }
      `}</style>
    </React.Fragment>
  );
};

export default MainHeader;